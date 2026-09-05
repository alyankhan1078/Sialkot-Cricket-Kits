import { categoryOrder, products as staticProducts } from "../data/products.ts";
import { faqs as initialFaqs } from "../data/faqs.ts";
import { getAdminSupabase, requireAdminSupabase } from "./supabase.ts";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

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
  storagePath?: string;
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

// No in-memory product storage. Supabase is the single source of truth.

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


// ─── Helper: Map DB row to DBProduct ──────────────────────────────────────────
function mapDbRowToProduct(d: any): DBProduct {
  return {
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
    shortDescription: d.short_description || undefined,
    openingStatement: d.opening_statement || undefined,
    highlights: Array.isArray(d.highlights) ? d.highlights : undefined,
    bestFor: d.best_for || undefined,
    specifications: Array.isArray(d.specifications) ? d.specifications : undefined,
    seoTitle: d.seo_title || undefined,
    seoDescription: d.seo_description || undefined,
    imageAlt: d.image_alt || undefined,
    disclosureType: d.disclosure_type || undefined,
    featured: Boolean(d.featured),
    active: Boolean(d.active),
    sortOrder: d.sort_order || 0,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

function mapDbRowToProductImage(d: any): DBProductImage {
  return {
    id: d.id,
    productId: d.product_id,
    url: d.url,
    storagePath: d.storage_path || undefined,
    alt: d.alt || "",
    position: d.position ?? 0,
    isMain: Boolean(d.is_main),
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

/** Revalidate storefront pages after product mutations */
export function revalidateProductPages(productId?: string) {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/shop", "page");
    if (productId) {
      revalidatePath(`/product/${productId}`, "page");
    }
  } catch (e) {
    // revalidatePath may throw if called outside a server context (e.g. during build)
    console.warn("[revalidateProductPages] skipped:", e);
  }
}

function getFallbackStaticProducts(options?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): DBProduct[] {
  let list: DBProduct[] = staticProducts.map((p, idx) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stockStatus === "in_stock" ? "Available" : "0",
    image: p.image,
    images: p.gallery && p.gallery.length > 0 ? p.gallery : [p.image],
    description: p.description || "",
    featured: Boolean(p.featured),
    active: true,
    sortOrder: idx,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

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
  return list;
}

// ─── Product Operations (Supabase source of truth, resilient build fallback) ──
export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  search?: string;
  includeInactive?: boolean;
}): Promise<DBProduct[]> {
  const sb = getAdminSupabase();
  if (!sb) {
    console.warn("[getProducts] Supabase client unavailable, using catalogue fallback");
    return getFallbackStaticProducts(options);
  }

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
  if (error || !data || data.length === 0) {
    if (error) console.warn("[getProducts] Supabase query notice:", error.message);
    return getFallbackStaticProducts(options);
  }

  let list = (data || []).map(mapDbRowToProduct);

  // Client-side search filter
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getProductById(id: string): Promise<DBProduct | null> {
  const sb = getAdminSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("products").select("*").eq("id", id).maybeSingle();
      if (!error && data) {
        return mapDbRowToProduct(data);
      }
    } catch {}
  }

  const fallback = staticProducts.find((p) => p.id === id);
  if (fallback) {
    return {
      id: fallback.id,
      name: fallback.name,
      category: fallback.category,
      price: fallback.price,
      stock: fallback.stockStatus === "in_stock" ? "Available" : "0",
      image: fallback.image,
      images: fallback.gallery && fallback.gallery.length > 0 ? fallback.gallery : [fallback.image],
      description: fallback.description || "",
      featured: Boolean(fallback.featured),
      active: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}

export async function createProduct(data: Omit<DBProduct, "createdAt" | "updatedAt">): Promise<DBProduct> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();

  const { data: inserted, error } = await sb
    .from("products")
    .insert({
      id: data.id,
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock,
      right_stock: data.rightStock || null,
      left_stock: data.leftStock || null,
      image: data.image || "/assets/products/bat-collection.webp",
      images: data.images || [],
      description: data.description || "",
      featured: data.featured ?? false,
      active: data.active ?? true,
      sort_order: data.sortOrder ?? 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !inserted) {
    const errId = crypto.randomUUID().slice(0, 8);
    console.error(`[createProduct] Error ${errId}:`, error?.message);
    throw new Error(`Database error creating product [ref: ${errId}]`);
  }

  revalidateProductPages(inserted.id);
  return mapDbRowToProduct(inserted);
}

export async function updateProduct(id: string, data: Partial<DBProduct>): Promise<DBProduct | null> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();

  // Build update payload with only provided fields
  const payload: Record<string, any> = { updated_at: now };
  if (data.name !== undefined) payload.name = data.name;
  if (data.category !== undefined) payload.category = data.category;
  if (data.price !== undefined) payload.price = data.price;
  if (data.stock !== undefined) payload.stock = data.stock;
  if (data.rightStock !== undefined) payload.right_stock = data.rightStock || null;
  if (data.leftStock !== undefined) payload.left_stock = data.leftStock || null;
  if (data.image !== undefined) payload.image = data.image;
  if (data.images !== undefined) payload.images = data.images;
  if (data.description !== undefined) payload.description = data.description;
  if (data.shortDescription !== undefined) payload.short_description = data.shortDescription;
  if (data.openingStatement !== undefined) payload.opening_statement = data.openingStatement;
  if (data.highlights !== undefined) payload.highlights = data.highlights;
  if (data.bestFor !== undefined) payload.best_for = data.bestFor;
  if (data.specifications !== undefined) payload.specifications = data.specifications;
  if (data.seoTitle !== undefined) payload.seo_title = data.seoTitle;
  if (data.seoDescription !== undefined) payload.seo_description = data.seoDescription;
  if (data.imageAlt !== undefined) payload.image_alt = data.imageAlt;
  if (data.disclosureType !== undefined) payload.disclosure_type = data.disclosureType;
  if (data.featured !== undefined) payload.featured = data.featured;
  if (data.active !== undefined) payload.active = data.active;
  if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder;

  const { data: updated, error } = await sb
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    const errId = crypto.randomUUID().slice(0, 8);
    console.error(`[updateProduct] Error ${errId}:`, error?.message);
    throw new Error(`Database error updating product [ref: ${errId}]`);
  }

  revalidateProductPages(id);
  return mapDbRowToProduct(updated);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const sb = requireAdminSupabase();

  // 1. Get all product images to clean up Storage objects
  const { data: imageRows } = await sb
    .from("product_images")
    .select("id, storage_path")
    .eq("product_id", id);

  // 2. Delete Storage objects for images that have storage_path
  if (imageRows && imageRows.length > 0) {
    const storagePaths = imageRows
      .map((r: any) => r.storage_path)
      .filter((p: string | null) => p);

    if (storagePaths.length > 0) {
      const { error: storageErr } = await sb.storage
        .from("product-images")
        .remove(storagePaths);
      if (storageErr) {
        console.warn(`[deleteProduct] Storage cleanup warning:`, storageErr.message);
      }
    }
  }

  // 3. Delete product_images rows (CASCADE should handle this, but be explicit)
  await sb.from("product_images").delete().eq("product_id", id);

  // 4. Delete the product itself
  const { error, count } = await sb
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    const errId = crypto.randomUUID().slice(0, 8);
    console.error(`[deleteProduct] Error ${errId}:`, error.message);
    throw new Error(`Database error deleting product [ref: ${errId}]`);
  }

  revalidateProductPages(id);
  return true;
}

