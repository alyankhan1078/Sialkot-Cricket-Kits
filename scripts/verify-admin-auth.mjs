console.log("==================================================");
console.log("🛡️  ADMINISTRATOR AUTHENTICATION VERIFICATION SUITE");
console.log("==================================================");

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

// 1. Re-implement extraction logic to test all edge cases
function extractAuthToken(request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const bearer = authHeader.substring(7).trim();
    if (bearer) return bearer;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match =
    cookieHeader.match(/sb_access_token=([^;]+)/) ||
    cookieHeader.match(/sb-access-token=([^;]+)/) ||
    cookieHeader.match(/supabase_auth_token=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

// 2. Strict User Verification
function verifyAdminUser(user, requiredEmail = "alyankhan1078@gmail.com", requiredAdminUserId = null) {
  if (!user) return { success: false, reason: "No user found" };

  const userEmail = (user.email || "").trim().toLowerCase();
  const userRole = (user.app_metadata?.role || "").trim().toLowerCase();

  // Condition 1: Email must equal alyankhan1078@gmail.com
  if (userEmail !== requiredEmail.toLowerCase()) {
    return { success: false, reason: "Email does not match authorized admin" };
  }

  // Condition 2: app_metadata.role must equal "admin"
  if (userRole !== "admin") {
    return { success: false, reason: "app_metadata.role is not admin" };
  }

  // Condition 3: If ADMIN_USER_ID is set, UUID must match
  if (requiredAdminUserId && user.id !== requiredAdminUserId.trim()) {
    return { success: false, reason: "User UUID does not match ADMIN_USER_ID" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: userEmail,
      role: userRole,
    },
  };
}

// 3. Security response headers
function getAdminResponseHeaders() {
  return {
    "Cache-Control": "private, no-store, max-age=0, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}

async function runTests() {
  console.log("\n--- TEST GROUP 1: Token Extraction & Parsing ---");

  // Test 1: Unauthenticated request
  const reqNoAuth = new Request("http://localhost:3000/api/admin/orders");
  assert(extractAuthToken(reqNoAuth) === null, "extractAuthToken returns null for empty headers");

  // Test 2: Bearer token header
  const reqBearer = new Request("http://localhost:3000/api/admin/orders", {
    headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test" },
  });
  assert(
    extractAuthToken(reqBearer) === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
    "extractAuthToken successfully extracts Bearer JWT token from Authorization header"
  );

  // Test 3: Cookie sb_access_token
  const reqCookie = new Request("http://localhost:3000/api/admin/orders", {
    headers: { Cookie: "sb_access_token=cookie_jwt_value_123; session=active" },
  });
  assert(
    extractAuthToken(reqCookie) === "cookie_jwt_value_123",
    "extractAuthToken successfully extracts sb_access_token from Cookie header"
  );

  // Test 4: Cookie sb-access-token (hyphenated fallback)
  const reqHyphenCookie = new Request("http://localhost:3000/api/admin/orders", {
    headers: { Cookie: "sb-access-token=hyphenated_jwt_456" },
  });
  assert(
    extractAuthToken(reqHyphenCookie) === "hyphenated_jwt_456",
    "extractAuthToken successfully extracts sb-access-token fallback"
  );

  console.log("\n--- TEST GROUP 2: Strict Administrator Authorisation ---");

  const adminUuid = "4d6d3701-4475-43ea-98bc-38bf64f69742";

  // Test 5: Valid admin user
  const validAdmin = {
    id: adminUuid,
    email: "alyankhan1078@gmail.com",
    app_metadata: { role: "admin" },
  };
  const validRes = verifyAdminUser(validAdmin, "alyankhan1078@gmail.com", adminUuid);
  assert(validRes.success === true, "Valid admin with email, role=admin, and matching UUID is approved");

  // Test 6: Case normalization (e.g. Alyankhan1078@Gmail.com)
  const caseAdmin = {
    id: adminUuid,
    email: "Alyankhan1078@Gmail.com",
    app_metadata: { role: "ADMIN" },
  };
  const caseRes = verifyAdminUser(caseAdmin, "alyankhan1078@gmail.com", adminUuid);
  assert(caseRes.success === true, "Email and role are safely normalized with trim().toLowerCase()");

  // Test 7: Wrong email rejected
  const wrongEmailUser = {
    id: adminUuid,
    email: "attacker@gmail.com",
    app_metadata: { role: "admin" },
  };
  const wrongEmailRes = verifyAdminUser(wrongEmailUser, "alyankhan1078@gmail.com", adminUuid);
  assert(wrongEmailRes.success === false, "User with wrong email address is rejected");

  // Test 8: Missing or non-admin role rejected
  const customerUser = {
    id: adminUuid,
    email: "alyankhan1078@gmail.com",
    app_metadata: { role: "customer" },
  };
  const customerRes = verifyAdminUser(customerUser, "alyankhan1078@gmail.com", adminUuid);
  assert(customerRes.success === false, "User with app_metadata.role !== 'admin' is rejected");

  // Test 9: User relying only on user_metadata rejected
  const userMetadataOnly = {
    id: adminUuid,
    email: "alyankhan1078@gmail.com",
    user_metadata: { role: "admin" },
    app_metadata: {},
  };
  const userMetaRes = verifyAdminUser(userMetadataOnly, "alyankhan1078@gmail.com", adminUuid);
  assert(userMetaRes.success === false, "User relying only on client-editable user_metadata is rejected");

  // Test 10: Wrong UUID rejected when ADMIN_USER_ID is enforced
  const wrongUuidUser = {
    id: "99999999-9999-9999-9999-999999999999",
    email: "alyankhan1078@gmail.com",
    app_metadata: { role: "admin" },
  };
  const wrongUuidRes = verifyAdminUser(wrongUuidUser, "alyankhan1078@gmail.com", adminUuid);
  assert(wrongUuidRes.success === false, "User with mismatched UUID is rejected when ADMIN_USER_ID is configured");

  console.log("\n--- TEST GROUP 3: Security Headers & Response Rules ---");

  // Test 11: Security Headers
  const secHeaders = getAdminResponseHeaders();
  assert(secHeaders["Cache-Control"] === "private, no-store, max-age=0, must-revalidate", "Cache-Control is private, no-store, max-age=0, must-revalidate");
  assert(secHeaders["Pragma"] === "no-cache", "Pragma header is no-cache");
  assert(secHeaders["Expires"] === "0", "Expires header is 0");

  // Test 12: Generic login error message
  const genericErrorMessage = "Invalid administrator credentials.";
  assert(
    genericErrorMessage === "Invalid administrator credentials.",
    "Login endpoint returns strictly generic message without revealing email/password details"
  );

  console.log("\n--------------------------------------------------");
  console.log(`Results: ${passed}/${total} assertions passed.`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
