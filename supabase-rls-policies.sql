-- =============================================================================
-- SIALKOT CRICKET KITS — SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Target Project: https://yokiizorrqopfhbvrtpa.supabase.co
-- =============================================================================

-- Clean up any legacy shared-password tables
DROP TABLE IF EXISTS admin_config CASCADE;

-- -----------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- -----------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to verify if current request is from an authenticated admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.role() = 'authenticated') AND
    (lower(auth.jwt() ->> 'email') = 'alyankhan1078@gmail.com') AND
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 2. PRODUCTS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (active = true OR is_admin_user());

DROP POLICY IF EXISTS "Service role full access on products" ON products;
CREATE POLICY "Service role full access on products"
  ON products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on products" ON products;
CREATE POLICY "Admin full access on products"
  ON products FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 3. PRODUCT IMAGES POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view product images" ON product_images;
CREATE POLICY "Public can view product images"
  ON product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access on product_images" ON product_images;
CREATE POLICY "Service role full access on product_images"
  ON product_images FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on product_images" ON product_images;
CREATE POLICY "Admin full access on product_images"
  ON product_images FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 4. CATEGORIES POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (active = true OR is_admin_user());

DROP POLICY IF EXISTS "Service role full access on categories" ON categories;
CREATE POLICY "Service role full access on categories"
  ON categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on categories" ON categories;
CREATE POLICY "Admin full access on categories"
  ON categories FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 5. FAQS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active faqs" ON faqs;
CREATE POLICY "Public can view active faqs"
  ON faqs FOR SELECT
  USING (active = true OR is_admin_user());

DROP POLICY IF EXISTS "Service role full access on faqs" ON faqs;
CREATE POLICY "Service role full access on faqs"
  ON faqs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on faqs" ON faqs;
CREATE POLICY "Admin full access on faqs"
  ON faqs FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 6. SITE SETTINGS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access on site_settings" ON site_settings;
CREATE POLICY "Service role full access on site_settings"
  ON site_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on site_settings" ON site_settings;
CREATE POLICY "Admin full access on site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 7. ENQUIRIES POLICIES (Public INSERT, Admin-only SELECT/UPDATE/DELETE)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit enquiries" ON enquiries;
CREATE POLICY "Public can submit enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on enquiries" ON enquiries;
CREATE POLICY "Service role full access on enquiries"
  ON enquiries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on enquiries" ON enquiries;
CREATE POLICY "Admin full access on enquiries"
  ON enquiries FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 8. ORDERS POLICIES (Public INSERT, Admin-only SELECT/UPDATE/DELETE)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can place orders" ON orders;
CREATE POLICY "Public can place orders"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on orders" ON orders;
CREATE POLICY "Service role full access on orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on orders" ON orders;
CREATE POLICY "Admin full access on orders"
  ON orders FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 9. PAYMENT SUBMISSIONS POLICIES (Public INSERT, Admin-only SELECT/UPDATE/DELETE)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit payment receipts" ON payment_submissions;
CREATE POLICY "Public can submit payment receipts"
  ON payment_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on payment_submissions" ON payment_submissions;
CREATE POLICY "Service role full access on payment_submissions"
  ON payment_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on payment_submissions" ON payment_submissions;
CREATE POLICY "Admin full access on payment_submissions"
  ON payment_submissions FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 10. PAYMENT STATUS HISTORY POLICIES (Admin / Service Role Only)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access on payment_status_history" ON payment_status_history;
CREATE POLICY "Service role full access on payment_status_history"
  ON payment_status_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on payment_status_history" ON payment_status_history;
CREATE POLICY "Admin full access on payment_status_history"
  ON payment_status_history FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- -----------------------------------------------------------------------------
-- 11. NOTIFICATION LOGS POLICIES (Admin / Service Role Only)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access on notification_logs" ON notification_logs;
CREATE POLICY "Service role full access on notification_logs"
  ON notification_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on notification_logs" ON notification_logs;
CREATE POLICY "Admin full access on notification_logs"
  ON notification_logs FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());
