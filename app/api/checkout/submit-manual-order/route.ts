import { NextResponse } from "next/server";
import {
  createOrder,
  createPaymentSubmission,
  getProductById,
  checkDuplicateTransferReference,
  getOrderById,
  type OrderItem,
} from "@/src/lib/data-service";
import { calculateShippingFee } from "@/src/lib/shipping";
import { validateCheckoutCustomerInfo, type CheckoutCustomerInput } from "@/src/lib/validation";
import {
  ALLOWED_RECEIPT_MIME_TYPES,
  ALLOWED_RECEIPT_EXTENSIONS,
  MAX_RECEIPT_FILE_SIZE_BYTES,
} from "@/src/lib/payment-config";
import { sendOrderConfirmationEmail } from "@/src/lib/email";
import { getAdminSupabase } from "@/src/lib/supabase";

const ALLOWED_ORIGINS = [
  "https://sialkot-cricket-kits.alyankhan1078.workers.dev",
  "https://sialkotcricketkits.com",
  "https://www.sialkotcricketkits.com",
  "https://sialkot-cricket-kits-rust.vercel.app",
  "http://localhost:3000",
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

export async function GET(request: Request) {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use POST to submit orders for payment verification.",
    },
    {
      status: 405,
      headers: getCorsHeaders(request),
    }
  );
}