// ─── Product Image Operations (Supabase product_images table) ────────────────
export async function getProductImages(productId: string): Promise<DBProductImage[]> {
  const sb = getAdminSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (error) {
    console.error("[getProductImages] Supabase error:", error.message);
    return [];
  }

  return (data || []).map(mapDbRowToProductImage);
}

export async function saveProductImages(
  productId: string,
  images: Array<{
    id?: string;
    url: string;
    storagePath?: string;
    alt?: string;
    isMain?: boolean;
    position?: number;
  }>
): Promise<DBProductImage[]> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();

  // Normalize
  let mainSet = false;
  const normalized = images.map((img, index) => {
    const isMain = img.isMain ?? (index === 0 && !mainSet);
    if (isMain) mainSet = true;
    return {
      id: img.id || crypto.randomUUID(),
      product_id: productId,
      url: img.url,
      storage_path: img.storagePath || null,
      alt: img.alt || "",
      position: img.position ?? index,
      is_main: isMain,
      updated_at: now,
    };
  });

  // Ensure at least one main
  if (normalized.length > 0 && !normalized.some((img) => img.is_main)) {
    normalized[0].is_main = true;
  }

  normalized.sort((a, b) => a.position - b.position);

  // Delete existing rows and re-insert (atomic save)
  const { error: deleteError } = await sb
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    console.error("[saveProductImages] Delete error:", deleteError.message);
    throw new Error("Failed to save product images");
  }

  if (normalized.length > 0) {
    const { error: insertError } = await sb
      .from("product_images")
      .insert(normalized.map(img => ({
        id: img.id,
        product_id: img.product_id,
        url: img.url,
        storage_path: img.storage_path,
        alt: img.alt,
        position: img.position,
        is_main: img.is_main,
        created_at: now,
        updated_at: now,
      })));

    if (insertError) {
      console.error("[saveProductImages] Insert error:", insertError.message);
      throw new Error("Failed to save product images");
    }
  }

  // Sync main image + images array to the products table
  const mainImg = normalized.find((img) => img.is_main) || normalized[0];
  const imageUrls = normalized.map((img) => img.url);
  const productUpdate: Record<string, any> = {
    images: imageUrls,
    updated_at: now,
  };
  if (mainImg) {
    productUpdate.image = mainImg.url;
  }

  await sb.from("products").update(productUpdate).eq("id", productId);

  // Return the saved images
  return await getProductImages(productId);
}

