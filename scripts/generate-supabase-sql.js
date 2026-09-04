import fs from 'node:fs';
import { products, categories, categoryOrder } from '../src/data/products.ts';

const escapeSql = (str) => {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
};

const escapeJson = (obj) => {
  if (obj === null || obj === undefined) return 'NULL';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
};

let sql = `-- =============================================================================
-- SIALKOT CRICKET KITS - FULL SUPABASE POSTGRESQL SCHEMA & SEED SCRIPT
-- Target Project: https://yokiizorrqopfhbvrtpa.supabase.co
-- Generated on: ${new Date().toISOString()}
-- =============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running migration
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admin_config CASCADE;

-- -----------------------------------------------------------------------------
-- TABLE: products
-- -----------------------------------------------------------------------------
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock TEXT NOT NULL DEFAULT '0',
  right_stock TEXT,
  left_stock TEXT,
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_active ON products(active);

-- -----------------------------------------------------------------------------
-- TABLE: product_images
-- -----------------------------------------------------------------------------
CREATE TABLE product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  is_main BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_position ON product_images(product_id, position);

-- -----------------------------------------------------------------------------
-- TABLE: categories
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);

-- -----------------------------------------------------------------------------
-- TABLE: faqs
-- -----------------------------------------------------------------------------
CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);

-- -----------------------------------------------------------------------------
-- TABLE: site_settings
-- -----------------------------------------------------------------------------
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: enquiries
-- -----------------------------------------------------------------------------
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('contact', 'custom_bat')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  country TEXT,
  message TEXT NOT NULL,
  product TEXT,
  extras JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: orders
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  country TEXT NOT NULL DEFAULT 'Pakistan',
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'confirmed', 'pending', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'Direct Transfer',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: admin_sessions & admin_config
-- -----------------------------------------------------------------------------
CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE admin_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active catalogue items
CREATE POLICY "Allow public read active products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Allow public read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Allow public read faqs" ON faqs FOR SELECT USING (active = true);
CREATE POLICY "Allow public read site settings" ON site_settings FOR SELECT USING (true);

-- Allow public insert for enquiries and checkout orders
CREATE POLICY "Allow public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Allow service_role full access to all tables
CREATE POLICY "Allow full access for service role on products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service role on product_images" ON product_images FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service role on categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service role on faqs" ON faqs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service role on site_settings" ON site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service role on enquiries" ON enquiries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service role on orders" ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- SEED DATA INSERTIONS
-- =============================================================================

-- Insert Categories
INSERT INTO categories (name, sort_order, active) VALUES
${categoryOrder.map((name, idx) => `  (${escapeSql(name)}, ${idx + 1}, true)`).join(',\n')};


-- Insert Site Settings
INSERT INTO site_settings (key, value, label) VALUES
  ('whatsapp_number', '+92 323 1438214', 'WhatsApp Support Number'),
  ('contact_email', 'sialkotcricketkits@gmail.com', 'Contact Email Address'),
  ('location', 'House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan', 'Factory & Store Location'),
  ('currency', 'GBP', 'Store Currency'),
  ('currency_symbol', '£', 'Currency Symbol'),
  ('worldwide_delivery', 'true', 'Worldwide Delivery Active');

-- Insert FAQs
INSERT INTO faqs (question, answer, sort_order, active) VALUES
  ('Do you offer worldwide international delivery?', 'Yes, we provide tracked international courier delivery (DHL / FedEx Express / Air Cargo) to the United Kingdom, USA, Canada, Australia, UAE, Saudi Arabia, Europe and worldwide.', 1, true),
  ('Can I see a live video or ping demonstration of the bat before ordering?', 'Yes! We encourage all customers to message us on WhatsApp (+92 323 1438214) to view live high-definition videos, weight scale checks, and ping demonstrations of the exact bat.', 2, true),
  ('Do you provide custom bat making and personalized player specifications?', 'Yes. We handcraft bespoke bats tailored to your exact weight (e.g. 2lb 7oz to 2lb 12oz), handle shape (oval/round), edge depth (up to 45mm), and profile preference.', 3, true),
  ('What payment methods do you accept for international orders?', 'We accept Wise, Bank Transfer, Western Union, Remitly, MoneyGram, and TapTap Send with secure proof of payment confirmation.', 4, true),
  ('Do you offer machine knocking-in and bat preparation?', 'Yes, we offer professional machine knocking-in, oiling, scuff sheet fitting, and toe guard application upon request before dispatch.', 5, true);

-- Insert All 145 Products
INSERT INTO products (id, name, category, price, stock, right_stock, left_stock, image, images, description, featured, active, sort_order) VALUES
`;

