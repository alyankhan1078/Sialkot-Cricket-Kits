import type { Product } from "@/src/data/products";
import { formatPrice } from "@/src/data/products";

export const WHATSAPP_NUMBER = "923231438214";

export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const productMessage = (product: Product, quantity = 1, country = "") => `Hello Sialkot Cricket Kits,

I am interested in ordering:

Product: ${product.name}
Price: ${formatPrice(product.price)}
Quantity: ${quantity}${country ? `\nCountry: ${country}` : ""}

Please confirm availability, shipping charges and estimated delivery time. I would also like to request original pictures or a live product video.

Thank you.`;

