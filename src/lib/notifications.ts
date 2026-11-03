import type { DBOrder, DBPaymentSubmission } from "@/src/lib/data-service";
import { getAdminSupabase } from "@/src/lib/supabase";
import { buildMessage, type MessageEvent, type MessageInput, type MessageLanguage } from "@/src/lib/order-messages";
import {
  addressOf,
  isCustom,
  itemsSummary,
  money,
  paidOf,
  planLabelOf,
  reportedOf,
  sheetBalanceOf,
  trackingOf,
} from "@/src/lib/admin-orders";

export interface NotificationLog {
  id: string;
  orderId: string;
  type: "order_received" | "order_confirmed" | "status_update" | "admin_alert";
  channel: "email" | "whatsapp";
  recipient: string;
  status: "sent" | "failed" | "simulated";
  provider?: string;
  providerMessageId?: string;
  errorReason?: string;
  sentAt: string;
}

export interface NotificationSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  simulated?: boolean;
}

// In-memory notification audit log cache
export const memoryNotificationLogs: NotificationLog[] = [];

export async function saveNotificationLog(log: Omit<NotificationLog, "id" | "sentAt">): Promise<NotificationLog> {
  const newLog: NotificationLog = {
    ...log,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    sentAt: new Date().toISOString(),
  };

  memoryNotificationLogs.unshift(newLog);

  // Sync to Supabase if configured
  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("notification_logs").insert({
        id: newLog.id,
        order_id: newLog.orderId,
        type: newLog.type,
        channel: newLog.channel,
        recipient: newLog.recipient,
        status: newLog.status,
        provider: newLog.provider || null,
        provider_message_id: newLog.providerMessageId || null,
        error_reason: newLog.errorReason || null,
        sent_at: newLog.sentAt,
      });
    }
  } catch {
    // Graceful fallback to memory log
  }

  return newLog;
}

