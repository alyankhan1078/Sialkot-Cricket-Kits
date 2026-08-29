"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Send,
  Globe,
  ShieldCheck,
  Check,
  Copy,
  Lock,
  ArrowRight,
  ShoppingBag,
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  UploadCloud,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  RefreshCw,
  Camera,
  MessageCircle,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { calculateShippingFee, SHIPPING_DESTINATIONS, getCountryFlag } from "@/src/lib/shipping";
import {
  UBL_PAYMENT_CONFIG,
  FACTORY_INFO,
  TRANSFER_CHANNELS,
  TRANSFER_CHANNELS_NOTICE,
  PAYMENT_METHODS,
  PAYMENT_SECURITY_WARNING,
  UBL_CARD_GATEWAY_ENABLED,
  MAX_RECEIPT_FILE_SIZE_BYTES,
  ALLOWED_RECEIPT_EXTENSIONS,
  ALLOWED_RECEIPT_MIME_TYPES,
} from "@/src/lib/payment-config";
import { CUSTOM_BAT_STORAGE_KEY, type CustomBatOrder } from "@/src/lib/custom-bat-config";
import PolicyAgreementModal from "@/src/components/PolicyAgreementModal";
import { POLICY_METADATA } from "@/src/lib/policy-agreement";
import { CountrySelector } from "@/src/components/CountrySelector";
import { PhoneInput } from "@/src/components/PhoneInput";
import { CheckoutSelectorErrorBoundary } from "@/src/components/CheckoutSelectorErrorBoundary";
import {
  validateCheckoutCustomerInfo,
  validateFullName,
  validateEmail,
  validateStreetAddress,
  validateCity,
  validateState,
  validatePostalCode,
} from "@/src/lib/validation";
import { getAddressConfig } from "@/src/lib/address-config";

