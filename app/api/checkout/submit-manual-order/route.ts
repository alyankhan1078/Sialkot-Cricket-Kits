import { NextResponse } from "next/server";
import {
  createOrder,
  createPaymentSubmission,
  getProductById,
  checkDuplicateTransferReference,
  type OrderItem,
} from "@/src/lib/data-service";
import { calculateShippingFee } from "@/src/lib/shipping";
import {
  ALLOWED_RECEIPT_MIME_TYPES,
  ALLOWED_RECEIPT_EXTENSIONS,
  MAX_RECEIPT_FILE_SIZE_BYTES,
  FACTORY_INFO,
} from "@/src/lib/payment-config";
import { sendOrderConfirmationEmail } from "@/src/lib/email";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

// Validate file magic bytes to prevent spoofed file extensions
function validateFileMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG / JPG (FF D8 FF)
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG (89 50 4E 47)
  if (mimeType.includes("png")) {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // WEBP (RIFF .... WEBP)
  if (mimeType.includes("webp")) {
    const isRiff = buffer.toString("ascii", 0, 4) === "RIFF";
    const isWebp = buffer.toString("ascii", 8, 12) === "WEBP";
    return isRiff && isWebp;
  }

  // PDF (%PDF)
  if (mimeType.includes("pdf")) {
    return buffer.toString("ascii", 0, 4) === "%PDF";
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // 1. Extract Customer & Delivery Info
    const customerName = (formData.get("customerName") as string)?.trim();
    const customerEmail = (formData.get("customerEmail") as string)?.trim();
    const customerPhone = (formData.get("customerPhone") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const city = (formData.get("city") as string)?.trim();
    const state = (formData.get("state") as string)?.trim();
    const postalCode = (formData.get("postalCode") as string)?.trim();
    const country = (formData.get("country") as string)?.trim() || "Pakistan";
    const deliveryInstructions = (formData.get("deliveryInstructions") as string)?.trim();

    // 2. Extract Items & Deposit
    const itemsRaw = formData.get("items") as string;
    const depositPercent = Number(formData.get("depositPercent")) || 100;

    // 3. Extract Payment Submission Evidence
    const senderName = (formData.get("senderName") as string)?.trim() || customerName || "Customer";
    const senderCountry = (formData.get("senderCountry") as string)?.trim() || country;
    const provider = (formData.get("provider") as string)?.trim() || "Bank Transfer";
    let amountSent = parseFloat(formData.get("amountSent") as string) || 0;
    const currencySent = (formData.get("currencySent") as string)?.trim() || "GBP";
    const transferDate = (formData.get("transferDate") as string)?.trim() || new Date().toISOString().split("T")[0];
    let transferReference = (formData.get("transferReference") as string)?.trim();
    const customerNote = (formData.get("customerNote") as string)?.trim();
    const receiptFile = formData.get("receipt") as File | null;

    // ── Input Validation ──
    if (!customerName) {
      return NextResponse.json({ success: false, error: "Please enter your full name." }, { status: 400 });
    }

    if (!customerPhone && !customerEmail) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid WhatsApp/phone number or email." },
        { status: 400 }
      );
    }

    // ── Mandatory Payment Receipt Validation ──
    if (!receiptFile || receiptFile.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid payment receipt screenshot or document is required. Please upload your transfer receipt to complete order submission.",
        },
        { status: 400 }
      );
    }

    if (receiptFile.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Receipt file size exceeds the 8 MB limit. Please upload a smaller image or PDF." },
        { status: 400 }
      );
    }

    const fileExt = path.extname(receiptFile.name).toLowerCase();
    if (!ALLOWED_RECEIPT_EXTENSIONS.includes(fileExt) || !ALLOWED_RECEIPT_MIME_TYPES.includes(receiptFile.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid receipt format. Allowed formats: JPG, PNG, WEBP, or PDF." },
        { status: 400 }
      );
    }

    // ── Parse & Validate Items Server-Side ──
    let rawItems: any[] = [];
    try {
      rawItems = JSON.parse(itemsRaw);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid items format." }, { status: 400 });
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty." }, { status: 400 });
    }

    const verifiedItems: OrderItem[] = [];
    let calculatedSubtotalGbp = 0;
    let totalQuantity = 0;

    for (const it of rawItems) {
      const productId = it.productId || it.id;
      const quantity = Math.max(1, parseInt(it.quantity, 10) || 1);
      const serverProduct = await getProductById(productId);

      if (!serverProduct) {
        return NextResponse.json(
          { success: false, error: `Product "${productId}" could not be found or is unavailable.` },
          { status: 400 }
        );
      }

      calculatedSubtotalGbp += serverProduct.price * quantity;
      totalQuantity += quantity;

      verifiedItems.push({
        productId: serverProduct.id,
        name: serverProduct.name,
        category: serverProduct.category,
        price: serverProduct.price,
        quantity,
      });
    }

    // ── Server-Side Shipping Calculation ──
    const shippingCalc = calculateShippingFee(country, totalQuantity);
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
    const orderId = clientProvidedOrderId && /^SCK-\d{4}-\d{3,6}$/i.test(clientProvidedOrderId)
      ? clientProvidedOrderId.toUpperCase()
      : `SCK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    if (!transferReference) {
      transferReference = orderId;
    }

    // ── Store Receipt File Securely ──
    const fileBytes = await receiptFile.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    if (!validateFileMagicBytes(fileBuffer, receiptFile.type)) {
      return NextResponse.json(
        { success: false, error: "File content does not match the expected image or PDF format." },
        { status: 400 }
      );
    }

    const safeUniqueName = `rcpt_${orderId}_${crypto.randomBytes(8).toString("hex")}${fileExt}`;
    let receiptStoragePath = "";
    try {
      const privateDir = path.join(process.cwd(), "private_receipts");
      await fs.mkdir(privateDir, { recursive: true });
      const fullDiskPath = path.join(privateDir, safeUniqueName);
      await fs.writeFile(fullDiskPath, fileBuffer);
      receiptStoragePath = safeUniqueName;
    } catch {
      receiptStoragePath = `data:${receiptFile.type};base64,${fileBuffer.toString("base64")}`;
    }

    const receiptOriginalName = receiptFile.name;
    const receiptMimeType = receiptFile.type;
    const receiptFileSize = receiptFile.size;

    // Check for duplicate transfer reference across previous submissions
    const duplicateCheck = await checkDuplicateTransferReference(transferReference);

    // ── Create Order Record ──
    const orderNotes = [
      `Manual Payment Plan: ${chosenDepositPercent}% Deposit (£${depositDue} due today / Balance: £${balanceRemaining})`,
      `Beneficiary Target: ALYAN WAZIR (UBL Bank)`,
      `Sender: ${senderName} (${senderCountry}) via ${provider}`,
      `Transfer Reference: ${transferReference}`,
      `Payment Evidence: Attached & Uploaded to Private Storage (${receiptOriginalName})`,
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
      amountPaid: 0, // Never set as paid upon upload!
      balanceRemaining,
      currency: "GBP",
      paymentStatus: "payment_submitted",
      fulfilmentStatus: "new",
      status: "payment_submitted", // Customer-facing: "Payment Under Verification"
      paymentMethod: `UBL Bank Transfer (${provider})`,
      paymentProvider: "ubl_bank",
      transferReference,
      notes: orderNotes,
    });

    // ── Create Payment Submission Record ──
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

    // Link submission ID to order
    newOrder.paymentSubmissionId = paymentSubmission.id;

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail(newOrder).catch((err) => {
      console.error("[Order Confirmation Email Dispatch Error]:", err);
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderReference: newOrder.orderReference,
      customerFacingStatus: "Payment Under Verification",
      paymentStatus: "payment_submitted",
      message:
        "Thank you. Your order and payment evidence have been received successfully. Our team will verify the transfer against the UBL account. We will notify you after verification.",
    });
  } catch (error: any) {
    console.error("[Submit Manual Order Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit order for payment verification." },
      { status: 500 }
    );
  }
}
