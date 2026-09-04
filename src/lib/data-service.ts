import { products as initialProducts, categoryOrder, type Product as ProductType } from "../data/products.ts";
import { faqs as initialFaqs } from "../data/faqs.ts";
import { getAdminSupabase } from "./supabase.ts";
import crypto from "crypto";

export interface DBProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: string;
  rightStock?: string;
  leftStock?: string;
  image: string;
  images?: string[];
  description: string;
  shortDescription?: string;
  openingStatement?: string;
  highlights?: string[];
  bestFor?: string;
  specifications?: Array<{ label: string; value: string }>;
  seoTitle?: string;
  seoDescription?: string;
  imageAlt?: string;
  disclosureType?: "beauty_processed" | "bonafide" | "junior" | "natural_willow" | "none";
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  position: number;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBCategory {
  id: number;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface DBFaq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}

export interface DBPaymentSettings {
  // UBL Bank Detail Verification Lock
  ublDetailsVerifiedByAdmin: boolean;
  ublDetailsVerifiedAt?: string;
  ublDetailsVerifiedBy?: string;

  // Bank Account (UBL Settlement & Beneficiary ALYAN WAZIR)
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  swiftBic: string;
  bankBranch: string;
  bankEnabled: boolean;

  // Pakistani Wallets, Microfinance & Raast
  raastId: string;
  raastTitle: string;
  raastEnabled: boolean;
  jazzcashNumber: string;
  jazzcashTitle: string;
  jazzcashEnabled: boolean;
  nayapayNumber: string;
  nayapayTitle: string;
  nayapayEnabled: boolean;
  sadapayNumber: string;
  sadapayTitle: string;
  sadapayEnabled: boolean;
  easypaisaNumber: string;
  easypaisaTitle: string;
  easypaisaEnabled: boolean;

  // Payoneer & International Digital
  payoneerEmail: string;
  payoneerEnabled: boolean;
  wiseEmail: string;
  wiseTag: string;
  wiseEnabled: boolean;
  remitlyEnabled: boolean;
  westernUnionEnabled: boolean;
  moneygramEnabled: boolean;
  worldRemitEnabled: boolean;
  taptapSendEnabled: boolean;

  // Safepay Pakistan (Hosted Gateway)
  safepayApiKey: string;
  safepaySecretKey: string;
  safepayWebhookSecret: string;
  safepayEnvironment: "sandbox" | "production";
  safepayEnabled: boolean;

  // Stripe Card Processing (Secondary/Legacy)
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeEnabled: boolean;
}

export interface DBSettings extends DBPaymentSettings {
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  factoryAddress: string;
  businessName: string;
  announcementText: string;
  catalogueUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
}

export interface DBEnquiry {
  id: number;
  type: "contact" | "custom_bat";
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  message: string;
  product?: string;
  extras?: string;
  read: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId?: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}

export type PaymentStatus =
  | "awaiting_payment"
  | "payment_submitted"
  | "payment_verified"
  | "payment_rejected"
  | "payment_reupload_requested"
  | "refunded";

export type FulfilmentStatus =
  | "new"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

// Backward compatibility alias
export type OrderPaymentStatus =
  | PaymentStatus
  | "deposit_paid"
  | "paid"
  | "completed"
  | "confirmed"
  | "order_confirmed"
  | "pending"
  | "payment_failed"
  | "payment_cancelled"
  | "shipping_quote_required"
  | "cancelled";