// Pure Web-Standard Magic Byte Validator (Zero Node native dependency)
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
    } catch (formErr: any) {
      console.error("[FormData Parse Error]:", formErr);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to read uploaded submission. Please verify your file size and network connection.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Extract Customer & Delivery Info
    const customerInput: CheckoutCustomerInput = {
      fullName: (formData.get("customerName") as string)?.trim() || "",
      email: (formData.get("customerEmail") as string)?.trim() || "",
      phone: (formData.get("customerPhone") as string)?.trim() || "",
      phoneDialCode: (formData.get("phoneDialCode") as string)?.trim() || "",
      country: (formData.get("country") as string)?.trim() || "",
      countryCode: (formData.get("countryCode") as string)?.trim() || "",
      address: (formData.get("address") as string)?.trim() || "",
      city: (formData.get("city") as string)?.trim() || "",
      state: (formData.get("state") as string)?.trim() || "",
      postalCode: (formData.get("postalCode") as string)?.trim() || "",
      deliveryInstructions: (formData.get("deliveryInstructions") as string)?.trim() || "",
    };

    // ── Universal Customer Info Validation ──
    const validation = validateCheckoutCustomerInfo(customerInput);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          error: Object.values(validation.errors)[0] || "Invalid customer or delivery details provided.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const customerName = validation.normalized.fullName;
    const customerEmail = validation.normalized.email;
    const customerPhone = validation.normalized.phoneE164;
    const country = validation.normalized.country;
    const address = validation.normalized.address;
    const city = validation.normalized.city;
    const state = validation.normalized.state;
    const postalCode = validation.normalized.postalCode;
    const deliveryInstructions = validation.normalized.deliveryInstructions;

    // 2. Extract Items & Deposit
    const itemsRaw = formData.get("items") as string;
    const depositPercent = Number(formData.get("depositPercent")) || 100;

    // 3. Extract Payment Submission Evidence
    const senderName = (formData.get("senderName") as string)?.trim() || customerName || "Customer";
    const senderCountry = (formData.get("senderCountry") as string)?.trim() || country;
    const provider = (formData.get("provider") as string)?.trim() || "Bank Transfer";
    let amountSent = parseFloat(formData.get("amountSent") as string) || 0;
    const currencySent = (formData.get("currencySent") as string)?.trim() || "GBP";
    const transferDate =
      (formData.get("transferDate") as string)?.trim() || new Date().toISOString().split("T")[0];
    let transferReference = (formData.get("transferReference") as string)?.trim();
    const customerNote = (formData.get("customerNote") as string)?.trim();
    const receiptFile = formData.get("receipt") as File | null;

    // ── Policy Agreement Acceptance Validation ──
    const policiesAccepted = formData.get("policiesAccepted") === "true";
    const policyVersion = (formData.get("policyVersion") as string)?.trim() || "1.0";
    const policyAcceptedAt = new Date().toISOString();

    if (!policiesAccepted) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must read and accept the International Shipping, Returns, Product Disclosure, Customisation and Payment Verification Agreement before submitting your order.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Mandatory Payment Receipt Validation ──
    if (!receiptFile || receiptFile.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid payment receipt screenshot or document is required. Please upload your transfer receipt to complete order submission.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (receiptFile.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Receipt file size exceeds the 5 MB limit. Please upload a smaller image or PDF.",
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
          error: "Invalid receipt format. Allowed formats: JPG, PNG, WEBP, or PDF.",
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
        { success: false, error: "Cart is empty." },
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
          error: `A delivery quotation is required for ${country}. Please contact our support team on WhatsApp before submitting.`,
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

    // ── Generate or Use Canonical Order ID ──
    const clientProvidedOrderId = (formData.get("orderId") as string)?.trim();
    const orderId =
      clientProvidedOrderId && /^SCK-\d{4}-\d{3,6}$/i.test(clientProvidedOrderId)
        ? clientProvidedOrderId.toUpperCase()
        : `SCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!transferReference) {
      transferReference = orderId;
    }

    // ── Idempotency Check: Prevent duplicate creation if already submitted ──
    const existingOrder = await getOrderById(orderId);
    if (existingOrder) {
      return NextResponse.json(
        {
          success: true,
          orderId: existingOrder.id,
          orderReference: existingOrder.orderReference || existingOrder.id,
          customerFacingStatus: "Payment Under Verification",
          paymentStatus: existingOrder.paymentStatus || "payment_submitted",
          message:
            "Thank you. Your order and payment evidence have been received successfully. Our team will verify the transfer against the UBL account.",
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // ── Store Receipt File Directly into Supabase Storage ──
    const fileBytes = await receiptFile.arrayBuffer();
    const uint8Bytes = new Uint8Array(fileBytes);

    if (!validateFileMagicBytes(uint8Bytes, receiptFile.type)) {
      return NextResponse.json(
        { success: false, error: "File content does not match the expected image or PDF format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const safeUniqueName = `rcpt_${orderId}_${randomSuffix}${fileExt}`;
    let receiptStoragePath = `receipts/${safeUniqueName}`;

    // Direct upload to Supabase Storage
    try {
      const sb = getAdminSupabase();
      if (sb) {
        // Try 'receipts' bucket first, fallback to 'products' if receipts bucket does not exist
        let uploadBucket = "receipts";
        let { error: sbUploadErr } = await sb.storage
          .from(uploadBucket)
          .upload(safeUniqueName, fileBytes, {
            contentType: receiptFile.type || "application/octet-stream",
            upsert: true,
          });

        if (sbUploadErr) {
          uploadBucket = "products";
          const fallbackUpload = await sb.storage
            .from(uploadBucket)
            .upload(`receipts/${safeUniqueName}`, fileBytes, {
              contentType: receiptFile.type || "application/octet-stream",
              upsert: true,
            });
          if (!fallbackUpload.error) {
            sbUploadErr = null;
            receiptStoragePath = `supabase://products/receipts/${safeUniqueName}`;
          }
        } else {
          receiptStoragePath = `supabase://receipts/${safeUniqueName}`;
        }

        if (sbUploadErr) {
          console.warn("[Supabase Storage Notice]:", sbUploadErr.message);
          receiptStoragePath = `storage://${safeUniqueName}`;
        }
      }
    } catch (storageErr) {
      console.warn("[Storage Catch Notice]:", storageErr);
      receiptStoragePath = `storage://${safeUniqueName}`;
    }

    const receiptOriginalName = receiptFile.name;
    const receiptMimeType = receiptFile.type;
    const receiptFileSize = receiptFile.size;

    // Check for duplicate transfer reference across previous submissions
    let duplicateCheck = { isDuplicate: false, matchedOrders: [] as string[] };
    try {
      duplicateCheck = await checkDuplicateTransferReference(transferReference);
    } catch {}

    // ── Create Order Record ──
    const orderNotes = [
      `Manual Payment Plan: ${chosenDepositPercent}% Deposit (£${depositDue} due today / Balance: £${balanceRemaining})`,
      `Beneficiary Target: ALYAN WAZIR (UBL Bank)`,
      `Sender: ${senderName} (${senderCountry}) via ${provider}`,
      `Transfer Reference: ${transferReference}`,
      `Payment Evidence: Attached (${receiptOriginalName})`,
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

    // ── Create Payment Submission Record ──
    try {
      const paymentSubmission = await createPaymentSubmission({
        orderId: newOrder.id,
        paymentMethod: "UBL Bank Transfer / Remittance",
        senderName,
        senderCountry: senderCountry || country,
        provider,
        amountSent,
        currencySent,
        transferReference,
        transferDate,
        receiptStoragePath,
        receiptOriginalName,
        receiptMimeType,
        receiptFileSize,
        status: "payment_submitted",
        customerNote,
      });

      newOrder.paymentSubmissionId = paymentSubmission.id;
    } catch (psubErr) {
      console.warn("[Payment Submission Record Notice]:", psubErr);
    }

    // ── Asynchronous Multi-Channel Notifications (Customer & Admin Email + WhatsApp) ──
    try {
      const { sendOrderReceivedNotifications } = await import("@/src/lib/notifications");
      sendOrderReceivedNotifications(newOrder, paymentSubmission).catch((err) => {
        console.warn("[Order Received Notification Dispatch Notice]:", err);
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        orderId: newOrder.id,
        orderReference: newOrder.orderReference,
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