const productInserts = products.map((p, idx) => {
  const rightStock = p.rightStock !== undefined ? escapeSql(p.rightStock) : 'NULL';
  const leftStock = p.leftStock !== undefined ? escapeSql(p.leftStock) : 'NULL';
  const images = p.images ? escapeJson(p.images) : escapeJson([p.image]);
  const featured = p.featured ? 'true' : 'false';

  return `  (${escapeSql(p.id)}, ${escapeSql(p.name)}, ${escapeSql(p.category)}, ${p.price}, ${escapeSql(p.stock)}, ${rightStock}, ${leftStock}, ${escapeSql(p.image)}, ${images}, ${escapeSql(p.description)}, ${featured}, true, ${idx + 1})`;
});

sql += productInserts.join(',\n') + ';\n\n';

// Insert Product Images into product_images table
sql += `-- Insert Dedicated Product Images\nINSERT INTO product_images (id, product_id, url, alt, position, is_main) VALUES\n`;

const imageInserts = [];
products.forEach((p) => {
  const imgs = p.images && p.images.length > 0 ? p.images : [p.image];
  imgs.forEach((imgUrl, i) => {
    const imgId = `${p.id}-img-${i + 1}`;
    const alt = `${p.name} - View ${i + 1}`;
    const isMain = i === 0 ? 'true' : 'false';
    imageInserts.push(`  (${escapeSql(imgId)}, ${escapeSql(p.id)}, ${escapeSql(imgUrl)}, ${escapeSql(alt)}, ${i + 1}, ${isMain})`);
  });
});

sql += imageInserts.join(',\n') + ';\n\n';