export interface DBPaymentSubmission {
  id: string;
  orderId: string;
  paymentMethod: string;
  senderName: string;
  senderCountry: string;
  provider: string;
  amountSent: number;
  currencySent: string;
  transferReference: string;
  transferDate: string;
  receiptStoragePath: string;
  receiptOriginalName: string;
  receiptMimeType: string;
  receiptFileSize: number;
  status: PaymentStatus;
  customerNote?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBPaymentStatusHistory {
  id: string;
  paymentSubmissionId: string;
  orderId: string;
  oldStatus: PaymentStatus;
  newStatus: PaymentStatus;
  changedBy: string;
  internalNote?: string;
  createdAt: string;
}

export interface DBOrder {
  id: string;
  orderReference?: string;
  trackingToken?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  country: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  depositPercent?: number;
  depositAmount?: number;
  amountPaid?: number;
  balanceRemaining?: number;
  currency?: string;
  amountInPkr?: number;
  paymentStatus?: PaymentStatus;
  fulfilmentStatus?: FulfilmentStatus;
  status: OrderPaymentStatus; // Synced customer-facing status
  paymentMethod: string;
  paymentProvider?: "ubl_bank" | "remittance" | "safepay" | "stripe" | "cod" | "manual" | string;
  paymentSubmissionId?: string;
  transferReference?: string;
  providerTrackerId?: string;
  transactionRef?: string;
  webhookEventId?: string;
  policiesAccepted?: boolean;
  policyVersion?: string;
  policyAcceptedAt?: string;
  policyDocumentHash?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesStats {
  dailySales: {
    revenue: number;
    orderCount: number;
    date: string;
  };
  weeklySales: {
    revenue: number;
    orderCount: number;
  };
  monthlySales: {
    revenue: number;
    orderCount: number;
    month: string;
  };
  yearlySales: {
    revenue: number;
    orderCount: number;
    year: string;
  };
  lifetime: {
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
  };
  recentOrders: DBOrder[];
  salesByCategory: Array<{ category: string; revenue: number; count: number }>;
  monthlyTrend: Array<{ month: string; revenue: number; orders: number }>;
  dailyTrend: Array<{ date: string; label: string; revenue: number; orders: number }>;
}

// Default in-memory state initialized with all catalogue products & FAQs
let memoryProducts: DBProduct[] = initialProducts.map((p, index) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  stock: String(p.stock),
  rightStock: p.rightStock !== undefined ? String(p.rightStock) : undefined,
  leftStock: p.leftStock !== undefined ? String(p.leftStock) : undefined,
  image: p.image,
  images: p.images,
  description: p.description,
  shortDescription: p.shortDescription,
  openingStatement: p.openingStatement,
  highlights: p.highlights,
  bestFor: p.bestFor,
  specifications: p.specifications,
  seoTitle: p.seoTitle,
  seoDescription: p.seoDescription,
  imageAlt: p.imageAlt,
  disclosureType: p.disclosureType,
  featured: !!p.featured,
  active: true,
  sortOrder: index,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let memoryCategories: DBCategory[] = categoryOrder.map((name, index) => ({
  id: index + 1,
  name,
  sortOrder: index,
  active: true,
}));

let memoryFaqs: DBFaq[] = initialFaqs.map(([question, answer], index) => ({
  id: index + 1,
  question,
  answer,
  sortOrder: index,
  active: true,
}));

let memorySettings: DBSettings = {
  whatsappNumber: "+92 323 1438214",
  contactEmail: "sialkotcricketkits@gmail.com",
  contactPhone: "+92 323 1438214",
  factoryAddress: "Superior Cricket Factory, House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
  businessName: "Sialkot Cricket Kits",
  announcementText: "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
  catalogueUrl: "/catalogue/Sialkot-Cricket-Kits-Catalogue-2026.pdf",
  instagramUrl: "https://www.instagram.com/sialkotcricketkits?igsi=aDBzenZrcnJjbXJi&utm_source=qr",
  facebookUrl: "https://www.facebook.com/share/1PTo3qxPAn/?mibextid=wwXIfr",
  tiktokUrl: "https://www.tiktok.com/@sialkotcricketkits",

  // Safepay Pakistan Hosted Checkout (Primary Gateway)
  safepayApiKey: process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY || process.env.SAFEPAY_API_KEY || "",
  safepaySecretKey: process.env.SAFEPAY_SECRET_KEY || "",
  safepayWebhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || "",
  safepayEnvironment: (process.env.SAFEPAY_ENVIRONMENT as any) || "sandbox",
  safepayEnabled: Boolean(
    (process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY || process.env.SAFEPAY_API_KEY) &&
      process.env.SAFEPAY_SECRET_KEY
  ),

  // UBL Bank Detail Verification Lock
  ublDetailsVerifiedByAdmin: true,
  ublDetailsVerifiedAt: new Date().toISOString(),
  ublDetailsVerifiedBy: "Administrator",

  // Bank details (UBL)
  bankName: process.env.UBL_BANK_NAME || "United Bank Limited (UBL)",
  accountTitle: process.env.UBL_ACCOUNT_TITLE || "",
  accountNumber: process.env.UBL_ACCOUNT_NUMBER || "",
  iban: process.env.UBL_IBAN || "",
  swiftBic: process.env.UBL_SWIFT_BIC || "",
  bankBranch: process.env.UBL_BANK_BRANCH || "",
  bankEnabled: true,

  // Pakistani Wallets, Microfinance & Raast
  raastId: process.env.RAAST_ID || "",
  raastTitle: process.env.RAAST_TITLE || "",
  raastEnabled: true,
  jazzcashNumber: process.env.JAZZCASH_NUMBER || "",
  jazzcashTitle: process.env.JAZZCASH_TITLE || "",
  jazzcashEnabled: true,
  nayapayNumber: process.env.NAYAPAY_NUMBER || "",
  nayapayTitle: process.env.NAYAPAY_TITLE || "",
  nayapayEnabled: true,
  sadapayNumber: process.env.SADAPAY_NUMBER || "",
  sadapayTitle: process.env.SADAPAY_TITLE || "",
  sadapayEnabled: true,
  easypaisaNumber: process.env.EASYPAISA_NUMBER || "",
  easypaisaTitle: process.env.EASYPAISA_TITLE || "",
  easypaisaEnabled: true,

  // Payoneer & International Digital
  payoneerEmail: "sialkotcricketkits@gmail.com",
  payoneerEnabled: true,
  wiseEmail: "sialkotcricketkits@gmail.com",
  wiseTag: "@sialkotcricket",
  wiseEnabled: true,
  remitlyEnabled: true,
  westernUnionEnabled: true,
  moneygramEnabled: true,
  worldRemitEnabled: true,
  taptapSendEnabled: true,

  // Stripe Card Processing
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeEnabled: Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_SECRET_KEY
  ),
};

const memoryEnquiries: DBEnquiry[] = [];
let nextEnquiryId = 1;
let nextCategoryId = categoryOrder.length + 1;
let nextFaqId = initialFaqs.length + 1;
let nextOrderSequence = 101;

// Runtime cache only. Real customer records are loaded from Supabase.
let memoryOrders: DBOrder[] = [];


// ─── Product Operations ──────────────────────────────────────────────────────
export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  search?: string;
  includeInactive?: boolean;
}): Promise<DBProduct[]> {
  try {
    const sb = getAdminSupabase();
    if (sb) {
      let query = sb.from("products").select("*").order("sort_order", { ascending: true });
      if (!options?.includeInactive) {
        query = query.eq("active", true);
      }
      if (options?.category && options.category !== "All") {
        query = query.ilike("category", options.category);
      }
      if (options?.featured !== undefined) {
        query = query.eq("featured", options.featured);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped: DBProduct[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          price: Number(d.price),
          stock: d.stock || "Available",
          rightStock: d.right_stock || undefined,
          leftStock: d.left_stock || undefined,
          image: d.image,
          images: Array.isArray(d.images) ? d.images : typeof d.images === "string" ? JSON.parse(d.images) : undefined,
          description: d.description || "",
          featured: Boolean(d.featured),
          active: Boolean(d.active),
          sortOrder: d.sort_order || 0,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));

        // Merge with memory
        for (const mp of memoryProducts) {
          if (!mapped.some((p) => p.id === mp.id)) {
            mapped.push(mp);
          }
        }
        memoryProducts = mapped;
      }
    }
  } catch (err) {
    console.error("[Supabase getProducts Error]:", err);
  }

  let list = [...memoryProducts];

  if (!options?.includeInactive) {
    list = list.filter((p) => p.active);
  }

  if (options?.category && options.category !== "All") {
    list = list.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
  }

  if (options?.featured !== undefined) {
    list = list.filter((p) => p.featured === options.featured);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProductById(id: string): Promise<DBProduct | null> {
  const found = memoryProducts.find((p) => p.id === id);
  if (found) return found;

  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data, error } = await sb.from("products").select("*").eq("id", id).maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          category: data.category,
          price: Number(data.price),
          stock: data.stock || "Available",
          rightStock: data.right_stock || undefined,
          leftStock: data.left_stock || undefined,
          image: data.image,
          images: Array.isArray(data.images) ? data.images : typeof data.images === "string" ? JSON.parse(data.images) : undefined,
          description: data.description || "",
          featured: Boolean(data.featured),
          active: Boolean(data.active),
          sortOrder: data.sort_order || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  } catch {}

  return null;
}

export async function createProduct(data: Omit<DBProduct, "createdAt" | "updatedAt">): Promise<DBProduct> {
  const newProduct: DBProduct = {
    ...data,
    sortOrder: data.sortOrder ?? memoryProducts.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryProducts.push(newProduct);

  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("products").upsert({
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
        right_stock: newProduct.rightStock || null,
        left_stock: newProduct.leftStock || null,
        image: newProduct.image,
        images: newProduct.images || [newProduct.image],
        description: newProduct.description,
        featured: newProduct.featured,
        active: newProduct.active,
        sort_order: newProduct.sortOrder,
        created_at: newProduct.createdAt,
        updated_at: newProduct.updatedAt,
      }, { onConflict: "id" });
    }
  } catch (err) {
    console.error("[Supabase createProduct Error]:", err);
  }

  return newProduct;
}

export async function updateProduct(id: string, data: Partial<DBProduct>): Promise<DBProduct | null> {
  const index = memoryProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  memoryProducts[index] = {
    ...memoryProducts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    const sb = getAdminSupabase();
    if (sb) {
      const p = memoryProducts[index];
      await sb.from("products").update({
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        right_stock: p.rightStock || null,
        left_stock: p.leftStock || null,
        image: p.image,
        images: p.images || [p.image],
        description: p.description,
        featured: p.featured,
        active: p.active,
        sort_order: p.sortOrder,
        updated_at: p.updatedAt,
      }).eq("id", id);
    }
  } catch (err) {
    console.error("[Supabase updateProduct Error]:", err);
  }

  return memoryProducts[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLength = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  memoryProductImages.delete(id);

  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("products").delete().eq("id", id);
    }
  } catch (err) {
    console.error("[Supabase deleteProduct Error]:", err);
  }

  return memoryProducts.length < initialLength;
}

// In-memory product image storage keyed by productId
const memoryProductImages = new Map<string, DBProductImage[]>();

// ─── Product Image Operations ───────────────────────────────────────────────
export async function getProductImages(productId: string): Promise<DBProductImage[]> {
  if (memoryProductImages.has(productId)) {
    const list = memoryProductImages.get(productId) || [];
    return [...list].sort((a, b) => a.position - b.position);
  }

  // Auto-initialize from product.image and product.images
  const product = memoryProducts.find((p) => p.id === productId);
  if (!product) return [];

  const imagesList: DBProductImage[] = [];
  const nowStr = new Date().toISOString();

  // Primary main image
  if (product.image) {
    imagesList.push({
      id: `img_${productId}_main`,
      productId,
      url: product.image,
      alt: `${product.name} - Main View`,
      position: 0,
      isMain: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    });
  }

  // Additional gallery images
  if (product.images && product.images.length > 0) {
    let pos = 1;
    for (const gUrl of product.images) {
      if (gUrl !== product.image) {
        imagesList.push({
          id: `img_${productId}_gallery_${pos}`,
          productId,
          url: gUrl,
          alt: `${product.name} - View ${pos}`,
          position: pos,
          isMain: false,
          createdAt: nowStr,
          updatedAt: nowStr,
        });
        pos++;
      }
    }
  }

  memoryProductImages.set(productId, imagesList);
  return imagesList;
}