type Step = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, formatPrice, currency, setCurrency, currencies } = useStore();

  const [step, setStep] = useState<Step>(1);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Step 1: Contact & Delivery Form (Starts completely empty with no country preselected)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    phoneDialCode: "+92",
    country: "",
    countryCode: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    deliveryInstructions: "",
  });

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Real-time validation computation
  const validationOutcome = validateCheckoutCustomerInfo(formData);
  const canContinue = validationOutcome.isValid;
  const addressConfig = getAddressConfig(formData.countryCode);

  const handleFieldChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    // If the field becomes valid while typing, immediately clear its error
    const outcome = validateCheckoutCustomerInfo(updated);
    if (!outcome.errors[field]) {
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const outcome = validateCheckoutCustomerInfo(formData);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (outcome.errors[field]) {
        next[field] = outcome.errors[field];
      } else {
        delete next[field];
      }
      return next;
    });
  };

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"ubl_manual" | "cod">("ubl_manual");
  const [depositPercent, setDepositPercent] = useState<number>(100);

  // Generate provisional reference for transfer description
  const [provisionalRef] = useState(
    () => `SCK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );

  // Step 4: Payment Method Selection & Evidence Form
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Wise");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [evidenceData, setEvidenceData] = useState({
    senderName: "",
    senderCountry: "",
    provider: "Wise",
    amountSent: "",
    currencySent: "GBP",
    transferDate: new Date().toISOString().split("T")[0],
    transferReference: "",
    customerNote: "",
    confirmedAccurate: true,
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Custom Bat Order & Engraving details from configurator
  const [customBatOrder, setCustomBatOrder] = useState<CustomBatOrder | null>(null);
  const [customEngraving, setCustomEngraving] = useState<{
    text: string;
    size?: string;
    construction?: string;
    tier?: string;
  } | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedOrder = window.localStorage.getItem(CUSTOM_BAT_STORAGE_KEY);
        if (savedOrder) {
          const parsedOrder: CustomBatOrder = JSON.parse(savedOrder);
          if (parsedOrder && parsedOrder.payment && parsedOrder.payment.orderValue > 0) {
            setCustomBatOrder(parsedOrder);
            if (parsedOrder.payment.advancePercentage) {
              setDepositPercent(parsedOrder.payment.advancePercentage);
            }
            if (parsedOrder.customer?.name) {
              setFormData((prev) => ({
                ...prev,
                fullName: prev.fullName || parsedOrder.customer.name,
                country: prev.country || parsedOrder.customer.country || "",
              }));
            }
          }
        }

        const saved = window.localStorage.getItem("sialkot-custom-bat-engraving");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.text) {
            setCustomEngraving(parsed);
          }
        }
      }
    } catch {}
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCustomOrder = Boolean(customBatOrder && customBatOrder.payment?.orderValue > 0);

  const lines = isCustomOrder && customBatOrder
    ? [
        {
          productId: customBatOrder.customProductId || "custom-bat-order",
          quantity: 1,
          product: {
            id: customBatOrder.customProductId || "custom-bat-order",
            name: `Custom Cricket Bat — ${customBatOrder.bat.constructionType} (${customBatOrder.bat.qualityLevel})`,
            category: "Bespoke Custom Bat" as any,
            price: customBatOrder.payment.orderValue,
            stock: "Available" as const,
            image: "/assets/products/bat-collection.webp",
            description: `Size: ${customBatOrder.bat.size}, Handle: ${customBatOrder.bat.handlePreference}, Profile: ${customBatOrder.bat.profile}, Weight: ${customBatOrder.bat.preferredWeight}`,
            shortDescription: "Custom manufactured English Willow bat",
            openingStatement: "Custom Bat",
            highlights: [],
            bestFor: "All-round",
            specifications: [],
            seoTitle: "Custom Bat",
            seoDescription: "Custom Bat",
            imageAlt: "Custom Cricket Bat",
            disclosureType: "none" as const,
          },
        },
      ]
    : cart.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? [{ ...item, product }] : [];
      });

  const subtotal = isCustomOrder && customBatOrder
    ? customBatOrder.payment.orderValue
    : lines.reduce((t, i) => t + i.product.price * i.quantity, 0);

  const totalItemCount = isCustomOrder ? 1 : lines.reduce((t, i) => t + i.quantity, 0);
  const shippingCalc = calculateShippingFee(formData.country, totalItemCount);
  const grandTotal = subtotal + (shippingCalc.hasDestination ? shippingCalc.shippingFee : 0);
  const depositDueNow =
    depositPercent === 100
      ? grandTotal
      : Math.round(grandTotal * (depositPercent / 100) * 100) / 100;
  const balanceRemaining = Math.max(0, Math.round((grandTotal - depositDueNow) * 100) / 100);

  // Auto-sync sender defaults when navigating between steps or updating deposit
  useEffect(() => {
    setEvidenceData((prev) => ({
      ...prev,
      senderName: prev.senderName || formData.fullName,
      senderCountry: prev.senderCountry || formData.country,
      currencySent: prev.currencySent || currency || "GBP",
      amountSent: prev.amountSent || String(depositDueNow),
      transferReference: prev.transferReference || provisionalRef,
    }));
  }, [step, currency, depositDueNow, provisionalRef, formData.fullName, formData.country]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Handle Receipt File Selection & Preview
  const handleFileSelected = (file: File) => {
    setErrorMessage(null);

    if (file.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
      setErrorMessage(`Receipt exceeds the 5 MB limit. Please select a smaller image or document.`);
      return;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_RECEIPT_EXTENSIONS.includes(ext)) {
      setErrorMessage("Only JPG, PNG, WEBP images or PDF files are accepted.");
      return;
    }

    setReceiptFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setReceiptPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit manual order with mandatory payment evidence and policy agreement
  const handleSubmitManualOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (lines.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    // Strict validation of customer and delivery details
    const outcome = validateCheckoutCustomerInfo(formData);
    if (!outcome.isValid) {
      setFieldErrors(outcome.errors);
      setTouchedFields({
        fullName: true,
        email: true,
        phone: true,
        country: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
      });
      setErrorMessage("Please complete all required contact and delivery fields with valid information.");
      setStep(1);
      return;
    }

    if (!selectedPaymentMethod) {
      setErrorMessage("Please select the payment service or transfer method you used.");
      return;
    }

    if (!evidenceData.senderName.trim()) {
      setErrorMessage("Please enter the sender's full name.");
      return;
    }

    if (!evidenceData.transferReference.trim()) {
      setErrorMessage("Please enter your transaction / transfer reference number.");
      return;
    }

    const amountNum = parseFloat(evidenceData.amountSent);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Please enter a valid amount paid greater than zero.");
      return;
    }

    if (!receiptFile) {
      setErrorMessage("Please upload your payment receipt screenshot or document before submitting your order.");
      return;
    }

    if (receiptFile.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
      setErrorMessage("Receipt exceeds the 5 MB limit. Please select a smaller image or document.");
      return;
    }

    if (!paymentConfirmed) {
      setErrorMessage("Please confirm that you have sent the payment to the official beneficiary details.");
      return;
    }

    if (!policiesAccepted) {
      setErrorMessage("Please read and accept the International Shipping, Returns & Product Agreement before submitting your order.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append("customerName", outcome.normalized.fullName);
      submitFormData.append("customerEmail", outcome.normalized.email);
      submitFormData.append("customerPhone", outcome.normalized.phoneE164);
      submitFormData.append("customerPhoneDisplay", outcome.normalized.phoneDisplay);
      submitFormData.append("phoneDialCode", outcome.normalized.phoneDialCode);
      submitFormData.append("address", outcome.normalized.address);
      submitFormData.append("city", outcome.normalized.city);
      submitFormData.append("state", outcome.normalized.state);
      submitFormData.append("postalCode", outcome.normalized.postalCode);
      submitFormData.append("country", outcome.normalized.country);
      submitFormData.append("countryCode", outcome.normalized.countryCode);
      submitFormData.append("deliveryInstructions", outcome.normalized.deliveryInstructions);
      submitFormData.append("depositPercent", String(depositPercent));
      submitFormData.append("policiesAccepted", "true");
      submitFormData.append("policyVersion", POLICY_METADATA.version);

      submitFormData.append(
        "items",
        JSON.stringify(
          lines.map((l) => ({
            productId: l.product.id,
            name: l.product.name,
            category: l.product.category,
            price: l.product.price,
            quantity: l.quantity,
          }))
        )
      );

      submitFormData.append("orderId", provisionalRef);
      submitFormData.append("paymentMethod", selectedPaymentMethod);
      submitFormData.append("senderName", (evidenceData.senderName || formData.fullName).trim());
      submitFormData.append("senderCountry", (evidenceData.senderCountry || formData.country).trim());
      submitFormData.append("provider", selectedPaymentMethod);
      submitFormData.append("amountSent", evidenceData.amountSent || String(depositDueNow));
      submitFormData.append("currencySent", evidenceData.currencySent || currency || "GBP");
      submitFormData.append("transferDate", evidenceData.transferDate || new Date().toISOString().split("T")[0]);
      submitFormData.append("transferReference", (evidenceData.transferReference || provisionalRef).trim());
      const customNotes = isCustomOrder && customBatOrder
        ? [
            evidenceData.customerNote.trim(),
            `--- CUSTOM BAT SPECIFICATIONS ---`,
            `Size: ${customBatOrder.bat.size}`,
            `Construction: ${customBatOrder.bat.constructionType} (${customBatOrder.bat.qualityLevel})`,
            `Handle: ${customBatOrder.bat.handlePreference}`,
            `Weight: ${customBatOrder.bat.preferredWeight}`,
            `Profile: ${customBatOrder.bat.profile}`,
            customBatOrder.services.selectedServiceNames.length > 0 ? `Services: ${customBatOrder.services.selectedServiceNames.join(", ")}` : null,
            customBatOrder.services.engraving && customBatOrder.services.engravingText ? `Laser Engraving: "${customBatOrder.services.engravingText}"` : null,
            customBatOrder.bat.requirements ? `Special Notes: ${customBatOrder.bat.requirements}` : null,
          ].filter(Boolean).join("\n")
        : evidenceData.customerNote.trim();

      submitFormData.append("customerNote", customNotes);
      submitFormData.append("receipt", receiptFile);

      const res = await fetch("/api/checkout/submit-manual-order", {
        method: "POST",
        body: submitFormData,
      });

      const data = await res.json();

      if (data.success && data.orderId) {
        if (isCustomOrder) {
          try {
            window.localStorage.removeItem(CUSTOM_BAT_STORAGE_KEY);
            window.localStorage.removeItem("sialkot-custom-bat-engraving");
          } catch {}
        } else {
          clearCart();
        }
        router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderId)}`);
      } else {
        if (data.errors) {
          setFieldErrors(data.errors);
          setTouchedFields({
            fullName: true,
            email: true,
            phone: true,
            country: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
          });
          setStep(1);
        }
        setErrorMessage(
          data.error || "Failed to submit order. Please check your information and try again."
        );
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMessage("Network error occurred during order submission. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Step labels mapping
  const stepLabels: Record<Step, string> = {
    1: "Contact & Delivery",
    2: "Review Order",
    3: "Payment Option",
    4: "Transfer & Evidence",
  };

  // Order summary content renderer (used for both mobile collapsible accordion and desktop sticky card)
  const renderOrderSummaryContent = (isMobile = false) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Product Lines */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxHeight: isMobile ? 280 : 260,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {isCustomOrder && customBatOrder ? (
          <div
            style={{
              padding: "10px 12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: ".8rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <strong style={{ color: "#0f172a" }}>
                Custom Bat — {customBatOrder.bat.constructionType}
              </strong>
              <span style={{ fontWeight: 800, color: "#0f172a" }}>
                {formatPrice(customBatOrder.payment.orderValue)}
              </span>
            </div>
            <div style={{ fontSize: ".74rem", color: "#64748b", lineHeight: 1.4 }}>
              {customBatOrder.bat.size} · {customBatOrder.bat.qualityLevel} · {customBatOrder.bat.profile} · {customBatOrder.bat.preferredWeight}
            </div>
            {customBatOrder.services.selectedServiceNames.length > 0 && (
              <div style={{ marginTop: 4, fontSize: ".72rem", color: "#15803d" }}>
                ✓ {customBatOrder.services.selectedServiceNames.join(", ")}
              </div>
            )}
            {customBatOrder.services.engraving && customBatOrder.services.engravingText && (
              <div style={{ marginTop: 4, fontSize: ".72rem", color: "#b45309", background: "rgba(242,169,40,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                Laser Engraving: &ldquo;{customBatOrder.services.engravingText}&rdquo;
              </div>
            )}
          </div>
        ) : (
          lines.map((l) => (
            <div
              key={l.product.id}
              className="checkout-product-line"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                <img
                  src={l.product.image}
                  alt={l.product.name}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span className="checkout-product-name">
                    {l.product.name}
                  </span>
                  <span className="checkout-product-qty" style={{ display: "block" }}>
                    Qty: {l.quantity} · {formatPrice(l.product.price)} each
                  </span>
                </div>
              </div>
              <strong className="checkout-product-price">
                {formatPrice(l.product.price * l.quantity)}
              </strong>
            </div>
          ))
        )}
      </div>

      <div className="order-summary-divider" />

      {/* Subtotal */}
      <div className="order-summary-line">
        <span>Subtotal ({totalItemCount} item{totalItemCount !== 1 ? "s" : ""})</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>

      {/* Delivery */}
      <div className="order-summary-line">
        <span>
          {shippingCalc.hasDestination
            ? `Tracked Courier (${shippingCalc.countryName})`
            : "Tracked Courier: Select destination"}
        </span>
        <strong>
          {shippingCalc.hasDestination
            ? formatPrice(shippingCalc.shippingFee)
            : "—"}
        </strong>
      </div>

      {shippingCalc.requiresQuotation && (
        <div
          style={{
            padding: "8px 12px",
            background: "#fefce8",
            border: "1px solid #fde047",
            borderRadius: 8,
            fontSize: ".76rem",
            color: "#854d0e",
            lineHeight: 1.4,
          }}
        >
          ⚠️ A delivery quotation is required for {shippingCalc.countryName}. Our support team will confirm tracked courier charges.
        </div>
      )}

      <div className="order-summary-divider" />

      {/* Total Value */}
      <div className="order-total-line">
        <span className="label">Order Total</span>
        <span className="value">
          {shippingCalc.hasDestination ? formatPrice(grandTotal) : formatPrice(subtotal)}
        </span>
      </div>

      {/* Advance Deposit breakdown if deposit < 100 */}
      {depositPercent < 100 && (
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(34, 197, 94, 0.08)",
            borderRadius: 8,
            border: "1px solid rgba(34, 197, 94, 0.25)",
            fontSize: ".8rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#15803d", fontWeight: 700 }}>
            <span>Advance Deposit Due Now ({depositPercent}%):</span>
            <span>{formatPrice(depositDueNow)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: ".74rem", marginTop: 4 }}>
            <span>Balance Due Before Dispatch:</span>
            <span>{formatPrice(balanceRemaining)}</span>
          </div>
        </div>
      )}

      {/* Trust & Guarantee Box */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 12,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontSize: ".76rem",
          color: "#64748b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={15} color="#16a34a" style={{ flexShrink: 0 }} />
          <span>Official Beneficiary: <strong>ALYAN WAZIR (UBL Bank)</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Truck size={15} color="#d97706" style={{ flexShrink: 0 }} />
          <span>
            {shippingCalc.hasDestination && shippingCalc.destination
              ? `Estimated Delivery: ${shippingCalc.destination.estimatedDelivery}`
              : "Tracked Courier Dispatch"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Building2 size={15} color="#0284c7" style={{ flexShrink: 0 }} />
          <span>Direct from Sialkot Manufacturing Hub, Pakistan</span>
        </div>
      </div>
    </div>
  );

  // Guard: Empty cart renders clean message ONLY when neither standard cart nor custom bat order exist
  const hasStandardCart = cart.length > 0;
  const hasCustomOrder = isCustomOrder;

  if (!hasStandardCart && !hasCustomOrder && lines.length === 0) {
    return (
      <main className="checkout-page-wrapper">
        <div className="checkout-security-banner">
          <Lock size={14} color="#16a34a" />
          <span>Secure Manual Transfer Checkout · Official Sialkot Factory Direct</span>
        </div>

        <div
          style={{
            maxWidth: 540,
            margin: "40px auto",
            padding: "36px 20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "rgba(242, 169, 40, 0.12)",
              color: "var(--primary, #f2a928)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <ShoppingBag size={34} />
          </div>
          <h1 style={{ fontSize: "1.45rem", color: "#0f172a", margin: "0 0 10px", fontWeight: 800 }}>
            Your Cart is Empty
          </h1>
          <p style={{ color: "#64748b", fontSize: ".9rem", lineHeight: 1.6, marginBottom: 24 }}>
            You cannot proceed to checkout without selecting items. Please select equipment from our catalogue first.
          </p>
          <Link
            href="/shop"
            className="checkout-primary-cta"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", textDecoration: "none", fontSize: ".92rem" }}
          >
            <ShoppingBag size={18} /> Browse Equipment Catalogue
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page-wrapper">
      {/* Sleek Security Assurance Bar */}
      <div className="checkout-security-banner">
        <Lock size={14} color="#16a34a" />
        <span>256-Bit SSL Encrypted · Direct Factory Dispatch Checkout</span>
      </div>

      <div className="checkout-main-container">
        {/* ── MOBILE PROGRESS INDICATOR (< 768px) ── */}
        <div className="checkout-progress-mobile">
          <div className="checkout-progress-mobile-header">
            <div className="checkout-progress-mobile-info">
              <span className="checkout-progress-mobile-step-badge">
                Step {step} of 4
              </span>
              <span className="checkout-progress-mobile-title">
                {stepLabels[step]}
              </span>
            </div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as Step)}
                className="checkout-progress-mobile-back"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
          </div>
          <div className="checkout-progress-mobile-track">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`checkout-progress-mobile-bar ${
                  step === s ? "active" : step > s ? "completed" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── DESKTOP PROGRESS HEADER (≥ 768px) ── */}
        <div className="checkout-progress-desktop">
          {[
            { s: 1, label: "Contact & Delivery" },
            { s: 2, label: "Review Order" },
            { s: 3, label: "Payment Option" },
            { s: 4, label: "Transfer & Evidence" },
          ].map(({ s, label }) => {
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (isCompleted) setStep(s as Step);
                }}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  cursor: isCompleted ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 0,
                  opacity: isActive || isCompleted ? 1 : 0.45,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".84rem",
                    fontWeight: 800,
                    background: isCompleted
                      ? "#22c55e"
                      : isActive
                      ? "var(--primary, #f2a928)"
                      : "#e2e8f0",
                    color: isCompleted || isActive ? "#0f172a" : "#64748b",
                    transition: "all .2s ease",
                  }}
                >
                  {isCompleted ? <Check size={17} strokeWidth={2.5} color="#0f172a" /> : s}
                </div>
                <span
                  style={{
                    fontSize: ".76rem",
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#0f172a" : "#64748b",
                    textAlign: "center",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── MAIN CHECKOUT GRID (1 Col on Mobile, 2 Col on Desktop) ── */}
        <div className="checkout-layout-grid">
          {/* Left Column: Flow Cards + Mobile Collapsible Summary */}
          <div style={{ width: "100%", minWidth: 0 }}>
            {/* ── MOBILE COLLAPSIBLE ORDER SUMMARY (< 1024px) ── */}
            <div className="checkout-mobile-summary-wrapper">
              <button
                type="button"
                className="checkout-mobile-summary-toggle"
                onClick={() => setIsMobileSummaryOpen((prev) => !prev)}
                aria-expanded={isMobileSummaryOpen}
                aria-label="Toggle Order Summary"
              >
                <div className="checkout-mobile-summary-toggle-left">
                  <div className="checkout-mobile-summary-icon">
                    <ShoppingBag size={17} />
                  </div>
                  <div className="checkout-mobile-summary-meta">
                    <strong>Order Summary</strong>
                    <span>
                      {totalItemCount} item{totalItemCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="checkout-mobile-summary-toggle-right">
                  <div className="checkout-mobile-summary-price">
                    <span className="checkout-mobile-summary-price-label">
                      Total
                    </span>
                    <strong className="checkout-mobile-summary-price-val">
                      {shippingCalc.hasDestination ? formatPrice(grandTotal) : formatPrice(subtotal)}
                    </strong>
                  </div>
                  <span className="checkout-mobile-summary-action">
                    {isMobileSummaryOpen ? "Hide" : "Details"}
                    <ChevronDown
                      size={13}
                      className={`checkout-mobile-summary-chevron ${isMobileSummaryOpen ? "rotate" : ""}`}
                    />
                  </span>
                </div>
              </button>

              {isMobileSummaryOpen && (
                <div className="checkout-mobile-summary-content">
                  {renderOrderSummaryContent(true)}
                </div>
              )}
            </div>

            {/* ── STEP 1: CONTACT & DELIVERY ── */}
            {step === 1 && (
              <div className="checkout-card">
                <h2 className="checkout-step-heading">
                  Step 1 — Contact &amp; Delivery Details
                </h2>
                <p className="checkout-step-description">
                  Please enter your delivery destination and contact number for tracked dispatch updates.
                </p>

                <div className="checkout-form-grid">
                  {/* 1. Full Name */}
                  <div style={{ position: "relative" }}>
                    <label htmlFor="checkout-full-name" className="checkout-field-label">
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>FULL NAME</span>
                        <span style={{ color: "#ef4444" }}>*</span>
                      </div>
                      {validateFullName(formData.fullName).valid && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16a34a", fontSize: ".72rem", fontWeight: 700 }}>
                          <Check size={13} strokeWidth={2.5} /> Valid
                        </span>
                      )}
                    </label>
                    <input
                      id="checkout-full-name"
                      className="checkout-input"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Alyan Wazir / Imran Khan"
                      value={formData.fullName}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      onBlur={() => handleFieldBlur("fullName")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      aria-invalid={Boolean(fieldErrors.fullName)}
                      aria-describedby={fieldErrors.fullName ? "fullname-error" : undefined}
                      style={{
                        borderColor: fieldErrors.fullName
                          ? "#ef4444"
                          : validateFullName(formData.fullName).valid
                          ? "#22c55e"
                          : "#cbd5e1",
                        boxShadow: fieldErrors.fullName ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : undefined,
                      }}
                    />
                    {fieldErrors.fullName && (
                      <div id="fullname-error" role="alert" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: ".82rem", color: "#ef4444", fontWeight: 600, wordBreak: "break-word" }}>
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span>{fieldErrors.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Email Address */}
                  <div style={{ position: "relative", width: "100%" }}>
                    <label htmlFor="checkout-email" className="checkout-field-label">
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>EMAIL ADDRESS</span>
                        <span style={{ color: "#ef4444" }}>*</span>
                      </div>
                      {validateEmail(formData.email).valid && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16a34a", fontSize: ".72rem", fontWeight: 700 }}>
                          <Check size={13} strokeWidth={2.5} /> Valid
                        </span>
                      )}
                    </label>
                    <input
                      id="checkout-email"
                      className="checkout-input"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      placeholder="e.g. name@example.com / customer@outlook.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      style={{
                        borderColor: fieldErrors.email
                          ? "#ef4444"
                          : validateEmail(formData.email).valid
                          ? "#22c55e"
                          : "#cbd5e1",
                        boxShadow: fieldErrors.email ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : undefined,
                      }}
                    />
                    {fieldErrors.email && (
                      <div id="email-error" role="alert" className="checkout-field-error">
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{fieldErrors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Phone / WhatsApp with Calling Code Selector */}
                  <div className="checkout-form-col-full">
                    <CheckoutSelectorErrorBoundary fallbackTitle="Could not load phone calling code selector. Please try again.">
                      <PhoneInput
                        id="checkout-phone"
                        value={formData.phone}
                        dialCode={formData.phoneDialCode}
                        onChange={(phoneVal, dialVal) => {
                          const updated = { ...formData, phone: phoneVal, phoneDialCode: dialVal };
                          setFormData(updated);
                          if (touchedFields.phone || fieldErrors.phone) {
                            const outcome = validateCheckoutCustomerInfo(updated);
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              if (outcome.errors.phone) next.phone = outcome.errors.phone;
                              else delete next.phone;
                              return next;
                            });
                          }
                        }}
                        onBlur={() => handleFieldBlur("phone")}
                        error={fieldErrors.phone}
                        isValid={Boolean(formData.phone.trim()) && !fieldErrors.phone}
                      />
                    </CheckoutSelectorErrorBoundary>
                  </div>

                  {/* 4. Destination Country Selector */}
                  <div className="checkout-form-col-full">
                    <CheckoutSelectorErrorBoundary fallbackTitle="Could not load destination country list. Please try again.">
                      <CountrySelector
                        value={formData.country}
                        onChange={(selected) => {
                          const updated = {
                            ...formData,
                            country: selected.name,
                            countryCode: selected.code,
                            state: "",
                          };
                          setFormData(updated);
                          setTouchedFields((prev) => ({ ...prev, country: true }));
                          const outcome = validateCheckoutCustomerInfo(updated);
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            if (outcome.errors.country) next.country = outcome.errors.country;
                            else delete next.country;
                            return next;
                          });
                          setErrorMessage(null);
                        }}
                        error={fieldErrors.country}
                      />
                    </CheckoutSelectorErrorBoundary>
                  </div>

                  {/* 5. Street Address */}
                  <div className="checkout-form-col-full" style={{ position: "relative" }}>
                    <label htmlFor="checkout-address" className="checkout-field-label">
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>STREET ADDRESS</span>
                        <span style={{ color: "#ef4444" }}>*</span>
                      </div>
                      {validateStreetAddress(formData.address).valid && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16a34a", fontSize: ".72rem", fontWeight: 700 }}>
                          <Check size={13} strokeWidth={2.5} /> Valid
                        </span>
                      )}
                    </label>
                    <input
                      id="checkout-address"
                      className="checkout-input"
                      type="text"
                      required
                      autoComplete="street-address"
                      placeholder="House/Apartment number, street, landmark"
                      value={formData.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      onBlur={() => handleFieldBlur("address")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      aria-invalid={Boolean(fieldErrors.address)}
                      aria-describedby={fieldErrors.address ? "address-error" : undefined}
                      style={{
                        borderColor: fieldErrors.address
                          ? "#ef4444"
                          : validateStreetAddress(formData.address).valid
                          ? "#22c55e"
                          : "#cbd5e1",
                        boxShadow: fieldErrors.address ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : undefined,
                      }}
                    />
                    {fieldErrors.address && (
                      <div id="address-error" role="alert" className="checkout-field-error">
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{fieldErrors.address}</span>
                      </div>
                    )}
                  </div>

                  {/* 6. City */}
                  <div style={{ position: "relative", width: "100%" }}>
                    <label htmlFor="checkout-city" className="checkout-field-label">
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>CITY</span>
                        <span style={{ color: "#ef4444" }}>*</span>
                      </div>
                      {validateCity(formData.city).valid && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16a34a", fontSize: ".72rem", fontWeight: 700 }}>
                          <Check size={13} strokeWidth={2.5} /> Valid
                        </span>
                      )}
                    </label>
                    <input
                      id="checkout-city"
                      className="checkout-input"
                      type="text"
                      required
                      autoComplete="address-level2"
                      placeholder="e.g. London / Lahore / Dubai"
                      value={formData.city}
                      onChange={(e) => handleFieldChange("city", e.target.value)}
                      onBlur={() => handleFieldBlur("city")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      aria-invalid={Boolean(fieldErrors.city)}
                      aria-describedby={fieldErrors.city ? "city-error" : undefined}
                      style={{
                        borderColor: fieldErrors.city
                          ? "#ef4444"
                          : validateCity(formData.city).valid
                          ? "#22c55e"
                          : "#cbd5e1",
                        boxShadow: fieldErrors.city ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : undefined,
                      }}
                    />
                    {fieldErrors.city && (
                      <div id="city-error" role="alert" className="checkout-field-error">
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{fieldErrors.city}</span>
                      </div>
                    )}
                  </div>

                  {/* 7. State / Region / County */}
                  <div style={{ position: "relative", width: "100%" }}>
                    <label htmlFor="checkout-state" className="checkout-field-label">
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>{addressConfig.stateLabel.replace(" *", "")}</span>
                        {addressConfig.requiresState ? (
                          <span style={{ color: "#ef4444" }}>*</span>
                        ) : (
                          <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".72rem", textTransform: "none" }}>(Optional)</span>
                        )}
                      </div>
                      {validateState(formData.state, formData.countryCode).valid && Boolean(formData.state?.trim()) && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16a34a", fontSize: ".72rem", fontWeight: 700 }}>
                          <Check size={13} strokeWidth={2.5} /> Valid
                        </span>
                      )}
                    </label>
                    {addressConfig.states && addressConfig.states.length > 0 ? (
                      <select
                        id="checkout-state"
                        className="checkout-select"
                        value={formData.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        onBlur={() => handleFieldBlur("state")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        aria-invalid={Boolean(fieldErrors.state)}
                        style={{
                          borderColor: fieldErrors.state
                            ? "#ef4444"
                            : validateState(formData.state, formData.countryCode).valid && Boolean(formData.state)
                            ? "#22c55e"
                            : "#cbd5e1",
                        }}
                      >
                        <option value="">Select {addressConfig.stateLabel.replace(" *", "")}</option>
                        {addressConfig.states.map((s) => (
                          <option key={s.code} value={s.name}>
                            {s.name} ({s.code.replace("_US", "")})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="checkout-state"
                        className="checkout-input"
                        type="text"
                        autoComplete="address-level1"
                        placeholder="e.g. Greater London / Punjab"
                        value={formData.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        onBlur={() => handleFieldBlur("state")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        aria-invalid={Boolean(fieldErrors.state)}
                        style={{
                          borderColor: fieldErrors.state
                            ? "#ef4444"
                            : validateState(formData.state, formData.countryCode).valid && Boolean(formData.state?.trim())
                            ? "#22c55e"
                            : "#cbd5e1",
                        }}
                      />
                    )}
                    {fieldErrors.state && (
                      <div role="alert" className="checkout-field-error">
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{fieldErrors.state}</span>
                      </div>
                    )}
                  </div>

                  {/* 8. Postal / ZIP Code */}
                  <div style={{ position: "relative", width: "100%" }}>
                    <label htmlFor="checkout-postal" className="checkout-field-label">
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>{addressConfig.postalCodeLabel.replace(" *", "").replace(" (Optional)", "")}</span>
                        {addressConfig.requiresPostalCode ? (
                          <span style={{ color: "#ef4444" }}>*</span>
                        ) : (
                          <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".72rem", textTransform: "none" }}>(Optional)</span>
                        )}
                      </div>
                      {validatePostalCode(formData.postalCode, formData.countryCode).valid && Boolean(formData.postalCode?.trim()) && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16a34a", fontSize: ".72rem", fontWeight: 700 }}>
                          <Check size={13} strokeWidth={2.5} /> Valid
                        </span>
                      )}
                    </label>
                    <input
                      id="checkout-postal"
                      className="checkout-input"
                      type="text"
                      autoComplete="postal-code"
                      placeholder={addressConfig.postalCodePlaceholder}
                      value={formData.postalCode}
                      onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                      onBlur={() => handleFieldBlur("postalCode")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      aria-invalid={Boolean(fieldErrors.postalCode)}
                      style={{
                        borderColor: fieldErrors.postalCode
                          ? "#ef4444"
                          : validatePostalCode(formData.postalCode, formData.countryCode).valid && Boolean(formData.postalCode?.trim())
                          ? "#22c55e"
                          : "#cbd5e1",
                      }}
                    />
                    {fieldErrors.postalCode && (
                      <div role="alert" className="checkout-field-error">
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{fieldErrors.postalCode}</span>
                      </div>
                    )}
                  </div>

                  {/* 9. Delivery Notes */}
                  <div className="checkout-form-col-full">
                    <label htmlFor="checkout-notes" className="checkout-field-label">
                      <span>DELIVERY NOTES</span>
                      <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".72rem", textTransform: "none" }}>(Optional)</span>
                    </label>
                    <input
                      id="checkout-notes"
                      className="checkout-input"
                      type="text"
                      maxLength={500}
                      placeholder="Leave with neighbor, gate code, ring buzzer, etc."
                      value={formData.deliveryInstructions}
                      onChange={(e) => handleFieldChange("deliveryInstructions", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                    />
                  </div>
                </div>

                {/* Step 1 Error Banner */}
                {errorMessage && (
                  <div
                    role="alert"
                    style={{
                      marginTop: 18,
                      padding: "12px 16px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1.5px solid #ef4444",
                      borderRadius: 8,
                      color: "#dc2626",
                      fontSize: ".85rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      wordBreak: "break-word",
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Step 1 Continue Button */}
                <button
                  type="button"
                  className="checkout-primary-cta"
                  onClick={() => {
                    setTouchedFields({
                      fullName: true,
                      email: true,
                      phone: true,
                      country: true,
                      address: true,
                      city: true,
                      state: true,
                      postalCode: true,
                    });

                    const outcome = validateCheckoutCustomerInfo(formData);
                    if (!outcome.isValid) {
                      setFieldErrors(outcome.errors);
                      const missingFields = Object.keys(outcome.errors);
                      const firstField = missingFields[0];
                      const friendlyName =
                        firstField === "fullName"
                          ? "Full Name"
                          : firstField === "email"
                          ? "Email Address"
                          : firstField === "phone"
                          ? "Phone Number"
                          : firstField === "country"
                          ? "Destination Country"
                          : firstField === "address"
                          ? "Street Address"
                          : firstField === "city"
                          ? "City"
                          : firstField === "state"
                          ? addressConfig.stateLabel.replace(" *", "")
                          : firstField === "postalCode"
                          ? addressConfig.postalCodeLabel.replace(" *", "")
                          : "required information";

                      setErrorMessage(`Please complete ${friendlyName} (${outcome.errors[firstField]}) before proceeding.`);

                      const targetId =
                        firstField === "fullName"
                          ? "checkout-full-name"
                          : firstField === "email"
                          ? "checkout-email"
                          : firstField === "phone"
                          ? "checkout-phone"
                          : firstField === "address"
                          ? "checkout-address"
                          : firstField === "city"
                          ? "checkout-city"
                          : firstField === "state"
                          ? "checkout-state"
                          : firstField === "postalCode"
                          ? "checkout-postal"
                          : "checkout-country";
                      const el = document.getElementById(targetId);
                      if (el) {
                        el.focus();
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                      return;
                    }

                    setFieldErrors({});
                    setErrorMessage(null);
                    setStep(2);
                  }}
                  style={{ marginTop: 22 }}
                >
                  Proceed to Review Order <ArrowRight size={17} />
                </button>
              </div>
            )}

            {/* ── STEP 2: REVIEW ORDER ── */}
            {step === 2 && (
              <div className="checkout-card">
                <button className="checkout-back-btn" type="button" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Back to Contact Details
                </button>

                <h2 className="checkout-step-heading">Step 2 — Review Your Order</h2>
                <p className="checkout-step-description">
                  Verify your items and delivery destination before continuing to payment details.
                </p>

                <div
                  style={{
                    background: "rgba(242, 169, 40, 0.08)",
                    border: "1px solid rgba(242, 169, 40, 0.3)",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: ".84rem",
                    color: "#b45309",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <span>Provisional Order Reference: <strong>{provisionalRef}</strong></span>
                </div>

                {/* Items List or Custom Bat Specification */}
                {isCustomOrder && customBatOrder ? (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "16px 18px",
                      marginBottom: 20,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        borderBottom: "1px solid #f1f5f9",
                        paddingBottom: 12,
                        marginBottom: 12,
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: ".72rem",
                            fontWeight: 800,
                            color: "#b45309",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          BESPOKE SPECIFICATION · CUSTOM BAT
                        </span>
                        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                          Custom Cricket Bat — {customBatOrder.bat.constructionType}
                        </h3>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: ".74rem",
                            background: "rgba(242, 169, 40, 0.15)",
                            color: "#b45309",
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 999,
                            display: "inline-block",
                            marginBottom: 4,
                          }}
                        >
                          {customBatOrder.bat.qualityLevel}
                        </span>
                        <div style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a" }}>
                          {formatPrice(customBatOrder.payment.orderValue)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: "10px 14px",
                        fontSize: ".82rem",
                        color: "#475569",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: "#0f172a", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>
                          Size / Category
                        </span>
                        <span>{customBatOrder.bat.size}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#0f172a", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>
                          Blade Profile
                        </span>
                        <span>{customBatOrder.bat.profile}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#0f172a", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>
                          Handle
                        </span>
                        <span>{customBatOrder.bat.handlePreference}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#0f172a", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>
                          Target Weight
                        </span>
                        <span>{customBatOrder.bat.preferredWeight}</span>
                      </div>
                    </div>

                    {customBatOrder.services.selectedServiceNames.length > 0 && (
                      <div
                        style={{
                          fontSize: ".78rem",
                          color: "#15803d",
                          background: "rgba(34, 197, 94, 0.08)",
                          padding: "8px 12px",
                          borderRadius: 8,
                          marginBottom: 10,
                        }}
                      >
                        <strong>Included Services:</strong> {customBatOrder.services.selectedServiceNames.join(" · ")}
                      </div>
                    )}

                    {customBatOrder.services.engraving && customBatOrder.services.engravingText && (
                      <div
                        style={{
                          fontSize: ".84rem",
                          background: "rgba(242, 169, 40, 0.08)",
                          border: "1px dashed rgba(242, 169, 40, 0.6)",
                          padding: "10px 12px",
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, color: "#b45309" }}>Laser Engraving Text:</span>
                          <span style={{ fontSize: ".72rem", color: "#15803d", fontWeight: 700 }}>✓ Included</span>
                        </div>
                        <div style={{ fontSize: "1.02rem", fontWeight: 900, color: "#0f172a", marginTop: 3 }}>
                          &ldquo;{customBatOrder.services.engravingText}&rdquo;
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: ".72rem", color: "#64748b" }}>
                          Please check spelling carefully. Your bat will be laser engraved exactly as entered.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {lines.map((line) => (
                      <div
                        key={line.product.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                        }}
                      >
                        <img
                          src={line.product.image}
                          alt={line.product.name}
                          style={{
                            width: 48,
                            height: 48,
                            minWidth: 48,
                            objectFit: "cover",
                            borderRadius: 8,
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong
                            style={{
                              fontSize: ".88rem",
                              display: "block",
                              color: "#0f172a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {line.product.name}
                          </strong>
                          <span style={{ fontSize: ".76rem", color: "#64748b" }}>
                            Qty: {line.quantity} · {formatPrice(line.product.price)} each
                          </span>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <strong style={{ color: "#0f172a", fontSize: ".92rem" }}>
                            {formatPrice(line.product.price * line.quantity)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals Summary */}
                <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 20 }}>
                  <div className="order-summary-line">
                    <span>Subtotal ({totalItemCount} items)</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <div className="order-summary-line">
                    <span>
                      {shippingCalc.hasDestination
                        ? `Tracked Courier (${shippingCalc.countryName})`
                        : "Tracked Courier: Select destination"}
                    </span>
                    <strong>
                      {shippingCalc.hasDestination
                        ? formatPrice(shippingCalc.shippingFee)
                        : "—"}
                    </strong>
                  </div>
                  {shippingCalc.requiresQuotation && (
                    <div style={{ marginTop: 6, padding: "8px 10px", background: "#fefce8", border: "1px solid #fde047", borderRadius: 6, fontSize: ".76rem", color: "#854d0e" }}>
                      ⚠️ A delivery quotation is required for this destination.
                    </div>
                  )}
                  <div className="order-summary-divider" />
                  <div className="order-total-line">
                    <span className="label">Total Order Value</span>
                    <span className="value">
                      {shippingCalc.hasDestination ? formatPrice(grandTotal) : formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-primary-cta"
                  onClick={() => setStep(3)}
                >
                  Select Payment Option <ArrowRight size={17} />
                </button>
              </div>
            )}

            {/* ── STEP 3: SELECT PAYMENT METHOD ── */}
            {step === 3 && (
              <div className="checkout-card">
                <button className="checkout-back-btn" type="button" onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Back to Order Review
                </button>

                <h2 className="checkout-step-heading">Step 3 — Select Payment Option</h2>
                <p className="checkout-step-description">
                  Choose 100% full payment or a 50% advance production deposit. Card payments are handled via bank transfer until the official UBL card gateway is enabled.
                </p>

                {/* Advance Deposit Option */}
                <div style={{ marginBottom: 20 }}>
                  <label className="checkout-field-label">Choose Payment Plan</label>
                  <div className="checkout-plans-grid">
                    <button
                      type="button"
                      onClick={() => setDepositPercent(100)}
                      className={`payment-method-option${depositPercent === 100 ? " selected" : ""}`}
                    >
                      <span className="payment-method-label">100% Full Payment</span>
                      <small style={{ color: "#64748b", fontSize: ".76rem", display: "block", marginTop: 2 }}>
                        Pay full amount upfront ({formatPrice(grandTotal)})
                      </small>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositPercent(50)}
                      className={`payment-method-option${depositPercent === 50 ? " selected" : ""}`}
                    >
                      <span className="payment-method-label">50% Advance Deposit</span>
                      <small style={{ color: "#64748b", fontSize: ".76rem", display: "block", marginTop: 2 }}>
                        Pay {formatPrice(Math.round(grandTotal * 0.5 * 100) / 100)} now, balance before dispatch
                      </small>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositPercent(30)}
                      className={`payment-method-option${depositPercent === 30 ? " selected" : ""}`}
                    >
                      <span className="payment-method-label">30% Minimum Advance</span>
                      <small style={{ color: "#64748b", fontSize: ".76rem", display: "block", marginTop: 2 }}>
                        Pay {formatPrice(Math.round(grandTotal * 0.3 * 100) / 100)} now (Custom Bats)
                      </small>
                    </button>
                  </div>
                </div>

                {/* Primary Payment Option Card */}
                <div
                  style={{
                    border: "2px solid #b45309",
                    background: "rgba(242, 169, 40, 0.05)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <Building2 size={20} color="#b45309" />
                    <strong style={{ fontSize: ".98rem", color: "#0f172a" }}>
                      Bank Wire / International Remittance (Wise, Remitly, etc.)
                    </strong>
                    <span style={{ background: "rgba(34, 197, 94, 0.15)", color: "#15803d", fontSize: ".72rem", fontWeight: 800, padding: "2px 8px", borderRadius: 999, marginLeft: "auto" }}>
                      Recommended
                    </span>
                  </div>
                  <p style={{ fontSize: ".84rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                    Transfer the final order amount using our verified UBL bank details. After completing your transfer via mobile banking, Taptap Send, Remitly, Wise, or exchange, upload your receipt screenshot on the next step.
                  </p>
                </div>

                {/* Domestic Pakistan COD Notice */}
                {formData.country === "Pakistan" && (
                  <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 16, fontSize: ".82rem", color: "#475569" }}>
                    💡 <em>For domestic Pakistan deliveries requiring partial advance verification, our team will coordinate on WhatsApp.</em>
                  </div>
                )}

                <button
                  type="button"
                  className="checkout-primary-cta"
                  onClick={() => setStep(4)}
                >
                  View UBL Bank Transfer Instructions <ArrowRight size={17} />
                </button>
              </div>
            )}

            {/* ── STEP 4: PAYMENT INSTRUCTIONS & EVIDENCE UPLOAD ── */}
            {step === 4 && (
              <div className="checkout-card">
                <button className="checkout-back-btn" type="button" onClick={() => setStep(3)}>
                  <ChevronLeft size={16} /> Back to Payment Option
                </button>

                <h2 className="checkout-step-heading">
                  Step 4 — Beneficiary &amp; Payment Verification
                </h2>
                <p className="checkout-step-description">
                  Please complete your payment to the official UBL account below, select the payment service you used, and upload your transfer receipt for verification.
                </p>

                {/* Total Due Banner */}
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1.5px solid rgba(34, 197, 94, 0.35)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <span style={{ fontSize: ".72rem", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                      Amount Due ({depositPercent}% {depositPercent < 100 ? "Deposit" : "Full"})
                    </span>
                    <strong style={{ fontSize: "1.4rem", color: "#15803d", fontWeight: 800 }}>
                      {formatPrice(depositDueNow)}
                    </strong>
                    {balanceRemaining > 0 && (
                      <small style={{ display: "block", color: "#64748b", fontSize: ".74rem", marginTop: 2 }}>
                        Remaining balance ({formatPrice(balanceRemaining)}) due before dispatch.
                      </small>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: ".7rem", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                      Your Transfer Reference
                    </span>
                    <strong style={{ color: "#b45309", fontSize: "1rem", fontFamily: "monospace", fontWeight: 800 }}>
                      {provisionalRef}
                    </strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(provisionalRef, "Order Ref")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        cursor: "pointer",
                        fontSize: ".76rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginLeft: "auto",
                        marginTop: 3,
                        padding: 0,
                      }}
                    >
                      {copiedKey === "Order Ref" ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      <span>{copiedKey === "Order Ref" ? "Ref copied!" : "Copy Ref"}</span>
                    </button>
                  </div>
                </div>

                {/* Centralized Official UBL Details Box */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 18,
                  }}
                >
                  <h3 style={{ margin: "0 0 12px", fontSize: ".95rem", color: "#0f172a", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={18} color="#b45309" />
                    <span>Official UBL Beneficiary Details</span>
                  </h3>

                  {[
                    { label: "Bank Name", val: UBL_PAYMENT_CONFIG.bankName },
                    { label: "Beneficiary Title", val: UBL_PAYMENT_CONFIG.beneficiaryFullName },
                    { label: "Account Number", val: UBL_PAYMENT_CONFIG.accountNumber },
                    { label: "IBAN", val: UBL_PAYMENT_CONFIG.iban },
                    { label: "SWIFT / BIC", val: UBL_PAYMENT_CONFIG.swiftBic },
                    { label: "Branch Name", val: UBL_PAYMENT_CONFIG.branchName },
                    { label: "Beneficiary Mobile", val: UBL_PAYMENT_CONFIG.mobileNumber },
                    { label: "Payment Email", val: UBL_PAYMENT_CONFIG.paymentEmail },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: ".82rem",
                        flexWrap: "wrap",
                        gap: 4,
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: ".8rem", fontWeight: 600 }}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: "100%", wordBreak: "break-all" }}>
                        <strong style={{ color: "#0f172a", fontFamily: label === "IBAN" || label === "Account Number" || label === "SWIFT / BIC" ? "monospace" : "inherit", fontSize: ".84rem" }}>
                          {val}
                        </strong>
                        <button
                          type="button"
                          className="payment-info-copy"
                          onClick={() => copyToClipboard(val, label)}
                          aria-label={`Copy ${label}`}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            borderRadius: 4,
                            color: "#0284c7",
                            flexShrink: 0,
                          }}
                        >
                          {copiedKey === label ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Important Notice */}
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 20,
                    fontSize: ".82rem",
                    color: "#92400e",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  <AlertTriangle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  <strong>Important Notice:</strong> {UBL_PAYMENT_CONFIG.beneficiaryNotice}
                </div>

                {/* ── Payment Method Selection Radio Group ── */}
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
                    How did you make your payment?
                  </h3>
                  <p style={{ color: "#64748b", fontSize: ".84rem", margin: "0 0 14px", lineHeight: 1.5 }}>
                    Select the service or transfer method you used.
                  </p>

                  <div
                    role="radiogroup"
                    aria-label="Payment method selection"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 8,
                    }}
                  >
                    {PAYMENT_METHODS.map((pm) => {
                      const isSelected = selectedPaymentMethod === pm.name;
                      const isWise = pm.id === "wise";
                      return (
                        <label
                          key={pm.id}
                          htmlFor={`payment-option-${pm.id}`}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            background: isSelected ? "rgba(34, 197, 94, 0.08)" : "#ffffff",
                            border: isSelected
                              ? "2px solid #16a34a"
                              : "1.5px solid #cbd5e1",
                            borderRadius: 10,
                            padding: "12px 14px",
                            cursor: "pointer",
                            boxShadow: isSelected
                              ? "0 3px 12px rgba(34, 197, 94, 0.12)"
                              : "0 1px 3px rgba(0, 0, 0, 0.02)",
                            transition: "all .2s ease",
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <input
                                id={`payment-option-${pm.id}`}
                                type="radio"
                                name="selectedPaymentMethodRadio"
                                value={pm.name}
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedPaymentMethod(pm.name);
                                  setEvidenceData((prev) => ({ ...prev, provider: pm.name }));
                                }}
                                style={{
                                  accentColor: "#16a34a",
                                  width: 18,
                                  height: 18,
                                  cursor: "pointer",
                                  margin: 0,
                                  flexShrink: 0,
                                }}
                              />
                              <div>
                                <strong style={{ fontSize: ".9rem", color: "#0f172a", display: "block" }}>
                                  {pm.name}
                                </strong>
                                {pm.badge && (
                                  <span
                                    style={{
                                      fontSize: ".68rem",
                                      fontWeight: 700,
                                      color: isSelected ? "#15803d" : "#64748b",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {pm.badge}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "rgba(34, 197, 94, 0.15)",
                                  color: "#15803d",
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  fontSize: ".7rem",
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                <CheckCircle2 size={13} color="#16a34a" />
                                <span>{isWise ? "Wise selected" : "Selected"}</span>
                              </div>
                            )}
                          </div>

                          <p style={{ margin: "6px 0 0 28px", fontSize: ".76rem", color: "#64748b", lineHeight: 1.4 }}>
                            {pm.description}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Provider Guidance Box */}
                {selectedPaymentMethod === "Wise" ? (
                  <div
                    style={{
                      background: "rgba(34, 197, 94, 0.08)",
                      border: "1.5px solid rgba(34, 197, 94, 0.4)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      marginBottom: 18,
                      fontSize: ".84rem",
                      color: "#166534",
                      lineHeight: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong style={{ display: "block", marginBottom: 2, fontSize: ".88rem" }}>
                        Wise Selected
                      </strong>
                      You selected Wise. Please enter your transfer reference and attach the receipt screenshot below.
                    </div>
                  </div>
                ) : selectedPaymentMethod ? (
                  <div
                    style={{
                      background: "rgba(56, 189, 248, 0.08)",
                      border: "1.5px solid rgba(56, 189, 248, 0.3)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      marginBottom: 18,
                      fontSize: ".84rem",
                      color: "#0369a1",
                      lineHeight: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <Info size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong style={{ display: "block", marginBottom: 2, fontSize: ".88rem" }}>
                        {selectedPaymentMethod} Selected
                      </strong>
                      Please enter your transfer reference and attach the payment receipt below.
                    </div>
                  </div>
                ) : null}

                {/* ── Payment Details Form ── */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 18,
                  }}
                >
                  <h4 style={{ margin: "0 0 14px", fontSize: ".92rem", fontWeight: 800, color: "#0f172a" }}>
                    Payment Details Form
                  </h4>

                  <div className="checkout-form-grid">
                    {/* Sender Name */}
                    <div>
                      <label className="checkout-field-label">
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span>SENDER’S FULL NAME</span>
                          <span style={{ color: "#ef4444" }}>*</span>
                        </div>
                      </label>
                      <input
                        className="checkout-input"
                        type="text"
                        required
                        placeholder="Name on bank / transfer account"
                        value={evidenceData.senderName}
                        onChange={(e) => setEvidenceData({ ...evidenceData, senderName: e.target.value })}
                      />
                    </div>

                    {/* Country Payment Sent From */}
                    <div>
                      <label className="checkout-field-label">COUNTRY PAYMENT SENT FROM</label>
                      <input
                        className="checkout-input"
                        type="text"
                        placeholder="e.g. United Kingdom, USA, UAE"
                        value={evidenceData.senderCountry}
                        onChange={(e) => setEvidenceData({ ...evidenceData, senderCountry: e.target.value })}
                      />
                    </div>

                    {/* Transfer Reference */}
                    <div>
                      <label className="checkout-field-label">
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span>TRANSACTION / REFERENCE NUMBER</span>
                          <span style={{ color: "#ef4444" }}>*</span>
                        </div>
                      </label>
                      <input
                        className="checkout-input"
                        type="text"
                        required
                        placeholder={
                          PAYMENT_METHODS.find((p) => p.name === selectedPaymentMethod)?.referencePlaceholder ||
                          provisionalRef
                        }
                        value={evidenceData.transferReference}
                        onChange={(e) => setEvidenceData({ ...evidenceData, transferReference: e.target.value })}
                      />
                    </div>

                    {/* Amount Paid */}
                    <div>
                      <label className="checkout-field-label">
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span>AMOUNT PAID</span>
                          <span style={{ color: "#ef4444" }}>*</span>
                        </div>
                      </label>
                      <input
                        className="checkout-input"
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        placeholder={String(depositDueNow)}
                        value={evidenceData.amountSent}
                        onChange={(e) => setEvidenceData({ ...evidenceData, amountSent: e.target.value })}
                      />
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="checkout-field-label">
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span>CURRENCY</span>
                          <span style={{ color: "#ef4444" }}>*</span>
                        </div>
                      </label>
                      <select
                        className="checkout-select"
                        value={evidenceData.currencySent}
                        onChange={(e) => setEvidenceData({ ...evidenceData, currencySent: e.target.value })}
                      >
                        {["GBP", "USD", "EUR", "AED", "SAR", "AUD", "CAD", "PKR"].map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="checkout-field-label">
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span>PAYMENT DATE</span>
                          <span style={{ color: "#ef4444" }}>*</span>
                        </div>
                      </label>
                      <input
                        className="checkout-input"
                        type="date"
                        required
                        value={evidenceData.transferDate}
                        onChange={(e) => setEvidenceData({ ...evidenceData, transferDate: e.target.value })}
                      />
                    </div>

                    {/* Customer Note */}
                    <div className="checkout-form-col-full">
                      <label className="checkout-field-label">
                        <span>CUSTOMER NOTE / SPECIAL SPECIFICATIONS</span>
                        <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".72rem", textTransform: "none" }}>(Optional)</span>
                      </label>
                      <textarea
                        className="checkout-input"
                        rows={2}
                        placeholder="Bat weight preference, handle shape, or custom instructions..."
                        value={evidenceData.customerNote}
                        onChange={(e) => setEvidenceData({ ...evidenceData, customerNote: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Receipt Upload Box ── */}
                <div style={{ marginBottom: 18 }}>
                  <label className="checkout-field-label">
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span>PAYMENT RECEIPT / SCREENSHOT UPLOAD</span>
                      <span style={{ color: "#ef4444" }}>*</span>
                    </div>
                    <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".72rem", textTransform: "none" }}>Max 5 MB (JPG, PNG, PDF)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />

                  {!receiptFile ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileSelected(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: isDragOver ? "2px dashed #16a34a" : "2px dashed #cbd5e1",
                        background: isDragOver ? "rgba(34, 197, 94, 0.06)" : "#f8fafc",
                        borderRadius: 12,
                        padding: "22px 14px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all .2s ease",
                      }}
                    >
                      <UploadCloud size={34} color="#16a34a" style={{ margin: "0 auto 6px", display: "block" }} />
                      <strong style={{ fontSize: ".88rem", color: "#0f172a", display: "block" }}>
                        Tap to select or drop receipt screenshot
                      </strong>
                      <span style={{ fontSize: ".76rem", color: "#64748b", display: "block", marginTop: 2 }}>
                        Supports JPG, PNG, WEBP images or PDF document
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "rgba(34, 197, 94, 0.08)",
                        border: "1.5px solid rgba(34, 197, 94, 0.4)",
                        borderRadius: 12,
                        padding: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Receipt Preview"
                          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8, border: "1px solid #cbd5e1" }}
                        />
                      ) : (
                        <div style={{ width: 50, height: 50, borderRadius: 8, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FileText size={24} color="#0284c7" />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: ".86rem", color: "#0f172a", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {receiptFile.name}
                        </strong>
                        <small style={{ color: "#16a34a", fontSize: ".74rem", fontWeight: 700 }}>
                          {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB · Attached &amp; verified
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={removeFile}
                        style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: 8, borderRadius: 8, cursor: "pointer" }}
                        title="Remove or replace receipt"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Payment Confirmation & Commercial Agreement ── */}
                <div
                  style={{
                    marginTop: 18,
                    marginBottom: 18,
                    background: "#f8fafc",
                    border: paymentConfirmed && policiesAccepted
                      ? "1.5px solid rgba(34, 197, 94, 0.6)"
                      : "1.5px solid #cbd5e1",
                    borderRadius: 12,
                    padding: "14px 16px",
                    transition: "border-color .2s ease",
                  }}
                >
                  {/* Checkbox 1: Payment Confirmation */}
                  <label
                    htmlFor="payment-confirmation-checkbox"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                      fontSize: ".84rem",
                      color: "#0f172a",
                      lineHeight: 1.45,
                      userSelect: "none",
                      marginBottom: 12,
                    }}
                  >
                    <input
                      id="payment-confirmation-checkbox"
                      type="checkbox"
                      checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                      style={{
                        accentColor: "#16a34a",
                        width: 18,
                        height: 18,
                        marginTop: 2,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      I confirm that I have sent the payment to the official beneficiary details shown above and that the information provided is correct.
                    </span>
                  </label>

                  <div style={{ height: 1, background: "#e2e8f0", margin: "8px 0 12px" }} />

                  {/* Checkbox 2: Policy Agreement */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".74rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>
                      <ShieldCheck size={15} /> Commercial Agreement
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPolicyModalOpen(true)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#0284c7",
                        fontSize: ".8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Read International Agreement ↗
                    </button>
                  </div>

                  <label
                    htmlFor="policy-agreement-checkbox"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                      fontSize: ".84rem",
                      color: "#0f172a",
                      lineHeight: 1.45,
                      userSelect: "none",
                    }}
                  >
                    <input
                      id="policy-agreement-checkbox"
                      type="checkbox"
                      checked={policiesAccepted}
                      onChange={(e) => setPoliciesAccepted(e.target.checked)}
                      style={{
                        accentColor: "#16a34a",
                        width: 18,
                        height: 18,
                        marginTop: 2,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      I confirm that I have read and agree to the <strong>International Shipping, Returns, Product Disclosure, Customisation and Payment Verification Policies</strong>.
                    </span>
                  </label>
                </div>

                {/* Dynamic Submit Status & Action CTA */}
                {(() => {
                  const isAmountValid = parseFloat(evidenceData.amountSent) > 0;
                  const isSenderValid = Boolean(evidenceData.senderName.trim());
                  const isRefValid = Boolean(evidenceData.transferReference.trim());
                  const isReceiptValid = Boolean(receiptFile) && (receiptFile?.size ?? 0) <= MAX_RECEIPT_FILE_SIZE_BYTES;
                  const isMethodValid = Boolean(selectedPaymentMethod);
                  const canSubmit =
                    isMethodValid &&
                    isSenderValid &&
                    isRefValid &&
                    isAmountValid &&
                    isReceiptValid &&
                    paymentConfirmed &&
                    policiesAccepted &&
                    !isSubmitting;

                  return (
                    <>
                      {!canSubmit && (
                        <div
                          style={{
                            marginBottom: 14,
                            padding: "10px 12px",
                            borderRadius: 8,
                            fontSize: ".8rem",
                            background: "#fefce8",
                            border: "1px solid #fde047",
                            color: "#854d0e",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            wordBreak: "break-word",
                          }}
                        >
                          <Info size={16} color="#ca8a04" style={{ flexShrink: 0 }} />
                          <span>
                            {!isMethodValid
                              ? "Please select a payment method above."
                              : !isSenderValid
                              ? "Please enter the sender's full name."
                              : !isRefValid
                              ? "Please enter the transfer reference number."
                              : !isAmountValid
                              ? "Please enter the amount paid (greater than 0)."
                              : !isReceiptValid
                              ? "Please attach your payment receipt (max 5 MB)."
                              : !paymentConfirmed
                              ? "Please check the box confirming payment was sent to the official UBL details."
                              : !policiesAccepted
                              ? "Please accept the commercial & policy agreement."
                              : "Complete the required fields to submit for verification."}
                          </span>
                        </div>
                      )}

                      {errorMessage && (
                        <div
                          className="checkout-error"
                          role="alert"
                          style={{
                            marginBottom: 14,
                            padding: "12px 14px",
                            background: "#fef2f2",
                            border: "1px solid #f87171",
                            borderRadius: 8,
                            color: "#b91c1c",
                            fontSize: ".84rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            wordBreak: "break-word",
                          }}
                        >
                          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSubmitManualOrder()}
                        disabled={!canSubmit}
                        aria-disabled={!canSubmit}
                        className="checkout-primary-cta"
                        style={{
                          width: "100%",
                          opacity: canSubmit ? 1 : 0.65,
                          cursor: canSubmit ? "pointer" : isSubmitting ? "wait" : "not-allowed",
                          background: canSubmit
                            ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                            : "#94a3b8",
                          color: "#ffffff",
                          fontWeight: 800,
                          padding: "16px 20px",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          fontSize: "1rem",
                          letterSpacing: ".02em",
                          boxShadow: canSubmit ? "0 6px 20px rgba(22, 163, 74, 0.35)" : "none",
                          transition: "all .2s ease",
                          border: "none",
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                            <span>Uploading Receipt &amp; Submitting Order…</span>
                          </>
                        ) : (
                          <>
                            {canSubmit ? <CheckCircle2 size={20} /> : <Lock size={18} />}
                            <span>Submit Payment for Verification</span>
                          </>
                        )}
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Column: Desktop Sticky Order Summary Card (≥ 1024px) */}
          <div className="checkout-desktop-summary-wrapper">
            <div className="checkout-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <ShoppingBag size={18} color="#b45309" />
                  <span>Order Summary</span>
                </h3>
                <span style={{ fontSize: ".76rem", color: "#64748b", fontWeight: 600 }}>
                  {totalItemCount} item{totalItemCount !== 1 ? "s" : ""}
                </span>
              </div>

              {renderOrderSummaryContent(false)}
            </div>
          </div>
        </div>
      </div>

      {/* Policy Agreement Modal */}
      <PolicyAgreementModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onAccept={() => setPoliciesAccepted(true)}
        isAccepted={policiesAccepted}
      />
    </main>
  );
}

function lineQuantity(qty: number) {
  return typeof qty === "number" && qty > 0 ? qty : 1;
}