export async function addProductImage(
  productId: string,
  image: { url: string; storagePath?: string; alt?: string; isMain?: boolean }
): Promise<DBProductImage> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();
  const current = await getProductImages(productId);
  const isMain = image.isMain ?? current.length === 0;

  // If setting as main, unset existing main
  if (isMain && current.length > 0) {
    await sb
      .from("product_images")
      .update({ is_main: false, updated_at: now })
      .eq("product_id", productId)
      .eq("is_main", true);
  }

  const newId = crypto.randomUUID();
  const { data: inserted, error } = await sb
    .from("product_images")
    .insert({
      id: newId,
      product_id: productId,
      url: image.url,
      storage_path: image.storagePath || null,
      alt: image.alt || "",
      position: current.length,
      is_main: isMain,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !inserted) {
    const errId = crypto.randomUUID().slice(0, 8);
    console.error(`[addProductImage] Error ${errId}:`, error?.message);
    throw new Error(`Failed to add product image [ref: ${errId}]`);
  }

  // Sync products table
  const allImages = await getProductImages(productId);
  const mainImgRow = allImages.find((i) => i.isMain) || allImages[0];
  await sb.from("products").update({
    image: mainImgRow?.url || image.url,
    images: allImages.map((i) => i.url),
    updated_at: now,
  }).eq("id", productId);

  revalidateProductPages(productId);
  return mapDbRowToProductImage(inserted);
}