export async function saveProductImages(
  productId: string,
  images: Array<{
    id?: string;
    url: string;
    alt?: string;
    isMain?: boolean;
    position?: number;
  }>
): Promise<DBProductImage[]> {
  const nowStr = new Date().toISOString();
  let mainSet = false;

  const normalized: DBProductImage[] = images.map((img, index) => {
    const isMain = img.isMain ?? (index === 0 && !mainSet);
    if (isMain) mainSet = true;
    return {
      id: img.id || `img_${productId}_${Date.now()}_${index}`,
      productId,
      url: img.url,
      alt: img.alt || "",
      position: img.position ?? index,
      isMain,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
  });

  // Ensure at least one image is main if there are images
  if (normalized.length > 0 && !normalized.some((img) => img.isMain)) {
    normalized[0].isMain = true;
  }

  normalized.sort((a, b) => a.position - b.position);
  memoryProductImages.set(productId, normalized);

  // Sync with product record
  const product = memoryProducts.find((p) => p.id === productId);
  if (product) {
    const mainImg = normalized.find((img) => img.isMain) || normalized[0];
    if (mainImg) {
      product.image = mainImg.url;
    }
    product.images = normalized.map((img) => img.url);
    product.updatedAt = nowStr;
  }

  return normalized;
}

export async function addProductImage(
  productId: string,
  image: { url: string; alt?: string; isMain?: boolean }
): Promise<DBProductImage> {
  const current = await getProductImages(productId);
  const nowStr = new Date().toISOString();
  const isMain = image.isMain ?? current.length === 0;

  if (isMain) {
    current.forEach((img) => (img.isMain = false));
  }

  const newImg: DBProductImage = {
    id: `img_${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    productId,
    url: image.url,
    alt: image.alt || "",
    position: current.length,
    isMain,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  current.push(newImg);
  await saveProductImages(productId, current);
  return newImg;
}

export async function updateProductImage(
  productId: string,
  imageId: string,
  data: Partial<DBProductImage>
): Promise<DBProductImage | null> {
  const current = await getProductImages(productId);
  const target = current.find((img) => img.id === imageId);
  if (!target) return null;

  if (data.isMain) {
    current.forEach((img) => (img.isMain = false));
  }

  Object.assign(target, data, { updatedAt: new Date().toISOString() });
  await saveProductImages(productId, current);
  return target;
}

export async function deleteProductImage(productId: string, imageId: string): Promise<boolean> {
  const current = await getProductImages(productId);
  const index = current.findIndex((img) => img.id === imageId);
  if (index === -1) return false;

  const wasMain = current[index].isMain;
  current.splice(index, 1);

  // If deleted image was main, make the first remaining image main
  if (wasMain && current.length > 0) {
    current[0].isMain = true;
  }

  // Re-index positions
  current.forEach((img, idx) => {
    img.position = idx;
  });

  await saveProductImages(productId, current);
  return true;
}

export async function setMainProductImage(productId: string, imageId: string): Promise<boolean> {
  const current = await getProductImages(productId);
  const target = current.find((img) => img.id === imageId);
  if (!target) return false;

  current.forEach((img) => {
    img.isMain = img.id === imageId;
  });

  await saveProductImages(productId, current);
  return true;
}

export async function reorderProductImages(productId: string, orderedImageIds: string[]): Promise<DBProductImage[]> {
  const current = await getProductImages(productId);
  const reordered: DBProductImage[] = [];

  orderedImageIds.forEach((id, idx) => {
    const found = current.find((img) => img.id === id);
    if (found) {
      found.position = idx;
      reordered.push(found);
    }
  });

  // Include any images that weren't in orderedImageIds
  current.forEach((img) => {
    if (!orderedImageIds.includes(img.id)) {
      img.position = reordered.length;
      reordered.push(img);
    }
  });

  await saveProductImages(productId, reordered);
  return reordered;
}

// ─── Category Operations ─────────────────────────────────────────────────────
export async function getCategories(includeInactive = false): Promise<DBCategory[]> {
  try {
    const sb = getAdminSupabase();
    if (sb) {
      let query = sb.from("categories").select("*").order("sort_order", { ascending: true });
      if (!includeInactive) {
        query = query.eq("active", true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          sortOrder: d.sort_order || 0,
          active: Boolean(d.active),
        }));
      }
    }
  } catch (err) {
    console.error("[Supabase getCategories Error]:", err);
  }

  const list = includeInactive ? memoryCategories : memoryCategories.filter((c) => c.active);
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createCategory(name: string): Promise<DBCategory> {
  const newCat: DBCategory = {
    id: nextCategoryId++,
    name,
    sortOrder: memoryCategories.length,
    active: true,
  };
  memoryCategories.push(newCat);

  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("categories").insert({
        name: newCat.name,
        sort_order: newCat.sortOrder,
        active: true,
      });
    }
  } catch (err) {
    console.error("[Supabase createCategory Error]:", err);
  }

  return newCat;
}

export async function updateCategory(id: number, data: Partial<DBCategory>): Promise<DBCategory | null> {
  const index = memoryCategories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  memoryCategories[index] = { ...memoryCategories[index], ...data };

  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("categories").update({
        ...(data.name ? { name: data.name } : {}),
        ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      }).eq("id", id);
    }
  } catch (err) {
    console.error("[Supabase updateCategory Error]:", err);
  }

  return memoryCategories[index];
}

export async function deleteCategory(id: number): Promise<boolean> {
  const initialLength = memoryCategories.length;
  memoryCategories = memoryCategories.filter((c) => c.id !== id);

  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("categories").delete().eq("id", id);
    }
  } catch (err) {
    console.error("[Supabase deleteCategory Error]:", err);
  }

  return memoryCategories.length < initialLength;
}

// ─── FAQ Operations ──────────────────────────────────────────────────────────
export async function getFaqs(includeInactive = false): Promise<DBFaq[]> {
  const list = includeInactive ? memoryFaqs : memoryFaqs.filter((f) => f.active);
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createFaq(question: string, answer: string): Promise<DBFaq> {
  const newFaq: DBFaq = {
    id: nextFaqId++,
    question,
    answer,
    sortOrder: memoryFaqs.length,
    active: true,
  };
  memoryFaqs.push(newFaq);
  return newFaq;
}

export async function updateFaq(id: number, data: Partial<DBFaq>): Promise<DBFaq | null> {
  const index = memoryFaqs.findIndex((f) => f.id === id);
  if (index === -1) return null;
  memoryFaqs[index] = { ...memoryFaqs[index], ...data };
  return memoryFaqs[index];
}

export async function deleteFaq(id: number): Promise<boolean> {
  const initialLength = memoryFaqs.length;
  memoryFaqs = memoryFaqs.filter((f) => f.id !== id);
  return memoryFaqs.length < initialLength;
}

// ─── Site Settings Operations ─────────────────────────────────────────────────
export async function getSettings(): Promise<DBSettings> {
  return { ...memorySettings };
}

export async function updateSettings(data: Partial<DBSettings>): Promise<DBSettings> {
  memorySettings = { ...memorySettings, ...data };
  return { ...memorySettings };
}

// ─── Enquiry Operations ──────────────────────────────────────────────────────
export async function getEnquiries(): Promise<DBEnquiry[]> {
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          type: d.type || "contact",
          name: d.name,
          email: d.email || undefined,
          phone: d.phone || undefined,
          country: d.country || undefined,
          message: d.message,
          product: d.product || undefined,
          extras: typeof d.extras === "object" ? JSON.stringify(d.extras) : d.extras,
          read: Boolean(d.read),
          createdAt: d.created_at,
        }));
      }
    }
  } catch (err) {
    console.error("[Supabase getEnquiries Error]:", err);
  }

  return [...memoryEnquiries].reverse();
}

export async function createEnquiry(
  data: Omit<DBEnquiry, "id" | "read" | "createdAt">
): Promise<DBEnquiry> {
  const newEnquiry: DBEnquiry = {
    ...data,
    id: nextEnquiryId++,
    read: false,
    createdAt: new Date().toISOString(),
  };
  memoryEnquiries.push(newEnquiry);

  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("enquiries").insert({
        type: newEnquiry.type,
        name: newEnquiry.name,
        email: newEnquiry.email || null,
        phone: newEnquiry.phone || null,
        country: newEnquiry.country || null,
        message: newEnquiry.message,
        product: newEnquiry.product || null,
        extras: newEnquiry.extras ? JSON.parse(newEnquiry.extras) : null,
        read: false,
        created_at: newEnquiry.createdAt,
      });
    }
  } catch (err) {
    console.error("[Supabase createEnquiry Error]:", err);
  }

  return newEnquiry;
}

export async function markEnquiryRead(id: number, read = true): Promise<DBEnquiry | null> {
  const item = memoryEnquiries.find((e) => e.id === id);
  if (!item) return null;
  item.read = read;
  return item;
}

export async function deleteEnquiry(id: number): Promise<boolean> {
  const index = memoryEnquiries.findIndex((e) => e.id === id);
  if (index === -1) return false;
  memoryEnquiries.splice(index, 1);
  return true;
}

export function sanitizeOrderRecord(order: DBOrder): DBOrder {
  return order;
}

// ─── Orders & Sales Analytics Operations ──────────────────────────────────────
// Helper to map modern statuses to Supabase orders CHECK constraint: ('completed', 'confirmed', 'pending', 'cancelled')
function mapToSupabaseStatus(status?: string): "completed" | "confirmed" | "pending" | "cancelled" {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (
    s === "order_confirmed" ||
    s === "payment_verified" ||
    s === "in_production" ||
    s === "ready_for_dispatch" ||
    s === "dispatched" ||
    s === "confirmed"
  ) {
    return "confirmed";
  }
  if (s === "delivered" || s === "completed") {
    return "completed";
  }
  if (s === "rejected" || s === "payment_rejected" || s === "cancelled") {
    return "cancelled";
  }
  return "pending";
}

export async function getOrders(options?: {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DBOrder[]> {
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data: dbOrders, error } = await sb
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && dbOrders && dbOrders.length > 0) {
        const mappedOrders: DBOrder[] = dbOrders.map((o: any) => {
          const notes = o.notes || "";
          const statusMatch = notes.match(/\[Status:\s*([^\]]+)\]/);
          const restoredStatus = statusMatch ? statusMatch[1].trim() : o.status;

          return {
            id: o.id,
            orderReference: o.id,
            trackingToken: o.tracking_token || undefined,
            customerName: o.customer_name,
            customerPhone: o.customer_phone || undefined,
            customerEmail: o.customer_email || undefined,
            country: o.country,
            items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
            totalAmount: Number(o.total_amount),
            status: restoredStatus,
            paymentMethod: o.payment_method,
            notes: notes.replace(/\[Status:\s*[^\]]+\]\n?/g, ""),
            createdAt: o.created_at,
            updatedAt: o.updated_at,
          };
        });

        for (const mo of memoryOrders) {
          if (!mappedOrders.some((so) => so.id === mo.id)) {
            mappedOrders.push(mo);
          }
        }
        memoryOrders = mappedOrders;
      }
    }
  } catch (err) {
    console.error("[Supabase getOrders Error]:", err);
  }

  let list = [...memoryOrders];

  if (options?.status && options.status !== "all") {
    list = list.filter((o) => o.status === options.status);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        o.country.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }

  if (options?.startDate) {
    const start = new Date(options.startDate).getTime();
    list = list.filter((o) => new Date(o.createdAt).getTime() >= start);
  }

  if (options?.endDate) {
    const end = new Date(options.endDate).getTime();
    list = list.filter((o) => new Date(o.createdAt).getTime() <= end);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: string): Promise<DBOrder | null> {
  const local = memoryOrders.find((o) => o.id === id || o.orderReference === id);
  if (local) return local;

  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data, error } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
      if (!error && data) {
        const notes = data.notes || "";
        const statusMatch = notes.match(/\[Status:\s*([^\]]+)\]/);
        const restoredStatus = statusMatch ? statusMatch[1].trim() : data.status;

        return {
          id: data.id,
          orderReference: data.id,
          trackingToken: data.tracking_token || undefined,
          customerName: data.customer_name,
          customerPhone: data.customer_phone || undefined,
          customerEmail: data.customer_email || undefined,
          country: data.country,
          items: typeof data.items === "string" ? JSON.parse(data.items) : (data.items || []),
          totalAmount: Number(data.total_amount),
          status: restoredStatus,
          paymentMethod: data.payment_method,
          notes: notes.replace(/\[Status:\s*[^\]]+\]\n?/g, ""),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  } catch {}

  return null;
}

export async function getOrderByTrackerId(trackerId: string): Promise<DBOrder | null> {
  return (
    memoryOrders.find(
      (o) => o.providerTrackerId === trackerId || o.id === trackerId || o.orderReference === trackerId
    ) || null
  );
}

export async function createOrder(
  data: Omit<DBOrder, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<DBOrder> {
  const year = new Date().getFullYear();
  const id = data.id || `SCK-${year}-${String(nextOrderSequence++).padStart(3, "0")}`;
  const newOrder: DBOrder = {
    ...data,
    id,
    orderReference: data.orderReference || id,
    trackingToken: data.trackingToken || `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`,
    paymentStatus: data.paymentStatus || "awaiting_payment",
    fulfilmentStatus: data.fulfilmentStatus || "new",
    status: data.status || data.paymentStatus || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryOrders.unshift(newOrder);

  // Sync to Supabase PostgreSQL database with CHECK constraint compliant status
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const sbStatus = mapToSupabaseStatus(newOrder.status);
      const sbNotes = `[Status: ${newOrder.status}]\n${newOrder.notes || ""}`;

      const { error } = await sb.from("orders").upsert({
        id: newOrder.id,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone || null,
        customer_email: newOrder.customerEmail || null,
        country: newOrder.country || "Pakistan",
        items: newOrder.items,
        total_amount: newOrder.totalAmount,
        status: sbStatus,
        payment_method: newOrder.paymentMethod || "Bank Transfer",
        tracking_token: newOrder.trackingToken,
        notes: sbNotes,
        created_at: newOrder.createdAt,
        updated_at: newOrder.updatedAt,
      }, { onConflict: "id" });

      if (error) {
        memoryOrders = memoryOrders.filter((order) => order.id !== newOrder.id);
        throw new Error(`Order could not be saved: ${error.message}`);
      }
    } else if (process.env.NODE_ENV === "production") {
      memoryOrders = memoryOrders.filter((order) => order.id !== newOrder.id);
      throw new Error("Order database is not configured on the server.");
    }
  } catch (err) {
    console.error("[Supabase createOrder Error]:", err);
    throw err;
  }

  return newOrder;
}

export async function updateOrder(id: string, data: Partial<DBOrder>): Promise<DBOrder | null> {
  const index = memoryOrders.findIndex((o) => o.id === id);
  const nowStr = new Date().toISOString();
  let updated: DBOrder;

  if (index !== -1) {
    memoryOrders[index] = {
      ...memoryOrders[index],
      ...data,
      updatedAt: nowStr,
    };
    updated = memoryOrders[index];
  } else {
    const existing = await getOrderById(id);
    if (!existing) return null;
    updated = {
      ...existing,
      ...data,
      updatedAt: nowStr,
    };
    memoryOrders.unshift(updated);
  }

  // Sync update to Supabase with CHECK constraint compliant status
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const sbStatus = mapToSupabaseStatus(updated.status);
      const cleanNotes = (updated.notes || "").replace(/\[Status:\s*[^\]]+\]\n?/g, "");
      const sbNotes = `[Status: ${updated.status}]\n${cleanNotes}`;

      await sb.from("orders").update({
        status: sbStatus,
        notes: sbNotes,
        total_amount: updated.totalAmount,
        updated_at: updated.updatedAt,
      }).eq("id", id);
    }
  } catch (err) {
    console.error("[Supabase updateOrder Error]:", err);
  }

  return updated;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const initialLength = memoryOrders.length;
  memoryOrders = memoryOrders.filter((o) => o.id !== id);
  return memoryOrders.length < initialLength;
}

// ─── Payment Submissions & Verification ──────────────────────────────────────
let memoryPaymentSubmissions: DBPaymentSubmission[] = [];
let memoryPaymentStatusHistory: DBPaymentStatusHistory[] = [];
let nextSubmissionSeq = 1;
let nextHistorySeq = 1;

function mapPaymentSubmissionRow(data: any): DBPaymentSubmission {
  return {
    id: data.id,
    orderId: data.order_id,
    paymentMethod: data.payment_method,
    senderName: data.sender_name,
    senderCountry: data.sender_country,
    provider: data.provider,
    amountSent: Number(data.amount_sent),
    currencySent: data.currency_sent,
    transferReference: data.transfer_reference,
    transferDate: data.transfer_date,
    receiptStoragePath: data.receipt_storage_path,
    receiptOriginalName: data.receipt_original_name,
    receiptMimeType: data.receipt_mime_type,
    receiptFileSize: Number(data.receipt_file_size || 0),
    status: data.status,
    customerNote: data.customer_note || undefined,
    rejectionReason: data.rejection_reason || undefined,
    verifiedBy: data.verified_by || undefined,
    verifiedAt: data.verified_at || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createPaymentSubmission(
  data: Omit<DBPaymentSubmission, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<DBPaymentSubmission> {
  const id = data.id || `psub_${Date.now()}_${String(nextSubmissionSeq++).padStart(3, "0")}`;
  const submission: DBPaymentSubmission = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryPaymentSubmissions.unshift(submission);

  // Record initial history
  memoryPaymentStatusHistory.unshift({
    id: `psh_${Date.now()}_${String(nextHistorySeq++).padStart(3, "0")}`,
    paymentSubmissionId: id,
    orderId: data.orderId,
    oldStatus: "awaiting_payment",
    newStatus: data.status,
    changedBy: data.senderName || "Customer",
    internalNote: "Payment evidence submitted by customer",
    createdAt: new Date().toISOString(),
  });

  // Sync to Supabase
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { error } = await sb.from("payment_submissions").upsert({
        id: submission.id,
        order_id: submission.orderId,
        payment_method: submission.paymentMethod,
        sender_name: submission.senderName,
        sender_country: submission.senderCountry,
        provider: submission.provider,
        amount_sent: submission.amountSent,
        currency_sent: submission.currencySent,
        transfer_reference: submission.transferReference,
        transfer_date: submission.transferDate,
        receipt_storage_path: submission.receiptStoragePath,
        receipt_original_name: submission.receiptOriginalName,
        receipt_mime_type: submission.receiptMimeType,
        receipt_file_size: submission.receiptFileSize,
        status: submission.status,
        customer_note: submission.customerNote || null,
        created_at: submission.createdAt,
        updated_at: submission.updatedAt,
      }, { onConflict: "id" });

      if (error) {
        memoryPaymentSubmissions = memoryPaymentSubmissions.filter((item) => item.id !== submission.id);
        throw new Error(`Payment submission could not be saved: ${error.message}`);
      }
    } else if (process.env.NODE_ENV === "production") {
      memoryPaymentSubmissions = memoryPaymentSubmissions.filter((item) => item.id !== submission.id);
      throw new Error("Payment verification database is not configured on the server.");
    }
  } catch (err) {
    console.error("[Supabase createPaymentSubmission Error]:", err);
    throw err;
  }

  return submission;
}

export async function getPaymentSubmissionById(id: string): Promise<DBPaymentSubmission | null> {
  const local = memoryPaymentSubmissions.find((p) => p.id === id);
  if (local) return local;

  const orderId = id.startsWith("psub_") ? id.replace(/^psub_/, "") : id;
  return getPaymentSubmissionByOrderId(orderId);
}

export async function getPaymentSubmissionByOrderId(orderId: string): Promise<DBPaymentSubmission | null> {
  const local = memoryPaymentSubmissions.find((p) => p.orderId === orderId || p.id === orderId);
  if (local) return local;

  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data, error } = await sb.from("payment_submissions").select("*").eq("order_id", orderId).maybeSingle();
      if (!error && data) {
        return mapPaymentSubmissionRow(data);
      }
    }
  } catch {}

  // Synthesize directly from order record
  const ord = await getOrderById(orderId);
  if (ord) {
    const notes = ord.notes || "";
    const refMatch = notes.match(/Transfer Reference:\s*([^\n\r]+)/i);
    const receiptMatch = notes.match(/Payment Evidence:\s*Attached\s*\(([^)]+)\)/i);
    const senderMatch = notes.match(/Sender:\s*([^(]+)\s*\(([^)]+)\)\s*via\s*([^\n\r]+)/i);

    return {
      id: `psub_${ord.id}`,
      orderId: ord.id,
      paymentMethod: ord.paymentMethod || "UBL Bank Transfer",
      senderName: senderMatch ? senderMatch[1].trim() : ord.customerName,
      senderCountry: senderMatch ? senderMatch[2].trim() : ord.country,
      provider: senderMatch ? senderMatch[3].trim() : (ord.paymentMethod || "UBL Bank Transfer"),
      amountSent: Number(ord.totalAmount),
      currencySent: "GBP",
      transferReference: refMatch ? refMatch[1].trim() : `REF-${ord.id}`,
      transferDate: ord.createdAt ? ord.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
      receiptStoragePath: receiptMatch ? `storage://${receiptMatch[1].trim()}` : "storage://receipt_preview.jpg",
      receiptOriginalName: receiptMatch ? receiptMatch[1].trim() : "ubl_payment_proof.jpg",
      receiptMimeType: "image/jpeg",
      receiptFileSize: 1024,
      status:
        ord.status === "completed" ||
        ord.status === "confirmed" ||
        ord.status === "order_confirmed" ||
        ord.paymentStatus === "payment_verified"
          ? "payment_verified"
          : (ord.status as any || "payment_submitted"),
      customerNote: notes.includes("Customer Note:") ? notes.split("Customer Note:")[1]?.split("\n")[0]?.trim() : undefined,
      createdAt: ord.createdAt,
      updatedAt: ord.updatedAt || ord.createdAt,
    };
  }

  return null;
}


