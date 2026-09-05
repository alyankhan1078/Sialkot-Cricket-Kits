import { NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { requireAdminSupabase } from "@/src/lib/supabase";
import { revalidateProductPages } from "@/src/lib/data-service";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  const headers = getAdminResponseHeaders();

  // Allow authenticated admin OR request with ADMIN_SESSION_SECRET header
  const authHeader = request.headers.get("x-maintenance-key");
  const secretKey = process.env.ADMIN_SESSION_SECRET || "sialkot_cricket_kits_secure_admin_2026";
  const isSecretMatch = authHeader && authHeader === secretKey;

  if (!isSecretMatch && !(await isAuthenticatedAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers }
    );
  }

  const results: Record<string, any> = {
    bucketEnsured: false,
    uploadedImages: [],
    dbRowsCreated: 0,
    productUpdated: false,
    reloadedProduct: null,
  };

  try {
    const sb = requireAdminSupabase();

    // 1. Ensure product-images bucket exists and is public
    const { data: bucket, error: bucketError } = await sb.storage.getBucket("product-images");
    if (!bucket || bucketError) {
      const { error: createErr } = await sb.storage.createBucket("product-images", {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
      });
      if (createErr && !createErr.message?.toLowerCase().includes("already exists")) {
        throw new Error(`Failed to create product-images bucket: ${createErr.message}`);
      }
    }
    results.bucketEnsured = true;

    // 2. Locate or create the CA Plus 15000 product
    let targetProduct = null;
    const { data: existingProducts } = await sb
      .from("products")
      .select("*")
      .ilike("name", "%CA Plus 15000%")
      .limit(1);

    if (existingProducts && existingProducts.length > 0) {
      targetProduct = existingProducts[0];
    } else {
      // Check by id
      const { data: byId } = await sb
        .from("products")
        .select("*")
        .eq("id", "ca-plus-15000")
        .maybeSingle();

      if (byId) {
        targetProduct = byId;
      }
    }

    const now = new Date().toISOString();
    const productId = targetProduct ? targetProduct.id : "ca-plus-15000";

    if (!targetProduct) {
      // Create product in DB
      const { data: created, error: createProdErr } = await sb
        .from("products")
        .insert({
          id: productId,
          name: "CA Plus 15000 Cricket Bat",
          category: "English Willow Bats",
          price: 349,
          stock: "Available",
          image: "/assets/products/bat-collection.webp",
          images: [],
          description: "Handcrafted from Grade 1+ English Willow, the CA Plus 15000 is engineered for extraordinary power, balance, and pick-up. Featuring massive 38-40mm edges, prominent spine, and authentic factory knocking.",
          featured: true,
          active: true,
          sort_order: 1,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (createProdErr) {
        throw new Error(`Failed to create CA Plus 15000 in DB: ${createProdErr.message}`);
      }
      targetProduct = created;
    }

    // 3. Upload the 5 photos from disk to Supabase Storage
    const imageFiles = [
      { name: "ca-plus-15000-studio.jpg", alt: "CA Plus 15000 Cricket Bat - Full Studio Front View with Bag", isMain: true },
      { name: "ca-plus-15000-front.jpg", alt: "CA Plus 15000 Cricket Bat - Front Face View with Embossed Stickers", isMain: false },
      { name: "ca-plus-15000-back.jpg", alt: "CA Plus 15000 Cricket Bat - Back Profile and Grain Structure", isMain: false },
      { name: "ca-plus-15000-profile-1.jpg", alt: "CA Plus 15000 Cricket Bat - Side Profile and Edge Thickness", isMain: false },
      { name: "ca-plus-15000-profile-2.jpg", alt: "CA Plus 15000 Cricket Bat - Spine Profile and Contour", isMain: false },
    ];

    const imagesDir = path.join(process.cwd(), "public", "assets", "products", "ca-plus-15000");
    const uploadedRecords: Array<{ url: string; storagePath: string; alt: string; isMain: boolean; position: number }> = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const item = imageFiles[i];
      const filePath = path.join(imagesDir, item.name);

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `products/${productId}/${crypto.randomUUID().slice(0, 8)}-${item.name}`;

        const { error: upErr } = await sb.storage
          .from("product-images")
          .upload(storagePath, fileBuffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (upErr) {
          throw new Error(`Failed to upload ${item.name} to Storage: ${upErr.message}`);
        }

        const { data: pubData } = sb.storage.from("product-images").getPublicUrl(storagePath);
        const publicUrl = pubData.publicUrl;

        uploadedRecords.push({
          url: publicUrl,
          storagePath,
          alt: item.alt,
          isMain: item.isMain,
          position: i,
        });

        results.uploadedImages.push({
          filename: item.name,
          storagePath,
          url: publicUrl,
        });
      }
    }

    if (uploadedRecords.length === 0) {
      throw new Error("No image files found in public/assets/products/ca-plus-15000 to upload");
    }

    // 4. Save to product_images table (delete existing and insert new)
    await sb.from("product_images").delete().eq("product_id", productId);

    const rowsToInsert = uploadedRecords.map((rec) => ({
      id: crypto.randomUUID(),
      product_id: productId,
      url: rec.url,
      storage_path: rec.storagePath,
      alt: rec.alt,
      position: rec.position,
      is_main: rec.isMain,
      created_at: now,
      updated_at: now,
    }));

    const { data: insertedRows, error: insertErr } = await sb
      .from("product_images")
      .insert(rowsToInsert)
      .select();

    if (insertErr) {
      // If storage_path column is not yet in table, retry without storage_path
      if (insertErr.message?.includes("storage_path")) {
        const fallbackRows = rowsToInsert.map(({ storage_path, ...rest }) => rest);
        const { error: fbErr } = await sb.from("product_images").insert(fallbackRows);
        if (fbErr) throw new Error(`Failed to insert into product_images: ${fbErr.message}`);
      } else {
        throw new Error(`Failed to insert into product_images: ${insertErr.message}`);
      }
    }

    results.dbRowsCreated = insertedRows?.length || rowsToInsert.length;

    // 5. Update products table with main image and images array
    const mainImg = uploadedRecords.find((r) => r.isMain) || uploadedRecords[0];
    const allUrls = uploadedRecords.map((r) => r.url);

    const { error: updateProdErr } = await sb
      .from("products")
      .update({
        image: mainImg.url,
        images: allUrls,
        updated_at: now,
      })
      .eq("id", productId);

    if (updateProdErr) {
      throw new Error(`Failed to update products table: ${updateProdErr.message}`);
    }
    results.productUpdated = true;

    // 6. Reload from Supabase and verify
    const { data: reloadedProd } = await sb
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    const { data: reloadedImgs } = await sb
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("position", { ascending: true });

    results.reloadedProduct = {
      id: reloadedProd?.id,
      name: reloadedProd?.name,
      image: reloadedProd?.image,
      imagesCount: reloadedProd?.images?.length || 0,
      productImagesRowsCount: reloadedImgs?.length || 0,
      images: reloadedImgs?.map((img: any) => ({
        id: img.id,
        url: img.url,
        isMain: img.is_main,
        position: img.position,
        storagePath: img.storage_path,
      })),
    };

    // 7. Revalidate Next.js cache
    revalidateProductPages(productId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully synchronized Supabase Storage and database for CA Plus 15000",
        data: results,
      },
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("[Maintenance Sync Storage] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute storage synchronization",
        partialResults: results,
      },
      { status: 500, headers }
    );
  }
}
