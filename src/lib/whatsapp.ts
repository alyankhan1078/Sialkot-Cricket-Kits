import type { Product } from "@/src/data/products";
import { formatPrice } from "@/src/data/products";
import type { DBOrder } from "@/src/lib/data-service";

export const WHATSAPP_NUMBER = "923231438214";

export const whatsappUrl = (message: string, targetPhone = WHATSAPP_NUMBER) => {
  const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const productMessage = (product: Product, quantity = 1, country = "") => `Hello Sialkot Cricket Kits,

I am interested in ordering:

Product: ${product.name}
Price: ${formatPrice(product.price)}
Quantity: ${quantity}${country ? `\nCountry: ${country}` : ""}

Please confirm availability, shipping charges and estimated delivery time. I would also like to request original pictures or a live product video.

Thank you.`;

export const generateOrderConfirmationWhatsAppMessage = (order: DBOrder) => {
  const itemsText = order.items
    .map((item) => `• ${item.quantity}x ${item.name} (${formatPrice(item.price)})`)
    .join("\n");

  return `🏏 *SIALKOT CRICKET KITS — OFFICIAL ORDER CONFIRMATION* 🏏

Hello *${order.customerName}*,
Thank you for your order with Sialkot Cricket Kits!

📋 *Order ID:* #${order.id}
🌍 *Destination:* ${order.country}
💰 *Total Order Value:* ${formatPrice(order.totalAmount)}
💳 *Payment Method:* ${order.paymentMethod}
📦 *Status:* ${order.status.toUpperCase()}

🛒 *Ordered Equipment:*
${itemsText}

${order.notes ? `📝 *Order Details & Confirmation Plan:*\n${order.notes}\n` : ""}
📹 *Next Step — Live Ping Video Demo:*
Our craftsmen in Sialkot have received your order. Before courier dispatch (DHL / FedEx Express), we will send you a personalized WhatsApp video showing the bat grain profile, balance, and ping performance demo.

Thank you for choosing genuine Sialkot craftsmanship! 🏏✨`;
};

