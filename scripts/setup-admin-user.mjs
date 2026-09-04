import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Load .env.local if present
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [k, ...v] = trimmed.split("=");
      if (k && v.length) {
        process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  });
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://yokiizorrqopfhbvrtpa.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const targetEmail = (
  process.env.ADMIN_EMAIL || "alyankhan1078@gmail.com"
).trim().toLowerCase();

// Password can be passed via command line: node scripts/setup-admin-user.mjs <password>
// or via environment variable: SUPABASE_ADMIN_PASSWORD
const targetPassword =
  process.argv[2] || process.env.SUPABASE_ADMIN_PASSWORD || null;

console.log("=================================================");
console.log("🛡️  SUPABASE AUTH — ADMINISTRATOR SETUP UTILITY");
console.log("=================================================");
console.log("Supabase URL:    ", supabaseUrl);
console.log("Target Admin:    ", targetEmail);
console.log("Required Role:   ", 'app_metadata.role = "admin"');
console.log("-------------------------------------------------");

if (!serviceRoleKey) {
  console.error("\n❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is missing.");
  console.log("Please create a `.env.local` file or set SUPABASE_SERVICE_ROLE_KEY to execute admin provisioning.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function setupAdmin() {
  try {
    // 1. Check if user already exists
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Failed to query Supabase Auth users: ${listError.message}`);
    }

    const existingUser = usersData.users.find(
      (u) => (u.email || "").trim().toLowerCase() === targetEmail
    );

    if (existingUser) {
      console.log(`\n✅ Existing user found in Supabase Auth.`);
      console.log(`   User UUID: ${existingUser.id}`);

      const updatePayload = {
        email_confirm: true,
        app_metadata: {
          ...existingUser.app_metadata,
          role: "admin",
        },
      };

      if (targetPassword) {
        updatePayload.password = targetPassword;
      }

      const { data: updated, error: updateError } =
        await supabase.auth.admin.updateUserById(existingUser.id, updatePayload);

      if (updateError) {
        throw new Error(`Failed to update admin metadata: ${updateError.message}`);
      }

      console.log(`   Role Claim: app_metadata.role = "admin" (Verified)`);
      console.log(`   Email Confirmed: true`);
      if (targetPassword) {
        console.log(`   Password: Successfully updated to new private password.`);
      } else {
        console.log(`   Password: Kept existing password (no new password provided).`);
      }
      console.log(`\n🎉 Administrator account is fully configured and ready to log in!`);
      console.log(`\nTo lock your application to this exact UUID, add to .env.local:`);
      console.log(`ADMIN_USER_ID=${existingUser.id}\n`);
    } else {
      if (!targetPassword) {
        console.error(`\n❌ User ${targetEmail} does not exist yet.`);
        console.log(`To create this user, please provide a password:`);
        console.log(`node scripts/setup-admin-user.mjs <your_secure_password>\n`);
        process.exit(1);
      }

      console.log(`\nCreating new administrator account for ${targetEmail}...`);
      const { data: created, error: createError } =
        await supabase.auth.admin.createUser({
          email: targetEmail,
          password: targetPassword,
          email_confirm: true,
          app_metadata: {
            role: "admin",
          },
        });

      if (createError || !created?.user) {
        throw new Error(`Failed to create admin user: ${createError?.message}`);
      }

      console.log(`✅ Administrator created successfully!`);
      console.log(`   User UUID: ${created.user.id}`);
      console.log(`   Role Claim: app_metadata.role = "admin"`);
      console.log(`\n🎉 Administrator account is ready for sign-in at /admin!`);
      console.log(`\nTo lock your application to this exact UUID, add to .env.local:`);
      console.log(`ADMIN_USER_ID=${created.user.id}\n`);
    }
  } catch (err) {
    console.error(`\n❌ Error setting up administrator:`, err.message);
    process.exit(1);
  }
}

setupAdmin();
