import {
  UBL_PAYMENT_CONFIG,
  FACTORY_INFO,
  TRANSFER_CHANNELS,
  ALLOWED_RECEIPT_EXTENSIONS,
  ALLOWED_RECEIPT_MIME_TYPES,
  MAX_RECEIPT_FILE_SIZE_BYTES,
} from "../src/lib/payment-config.ts";
import { BUSINESS_CONFIG } from "../src/lib/business-config.ts";
import {
  createOrder,
  createPaymentSubmission,
  verifyPaymentSubmission,
  rejectPaymentSubmission,
  getPaymentStatusHistory,
  checkDuplicateTransferReference,
  sanitizeOrderRecord,
} from "../src/lib/data-service.ts";

async function runManualPaymentTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING MANUAL UBL PAYMENT & VERIFICATION TESTS");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // ── Test 1: Centralized Business & Bank Configuration Integrity ──
  assert(BUSINESS_CONFIG.businessName === "Sialkot Cricket Kits", "Business name is strictly Sialkot Cricket Kits");
  assert(BUSINESS_CONFIG.displayPhone === "+92 323 1438214", "Business phone is strictly +92 323 1438214");
  assert(BUSINESS_CONFIG.primaryEmail === "sialkotcricketkits@gmail.com", "Business email is strictly sialkotcricketkits@gmail.com");
  assert(BUSINESS_CONFIG.fullAddress === "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan", "Business address is House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan");
  assert(UBL_PAYMENT_CONFIG.beneficiaryFullName === "ALYAN WAZIR", "Beneficiary name is strictly ALYAN WAZIR");
  assert(UBL_PAYMENT_CONFIG.accountNumber === "0881304929964", "UBL Account Number is 0881304929964");
  assert(UBL_PAYMENT_CONFIG.iban === "PK93UNIL0109000304929964", "UBL IBAN is PK93UNIL0109000304929964");
  assert(UBL_PAYMENT_CONFIG.branchName === "0881 – Wana", "Branch Name is 0881 – Wana");
  assert(UBL_PAYMENT_CONFIG.swiftBic === "UNILPKKA", "SWIFT/BIC is UNILPKKA");
  assert(FACTORY_INFO.factoryName === "Superior Cricket Factory", "Factory Name is Superior Cricket Factory");

  // ── Test 1B: Legacy Order Sanitizer vs Genuine Customer Orders ──
  const legacyTestOrder = {
    id: "SCK-OLD-01",
    customerName: "Alyan Wazir",
    customerPhone: "03449832129",
    customerEmail: "alyankhan1078@gmail.com",
    address: "AWAMI KUTHAB KHANA NAZIR MARKET SOUTH WAZIRISTAN WANA SWLTD",
    city: "Wana",
    state: "South Waziristan",
    postalCode: "29540",
    country: "Pakistan",
    totalAmount: 500,
    status: "pending",
    items: [],
    paymentStatus: "payment_submitted",
    fulfilmentStatus: "new",
    paymentMethod: "UBL Bank Transfer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const sanitized = sanitizeOrderRecord(legacyTestOrder);
  assert(sanitized.customerPhone === "+92 327 5756188", "Legacy order phone sanitized to official +92 327 5756188");
  assert(sanitized.customerEmail === "sialkotcricketkits@gmail.com", "Legacy order email sanitized to official sialkotcricketkits@gmail.com");
  assert(sanitized.address.includes("House No. 207, Gulshan Street"), "Legacy order address sanitized to official Sialkot address");

  const genuineCustomerOrder = {
    id: "SCK-NEW-01",
    customerName: "David Warner",
    customerPhone: "+61 412 345 678",
    customerEmail: "david@cricketaustralia.com",
    address: "123 Sydney Cricket Ground Road",
    city: "Sydney",
    state: "NSW",
    postalCode: "2000",
    country: "Australia",
    totalAmount: 750,
    status: "pending",
    items: [],
    paymentStatus: "payment_submitted",
    fulfilmentStatus: "new",
    paymentMethod: "UBL Bank Transfer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const preserved = sanitizeOrderRecord(genuineCustomerOrder);
  assert(preserved.customerName === "David Warner", "Genuine customer name preserved dynamically");
  assert(preserved.customerPhone === "+61 412 345 678", "Genuine customer phone preserved dynamically");
  assert(preserved.address === "123 Sydney Cricket Ground Road", "Genuine customer address preserved dynamically");
  assert(preserved.country === "Australia", "Genuine customer destination preserved dynamically");

  // ── Test 2: Receipt File Rules & Limits ──
  assert(MAX_RECEIPT_FILE_SIZE_BYTES === 8 * 1024 * 1024, "Maximum receipt size is 8 MB");
  assert(ALLOWED_RECEIPT_EXTENSIONS.includes(".pdf") && ALLOWED_RECEIPT_EXTENSIONS.includes(".jpg"), "PDF and JPG are allowed receipt extensions");
  assert(ALLOWED_RECEIPT_MIME_TYPES.includes("application/pdf") && ALLOWED_RECEIPT_MIME_TYPES.includes("image/jpeg"), "PDF and JPEG MIME types are allowed");

  // ── Test 3: Order Submission Initial State ──
  const testOrderId = `SCK-TEST-${Date.now()}`;
  const order = await createOrder({
    id: testOrderId,
    customerName: "Tariq Mahmood",
    customerPhone: "+44 7700 900123",
    customerEmail: "tariq@example.co.uk",
    country: "United Kingdom",
    items: [{ name: "Player Edition Bonafide Bat", price: 215, quantity: 1 }],
    totalAmount: 235,
    paymentStatus: "payment_submitted",
    fulfilmentStatus: "new",
    status: "payment_submitted",
    paymentMethod: "UBL Bank Transfer (Taptap Send)",
    transferReference: "TXN-987654",
  });

  assert(order.paymentStatus === "payment_submitted", "Order payment status is payment_submitted upon creation");
  assert(order.status !== "paid" && order.paymentStatus !== "payment_verified", "Order is NEVER marked as paid merely upon submission");

  // ── Test 4: Payment Submission Record ──
  const submission = await createPaymentSubmission({
    orderId: testOrderId,
    paymentMethod: "UBL Bank Transfer / Remittance",
    senderName: "Tariq Mahmood",
    senderCountry: "United Kingdom",
    provider: "Taptap Send",
    amountSent: 235,
    currencySent: "GBP",
    transferReference: "TXN-987654",
    transferDate: "2026-08-29",
    receiptStoragePath: "private_receipts/rcpt_test.jpg",
    receiptOriginalName: "bank_receipt.jpg",
    receiptMimeType: "image/jpeg",
    receiptFileSize: 1024 * 500,
    status: "payment_submitted",
  });

  assert(submission.id.startsWith("psub_"), "Payment submission ID correctly generated");
  assert(submission.status === "payment_submitted", "Submission status initialized to payment_submitted");

  // ── Test 5: Duplicate Transfer Reference Detection ──
  const dupCheck1 = await checkDuplicateTransferReference("TXN-987654", "other-order");
  assert(dupCheck1.isDuplicate === true, "Duplicate transfer reference is detected");

  const dupCheck2 = await checkDuplicateTransferReference("UNIQUE-REF-9999");
  assert(dupCheck2.isDuplicate === false, "Unique transfer reference passes duplicate check");

  // ── Test 6: Administrator Payment Verification Workflow ──
  const verifyResult = await verifyPaymentSubmission(
    submission.id,
    "admin@sialkotcricketkits.co.uk",
    "Verified in UBL mobile banking app against ref TXN-987654"
  );

  assert(verifyResult.success === true, "Admin payment verification succeeded");
  assert(verifyResult.submission?.status === "payment_verified", "Submission status updated to payment_verified");
  assert(verifyResult.submission?.verifiedBy === "admin@sialkotcricketkits.co.uk", "Verified by admin recorded");

  // Check audit history
  const history = await getPaymentStatusHistory(submission.id);
  assert(history.length >= 2, "Status history recorded initial submission and verification entries");
  assert(history[0].newStatus === "payment_verified", "Latest audit entry reflects payment_verified");

  // ── Test 7: Administrator Rejection Workflow ──
  const rejSubmission = await createPaymentSubmission({
    orderId: `SCK-REJ-${Date.now()}`,
    paymentMethod: "UBL Bank Transfer / Remittance",
    senderName: "Test User",
    senderCountry: "Pakistan",
    provider: "Wise",
    amountSent: 100,
    currencySent: "GBP",
    transferReference: "TXN-INVALID-001",
    transferDate: "2026-08-29",
    receiptStoragePath: "private_receipts/fake.jpg",
    receiptOriginalName: "fake.jpg",
    receiptMimeType: "image/jpeg",
    receiptFileSize: 1024,
    status: "payment_submitted",
  });

  const rejectResult = await rejectPaymentSubmission(
    rejSubmission.id,
    "admin@sialkotcricketkits.co.uk",
    "Transaction reference not found in UBL account records",
    true
  );

  assert(rejectResult.success === true, "Admin rejection succeeded");
  assert(rejectResult.submission?.status === "payment_reupload_requested", "Status updated to payment_reupload_requested");
  assert(rejectResult.submission?.rejectionReason !== undefined, "Rejection reason preserved");

  console.log("\n=================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runManualPaymentTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
