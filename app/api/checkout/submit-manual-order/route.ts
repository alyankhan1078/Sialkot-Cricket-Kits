import { NextResponse } from "next/server";
import {
  createOrder,
  getProductById,
  checkDuplicateTransferReference,
  createPaymentSubmission,
  getOrderById,
  type OrderItem,
} from "@/src/lib/data-service";
import { calculateShippingFee } from "@/src/lib/shipping";
import { validateCheckoutCustomerInfo, type CheckoutCustomerInput } from "@/src/lib/validation";
import { requireAdminSupabase } from "@/src/lib/supabase";

const ALLOWED_ORIGINS = [
  "https://sialkot-cricket-kits.alyankhan1078.workers.dev",
  "https://sialkotcricketkits.com",
  "https://www.sialkotcricketkits.com",
  "https://sialkot-cricket-kits-rust.vercel.app",
  "http://localhost:3000",
];

const MAX_RECEIPT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Max
const ALLOWED_RECEIPT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const ALLOWED_RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/pjpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

function methodNotAllowedResponse(request: Request) {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Only POST requests are accepted.",
    },
    {
      status: 405,
      headers: getCorsHeaders(request),
    }
  );
}

export async function GET(request: Request) {
  return methodNotAllowedResponse(request);
}

export async function PUT(request: Request) {
  return methodNotAllowedResponse(request);
}

export async function DELETE(request: Request) {
  return methodNotAllowedResponse(request);
}

export async function PATCH(request: Request) {
  return methodNotAllowedResponse(request);
}

export async function HEAD(request: Request) {
  return methodNotAllowedResponse(request);
}