export async function getNotificationLogsForOrder(orderId: string): Promise<NotificationLog[]> {
  const local = memoryNotificationLogs.filter((l) => l.orderId === orderId);
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("notification_logs")
        .select("*")
        .eq("order_id", orderId)
        .order("sent_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: NotificationLog[] = data.map((d: any) => ({
          id: d.id,
          orderId: d.order_id,
          type: d.type,
          channel: d.channel,
          recipient: d.recipient,
          status: d.status,
          provider: d.provider,
          providerMessageId: d.provider_message_id,
          errorReason: d.error_reason,
          sentAt: d.sent_at,
        }));

        for (const m of mapped) {
          if (!local.some((l) => l.id === m.id)) {
            local.push(m);
          }
        }
      }
    }
  } catch {}

  return local.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL NOTIFICATION SENDER (Edge-Safe: Resend API / SMTP dynamic fallback)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEmailDirect({
  to,
  subject,
  html,
  text,
  bcc,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bcc?: string | string[];
}): Promise<NotificationSendResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"Sialkot Cricket Kits" <sialkotcricketkits@gmail.com>`;

  // 1. Resend API (Recommended for Edge / Serverless)
  if (resendApiKey) {
    try {
      const bccList = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "orders@sialkotcricketkits.com",
          to: [to],
          bcc: bccList.length > 0 ? bccList : undefined,
          subject,
          html,
          text,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.id) {
        return { success: true, providerMessageId: json.id };
      }
      return { success: false, error: json.message || `Resend HTTP error ${res.status}` };
    } catch (err) {
      return { success: false, error: err instanceof Error && err.message ? err.message : "Resend API connection failed" };
    }
  }

  // 2. SMTP Transport Fallback (When in Node environment)
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
        subject,
        html,
        text,
      });

      return { success: true, providerMessageId: info.messageId };
    } catch (err) {
      return { success: false, error: err instanceof Error && err.message ? err.message : "SMTP dispatch error" };
    }
  }

  // 3. Graceful Simulated Mode (Logged safely when keys not yet set)
  console.log(`[Email Notice]: Prepared "${subject}" for ${to}`);
  return { success: true, simulated: true, providerMessageId: `sim_${Date.now()}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP SENDER (Meta Cloud API: approved templates or text; Twilio fallback)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendWhatsAppDirect({
  toPhone,
  message,
  template,
}: {
  toPhone: string;
  message: string;
  /** Business-initiated messages need an approved template; text only works inside the 24-hour reply window. */
  template?: { name: string; params: string[] };
}): Promise<NotificationSendResult> {
  const cleanPhone = toPhone.replace(/[^0-9+]/g, "").replace(/^00/, "+");
  const metaAccessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const metaPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
  const useTemplates = process.env.WHATSAPP_TEMPLATES_APPROVED === "1";
  const templatePrefix = process.env.WHATSAPP_TEMPLATE_PREFIX || "";
  const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM || "";

  if (metaAccessToken && metaPhoneNumberId) {
    try {
      const to = cleanPhone.replace(/\+/g, "");
      const payload =
        useTemplates && template
          ? {
              messaging_product: "whatsapp",
              to,
              type: "template",
              template: {
                name: `${templatePrefix}${template.name}`,
                language: { code: templateLanguage },
                components: [
                  {
                    type: "body",
                    // Template parameters may not contain new lines or tabs.
                    parameters: template.params.map((p) => ({ type: "text", text: String(p).replace(/\s+/g, " ").trim().slice(0, 900) || "-" })),
                  },
                ],
              },
            }
          : { messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: true, body: message } };
      const res = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${metaAccessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.messages?.[0]?.id) return { success: true, providerMessageId: json.messages[0].id };
      return { success: false, error: json.error?.message || `Meta WhatsApp API error ${res.status}` };
    } catch (err) {
      return { success: false, error: err instanceof Error && err.message ? err.message : "Meta WhatsApp API request failed" };
    }
  }

  if (twilioAccountSid && twilioAuthToken && twilioWhatsAppFrom) {
    try {
      const formattedTo = cleanPhone.startsWith("+") ? `whatsapp:${cleanPhone}` : `whatsapp:+${cleanPhone}`;
      const params = new URLSearchParams();
      params.append("From", twilioWhatsAppFrom.startsWith("whatsapp:") ? twilioWhatsAppFrom : `whatsapp:${twilioWhatsAppFrom}`);
      params.append("To", formattedTo);
      params.append("Body", message);
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.sid) return { success: true, providerMessageId: json.sid };
      return { success: false, error: json.message || `Twilio HTTP error ${res.status}` };
    } catch (err) {
      return { success: false, error: err instanceof Error && err.message ? err.message : "Twilio WhatsApp request failed" };
    }
  }

  // No keys yet: nothing is sent, the attempt is logged as "simulated".
  console.log(`[WhatsApp Notice]: not configured, prepared message for ${cleanPhone.slice(0, 5)}…`);
  return { success: true, simulated: true, providerMessageId: `sim_wa_${Date.now()}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER MESSAGES (customer + owner)
// ─────────────────────────────────────────────────────────────────────────────
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://sialkotcricketkits.com").replace(/\/$/, "");
const OWNER_EMAIL = process.env.BUSINESS_EMAIL || "sialkotcricketkits@gmail.com";
const OWNER_WHATSAPP = process.env.BUSINESS_WHATSAPP || "+923231438214";

/** Messages go to real customers only when NOTIFY_LIVE=1. Until then every customer message goes to the owner (test mode). */
const isLive = () => process.env.NOTIFY_LIVE === "1";
const language = (): MessageLanguage => (process.env.MESSAGE_LANGUAGE === "ur" ? "ur" : "en");

type CustomerEvent = Exclude<MessageEvent, "admin_alert">;

/** The notification_logs.type column only accepts these four values. */
function logTypeFor(event: MessageEvent): NotificationLog["type"] {
  if (event === "order_received") return "order_received";
  if (event === "payment_confirmed") return "order_confirmed";
  if (event === "admin_alert") return "admin_alert";
  return "status_update";
}

/** Test orders send no messages at all, to the customer or to the owner. */
export function isTestOrder(order: DBOrder): boolean {
  const email = (order.customerEmail || "").toLowerCase();
  return (
    /@(example\.(com|org|net)|test\.com|mailinator\.com)$/.test(email) ||
    /\[test order\]/i.test(order.notes || "") ||
    /^test\b/i.test((order.customerName || "").trim())
  );
}

function asSheetOrder(order: DBOrder, submission?: DBPaymentSubmission | null) {
  return { ...order, paymentSubmission: submission ?? null } as Parameters<typeof reportedOf>[0];
}

export function messageInputFor(order: DBOrder, submission?: DBPaymentSubmission | null, extra: Partial<MessageInput> = {}): MessageInput {
  const o = asSheetOrder(order, submission);
  return {
    orderId: order.id,
    customerName: order.customerName,
    country: order.country,
    items: itemsSummary(order.items || []),
    total: money(Number(order.totalAmount) || 0),
    reported: reportedOf(o) || undefined,
    plan: planLabelOf(o),
    paid: money(paidOf(o)),
    balance: money(sheetBalanceOf(o).amount),
    reason: submission?.rejectionReason,
    tracking: trackingOf(o),
    isCustomBat: isCustom(o),
    orderLink: `${SITE_URL}/checkout/invoice/${encodeURIComponent(order.id)}${order.trackingToken ? `?token=${encodeURIComponent(order.trackingToken)}` : ""}`,
    adminLink: `${SITE_URL}/admin/orders?search=${encodeURIComponent(order.id)}`,
    ...extra,
  };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Clean, light, mobile-friendly email built from the same text as the WhatsApp message. */
export function renderEmailHtml(heading: string, text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) =>
      esc(block)
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#c2410c;font-weight:600;word-break:break-all">$1</a>')
        .replace(/\n/g, "<br>")
    )
    .map((html) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1f2937">${html}</p>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden">
<tr><td style="padding:20px 24px;border-bottom:3px solid #f2a928">
<img src="${SITE_URL}/assets/brand/logo-email.png" width="56" height="56" alt="Sialkot Cricket Kits" style="vertical-align:middle;margin-right:10px">
<span style="font-size:17px;font-weight:800;color:#111827;vertical-align:middle">Sialkot Cricket Kits</span></td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 16px;font-size:21px;color:#111827">${esc(heading)}</h1>${paragraphs}</td></tr>
<tr><td style="padding:14px 24px;background:#fafaf9;border-top:1px solid #e7e5e4;font-size:12.5px;color:#57534e">
Sialkot Cricket Kits · Sialkot, Pakistan · WhatsApp +92 323 1438214</td></tr>
</table></body></html>`;
}

