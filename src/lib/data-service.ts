import { products as initialProducts, categoryOrder, type Product as ProductType } from "@/src/data/products";
import { faqs as initialFaqs } from "@/src/data/faqs";

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
  featured: boolean;
  active: boolean;
  sortOrder: number;
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

export interface DBSettings {
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  factoryAddress: string;
  businessName: string;
  announcementText: string;
  catalogueUrl: string;
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
  factoryAddress: "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
  businessName: "Sialkot Cricket Kits",
  announcementText: "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
  catalogueUrl: "/catalogue/Sialkot-Cricket-Kits-Catalogue-2026.pdf",
};

const memoryEnquiries: DBEnquiry[] = [];
let nextEnquiryId = 1;
let nextCategoryId = categoryOrder.length + 1;
let nextFaqId = initialFaqs.length + 1;

// Admin password (default: admin123; can be updated from admin panel)
let adminPasswordHash = "admin123";
const activeSessions = new Set<string>();

// ─── Product Operations ──────────────────────────────────────────────────────
export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  search?: string;
  includeInactive?: boolean;
}): Promise<DBProduct[]> {
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
  return found || null;
}

export async function createProduct(data: Omit<DBProduct, "createdAt" | "updatedAt">): Promise<DBProduct> {
  const newProduct: DBProduct = {
    ...data,
    sortOrder: data.sortOrder ?? memoryProducts.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryProducts.push(newProduct);
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
  return memoryProducts[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLength = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  return memoryProducts.length < initialLength;
}

// ─── Category Operations ─────────────────────────────────────────────────────
export async function getCategories(includeInactive = false): Promise<DBCategory[]> {
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
  return newCat;
}

export async function updateCategory(id: number, data: Partial<DBCategory>): Promise<DBCategory | null> {
  const index = memoryCategories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  memoryCategories[index] = { ...memoryCategories[index], ...data };
  return memoryCategories[index];
}

export async function deleteCategory(id: number): Promise<boolean> {
  const initialLength = memoryCategories.length;
  memoryCategories = memoryCategories.filter((c) => c.id !== id);
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

// ─── Auth Operations ──────────────────────────────────────────────────────────
export function verifyAdminPassword(password: string): boolean {
  return password === adminPasswordHash;
}

export function updateAdminPassword(newPassword: string): void {
  adminPasswordHash = newPassword;
}

export function createAdminSession(): string {
  const token = `sck_sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  activeSessions.add(token);
  return token;
}

export function validateAdminSession(token?: string): boolean {
  if (!token) return false;
  return activeSessions.has(token);
}

export function destroyAdminSession(token: string): void {
  activeSessions.delete(token);
}