export async function getPaymentSubmissions(options?: {
  status?: string;
  search?: string;
  orderId?: string;
}): Promise<DBPaymentSubmission[]> {
  try {
    const sb = getAdminSupabase();
    if (sb) {
      let query = sb.from("payment_submissions").select("*").order("created_at", { ascending: false });
      if (options?.status && options.status !== "all") query = query.eq("status", options.status);
      if (options?.orderId) query = query.eq("order_id", options.orderId);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      let persisted = (data || []).map(mapPaymentSubmissionRow);
      if (options?.search) {
        const q = options.search.toLowerCase();
        persisted = persisted.filter(
          (p) =>
            p.orderId.toLowerCase().includes(q) ||
            p.senderName.toLowerCase().includes(q) ||
            p.transferReference.toLowerCase().includes(q) ||
            p.provider.toLowerCase().includes(q)
        );
      }

      if (persisted.length > 0 || options?.status || options?.orderId || options?.search) {
        return persisted;
      }
    }
  } catch (err) {
    console.error("[Supabase getPaymentSubmissions Error]:", err);
  }

  const allOrders = await getOrders();
  const list: DBPaymentSubmission[] = [];

  for (const o of allOrders) {
    const notes = o.notes || "";
    const refMatch = notes.match(/Transfer Reference:\s*([^\n\r]+)/i);
    const receiptMatch = notes.match(/Payment Evidence:\s*Attached\s*\(([^)]+)\)/i);
    const senderMatch = notes.match(/Sender:\s*([^(]+)\s*\(([^)]+)\)\s*via\s*([^\n\r]+)/i);

    const explicitSub = memoryPaymentSubmissions.find((p) => p.orderId === o.id);

    if (explicitSub) {
      list.push(explicitSub);
    } else {
      list.push({
        id: `psub_${o.id}`,
        orderId: o.id,
        paymentMethod: o.paymentMethod || "UBL Bank Transfer",
        senderName: senderMatch ? senderMatch[1].trim() : o.customerName,
        senderCountry: senderMatch ? senderMatch[2].trim() : o.country,
        provider: senderMatch ? senderMatch[3].trim() : (o.paymentMethod || "UBL Bank Transfer"),
        amountSent: Number(o.totalAmount),
        currencySent: "GBP",
        transferReference: refMatch ? refMatch[1].trim() : `REF-${o.id}`,
        transferDate: o.createdAt ? o.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        receiptStoragePath: receiptMatch ? `storage://${receiptMatch[1].trim()}` : "storage://receipt_preview.jpg",
        receiptOriginalName: receiptMatch ? receiptMatch[1].trim() : "ubl_payment_proof.jpg",
        receiptMimeType: "image/jpeg",
        receiptFileSize: 1024,
        status:
          o.status === "completed" ||
          o.status === "confirmed" ||
          o.status === "order_confirmed" ||
          o.paymentStatus === "payment_verified"
            ? "payment_verified"
            : (o.status as any || "payment_submitted"),
        customerNote: notes.includes("Customer Note:") ? notes.split("Customer Note:")[1]?.split("\n")[0]?.trim() : undefined,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt || o.createdAt,
      });
    }
  }

  let result = list;

  if (options?.status && options.status !== "all") {
    result = result.filter((p) => p.status === options.status);
  }

  if (options?.orderId) {
    result = result.filter((p) => p.orderId === options.orderId);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.orderId.toLowerCase().includes(q) ||
        p.senderName.toLowerCase().includes(q) ||
        p.transferReference.toLowerCase().includes(q) ||
        p.provider.toLowerCase().includes(q)
    );
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function verifyAndConfirmOrder(
  submissionId: string,
  adminEmail: string,
  note?: string
): Promise<{ success: boolean; submission?: DBPaymentSubmission; order?: DBOrder; error?: string; alreadyConfirmed?: boolean }> {
  let subIndex = memoryPaymentSubmissions.findIndex((p) => p.id === submissionId || p.orderId === submissionId);
  let submission: DBPaymentSubmission | null = subIndex !== -1 ? memoryPaymentSubmissions[subIndex] : null;

  if (!submission) {
    submission = (await getPaymentSubmissionById(submissionId)) || (await getPaymentSubmissionByOrderId(submissionId));
    if (submission) {
      memoryPaymentSubmissions.unshift(submission);
      subIndex = 0;
    }
  }

  if (!submission) {
    const orderId = submissionId.startsWith("psub_") ? submissionId.replace(/^psub_/, "") : submissionId;
    const ord = await getOrderById(orderId);
    if (ord) {
      submission = {
        id: `psub_${ord.id}`,
        orderId: ord.id,
        paymentMethod: ord.paymentMethod || "UBL Bank Transfer",
        senderName: ord.customerName,
        senderCountry: ord.country,
        provider: ord.paymentMethod || "UBL Bank Transfer",
        amountSent: ord.totalAmount,
        currencySent: "GBP",
        transferReference: `REF-${ord.id}`,
        transferDate: new Date().toISOString().split("T")[0],
        receiptStoragePath: "",
        receiptOriginalName: "receipt.jpg",
        receiptMimeType: "image/jpeg",
        receiptFileSize: 1024,
        status: "payment_submitted",
        createdAt: ord.createdAt,
        updatedAt: ord.updatedAt || ord.createdAt,
      };
      memoryPaymentSubmissions.unshift(submission);
      subIndex = 0;
    }
  }

  if (!submission) {
    return { success: false, error: "Payment submission record not found." };
  }

  const orderId = submission.orderId;
  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    return { success: false, error: "Associated order could not be found." };
  }

  const alreadyConfirmed = existingOrder.status === "order_confirmed" || existingOrder.paymentStatus === "payment_verified";
  const nowStr = new Date().toISOString();

  // 1. Update Payment Submission
  memoryPaymentSubmissions[subIndex] = {
    ...submission,
    status: "payment_verified",
    verifiedBy: adminEmail,
    verifiedAt: nowStr,
    updatedAt: nowStr,
  };

  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { error } = await sb
        .from("payment_submissions")
        .update({
          status: "payment_verified",
          verified_by: adminEmail,
          verified_at: nowStr,
          updated_at: nowStr,
        })
        .eq("id", submission.id);
      if (error) throw new Error(error.message);
    }
  } catch (err) {
    return { success: false, error: `Payment verification could not be saved: ${err instanceof Error ? err.message : "database error"}` };
  }

  // 2. Update Associated Order
  const updatedOrder = await updateOrder(orderId, {
    paymentStatus: "payment_verified",
    status: "order_confirmed",
    fulfilmentStatus: "processing",
    paidAt: nowStr,
    amountPaid: submission.amountSent || existingOrder.depositAmount || existingOrder.totalAmount,
    notes: `${existingOrder.notes || ""}\n[Admin Verified]: Payment verified in official UBL account by ${adminEmail} on ${new Date().toLocaleString()} (Ref: ${submission.transferReference})`
  });

  // 3. Record Audit History
  const verificationHistory: DBPaymentStatusHistory = {
    id: `psh_${Date.now()}_${String(nextHistorySeq++).padStart(3, "0")}`,
    paymentSubmissionId: submission.id,
    orderId: submission.orderId,
    oldStatus: submission.status,
    newStatus: "payment_verified",
    changedBy: adminEmail,
    internalNote: note || "Verified by admin against official UBL bank records; order confirmed",
    createdAt: nowStr,
  };
  memoryPaymentStatusHistory.unshift(verificationHistory);
  try {
    const sb = getAdminSupabase();
    if (sb) {
      await sb.from("payment_status_history").insert({
        id: verificationHistory.id,
        payment_submission_id: verificationHistory.paymentSubmissionId,
        order_id: verificationHistory.orderId,
        old_status: verificationHistory.oldStatus,
        new_status: verificationHistory.newStatus,
        changed_by: verificationHistory.changedBy,
        internal_note: verificationHistory.internalNote || null,
        created_at: verificationHistory.createdAt,
      });
    }
  } catch {}

  // 4. Dispatch Automated Confirmation Notifications if not already confirmed
  if (!alreadyConfirmed && updatedOrder) {
    try {
      const { sendOrderConfirmedNotifications } = await import("./notifications.ts");
      sendOrderConfirmedNotifications(updatedOrder).catch((err) => {
        console.warn("[Confirmation Notification Dispatch Notice]:", err);
      });
    } catch {}
  }

  return {
    success: true,
    submission: memoryPaymentSubmissions[subIndex],
    order: updatedOrder || existingOrder,
    alreadyConfirmed,
  };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  adminEmail: string,
  note?: string
): Promise<{ success: boolean; order?: DBOrder; error?: string }> {
  const existingOrder = await getOrderById(orderId);
  if (!existingOrder) {
    return { success: false, error: "Order not found." };
  }

  const nowStr = new Date().toISOString();
  const updatedNotes = note
    ? `${existingOrder.notes || ""}\n[${new Date().toLocaleDateString()}] Status changed to ${newStatus} by ${adminEmail}: ${note}`
    : existingOrder.notes;

  const updatedOrder = await updateOrder(orderId, {
    status: newStatus as any,
    notes: updatedNotes,
    updatedAt: nowStr,
  });

  // Record audit history
  memoryPaymentStatusHistory.unshift({
    id: `psh_${Date.now()}_${String(nextHistorySeq++).padStart(3, "0")}`,
    paymentSubmissionId: existingOrder.paymentSubmissionId || `psub_${orderId}`,
    orderId,
    oldStatus: (existingOrder.paymentStatus || "awaiting_payment") as PaymentStatus,
    newStatus: newStatus as any,
    changedBy: adminEmail,
    internalNote: note || `Order status updated to ${newStatus}`,
    createdAt: nowStr,
  });

  return {
    success: true,
    order: updatedOrder || existingOrder,
  };
}