// Insert Sample Orders (in GBP)
sql += `-- Insert Orders Seed
INSERT INTO orders (id, customer_name, customer_phone, customer_email, country, items, total_amount, status, payment_method, notes) VALUES
  ('SCK-2026-042', 'Imran Siddiqui', '+44 7911 123456', 'imran.s@gmail.com', 'United Kingdom', '[{"name":"Apex Pro Beauty Processed Bat","category":"Beauty Processed Bats","price":185,"quantity":1},{"name":"Gray-Nicolls Legend Batting Pads","category":"Batting Pads","price":32,"quantity":1}]'::jsonb, 217, 'completed', 'Wise Transfer', 'Shipped via DHL Express to London. Knocked-in.'),
  ('SCK-2026-041', 'Tariq Mahmood', '+92 300 5554321', 'tariq.m@yahoo.com', 'Pakistan', '[{"name":"GM Original LE Batting Gloves","category":"Batting Gloves","price":28,"quantity":2},{"name":"DSC Fearless Intense Pro Bag","category":"Kit & Duffle Bags","price":40,"quantity":1}]'::jsonb, 96, 'completed', 'Bank Transfer (UBL)', 'Local delivery Lahore.'),
  ('SCK-2026-040', 'Hamza Farooq', '+971 50 9876543', 'h.farooq@outlook.com', 'United Arab Emirates', '[{"name":"VVIP Bonafide Original - Grade A+","category":"Bonafide Bats","price":499,"quantity":1},{"name":"Shrey Kit Bag","category":"Kit & Duffle Bags","price":62,"quantity":1}]'::jsonb, 561, 'completed', 'Remitly', 'Dubai priority air shipment.'),
  ('SCK-2026-039', 'David Campbell', '+61 412 345678', 'd.campbell@cricketclub.com.au', 'Australia', '[{"name":"Bounce Edition Beauty Processed Bat","category":"Beauty Processed Bats","price":180,"quantity":1},{"name":"Gray-Nicolls Classic Gloves","category":"Batting Gloves","price":25,"quantity":1},{"name":"Gray-Nicolls Stratos Pads","category":"Batting Pads","price":30,"quantity":1}]'::jsonb, 235, 'completed', 'Western Union', 'Sydney delivery. Weight 1175g verified.'),
  ('SCK-2026-038', 'Zahid Qureshi', '+92 333 4441122', 'zahid@qureshi.pk', 'Pakistan', '[{"name":"Monster Series Beauty Bat","category":"Beauty Processed Bats","price":195,"quantity":1}]'::jsonb, 195, 'completed', 'Direct Transfer', 'Custom name engraving requested.'),
  ('SCK-2026-037', 'Bilal Aslam', '+1 647 555 9988', 'bilal.aslam@gmail.com', 'Canada', '[{"name":"Special Edition - Grade A Bonafide Bat","category":"Bonafide Bats","price":330,"quantity":1},{"name":"Gray-Nicolls Legend Wheelie Bag","category":"Kit & Duffle Bags","price":52,"quantity":1}]'::jsonb, 382, 'completed', 'TapTap Send', 'Toronto delivery. Grain count 11 verified.'),
  ('SCK-2026-036', 'Fawad Khan', '+92 321 8887766', 'fawad.k@gmail.com', 'Pakistan', '[{"name":"Silver Edition Beauty Bat","category":"Beauty Processed Bats","price":125,"quantity":1},{"name":"Gray-Nicolls Helmet - Green","category":"Helmets","price":30,"quantity":1}]'::jsonb, 155, 'completed', 'Bank Transfer', 'Islamabad club team.'),
  ('SCK-2026-035', 'Marcus Thornton', '+44 7700 900123', 'marcus.t@leicestercricket.co.uk', 'United Kingdom', '[{"name":"Player Edition Bonafide Bat","category":"Bonafide Bats","price":215,"quantity":2},{"name":"SS Millennium Pro White Gloves","category":"Batting Gloves","price":26,"quantity":2}]'::jsonb, 482, 'completed', 'Wise', 'County league order.'),
  ('SCK-2026-034', 'Ahmad Raza', '+966 50 123 4567', 'ahmad.raza@saudi.com', 'Saudi Arabia', '[{"name":"VVIP Bat 45mm Edge","category":"Beauty Processed Bats","price":245,"quantity":1},{"name":"Gray-Nicolls Kit Bag Trolley","category":"Kit & Duffle Bags","price":62,"quantity":1}]'::jsonb, 307, 'completed', 'MoneyGram', 'Riyadh shipment.'),
  ('SCK-2026-033', 'Salman Butt', '+92 301 9991122', 'salman@butt.pk', 'Pakistan', '[{"name":"Gray-Nicolls Playing Kit - Large","category":"Teamwear","price":26,"quantity":10}]'::jsonb, 260, 'completed', 'Bank Transfer', 'Academy batch teamwear order.'),
  ('SCK-2026-032', 'Usman Ghani', '+1 214 555 7890', 'usman.ghani@dallascricket.org', 'United States', '[{"name":"VVIP Bonafide Original - Grade A+","category":"Bonafide Bats","price":499,"quantity":1},{"name":"Apex Pro Beauty Bat","category":"Beauty Processed Bats","price":185,"quantity":1},{"name":"Gray-Nicolls Legend Pads","category":"Batting Pads","price":32,"quantity":2}]'::jsonb, 748, 'completed', 'Wise', 'Texas premier league order.');
`;

fs.writeFileSync('./supabase-schema-and-seed.sql', sql, 'utf8');
console.log('Successfully created supabase-schema-and-seed.sql with all 145 products and complete schema!');
