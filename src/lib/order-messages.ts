/**
 * Customer and owner message texts for every order event, in English and Roman Urdu.
 * Browser-safe (no server imports): used by the server notification sender and by the
 * admin sheet's "Send on WhatsApp" button, so both always say the same thing.
 *
 * WhatsApp Cloud API needs pre-approved templates for business-initiated messages.
 * Each event therefore also returns a template name and its ordered body parameters
 * ({{1}}, {{2}}, ...). The template texts to submit to Meta are in TEMPLATE_TEXTS below.
 */

export type MessageEvent =
  | "order_received"
  | "payment_confirmed"
  | "payment_rejected"
  | "balance_requested"
  | "dispatched"
  | "admin_alert";

export type MessageLanguage = "en" | "ur";

export const BUSINESS_WHATSAPP_DISPLAY = "+92 323 1438214";

export interface MessageInput {
  orderId: string;
  customerName: string;
  country?: string;
  items: string;
  total: string;
  /** What the customer says they sent, e.g. "£250" or "PKR 87,000". */
  reported?: string;
  /** e.g. "50% deposit" or "full payment". */
  plan?: string;
  paid?: string;
  balance?: string;
  reason?: string;
  reupload?: boolean;
  /** Courier and tracking as typed by the owner, e.g. "DHL 1234567890". */
  tracking?: string;
  /** Bank details block for balance requests. */
  bankDetails?: string;
  isCustomBat?: boolean;
  /** Customer's order page (invoice/tracking). */
  orderLink?: string;
  /** Owner alerts only: link to the order in the admin sheet. */
  adminLink?: string;
}

export interface BuiltMessage {
  subject: string;
  /** Plain text: email text part, WhatsApp text (inside the 24-hour window) and wa.me links. */
  text: string;
  /** Short heading for the HTML email. */
  heading: string;
  templateName: string;
  /** Single-line values for the template's {{1}}, {{2}}, ... */
  templateParams: string[];
}

const oneLine = (s: string | undefined) => (s || "").replace(/\s+/g, " ").trim();
const firstName = (name: string) => oneLine(name).split(" ")[0] || "there";