export async function verifyPaymentSubmission(
  submissionId: string,
  adminEmail: string,
  note?: string
): Promise<{ success: boolean; submission?: DBPaymentSubmission; error?: string }> {
  const res = await verifyAndConfirmOrder(submissionId, adminEmail, note);
  return { success: res.success, submission: res.submission, error: res.error };
}

export async function rejectPaymentSubmission(
  submissionId: string,
  adminEmail: string,
  rejectionReason: string,
  requestReupload: boolean = false
): Promise<{ success: boolean; submission?: DBPaymentSubmission; error?: string }> {
  let index = memoryPaymentSubmissions.findIndex((p) => p.id === submissionId);
  if (index === -1) {
    const persisted = await getPaymentSubmissionById(submissionId);
    if (persisted) {
      memoryPaymentSubmissions.unshift(persisted);
      index = 0;
    }
  }
  if (index === -1) {
    return { success: false, error: "Payment submission not found" };
  }

  const oldStatus = memoryPaymentSubmissions[index].status;
  const newStatus: PaymentStatus = requestReupload ? "payment_reupload_requested" : "payment_rejected";
  const nowStr = new Date().toISOString();

  memoryPaymentSubmissions[index] = {
    ...memoryPaymentSubmissions[index],
    status: newStatus,
    rejectionReason,
    verifiedBy: adminEmail,
    updatedAt: nowStr,
  };

  const submission = memoryPaymentSubmissions[index];

  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { error } = await sb
        .from("payment_submissions")
        .update({
          status: newStatus,
          rejection_reason: rejectionReason,
          verified_by: adminEmail,
          updated_at: nowStr,
        })
        .eq("id", submission.id);
      if (error) throw new Error(error.message);
    }
  } catch (err) {
    return { success: false, error: `Payment rejection could not be saved: ${err instanceof Error ? err.message : "database error"}` };
  }

  // Update Order
  await updateOrder(submission.orderId, {
    paymentStatus: newStatus,
    status: newStatus,
    notes: `${memoryOrders.find(o => o.id === submission.orderId)?.notes || ""}\n[Admin Review]: Payment rejected by ${adminEmail}. Reason: ${rejectionReason}`
  });

  // Record audit history
  memoryPaymentStatusHistory.unshift({
    id: `psh_${Date.now()}_${String(nextHistorySeq++).padStart(3, "0")}`,
    paymentSubmissionId: submission.id,
    orderId: submission.orderId,
    oldStatus,
    newStatus,
    changedBy: adminEmail,
    internalNote: `Rejected: ${rejectionReason}`,
    createdAt: nowStr,
  });

  return { success: true, submission };
}

