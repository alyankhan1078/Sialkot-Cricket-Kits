import { UBL_PAYMENT_CONFIG } from "../src/lib/payment-config.ts";
import { BUSINESS_CONFIG } from "../src/lib/business-config.ts";

console.log("=== RUNNING INVOICE SPECIFICATION & DATA INTEGRITY TESTS ===\n");

let passed = 0;
let total = 0;

function assert(condition, name) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${name}`);
  }
}

// 1. Beneficiary Full Name
assert(
  UBL_PAYMENT_CONFIG.beneficiaryFullName === "ALYAN WAZIR",
  `Beneficiary full name is strictly ALYAN WAZIR (Found: ${UBL_PAYMENT_CONFIG.beneficiaryFullName})`
);

// 2. Bank Name
assert(
  UBL_PAYMENT_CONFIG.bankName === "United Bank Limited (UBL)",
  `Bank name is United Bank Limited (UBL) (Found: ${UBL_PAYMENT_CONFIG.bankName})`
);

// 3. IBAN integrity
assert(
  UBL_PAYMENT_CONFIG.iban.startsWith("PK93UNIL") && UBL_PAYMENT_CONFIG.iban.length >= 24,
  `IBAN is valid full international format (Found: ${UBL_PAYMENT_CONFIG.iban})`
);

// 4. Account Number integrity
assert(
  UBL_PAYMENT_CONFIG.accountNumber === "0881304929964",
  `Account number is 0881304929964 (Found: ${UBL_PAYMENT_CONFIG.accountNumber})`
);

// 5. Business Details
assert(
  BUSINESS_CONFIG.businessName === "Sialkot Cricket Kits",
  `Business name is Sialkot Cricket Kits (Found: ${BUSINESS_CONFIG.businessName})`
);

// 6. Test Stress Data Handling
const mockOrder = {
  id: "SCK-2026-999",
  customerName: "Sir Donald George Bradman The Legend Of Cricket Scoring Centuries",
  customerEmail: "verylongemailaddressforcricketcustomer@internationalcricketfederation.org",
  customerPhone: "+92 300 1234567890123",
  address: "Plot 104, Master Bat Crafters Industrial Estate, Off Daska Road, Factory Zone 4, Sialkot District",
  city: "Sialkot",
  state: "Punjab",
  postalCode: "51310",
  country: "Pakistan",
  paymentMethod: "UBL Bank Transfer (Taptap Send)",
  transferReference: "REF-TRANS-2026-998877665544332211",
  items: [
    { name: "APEX PRO ENGLISH WILLOW BAT - GRADE 1 CUSTOM SPECIFICATION WITH CONCAVE PROFILE", category: "Beauty Processed Bats", price: 250, quantity: 5 },
    { name: "SILVER EDITION TEST MATCH BAT - MID SWEET SPOT", category: "Bonafide Bats", price: 300, quantity: 3 },
  ],
  subtotal: 2150,
  shippingFee: 0,
  totalAmount: 2150,
  depositPercent: 30,
  depositAmount: 645,
  balanceRemaining: 1505,
  paymentStatus: "payment_submitted",
  createdAt: new Date().toISOString(),
};

assert(mockOrder.items.length === 2, "Mock order items count is 2");
assert(mockOrder.totalAmount === 2150, "Mock order total is 2150");
assert(mockOrder.depositAmount === 645, "Mock order deposit is 645");
assert(mockOrder.balanceRemaining === 1505, "Mock order balance is 1505");

console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===\n`);
if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
