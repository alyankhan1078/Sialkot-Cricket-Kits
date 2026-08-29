import nodemailer from "nodemailer";
import { formatPrice } from "@/src/data/products";
import type { DBOrder } from "@/src/lib/data-service";

export function generateOrderConfirmationHtml(order: DBOrder): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #2d3748;">
        <td style="padding: 12px 8px; color: #ffffff; font-weight: 600;">${item.name}</td>
        <td style="padding: 12px 8px; text-align: center; color: #cbd5e1;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #cbd5e1;">${formatPrice(item.price)}</td>
        <td style="padding: 12px 8px; text-align: right; color: #f2a928; font-weight: 700;">${formatPrice(
          item.price * item.quantity
        )}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation #${order.id} - Sialkot Cricket Kits</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c1017; color: #ffffff; margin: 0; padding: 24px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; margin: 0 auto; background-color: #141922; border-radius: 16px; border: 1px solid #2a3240; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #181f2b 0%, #0f141d 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f2a928;">
        <h1 style="color: #f2a928; font-size: 24px; margin: 0 0 6px; letter-spacing: 1px; text-transform: uppercase;">Sialkot Cricket Kits</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Official Order Confirmation & Invoice</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px 24px;">
        <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
          <h2 style="color: #4ade80; font-size: 18px; margin: 0 0 4px;">✅ Order Placed Successfully!</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin: 0; line-height: 1.5;">
            Dear <strong>${order.customerName}</strong>, thank you for trusting authentic Sialkot craftsmanship. Your order is now queued in our master manufacturing workshop.
          </p>
        </div>

        <!-- Order Summary Meta -->
        <table width="100%" style="background-color: #181f2b; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 12px; color: #94a3b8;">Order ID:</td>
            <td style="padding: 6px 12px; color: #f2a928; font-weight: 700; text-align: right;">#${order.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #94a3b8;">Order Date:</td>
            <td style="padding: 6px 12px; color: #ffffff; text-align: right;">${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #94a3b8;">Destination Country:</td>
            <td style="padding: 6px 12px; color: #ffffff; text-align: right;">${order.country}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #94a3b8;">Payment Method:</td>
            <td style="padding: 6px 12px; color: #ffffff; text-align: right;">${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #94a3b8;">Order Status:</td>
            <td style="padding: 6px 12px; color: #4ade80; font-weight: 700; text-align: right; text-transform: uppercase;">${order.status}</td>
          </tr>
        </table>

        <!-- Items Table -->
        <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 12px; border-bottom: 1px solid #2d3748; padding-bottom: 8px;">Ordered Equipment</h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 1px solid #475569; color: #94a3b8; text-transform: uppercase; font-size: 11px;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 16px 8px 4px; text-align: right; color: #cbd5e1; font-weight: 600;">Total Order Value:</td>
              <td style="padding: 16px 8px 4px; text-align: right; color: #f2a928; font-size: 18px; font-weight: 800;">${formatPrice(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Order Notes / Breakdown -->
        ${order.notes ? `
        <div style="background-color: #181f2b; border: 1px solid #2d3748; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 13px; color: #cbd5e1; white-space: pre-line;">
          <strong style="color: #f2a928; display: block; margin-bottom: 4px;">Order Notes & Confirmation Plan:</strong>
          ${order.notes}
        </div>
        ` : ""}

        <!-- Video Demo Promise -->
        <div style="background: linear-gradient(135deg, rgba(242, 169, 40, 0.12) 0%, rgba(20, 25, 34, 0.9) 100%); border: 1px solid rgba(242, 169, 40, 0.3); border-radius: 10px; padding: 18px; margin-bottom: 24px; text-align: center;">
          <h4 style="color: #f2a928; font-size: 15px; margin: 0 0 6px;">📹 Personalized Live Video Ping Demo</h4>
          <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 14px; line-height: 1.5;">
            Our craftsmen will record and send a live WhatsApp video of your bat balance, straight grains, and ball ping demo before courier pickup.
          </p>
          <a href="https://wa.me/923231438214?text=Hello%20Sialkot%20Cricket%20Kits,%20I%20am%20following%20up%20on%20my%20Order%20%23${order.id}" style="display: inline-block; background-color: #22c55e; color: #ffffff; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px;">
            💬 Connect on WhatsApp (+92 323 1438214)
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #0f141d; padding: 20px; text-align: center; border-top: 1px solid #2a3240; color: #64748b; font-size: 12px; line-height: 1.5;">
        <strong>Sialkot Cricket Kits · Superior Cricket Factory</strong><br>
        Model Town, Sialkot, Punjab, Pakistan | Email: sialkotcricketkits@gmail.com<br>
        Worldwide Express Tracked Courier (UK, USA, Australia, New Zealand, Europe, Pakistan)
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendOrderConfirmationEmail(order: DBOrder): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlContent = generateOrderConfirmationHtml(order);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"Sialkot Cricket Kits" <sialkotcricketkits@gmail.com>`;

    const recipients = [order.customerEmail, "sialkotcricketkits@gmail.com"].filter(Boolean).join(", ");

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: order.customerEmail || "sialkotcricketkits@gmail.com",
        bcc: "sialkotcricketkits@gmail.com",
        subject: `🏏 Order Confirmation #${order.id} — Sialkot Cricket Kits`,
        html: htmlContent,
      });

      console.log(`[Email] Order confirmation sent via SMTP to: ${recipients}`);
      return { success: true };
    }

    // Check for Resend API Key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && order.customerEmail) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "orders@sialkotcricketkits.com",
          to: [order.customerEmail],
          bcc: ["sialkotcricketkits@gmail.com"],
          subject: `🏏 Order Confirmation #${order.id} — Sialkot Cricket Kits`,
          html: htmlContent,
        }),
      });
      if (res.ok) {
        console.log(`[Email] Order confirmation sent via Resend API to: ${order.customerEmail}`);
        return { success: true };
      }
    }

    // If SMTP/Resend credentials not yet added, log notification safely
    console.log(`[Email Notification Prepared] Order #${order.id} for ${order.customerName} (${order.customerEmail || "No email"}). Amount: £${order.totalAmount}`);
    return { success: true };
  } catch (error: any) {
    console.error("[Email Error]:", error);
    return { success: false, error: error.message || "Failed to send confirmation email." };
  }
}