// Pure Web-Standard Magic Byte Validator (Zero heavy runtime dependencies)
function validateFileMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 4) return false;

  // JPEG / JPG (FF D8 FF)
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  // PNG (89 50 4E 47)
  if (mimeType.includes("png")) {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }

  // WEBP (RIFF .... WEBP)
  if (mimeType.includes("webp")) {
    const isRiff =
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isWebp =
      bytes.length >= 12 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;
    return isRiff && isWebp;
  }

  // PDF (%PDF -> 25 50 44 46)
  if (mimeType.includes("pdf")) {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  }

  return true;
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid form data. Please submit order details with attached payment proof." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Extract Customer & Delivery Fields ──
    const customerName = (formData.get("customerName") as string)?.trim() || "";
    const customerEmail = (formData.get("customerEmail") as string)?.trim() || "";
    const customerPhone = (formData.get("customerPhone") as string)?.trim() || "";
    const phoneDialCode = (formData.get("phoneDialCode") as string)?.trim() || "+92";
    const country = (formData.get("country") as string)?.trim() || "";
    const countryCode = (formData.get("countryCode") as string)?.trim() || "";
    const address = (formData.get("address") as string)?.trim() || "";
    const city = (formData.get("city") as string)?.trim() || "";
    const state = (formData.get("state") as string)?.trim() || "";
    const postalCode = (formData.get("postalCode") as string)?.trim() || "";
    const deliveryInstructions = (formData.get("deliveryInstructions") as string)?.trim() || "";

    // ── Payment Plan & Policies ──
    const depositPercent = parseInt((formData.get("depositPercent") as string) || "100", 10);
    const policiesAccepted = (formData.get("policiesAccepted") as string) === "true";
    const policyVersion = (formData.get("policyVersion") as string) || "1.0";
    const policyAcceptedAt = (formData.get("policyAcceptedAt") as string) || new Date().toISOString();

    // ── Sender & Transfer Reference ──
    const senderName = (formData.get("senderName") as string)?.trim() || customerName;
    const senderCountry = (formData.get("senderCountry") as string)?.trim() || country;
    const provider = (formData.get("provider") as string)?.trim() || "UBL Bank Transfer";
    let transferReference = (formData.get("transferReference") as string)?.trim() || "";
    const transferDate = (formData.get("transferDate") as string)?.trim() || new Date().toISOString().split("T")[0];
    let amountSent = parseFloat((formData.get("amountSent") as string) || "0");
    const currencySent = (formData.get("currencySent") as string)?.trim() || "GBP";
    const customerNote = (formData.get("customerNote") as string)?.trim() || "";

    // ── Items Payload ──
    const itemsRaw = (formData.get("items") as string)?.trim() || "[]";

    // ── Receipt File ──
    const receiptFile = formData.get("receipt") as File | null;

    // ── Validate Customer Info ──
    const customerValidationInput: CheckoutCustomerInput = {
      fullName: customerName,
      email: customerEmail,
      phone: customerPhone,
      phoneDialCode: phoneDialCode,
      country: country,
      countryCode: countryCode,
      address: address,
      city: city,
      state: state,
      stateProvince: state,
      postalCode: postalCode,
    };

    if (!policiesAccepted) {
      return NextResponse.json(
        { success: false, error: "Please read and accept the checkout policies before submitting your order." },
        { status: 400, headers: corsHeaders }
      );
    }

    const customerValidation = validateCheckoutCustomerInfo(customerValidationInput);
    if (!customerValidation.isValid) {
      const firstErr = Object.values(customerValidation.errors)[0] || "Invalid customer or address details.";
      return NextResponse.json({ success: false, error: firstErr }, { status: 400, headers: corsHeaders });
    }

    // ── Validate Receipt File ──
    if (!receiptFile || typeof receiptFile !== "object" || typeof receiptFile.arrayBuffer !== "function") {
      return NextResponse.json(
        { success: false, error: "Payment verification receipt is required. Please attach a screenshot or document of your bank transfer." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (receiptFile.size <= 0) {
      return NextResponse.json(
        { success: false, error: "Attached receipt file is empty. Please select a valid payment proof." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (receiptFile.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Receipt file size (${(receiptFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 5 MB.`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const fileName = receiptFile.name || "receipt.jpg";
    const lastDotIndex = fileName.lastIndexOf(".");
    const fileExt = lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : ".jpg";

    if (
      !ALLOWED_RECEIPT_EXTENSIONS.includes(fileExt) ||
      !ALLOWED_RECEIPT_MIME_TYPES.includes(receiptFile.type)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid receipt format. Allowed formats: JPG, JPEG, PNG, WEBP, or PDF.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Parse & Validate Items Server-Side ──
    let rawItems: any[] = [];
    try {
      rawItems = JSON.parse(itemsRaw);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid items format." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty. Please add items to proceed." },
        { status: 400, headers: corsHeaders }
      );
    }

    const verifiedItems: OrderItem[] = [];
    let calculatedSubtotalGbp = 0;

    for (const it of rawItems) {
      const productId = it.productId || it.id;
      const quantity = Math.max(1, parseInt(it.quantity, 10) || 1);
      const serverProduct = await getProductById(productId);

      if (!serverProduct) {
        // Handle bespoke custom bat orders
        if (
          productId &&
          (productId.startsWith("custom-bat") ||
            productId.includes("custom-bat") ||
            productId === "custom-bat-order" ||
            it.name?.toLowerCase().includes("custom"))
        ) {
          const customPrice = Number(it.price) || 300;
          calculatedSubtotalGbp += customPrice * quantity;

          verifiedItems.push({
            productId: productId,
            name: it.name || "Custom Cricket Bat",
            category: "Bespoke Custom Bat",
            price: customPrice,
            quantity,
          });
          continue;
        }

        return NextResponse.json(
          { success: false, error: `Product "${productId}" could not be found or is unavailable.` },
          { status: 400, headers: corsHeaders }
        );
      }

      calculatedSubtotalGbp += serverProduct.price * quantity;

      verifiedItems.push({
        productId: serverProduct.id,
        name: serverProduct.name,
        category: serverProduct.category,
        price: serverProduct.price,
        quantity,
      });
    }

    // ── Server-Side Shipping Calculation ──
    const shippingCalc = calculateShippingFee(country, verifiedItems);
    if (shippingCalc.requiresQuotation) {
      return NextResponse.json(
        {
          success: false,
          error: `A delivery quotation is required for ${country}. Please contact our support team on WhatsApp (+92 323 1438214) before submitting.`,
        },
        { status: 400, headers: corsHeaders }
      );
    }
    const shippingFee = shippingCalc.shippingFee;
    const grandTotal = Math.round((calculatedSubtotalGbp + shippingFee) * 100) / 100;

    const chosenDepositPercent = [30, 35, 50, 100].includes(depositPercent) ? depositPercent : 100;
    const depositDue =
      chosenDepositPercent === 100
        ? grandTotal
        : Math.round(grandTotal * (chosenDepositPercent / 100) * 100) / 100;
    const balanceRemaining = Math.max(0, Math.round((grandTotal - depositDue) * 100) / 100);

    if (amountSent <= 0) {
      amountSent = depositDue;
    }

    // ── Generate Unique Canonical Order ID ──
    const clientProvidedOrderId = (formData.get("orderId") as string)?.trim();
    const orderId =
      clientProvidedOrderId && /^SCK-\d{4}-\d{3,6}$/i.test(clientProvidedOrderId)
        ? clientProvidedOrderId.toUpperCase()
        : `SCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!transferReference) {
      transferReference = `REF-${orderId}`;
    }

    // ── Idempotency Check: Prevent duplicate creation if already submitted ──
    const existingOrder = await getOrderById(orderId);
    if (existingOrder) {
      return NextResponse.json(
        {
          success: true,
          orderId: existingOrder.id,
          orderReference: existingOrder.orderReference || existingOrder.id,
          message:
            "Thank you. Your order and payment evidence have been received successfully. Our team will verify the transfer against the UBL account.",
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // ── Validate Magic Bytes ──
    const fileBytes = await receiptFile.arrayBuffer();
    const uint8Bytes = new Uint8Array(fileBytes);

    if (!validateFileMagicBytes(uint8Bytes, receiptFile.type)) {
      return NextResponse.json(
        { success: false, error: "File content does not match the expected image or PDF format." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Direct Upload to Private Supabase Storage 'receipts' Bucket ──
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const safeUniqueName = `rcpt_${orderId}_${randomSuffix}${fileExt}`;
    let receiptStoragePath = `receipts/${safeUniqueName}`;

    const sb = requireAdminSupabase();
    const bucketName = process.env.SUPABASE_RECEIPTS_BUCKET || "receipts";
    const { error: sbUploadErr } = await sb.storage
      .from(bucketName)
      .upload(safeUniqueName, fileBytes, {
        contentType: receiptFile.type || "application/octet-stream",
        upsert: false,
      });

    if (sbUploadErr) {
      throw new Error(`Payment receipt could not be stored: ${sbUploadErr.message}`);
    }

    receiptStoragePath = `supabase://${bucketName}/${safeUniqueName}`;

    const receiptOriginalName = receiptFile.name || "receipt.jpg";

    // Duplicate transfer reference check across previous orders
    let duplicateCheck = { isDuplicate: false, matchedOrders: [] as string[] };
    try {
      duplicateCheck = await checkDuplicateTransferReference(transferReference);
    } catch {}

    // ── Build Comprehensive Order Notes with Full Specifications ──
    const orderNotes = [
      `Manual Payment Plan: ${chosenDepositPercent}% Deposit (£${depositDue} due today / Balance: £${balanceRemaining})`,
      `Beneficiary Target: ALYAN WAZIR (UBL Bank)`,
      `Sender: ${senderName} (${senderCountry}) via ${provider}`,
      `Transfer Reference: ${transferReference}`,
      `Payment Evidence: Attached (${receiptOriginalName})`,
      `Receipt Storage: ${receiptStoragePath}`,
      `Policy Agreement: Version ${policyVersion} Accepted on ${policyAcceptedAt}`,
      duplicateCheck.isDuplicate
        ? `⚠️ [WARNING]: This transfer reference was also submitted on order(s): ${duplicateCheck.matchedOrders.join(", ")}`
        : "",
      customerNote ? `Customer Note: ${customerNote}` : "",
      deliveryInstructions ? `Delivery Instructions: ${deliveryInstructions}` : "",
      address ? `Address: ${address}, ${city || ""}, ${state || ""} ${postalCode || ""}, ${country}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // ── Create & Save Order in Supabase 'orders' Table ──
    const newOrder = await createOrder({
      id: orderId,
      orderReference: orderId,
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      country,
      address,
      city,
      state,
      postalCode,
      deliveryInstructions,
      items: verifiedItems,
      subtotal: calculatedSubtotalGbp,
      shippingFee,
      totalAmount: grandTotal,
      depositPercent: chosenDepositPercent,
      depositAmount: depositDue,
      amountPaid: 0,
      balanceRemaining,
      currency: "GBP",
      policiesAccepted: true,
      policyVersion,
      policyAcceptedAt,
      paymentStatus: "payment_submitted",
      fulfilmentStatus: "new",
      status: "payment_submitted",
      paymentMethod: `UBL Bank Transfer (${provider})`,
      paymentProvider: "ubl_bank",
      transferReference,
      notes: orderNotes,
    });

    await createPaymentSubmission({
      id: `psub_${orderId}`,
      orderId,
      paymentMethod: `UBL Bank Transfer (${provider})`,
      senderName,
      senderCountry,
      provider,
      amountSent,
      currencySent,
      transferReference,
      transferDate,
      receiptStoragePath,
      receiptOriginalName,
      receiptMimeType: receiptFile.type,
      receiptFileSize: receiptFile.size,
      status: "payment_submitted",
      customerNote: customerNote || undefined,
    });

    // ── Non-blocking Asynchronous Notification Dispatch (Never blocks or fails checkout) ──
    try {
      import("@/src/lib/notifications")
        .then(({ sendOrderReceivedNotifications }) => {
          sendOrderReceivedNotifications(newOrder).catch((err) => {
            console.warn("[Order Received Notification Notice]:", err);
          });
        })
        .catch(() => {});
    } catch {}

    // ── Immediate Clean Success Response ──
    return NextResponse.json(
      {
        success: true,
        orderId: newOrder.id,
        orderReference: newOrder.orderReference,
        trackingToken: newOrder.trackingToken,
        customerFacingStatus: "Payment Under Verification",
        paymentStatus: "payment_submitted",
        message:
          "Thank you. Your order and payment evidence have been received successfully. Our team will verify the transfer against the UBL account. We will notify you after verification.",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Submit Manual Order Fatal Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Our order processing server experienced a temporary issue. Please try submitting again.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
