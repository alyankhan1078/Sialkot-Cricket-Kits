import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Products ────────────────────────────────────────────────────────────────
export const products = sqliteTable("products", {
  id: text("id").primaryKey(), // slug like "beauty-processed-bats-silver-edition"
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  stock: text("stock").notNull().default("0"), // stored as string: number or "Available" or "Confirm on WhatsApp"
  rightStock: text("right_stock"), // nullable
  leftStock: text("left_stock"), // nullable
  image: text("image").notNull(),
  images: text("images"), // JSON array of image paths
  description: text("description").notNull().default(""),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Product Images (Dedicated Media Table) ──────────────────────────────────
export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(), // e.g. "img_apex_pro_01" or uuid
  productId: text("product_id").notNull(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  position: integer("position").notNull().default(0),
  isMain: integer("is_main", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// ─── FAQs ─────────────────────────────────────────────────────────────────────
export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  label: text("label").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Enquiries ────────────────────────────────────────────────────────────────
export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["contact", "custom_bat"] }).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  country: text("country"),
  message: text("message").notNull(),
  product: text("product"), // product name/id if related
  extras: text("extras"), // JSON for custom bat extras (weight, handle, profile, etc.)
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Orders / Sales ───────────────────────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), // e.g. "SCK-2026-001"
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  country: text("country").notNull().default("Pakistan"),
  items: text("items").notNull(), // JSON string array of { productId, name, price, quantity }
  totalAmount: real("total_amount").notNull(),
  status: text("status", { enum: ["completed", "confirmed", "pending", "cancelled"] }).notNull().default("completed"),
  paymentMethod: text("payment_method").notNull().default("Direct Transfer"),
  notes: text("notes").default(""),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Admin Sessions ───────────────────────────────────────────────────────────
export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(), // random UUID
  expiresAt: text("expires_at").notNull(),
});

// ─── Admin Config (password hash stored here) ─────────────────────────────────
export const adminConfig = sqliteTable("admin_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type Product = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductImageInsert = typeof productImages.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type EnquiryInsert = typeof enquiries.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
