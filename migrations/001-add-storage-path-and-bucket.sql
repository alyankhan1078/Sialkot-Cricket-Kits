-- =============================================================================
-- MIGRATION 001: Add storage_path to product_images + Storage bucket setup
-- Sialkot Cricket Kits — Product Management Rebuild
-- =============================================================================

-- 1. Add storage_path column to product_images (idempotent)
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 2. Create index on storage_path for cleanup queries
CREATE INDEX IF NOT EXISTS idx_product_images_storage_path
  ON product_images(storage_path)
  WHERE storage_path IS NOT NULL;

-- 3. Insert the storage bucket record if it doesn't exist
-- NOTE: Supabase Storage buckets are managed via storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- 4. Storage RLS policies for the product-images bucket

-- Allow public reads (anyone can view product images)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Service role has full access (used by admin API routes)
DROP POLICY IF EXISTS "Service role full access product images" ON storage.objects;
CREATE POLICY "Service role full access product images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Authenticated admin can upload/modify/delete
DROP POLICY IF EXISTS "Admin manage product images" ON storage.objects;
CREATE POLICY "Admin manage product images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated') AND
    (lower(auth.jwt() ->> 'email') = 'alyankhan1078@gmail.com') AND
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  )
  WITH CHECK (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated') AND
    (lower(auth.jwt() ->> 'email') = 'alyankhan1078@gmail.com') AND
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );
