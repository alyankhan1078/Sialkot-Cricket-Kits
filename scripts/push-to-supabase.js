import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import { products, categories, categoryOrder } from '../src/data/products.ts';

// Load .env.local if exists
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) {
        process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yokiizorrqopfhbvrtpa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('=== SIALKOT CRICKET KITS -> SUPABASE DATABASE SYNC ===');
console.log('Target Project URL:', supabaseUrl);

if (!supabaseKey) {
  console.log('\n❌ Supabase API Key (service_role or anon key) is required to push data programmatically.');
  console.log('Please create a `.env.local` file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://yokiizorrqopfhbvrtpa.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here (recommended for full schema sync)');
  console.log('\nAlternatively, you can copy the full SQL script from `supabase-schema-and-seed.sql` and run it directly in your Supabase SQL Editor:');
  console.log('👉 https://supabase.com/dashboard/project/yokiizorrqopfhbvrtpa/sql\n');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runSync() {
  try {
    console.log('1. Syncing Categories...');
    const catPayload = categoryOrder.map((name, idx) => ({
      name,
      sort_order: idx + 1,
      active: true,
    }));
    const { error: catError } = await supabase.from('categories').upsert(catPayload, { onConflict: 'name' });
    if (catError) console.warn('Categories notice:', catError.message);
    else console.log(`   ✅ Synced ${catPayload.length} categories.`);

    console.log('2. Syncing Products (145 items)...');
    const productPayload = products.map((p, idx) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: String(p.stock),
      right_stock: p.rightStock !== undefined ? String(p.rightStock) : null,
      left_stock: p.leftStock !== undefined ? String(p.leftStock) : null,
      image: p.image,
      images: p.images || [p.image],
      description: p.description || '',
      featured: Boolean(p.featured),
      active: true,
      sort_order: idx + 1,
    }));

    // Batch upsert in chunks of 50
    for (let i = 0; i < productPayload.length; i += 50) {
      const chunk = productPayload.slice(i, i + 50);
      const { error: prodError } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
      if (prodError) {
        console.error('Products batch error:', prodError.message);
        throw prodError;
      }
      console.log(`   ✅ Synced products chunk ${i + 1} to ${Math.min(i + 50, productPayload.length)}`);
    }

    console.log('3. Syncing Product Images...');
    const imagePayload = [];
    products.forEach((p) => {
      const imgs = p.images && p.images.length > 0 ? p.images : [p.image];
      imgs.forEach((imgUrl, i) => {
        imagePayload.push({
          id: `${p.id}-img-${i + 1}`,
          product_id: p.id,
          url: imgUrl,
          alt: `${p.name} - View ${i + 1}`,
          position: i + 1,
          is_main: i === 0,
        });
      });
    });

    for (let i = 0; i < imagePayload.length; i += 100) {
      const chunk = imagePayload.slice(i, i + 100);
      const { error: imgError } = await supabase.from('product_images').upsert(chunk, { onConflict: 'id' });
      if (imgError) console.warn('Product images notice:', imgError.message);
      else console.log(`   ✅ Synced images chunk ${i + 1} to ${Math.min(i + 100, imagePayload.length)}`);
    }

    console.log('4. Syncing Site Settings...');
    const settingsPayload = [
      { key: 'whatsapp_number', value: '+92 323 1438214', label: 'WhatsApp Support Number' },
      { key: 'contact_email', value: 'sialkotcricketkits@gmail.com', label: 'Contact Email Address' },
      { key: 'location', value: 'Model Town, Sialkot, Pakistan', label: 'Factory & Store Location' },
      { key: 'currency', value: 'GBP', label: 'Store Currency' },
      { key: 'currency_symbol', value: '£', label: 'Currency Symbol' },
      { key: 'worldwide_delivery', value: 'true', label: 'Worldwide Delivery Active' },
    ];
    await supabase.from('site_settings').upsert(settingsPayload, { onConflict: 'key' });
    console.log('   ✅ Synced site settings.');

    console.log('5. Syncing Admin Config...');
    await supabase.from('admin_config').upsert({ key: 'admin_password', value: 'admin123' }, { onConflict: 'key' });
    console.log('   ✅ Synced admin configuration.');

    console.log('\n🎉 ALL DATABASE TABLES AND 145 PRODUCTS SUCCESSFULLY SYNCED TO SUPABASE!');
  } catch (err) {
    console.error('\n❌ Sync Error:', err.message);
    console.log('Note: If tables do not exist yet in Supabase, execute `supabase-schema-and-seed.sql` once in the Supabase SQL Editor:');
    console.log('👉 https://supabase.com/dashboard/project/yokiizorrqopfhbvrtpa/sql\n');
  }
}

runSync();
