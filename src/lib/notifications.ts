import { formatPrice } from "@/src/data/products";
import type { DBOrder, DBPaymentSubmission } from "@/src/lib/data-service";
import { getAdminSupabase } from "@/src/lib/supabase";

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
}): Promise<{ success: boolean; providerMessageId?: string; error?: string; simulated?: boolean }> {
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
    } catch (err: any) {
      return { success: false, error: err.message || "Resend API connection failed" };
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
    } catch (err: any) {
      return { success: false, error: err.message || "SMTP dispatch error" };
    }
  }

  // 3. Graceful Simulated Mode (Logged safely when keys not yet set)
  console.log(`[Email Notice]: Prepared "${subject}" for ${to}`);
  return { success: true, simulated: true, providerMessageId: `sim_${Date.now()}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP NOTIFICATION SENDER (Meta Cloud API / Twilio)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendWhatsAppDirect({
  toPhone,
  message,
}: {
  toPhone: string;
  message: string;
}): Promise<{ success: boolean; providerMessageId?: string; error?: string; simulated?: boolean }> {
  // Normalize E.164 phone
  const cleanPhone = toPhone.replace(/[^0-9+]/g, "").replace(/^00/, "+");
  const metaAccessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const metaPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  // 1. Meta WhatsApp Cloud API
  if (metaAccessToken && metaPhoneNumberId) {
    try {
      const digitsOnly = cleanPhone.replace(/\+/g, "");
      const res = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: digitsOnly,
          type: "text",
          text: { preview_url: true, body: message },
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.messages?.[0]?.id) {
        return { success: true, providerMessageId: json.messages[0].id };
      }
      return { success: false, error: json.error?.message || `Meta WhatsApp API error ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err.message || "Meta WhatsApp API request failed" };
    }
  }

  // 2. Twilio WhatsApp API
  if (twilioAccountSid && twilioAuthToken) {
    try {
      const formattedTo = cleanPhone.startsWith("+") ? `whatsapp:${cleanPhone}` : `whatsapp:+${cleanPhone}`;
      const authHeader = `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`;
      const params = new URLSearchParams();
      params.append("From", twilioWhatsAppFrom.startsWith("whatsapp:") ? twilioWhatsAppFrom : `whatsapp:${twilioWhatsAppFrom}`);
      params.append("To", formattedTo);
      params.append("Body", message);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.sid) {
        return { success: true, providerMessageId: json.sid };
      }
      return { success: false, error: json.message || `Twilio HTTP error ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err.message || "Twilio WhatsApp request failed" };
    }
  }

  // 3. Graceful Simulated Mode
  console.log(`[WhatsApp Notice]: Prepared automated WhatsApp message for ${cleanPhone}: "${message.slice(0, 80)}..."`);
  return { success: true, simulated: true, providerMessageId: `sim_wa_${Date.now()}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORDER RECEIVED NOTIFICATIONS (Submitted → Pending Verification)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendOrderReceivedNotifications(
  order: DBOrder,
  paymentSubmission?: DBPaymentSubmission
): Promise<{ customerEmailResult: any; customerWhatsAppResult: any; adminAlertResult: any }> {
  const trackingLink = `https://sialkotcricketkits.com/checkout/invoice/${encodeURIComponent(order.id)}`;
  const adminReviewLink = `https://sialkotcricketkits.com/admin/orders?search=${encodeURIComponent(order.id)}`;
  const totalFormatted = formatPrice(order.totalAmount);

  // ── A. Customer Email (Order Received) ──
  let customerEmailResult = { success: false, error: "No email provided" };
  if (order.customerEmail) {
    const subject = `We Have Received Your Order — Sialkot Cricket Kits #${order.id}`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c1017; color: #ffffff; margin: 0; padding: 24px;">
  <table width="100%" style="max-width: 620px; margin: 0 auto; background-color: #141922; border-radius: 14px; border: 1px solid #2a3240; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #1e2634 0%, #0f141d 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #f2a928;">
        <h1 style="color: #f2a928; font-size: 22px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Sialkot Cricket Kits</h1>
        <p style="color: #94a3b8; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Order Received &amp; Under Verification</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 24px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
        <p style="color: #ffffff; font-size: 16px; margin: 0 0 16px;">Hello <strong>${order.customerName}</strong>,</p>
        <p>Thank you for placing your order with <strong>Sialkot Cricket Kits</strong>.</p>
        <p>We have successfully received your order and payment evidence.</p>
        
        <table width="100%" style="background-color: #181f2b; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 14px;">
          <tr>
            <td style="color: #94a3b8; padding: 4px 8px;">Order ID:</td>
            <td style="color: #f2a928; font-weight: 700; text-align: right; padding: 4px 8px;">#${order.id}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 8px;">Order Total:</td>
            <td style="color: #ffffff; font-weight: 700; text-align: right; padding: 4px 8px;">${totalFormatted}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 8px;">Current Status:</td>
            <td style="color: #f59e0b; font-weight: 700; text-align: right; padding: 4px 8px; text-transform: uppercase;">Payment Verification Pending</td>
          </tr>
        </table>

        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 22px; font-size: 13.5px; color: #fde68a;">
          ⚠️ <strong>Please note:</strong> Your order is not confirmed until our finance team verifies the payment in our official UBL account. We will email and message you again immediately after verification.
        </div>

        <p style="margin-bottom: 24px; text-align: center;">
          <a href="${trackingLink}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">
            📄 View Order Details &amp; Live Tracking
          </a>
        </p>

        <p style="font-size: 13.5px; color: #94a3b8; border-top: 1px solid #2d3748; padding-top: 16px;">
          For assistance, contact our master craftsmen on WhatsApp:<br>
          <strong style="color: #22c55e;">+92 323 1438214</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #0f141d; padding: 16px; text-align: center; border-top: 1px solid #2a3240; color: #64748b; font-size: 12px;">
        <strong>Sialkot Cricket Kits</strong> · Handcrafted in Sialkot, Pakistan · Worldwide Delivery Available
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `Hello ${order.customerName},\n\nThank you for placing your order with Sialkot Cricket Kits.\nWe have successfully received your order and payment evidence.\n\nOrder ID: #${order.id}\nOrder Total: ${totalFormatted}\nCurrent Status: Payment Verification Pending\n\nPlease note that your order is not confirmed until our team verifies the payment. We will email and message you again after verification.\n\nYou can track your order here:\n${trackingLink}\n\nFor assistance, contact us on WhatsApp:\n+92 323 1438214\n\nSialkot Cricket Kits\nHandcrafted in Sialkot, Pakistan\nWorldwide Delivery Available`;

    customerEmailResult = await sendEmailDirect({
      to: order.customerEmail,
      subject,
      html,
      text,
    });

    await saveNotificationLog({
      orderId: order.id,
      type: "order_received",
      channel: "email",
      recipient: order.customerEmail,
      status: customerEmailResult.success ? (customerEmailResult.simulated ? "simulated" : "sent") : "failed",
      provider: customerEmailResult.simulated ? "simulated_logger" : "resend_smtp",
      providerMessageId: customerEmailResult.providerMessageId,
      errorReason: customerEmailResult.error,
    });
  }

  // ── B. Customer WhatsApp (Order Received) ──
  let customerWhatsAppResult = { success: false, error: "No phone provided" };
  if (order.customerPhone) {
    const waText = `Hello ${order.customerName},

We have received your Sialkot Cricket Kits order.

Order ID: #${order.id}
Order Total: ${totalFormatted}
Status: Payment Verification Pending

Your payment evidence is being reviewed. Your order is not yet confirmed. We will notify you after verification.

Track your order:
${trackingLink}

Sialkot Cricket Kits
+92 323 1438214`;

    customerWhatsAppResult = await sendWhatsAppDirect({
      toPhone: order.customerPhone,
      message: waText,
    });

    await saveNotificationLog({
      orderId: order.id,
      type: "order_received",
      channel: "whatsapp",
      recipient: order.customerPhone,
      status: customerWhatsAppResult.success ? (customerWhatsAppResult.simulated ? "simulated" : "sent") : "failed",
      provider: customerWhatsAppResult.simulated ? "simulated_logger" : "meta_twilio",
      providerMessageId: customerWhatsAppResult.providerMessageId,
      errorReason: customerWhatsAppResult.error,
    });
  }

  // ── C. Admin Notifications (Email & WhatsApp) ──
  const adminEmail = "sialkotcricketkits@gmail.com";
  const adminSubject = `🚨 New Manual Order Submitted: #${order.id} (£${order.totalAmount}) — Verification Needed`;
  const adminHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #b45309; margin-top: 0;">🏏 New Order Received &amp; Payment Verification Needed</h2>
      <p>A new customer has placed an order and uploaded bank transfer evidence.</p>
      <ul>
        <li><strong>Order ID:</strong> #${order.id}</li>
        <li><strong>Customer Name:</strong> ${order.customerName}</li>
        <li><strong>WhatsApp:</strong> ${order.customerPhone || "N/A"}</li>
        <li><strong>Email:</strong> ${order.customerEmail || "N/A"}</li>
        <li><strong>Country / City:</strong> ${order.country} / ${order.city || ""}</li>
        <li><strong>Total Amount:</strong> £${order.totalAmount}</li>
        <li><strong>Payment Reference:</strong> ${order.transferReference || "N/A"}</li>
      </ul>
      <p><a href="${adminReviewLink}" style="background: #16a34a; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review in Admin Dashboard →</a></p>
    </div>
  `;

  const adminAlertResult = await sendEmailDirect({
    to: adminEmail,
    subject: adminSubject,
    html: adminHtml,
  });

  await saveNotificationLog({
    orderId: order.id,
    type: "admin_alert",
    channel: "email",
    recipient: adminEmail,
    status: adminAlertResult.success ? (adminAlertResult.simulated ? "simulated" : "sent") : "failed",
    provider: adminAlertResult.simulated ? "simulated_logger" : "resend_smtp",
    providerMessageId: adminAlertResult.providerMessageId,
    errorReason: adminAlertResult.error,
  });

  return { customerEmailResult, customerWhatsAppResult, adminAlertResult };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ORDER CONFIRMED NOTIFICATIONS (Admin Verified & Confirmed)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendOrderConfirmedNotifications(
  order: DBOrder
): Promise<{ customerEmailResult: any; customerWhatsAppResult: any }> {
  const trackingLink = `https://sialkotcricketkits.com/checkout/invoice/${encodeURIComponent(order.id)}`;
  const totalFormatted = formatPrice(order.totalAmount);

  // ── A. Customer Confirmation Email ──
  let customerEmailResult = { success: false, error: "No email provided" };
  if (order.customerEmail) {
    const subject = `Your Order Is Confirmed — Sialkot Cricket Kits #${order.id}`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c1017; color: #ffffff; margin: 0; padding: 24px;">
  <table width="100%" style="max-width: 620px; margin: 0 auto; background-color: #141922; border-radius: 14px; border: 1px solid #2a3240; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #14532d 0%, #052e16 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #22c55e;">
        <h1 style="color: #4ade80; font-size: 22px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Sialkot Cricket Kits</h1>
        <p style="color: #86efac; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Official Order Confirmation</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 24px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
        <p style="color: #ffffff; font-size: 16px; margin: 0 0 16px;">Hello <strong>${order.customerName}</strong>,</p>
        <p>Your payment has been <strong>successfully verified</strong>, and your order is now <strong>confirmed</strong>.</p>
        
        <table width="100%" style="background-color: #181f2b; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 14px;">
          <tr>
            <td style="color: #94a3b8; padding: 4px 8px;">Order ID:</td>
            <td style="color: #f2a928; font-weight: 700; text-align: right; padding: 4px 8px;">#${order.id}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 8px;">Status:</td>
            <td style="color: #4ade80; font-weight: 800; text-align: right; padding: 4px 8px; text-transform: uppercase;">Order Confirmed</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 8px;">Total Verified:</td>
            <td style="color: #ffffff; font-weight: 700; text-align: right; padding: 4px 8px;">${totalFormatted}</td>
          </tr>
        </table>

        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 22px; font-size: 14px; color: #bbf7d0;">
          🏏 <strong>Workshop Notice:</strong> Our master craftsmen will now begin preparing your equipment. Before dispatch, we will record and send your live ping video demo on WhatsApp. We will notify you again when it is ready for courier collection.
        </div>

        <p style="margin-bottom: 24px; text-align: center;">
          <a href="${trackingLink}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">
            📄 View Official Invoice &amp; Track Status
          </a>
        </p>

        <p style="font-size: 13.5px; color: #94a3b8;">
          Thank you for choosing <strong>Sialkot Cricket Kits</strong>.<br>
          Handcrafted in Sialkot, Pakistan · Worldwide Delivery
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `Hello ${order.customerName},\n\nYour payment has been successfully verified, and your order is now confirmed.\n\nOrder ID: #${order.id}\nStatus: Order Confirmed\n\nOur team will now begin preparing your order. We will notify you again when it is ready for dispatch.\n\nThank you for choosing Sialkot Cricket Kits.\n\nTrack order:\n${trackingLink}`;

    customerEmailResult = await sendEmailDirect({
      to: order.customerEmail,
      subject,
      html,
      text,
    });

    await saveNotificationLog({
      orderId: order.id,
      type: "order_confirmed",
      channel: "email",
      recipient: order.customerEmail,
      status: customerEmailResult.success ? (customerEmailResult.simulated ? "simulated" : "sent") : "failed",
      provider: customerEmailResult.simulated ? "simulated_logger" : "resend_smtp",
      providerMessageId: customerEmailResult.providerMessageId,
      errorReason: customerEmailResult.error,
    });
  }

  // ── B. Customer Confirmation WhatsApp ──
  let customerWhatsAppResult = { success: false, error: "No phone provided" };
  if (order.customerPhone) {
    const waText = `Hello ${order.customerName},

Your payment has been verified successfully.

Your Sialkot Cricket Kits order #${order.id} is now CONFIRMED.

We will notify you when your order is ready for dispatch.

Thank you for choosing Sialkot Cricket Kits.`;

    customerWhatsAppResult = await sendWhatsAppDirect({
      toPhone: order.customerPhone,
      message: waText,
    });

    await saveNotificationLog({
      orderId: order.id,
      type: "order_confirmed",
      channel: "whatsapp",
      recipient: order.customerPhone,
      status: customerWhatsAppResult.success ? (customerWhatsAppResult.simulated ? "simulated" : "sent") : "failed",
      provider: customerWhatsAppResult.simulated ? "simulated_logger" : "meta_twilio",
      providerMessageId: customerWhatsAppResult.providerMessageId,
      errorReason: customerWhatsAppResult.error,
    });
  }

  return { customerEmailResult, customerWhatsAppResult };
}