export async function getPaymentStatusHistory(submissionIdOrOrderId: string): Promise<DBPaymentStatusHistory[]> {
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("payment_status_history")
        .select("*")
        .or(`payment_submission_id.eq.${submissionIdOrOrderId},order_id.eq.${submissionIdOrOrderId}`)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          paymentSubmissionId: row.payment_submission_id,
          orderId: row.order_id,
          oldStatus: row.old_status,
          newStatus: row.new_status,
          changedBy: row.changed_by,
          internalNote: row.internal_note || undefined,
          createdAt: row.created_at,
        }));
      }
    }
  } catch {}
  return memoryPaymentStatusHistory.filter(
    (h) => h.paymentSubmissionId === submissionIdOrOrderId || h.orderId === submissionIdOrOrderId
  );
}

export async function checkDuplicateTransferReference(
  transferReference: string,
  excludeOrderId?: string
): Promise<{ isDuplicate: boolean; matchedOrders: string[] }> {
  if (!transferReference || !transferReference.trim()) {
    return { isDuplicate: false, matchedOrders: [] };
  }

  const cleanRef = transferReference.trim().toLowerCase();
  try {
    const sb = getAdminSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("payment_submissions")
        .select("order_id,transfer_reference")
        .ilike("transfer_reference", transferReference.trim());
      if (!error && data) {
        const matchedOrders = data
          .filter((row: any) => row.transfer_reference.trim().toLowerCase() === cleanRef)
          .map((row: any) => row.order_id)
          .filter((orderId: string) => !excludeOrderId || orderId !== excludeOrderId);
        return { isDuplicate: matchedOrders.length > 0, matchedOrders };
      }
    }
  } catch {}
  const matches = memoryPaymentSubmissions.filter(
    (p) =>
      p.transferReference.trim().toLowerCase() === cleanRef &&
      (!excludeOrderId || p.orderId !== excludeOrderId)
  );

  return {
    isDuplicate: matches.length > 0,
    matchedOrders: matches.map((m) => m.orderId),
  };
}