async function logResult(orderId: string, event: MessageEvent, channel: "email" | "whatsapp", recipient: string, r: NotificationSendResult, provider: string) {
  await saveNotificationLog({
    orderId,
    type: logTypeFor(event),
    channel,
    recipient,
    status: r.success ? (r.simulated ? "simulated" : "sent") : "failed",
    provider: r.simulated ? "simulated_logger" : provider,
    providerMessageId: r.providerMessageId,
    errorReason: r.error,
  });
}

/** Sends one customer event by email and WhatsApp, and logs the real result of each. */
export async function notifyOrderEvent(
  order: DBOrder,
  event: CustomerEvent,
  submission?: DBPaymentSubmission | null,
  extra: Partial<MessageInput> = {}
): Promise<{ skipped?: string; email?: NotificationSendResult; whatsapp?: NotificationSendResult }> {
  if (isTestOrder(order)) return { skipped: "test order" };
  const built = buildMessage(event, messageInputFor(order, submission, extra), language());
  const live = isLive();
  const toEmail = live ? order.customerEmail : OWNER_EMAIL;
  const toPhone = live ? order.customerPhone : OWNER_WHATSAPP;
  const testTag = live ? "" : `[TEST → ${order.customerEmail || order.customerPhone || "customer"}] `;
  const out: { email?: NotificationSendResult; whatsapp?: NotificationSendResult } = {};

  if (toEmail) {
    out.email = await sendEmailDirect({
      to: toEmail,
      subject: `${testTag}${built.subject}`,
      html: renderEmailHtml(built.heading, built.text),
      text: built.text,
    });
    await logResult(order.id, event, "email", toEmail, out.email, live ? "email" : "email_test_to_owner");
  }
  if (toPhone) {
    out.whatsapp = await sendWhatsAppDirect({
      toPhone,
      message: `${testTag}${built.text}`,
      template: { name: built.templateName, params: built.templateParams },
    });
    await logResult(order.id, event, "whatsapp", toPhone, out.whatsapp, live ? "whatsapp" : "whatsapp_test_to_owner");
  }
  return out;
}

/** Alerts the owner by email and WhatsApp that a new order with a payment screenshot arrived. */
export async function notifyOwnerNewOrder(order: DBOrder, submission?: DBPaymentSubmission | null) {
  if (isTestOrder(order)) return { skipped: "test order" };
  const built = buildMessage("admin_alert", messageInputFor(order, submission, { customerName: order.customerName }), "en");
  const email = await sendEmailDirect({ to: OWNER_EMAIL, subject: built.subject, html: renderEmailHtml(built.heading, `${built.text}\n\nAddress: ${addressOf(asSheetOrder(order, submission)) || order.country}`), text: built.text });
  await logResult(order.id, "admin_alert", "email", OWNER_EMAIL, email, "email");
  const whatsapp = await sendWhatsAppDirect({ toPhone: OWNER_WHATSAPP, message: built.text, template: { name: built.templateName, params: built.templateParams } });
  await logResult(order.id, "admin_alert", "whatsapp", OWNER_WHATSAPP, whatsapp, "whatsapp");
  return { email, whatsapp };
}

// Kept for existing callers.
export async function sendOrderReceivedNotifications(order: DBOrder, submission?: DBPaymentSubmission | null) {
  const customer = await notifyOrderEvent(order, "order_received", submission);
  const owner = await notifyOwnerNewOrder(order, submission);
  return { customer, owner };
}

export async function sendOrderConfirmedNotifications(order: DBOrder, submission?: DBPaymentSubmission | null) {
  return notifyOrderEvent(order, "payment_confirmed", submission);
}