export function buildMessage(event: MessageEvent, input: MessageInput, lang: MessageLanguage = "en"): BuiltMessage {
  const first = firstName(input.customerName);
  const id = input.orderId;
  const wa = BUSINESS_WHATSAPP_DISPLAY;
  const ur = lang === "ur";
  const link = input.orderLink ? `\n\n${ur ? "Order dekhein" : "View your order"}: ${input.orderLink}` : "";

  switch (event) {
    case "order_received": {
      const paidLine = input.reported
        ? ur
          ? `Aap ne ${input.reported} bheje hain${input.plan ? ` (${input.plan})` : ""}.`
          : `You reported paying ${input.reported}${input.plan ? ` (${input.plan})` : ""}.`
        : "";
      const text = ur
        ? `Assalam o Alaikum ${first}, Sialkot Cricket Kits se order karne ka shukriya.\n\nOrder #${id}: ${input.items}\nTotal: ${input.total}. ${paidLine}\n\nHum aap ki payment check karke 24 ghante mein confirm kar denge.${link}\n\nKoi sawal ho to WhatsApp karein: ${wa}`
        : `Assalam o Alaikum ${first}, thank you for your order with Sialkot Cricket Kits.\n\nOrder #${id}: ${input.items}\nTotal: ${input.total}. ${paidLine}\n\nWe will check your payment and confirm within 24 hours.${link}\n\nQuestions? WhatsApp us: ${wa}`;
      return {
        subject: ur ? `Aap ka order #${id} mil gaya — Sialkot Cricket Kits` : `We received your order #${id} — Sialkot Cricket Kits`,
        heading: ur ? "Order mil gaya" : "Order received",
        text,
        templateName: "order_received",
        templateParams: [first, id, oneLine(input.items), input.total, oneLine(input.reported) || "—"],
      };
    }
    case "payment_confirmed": {
      const next = input.isCustomBat
        ? ur
          ? "Ab aap ka bat banna shuru ho gaya hai. Dispatch se pehle hum pictures aur ping video bhejenge."
          : "We are now making your bat. We will send pictures and a ping video before dispatch."
        : ur
          ? "Ab hum aap ka order dispatch ke liye tayyar kar rahe hain."
          : "We are now preparing your order for dispatch.";
      const text = ur
        ? `Khushkhabri ${first}! Order #${id} ki payment confirm ho gayi hai.\n\nPaid: ${input.paid || "—"}\nBaqi raqam: ${input.balance || "£0"}\n\n${next}${link}\n\nKoi sawal ho to WhatsApp karein: ${wa}`
        : `Good news ${first}! Your payment for order #${id} is confirmed.\n\nPaid: ${input.paid || "—"}\nBalance: ${input.balance || "£0"}\n\n${next}${link}\n\nQuestions? WhatsApp us: ${wa}`;
      return {
        subject: ur ? `Payment confirm — order #${id}` : `Payment confirmed — order #${id}`,
        heading: ur ? "Payment confirm ho gayi" : "Payment confirmed",
        text,
        templateName: "payment_confirmed",
        templateParams: [first, id, input.paid || "—", input.balance || "£0"],
      };
    }
    case "payment_rejected": {
      const ask = input.reupload
        ? ur
          ? "Meherbani karke apni payment ki saaf screenshot is number par WhatsApp kar dein."
          : "Please send a clear screenshot of your payment to us on WhatsApp."
        : ur
          ? "Meherbani karke WhatsApp par hum se baat karein."
          : "Please contact us on WhatsApp so we can help.";
      const text = ur
        ? `Assalam o Alaikum ${first}, hum order #${id} ki payment confirm nahi kar sake.\n\nWajah: ${oneLine(input.reason)}\n\n${ask}\nWhatsApp: ${wa}`
        : `Hello ${first}, we could not confirm the payment for order #${id}.\n\nReason: ${oneLine(input.reason)}\n\n${ask}\nWhatsApp: ${wa}`;
      return {
        subject: ur ? `Order #${id}: payment confirm nahi hui` : `Order #${id}: we could not confirm your payment`,
        heading: ur ? "Payment confirm nahi hui" : "Payment not confirmed",
        text,
        templateName: "payment_issue",
        templateParams: [first, id, oneLine(input.reason) || "—"],
      };
    }
    case "balance_requested": {
      const bank = input.bankDetails ? `\n\n${input.bankDetails}` : "";
      const text = ur
        ? `Assalam o Alaikum ${first}, aap ka order #${id} aakhri payment ke liye tayyar hai.\n\nBaqi raqam: ${input.balance || "—"}${bank}\n\nPayment ke baad screenshot is number par WhatsApp kar dein: ${wa}`
        : `Hello ${first}, your order #${id} is ready for the final payment.\n\nBalance due: ${input.balance || "—"}${bank}\n\nAfter paying, please send the screenshot to us on WhatsApp: ${wa}`;
      return {
        subject: ur ? `Order #${id}: baqi raqam` : `Order #${id}: balance due`,
        heading: ur ? "Baqi raqam" : "Balance due",
        text,
        templateName: "balance_due",
        templateParams: [first, id, input.balance || "—"],
      };
    }
    case "dispatched": {
      const text = ur
        ? `Assalam o Alaikum ${first}, aap ka order #${id} bhej diya gaya hai.\n\nCourier / tracking: ${oneLine(input.tracking) || "—"}${link}\n\nSialkot Cricket Kits chunne ka shukriya!\nWhatsApp: ${wa}`
        : `Hello ${first}, your order #${id} has been dispatched.\n\nCourier / tracking: ${oneLine(input.tracking) || "—"}${link}\n\nThank you for choosing Sialkot Cricket Kits!\nWhatsApp: ${wa}`;
      return {
        subject: ur ? `Order #${id} bhej diya gaya` : `Your order #${id} has been dispatched`,
        heading: ur ? "Order bhej diya gaya" : "Order dispatched",
        text,
        templateName: "order_dispatched",
        templateParams: [first, id, oneLine(input.tracking) || "—"],
      };
    }
    case "admin_alert": {
      const text = `New order #${id}\n${oneLine(input.customerName)}${input.country ? `, ${input.country}` : ""}\nItems: ${input.items}\nTotal: ${input.total}\nReported paid: ${input.reported || "—"}${input.plan ? ` (${input.plan})` : ""}${
        input.adminLink ? `\n\nCheck it: ${input.adminLink}` : ""
      }`;
      return {
        subject: `New order #${id} — ${oneLine(input.customerName)} — ${input.total} (check payment)`,
        heading: "New order: check the payment",
        text,
        templateName: "owner_new_order",
        templateParams: [id, oneLine(input.customerName), input.total, input.reported || "—"],
      };
    }
  }
}

/**
 * Texts to submit to Meta (WhatsApp Manager → Message templates), category "Utility",
 * language English. {{n}} are filled from templateParams in the same order.
 */
export const TEMPLATE_TEXTS: Record<string, string> = {
  order_received:
    "Assalam o Alaikum {{1}}, thank you for your order with Sialkot Cricket Kits. Order #{{2}}: {{3}}. Total: {{4}}. You reported paying {{5}}. We will check your payment and confirm within 24 hours.",
  payment_confirmed:
    "Good news {{1}}! Your payment for order #{{2}} is confirmed. Paid: {{3}}. Balance: {{4}}. We will keep you updated on WhatsApp.",
  payment_issue:
    "Hello {{1}}, we could not confirm the payment for order #{{2}}. Reason: {{3}}. Please reply to this message with a clear screenshot of your payment.",
  balance_due:
    "Hello {{1}}, your order #{{2}} is ready for the final payment. Balance due: {{3}}. Please reply to this message for our bank details.",
  order_dispatched:
    "Hello {{1}}, your order #{{2}} has been dispatched. Courier and tracking: {{3}}. Thank you for choosing Sialkot Cricket Kits!",
  owner_new_order: "New order #{{1}} from {{2}}. Total {{3}}, reported paid {{4}}. Please check the payment in the admin.",
};