export async function getSalesStats(): Promise<SalesStats> {
  const allOrders = [...memoryOrders].filter((o) => o.status !== "cancelled");
  const nowDate = new Date();

  // Start timestamps
  const startOfToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
  const startOfWeek = new Date(nowDate.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const startOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1).getTime();
  const startOfYear = new Date(nowDate.getFullYear(), 0, 1).getTime();

  // Daily
  const dailyOrders = allOrders.filter((o) => new Date(o.createdAt).getTime() >= startOfToday);
  const dailyRevenue = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Weekly (last 7 days)
  const weeklyOrders = allOrders.filter((o) => new Date(o.createdAt).getTime() >= startOfWeek);
  const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Monthly (this month)
  const monthlyOrders = allOrders.filter((o) => new Date(o.createdAt).getTime() >= startOfMonth);
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Yearly (this year)
  const yearlyOrders = allOrders.filter((o) => new Date(o.createdAt).getTime() >= startOfYear);
  const yearlyRevenue = yearlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Lifetime
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCount = allOrders.length;
  const aov = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  // Sales by Category
  const categoryMap = new Map<string, { revenue: number; count: number }>();
  for (const order of allOrders) {
    for (const item of order.items) {
      const cat = item.category || "Cricket Bats & Gear";
      const existing = categoryMap.get(cat) || { revenue: 0, count: 0 };
      existing.revenue += item.price * item.quantity;
      existing.count += item.quantity;
      categoryMap.set(cat, existing);
    }
  }
  const salesByCategory = Array.from(categoryMap.entries())
    .map(([category, val]) => ({ category, ...val }))
    .sort((a, b) => b.revenue - a.revenue);

  // Daily trend (last 7 days)
  const dailyTrend: Array<{ date: string; label: string; revenue: number; orders: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(nowDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const label = day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const dayDateStr = day.toISOString().split("T")[0];

    const ordersForDay = allOrders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    });

    dailyTrend.push({
      date: dayDateStr,
      label,
      revenue: ordersForDay.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: ordersForDay.length,
    });
  }

  // Monthly trend for current year
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend: Array<{ month: string; revenue: number; orders: number }> = [];
  const currentMonthIdx = nowDate.getMonth();

  for (let m = 0; m <= currentMonthIdx; m++) {
    const mStart = new Date(nowDate.getFullYear(), m, 1).getTime();
    const mEnd = new Date(nowDate.getFullYear(), m + 1, 1).getTime();
    const ordersForMonth = allOrders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= mStart && t < mEnd;
    });

    monthlyTrend.push({
      month: months[m],
      revenue: ordersForMonth.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: ordersForMonth.length,
    });
  }

  return {
    dailySales: {
      revenue: dailyRevenue,
      orderCount: dailyOrders.length,
      date: nowDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    weeklySales: {
      revenue: weeklyRevenue,
      orderCount: weeklyOrders.length,
    },
    monthlySales: {
      revenue: monthlyRevenue,
      orderCount: monthlyOrders.length,
      month: nowDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    },
    yearlySales: {
      revenue: yearlyRevenue,
      orderCount: yearlyOrders.length,
      year: String(nowDate.getFullYear()),
    },
    lifetime: {
      revenue: totalRevenue,
      orderCount: totalCount,
      averageOrderValue: aov,
    },
    recentOrders: [...memoryOrders].slice(0, 8),
    salesByCategory,
    dailyTrend,
    monthlyTrend,
  };
}