export async function updateProductImage(
  productId: string,
  imageId: string,
  data: Partial<DBProductImage>
): Promise<DBProductImage | null> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();

  const payload: Record<string, any> = { updated_at: now };
  if (data.url !== undefined) payload.url = data.url;
  if (data.storagePath !== undefined) payload.storage_path = data.storagePath;
  if (data.alt !== undefined) payload.alt = data.alt;
  if (data.position !== undefined) payload.position = data.position;

  if (data.isMain) {
    // Unset all other main images for this product
    await sb
      .from("product_images")
      .update({ is_main: false, updated_at: now })
      .eq("product_id", productId)
      .eq("is_main", true);
    payload.is_main = true;
  } else if (data.isMain === false) {
    payload.is_main = false;
  }

  const { data: updated, error } = await sb
    .from("product_images")
    .update(payload)
    .eq("id", imageId)
    .eq("product_id", productId)
    .select()
    .single();

  if (error || !updated) return null;

  // Sync products table
  const allImages = await getProductImages(productId);
  const mainImgRow = allImages.find((i) => i.isMain) || allImages[0];
  if (mainImgRow) {
    await sb.from("products").update({
      image: mainImgRow.url,
      images: allImages.map((i) => i.url),
      updated_at: now,
    }).eq("id", productId);
  }

  revalidateProductPages(productId);
  return mapDbRowToProductImage(updated);
}

export async function deleteProductImage(productId: string, imageId: string): Promise<boolean> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();

  // Get the image to find its storage_path and is_main status
  const { data: imgRow } = await sb
    .from("product_images")
    .select("*")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (!imgRow) return false;

  const wasMain = imgRow.is_main;
  const storagePath = imgRow.storage_path;

  // Delete the DB row
  const { error } = await sb
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error("[deleteProductImage] DB error:", error.message);
    throw new Error("Failed to delete product image");
  }

  // Delete from Storage if applicable
  if (storagePath) {
    const { error: storageErr } = await sb.storage
      .from("product-images")
      .remove([storagePath]);
    if (storageErr) {
      console.warn("[deleteProductImage] Storage cleanup warning:", storageErr.message);
    }
  }

  // If deleted was main, promote next image
  if (wasMain) {
    const remaining = await getProductImages(productId);
    if (remaining.length > 0) {
      await sb
        .from("product_images")
        .update({ is_main: true, updated_at: now })
        .eq("id", remaining[0].id);
    }
  }

  // Re-index positions
  const remaining = await getProductImages(productId);
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].position !== i) {
      await sb
        .from("product_images")
        .update({ position: i, updated_at: now })
        .eq("id", remaining[i].id);
    }
  }

  // Sync products table
  const allImages = await getProductImages(productId);
  const mainImgRow = allImages.find((i) => i.isMain) || allImages[0];
  await sb.from("products").update({
    image: mainImgRow?.url || "/assets/products/bat-collection.webp",
    images: allImages.map((i) => i.url),
    updated_at: now,
  }).eq("id", productId);

  revalidateProductPages(productId);
  return true;
}

export async function setMainProductImage(productId: string, imageId: string): Promise<boolean> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();

  // Unset all main for this product
  await sb
    .from("product_images")
    .update({ is_main: false, updated_at: now })
    .eq("product_id", productId);

  // Set the target as main
  const { error } = await sb
    .from("product_images")
    .update({ is_main: true, updated_at: now })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) {
    console.error("[setMainProductImage] error:", error.message);
    throw new Error("Failed to set main image");
  }

  // Sync products table
  const { data: mainRow } = await sb
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .single();

  if (mainRow) {
    await sb.from("products").update({
      image: mainRow.url,
      updated_at: now,
    }).eq("id", productId);
  }

  revalidateProductPages(productId);
  return true;
}

export async function reorderProductImages(productId: string, orderedImageIds: string[]): Promise<DBProductImage[]> {
  const sb = requireAdminSupabase();
  const now = new Date().toISOString();

  // Update positions
  for (let i = 0; i < orderedImageIds.length; i++) {
    await sb
      .from("product_images")
      .update({ position: i, updated_at: now })
      .eq("id", orderedImageIds[i])
      .eq("product_id", productId);
  }

  // Sync products.images order
  const allImages = await getProductImages(productId);
  await sb.from("products").update({
    images: allImages.map((i) => i.url),
    updated_at: now,
  }).eq("id", productId);

  revalidateProductPages(productId);
  return allImages;
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