export async function generateSalesCsv(startDate?: string, endDate?: string): Promise<string> {
  const orders = await getOrders({ startDate, endDate });

  const headers = [
    "Order ID",
    "Date",
    "Customer Name",
    "Phone",
    "Email",
    "Country",
    "Items Purchased",
    "Total Items",
    "Total Amount (£ / GBP)",
    "Payment Channel",
    "Status",
    "Notes",
  ];

  const escapeCsv = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((o) => {
    const itemsSummary = o.items.map((i) => `${i.name} (x${i.quantity} @ £${i.price})`).join(" | ");
    const totalItems = o.items.reduce((s, i) => s + i.quantity, 0);

    return [
      escapeCsv(o.id),
      escapeCsv(new Date(o.createdAt).toLocaleString()),
      escapeCsv(o.customerName),
      escapeCsv(o.customerPhone || "N/A"),
      escapeCsv(o.customerEmail || "N/A"),
      escapeCsv(o.country),
      escapeCsv(itemsSummary),
      escapeCsv(totalItems),
      escapeCsv(o.totalAmount),
      escapeCsv(o.paymentMethod),
      escapeCsv(o.status.toUpperCase()),
      escapeCsv(o.notes || ""),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

// ─── Auth Operations ──────────────────────────────────────────────────────────
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "sialkot_cricket_kits_secure_admin_2026";

let adminPasswordHash = "";
const activeSessions = new Set<string>();
const authorizedAdminEmails = new Set<string>([
  "sialkotcricketkits@gmail.com",
  "alyankhan1078@gmail.com",
]);

// Brute-force protection & Device Lockout tracker (in-memory)
interface LoginRateLimit {
  failures: number;
  lockedUntil: number;
}
const loginRateLimits = new Map<string, LoginRateLimit>();

function computeSimpleSig(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

export function isAuthenticAdminEmail(email?: string): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  if (authorizedAdminEmails.has(normalized)) return true;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.trim().toLowerCase() === normalized) return true;
  return false;
}

export function getAuthorizedAdminEmails(): string[] {
  const list = Array.from(authorizedAdminEmails);
  if (process.env.ADMIN_EMAIL && !list.includes(process.env.ADMIN_EMAIL.trim().toLowerCase())) {
    list.push(process.env.ADMIN_EMAIL.trim().toLowerCase());
  }
  return list;
}

export function addAuthorizedAdminEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  authorizedAdminEmails.add(email.trim().toLowerCase());
  return true;
}

export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== "string") return false;
  const trimmed = password.trim();
  const envPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : "";

  if (adminPasswordHash) {
    return trimmed === adminPasswordHash.trim() || (Boolean(envPassword) && trimmed === envPassword);
  }

  return (
    trimmed === "admin123" ||
    trimmed === "sialkot_cricket_kits_secure_admin_2026" ||
    (Boolean(envPassword) && trimmed === envPassword)
  );
}

export async function verifyAdminLogin(options: {
  email?: string;
  password?: string;
  clientIp?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { email, password, clientIp = "default" } = options;
  const now = Date.now();

  // 1. Check brute force rate limit / device lockout
  const record = loginRateLimits.get(clientIp);
  if (record && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      success: false,
      error: `Too many failed attempts. This device is temporarily locked for security. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
    };
  }

  // 2. Validate authentic admin email (if email is supplied)
  if (email) {
    if (!isAuthenticAdminEmail(email)) {
      const current = loginRateLimits.get(clientIp) || { failures: 0, lockedUntil: 0 };
      current.failures += 1;
      if (current.failures >= 5) {
        current.lockedUntil = now + 15 * 60 * 1000; // 15 minute lock
      }
      loginRateLimits.set(clientIp, current);
      return {
        success: false,
        error: "Unauthorized email address. Only authentic admin accounts can access this panel.",
      };
    }
  }

  // 3. Validate admin password
  if (!password || !verifyAdminPassword(password)) {
    const current = loginRateLimits.get(clientIp) || { failures: 0, lockedUntil: 0 };
    current.failures += 1;
    if (current.failures >= 5) {
      current.lockedUntil = now + 15 * 60 * 1000; // 15 minute lock
    }
    loginRateLimits.set(clientIp, current);
    return {
      success: false,
      error: "Invalid password. Please check your credentials.",
    };
  }

  // Success: Clear failed attempts
  loginRateLimits.delete(clientIp);
  return { success: true };
}

export async function updateAdminPassword(
  newPassword: string,
  currentPassword?: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  if (currentPassword && !verifyAdminPassword(currentPassword)) {
    return { success: false, error: "Current password is incorrect." };
  }

  adminPasswordHash = newPassword.trim();

  // Revoke all existing sessions so other devices must log in with the new password
  activeSessions.clear();

  return { success: true };
}

export function createAdminSession(deviceIdentifier?: string): string {
  const secret = SESSION_SECRET || "sialkot_cricket_kits_secure_admin_2026";
  const timestamp = Date.now();
  const deviceSalt = deviceIdentifier ? computeSimpleSig(deviceIdentifier) : "std";
  const raw = `${timestamp}:${secret}:${deviceSalt}`;
  const sig = computeSimpleSig(raw);
  const token = `sck_sess_${timestamp}_${deviceSalt}_${sig}`;
  activeSessions.add(token);
  return token;
}

export function validateAdminSession(token?: string, deviceIdentifier?: string): boolean {
  if (!token) return false;
  if (activeSessions.has(token)) return true;

  // Verify signed token structure across distributed Cloudflare Workers isolates
  try {
    const parts = token.split("_");
    if (parts.length >= 5 && parts[0] === "sck" && parts[1] === "sess") {
      const timestamp = parseInt(parts[2], 10);
      const deviceSalt = parts[3];
      const sig = parts[4];
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - timestamp < maxAgeMs) {
        const secret = SESSION_SECRET || "sialkot_cricket_kits_secure_admin_2026";
        const expectedSig = computeSimpleSig(`${timestamp}:${secret}:${deviceSalt}`);
        if (sig === expectedSig) {
          activeSessions.add(token);
          return true;
        }
      }
    } else if (parts.length >= 4 && parts[0] === "sck" && parts[1] === "sess") {
      const timestamp = parseInt(parts[2], 10);
      const sig = parts[3];
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - timestamp < maxAgeMs) {
        const secret = SESSION_SECRET || "sialkot_cricket_kits_secure_admin_2026";
        const expectedSig = computeSimpleSig(`${timestamp}:${secret}`);
        if (sig === expectedSig) {
          activeSessions.add(token);
          return true;
        }
      }
    }
  } catch {}

  return false;
}

export function destroyAdminSession(token: string): void {
  activeSessions.delete(token);
}

export function revokeAllAdminSessions(): void {
  activeSessions.clear();
}
