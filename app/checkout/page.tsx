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
  UploadCloud,
  FileText,
  AlertTriangle,
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
  PAYMENT_SECURITY_WARNING,
  UBL_CARD_GATEWAY_ENABLED,
  MAX_RECEIPT_FILE_SIZE_BYTES,
  ALLOWED_RECEIPT_EXTENSIONS,
} from "@/src/lib/payment-config";

type Step = 1 | 2 | 3 | 4 | 5;

const countries = Object.keys(SHIPPING_DESTINATIONS);

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, formatPrice, currency, setCurrency, currencies } = useStore();

  const [step, setStep] = useState<Step>(1);

  // Step 1: Contact & Delivery Form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: currency === "PKR" ? "Pakistan" : currency === "USD" ? "United States" : currency === "AUD" ? "Australia" : "United Kingdom",
    deliveryInstructions: "",
  });

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"ubl_manual" | "cod">("ubl_manual");
  const [depositPercent, setDepositPercent] = useState<number>(100);

  // Generate provisional reference for transfer description
  const [provisionalRef] = useState(
    () => `SCK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );

  // Step 5: Payment Evidence Form
  const [evidenceData, setEvidenceData] = useState({
    senderName: "",
    senderCountry: "",
    provider: "Taptap Send",
    amountSent: "",
    currencySent: "GBP",
    transferDate: new Date().toISOString().split("T")[0],
    transferReference: "",
    customerNote: "",
    confirmedAccurate: true,
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const lines = cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((t, i) => t + i.product.price * i.quantity, 0);
  const totalItemCount = lines.reduce((t, i) => t + i.quantity, 0);
  const shippingCalc = calculateShippingFee(formData.country, totalItemCount);
  const grandTotal = subtotal + shippingCalc.shippingFee;
  const depositDueNow =
    depositPercent === 100
      ? grandTotal
      : Math.round(grandTotal * (depositPercent / 100) * 100) / 100;
  const balanceRemaining = Math.max(0, Math.round((grandTotal - depositDueNow) * 100) / 100);

  // Auto-sync sender defaults when navigating to Step 5 or updating amounts
  useEffect(() => {
    setEvidenceData((prev) => ({
      ...prev,
      senderName: prev.senderName || formData.fullName,
      senderCountry: prev.senderCountry || formData.country,
      currencySent: prev.currencySent || currency || "GBP",
      amountSent: prev.amountSent || String(depositDueNow),
      transferReference: prev.transferReference || provisionalRef,
    }));
  }, [formData, currency, depositDueNow, provisionalRef]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Handle Receipt File Selection & Preview
  const handleFileSelected = (file: File) => {
    setErrorMessage(null);

    if (file.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
      setErrorMessage(`Receipt exceeds the 8 MB limit. Please select a smaller image or document.`);
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

  // Submit manual order with mandatory payment evidence
  const handleSubmitManualOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (lines.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your Full Name.");
      setStep(1);
      return;
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setErrorMessage("Please enter your WhatsApp / Phone number or Email.");
      setStep(1);
      return;
    }

    if (!receiptFile) {
      setErrorMessage("Please upload your payment receipt screenshot or document before submitting your order.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append("customerName", formData.fullName.trim());
      submitFormData.append("customerEmail", formData.email.trim());
      submitFormData.append("customerPhone", formData.phone.trim());
      submitFormData.append("address", formData.address.trim());
      submitFormData.append("city", formData.city.trim());
      submitFormData.append("state", formData.state.trim());
      submitFormData.append("postalCode", formData.postalCode.trim());
      submitFormData.append("country", formData.country);
      submitFormData.append("deliveryInstructions", formData.deliveryInstructions.trim());
      submitFormData.append("depositPercent", String(depositPercent));

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
      submitFormData.append("senderName", (evidenceData.senderName || formData.fullName).trim());
      submitFormData.append("senderCountry", (evidenceData.senderCountry || formData.country).trim());
      submitFormData.append("provider", evidenceData.provider || "Bank Transfer");
      submitFormData.append("amountSent", evidenceData.amountSent || String(depositDueNow));
      submitFormData.append("currencySent", evidenceData.currencySent || currency || "GBP");
      submitFormData.append("transferDate", evidenceData.transferDate || new Date().toISOString().split("T")[0]);
      submitFormData.append("transferReference", (evidenceData.transferReference || provisionalRef).trim());
      submitFormData.append("customerNote", evidenceData.customerNote.trim());
      submitFormData.append("receipt", receiptFile);

      const res = await fetch("/api/checkout/submit-manual-order", {
        method: "POST",
        body: submitFormData,
      });

      const data = await res.json();

      if (data.success && data.orderId) {
        clearCart();
        router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderId)}`);
      } else {
        setErrorMessage(
          data.error || "Failed to submit order. Please check your uploaded receipt and try again."
        );
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMessage("Network error occurred during order submission. Please try again.");
      setIsSubmitting(false);
    }
  };

  // WhatsApp fallback message
  const whatsappEnquiryMessage = `Hello Sialkot Cricket Kits,\n\nI would like to order:\n${lines
    .map((l, i) => `${i + 1}. ${l.product.name} (x${l.quantity}) — ${formatPrice(l.product.price)}`)
    .join("\n")}\n\nTotal: ${formatPrice(grandTotal)}\nDelivery to: ${formData.country}\nOrder Ref: ${provisionalRef}\nName: ${formData.fullName}\nPhone: ${formData.phone}\n\nPlease guide me with payment verification.`;

  // Guard: Empty cart prevents checkout
  if (lines.length === 0) {
    return (
      <main style={{ background: "var(--surface-alt)", minHeight: "100vh", paddingBottom: 80, color: "var(--text-primary)" }}>
        <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: ".85rem clamp(1rem, 4vw, 4rem)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: ".6rem", textDecoration: "none" }}>
              <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="Sialkot Cricket Kits" style={{ width: 38, height: 38, objectFit: "contain" }} />
              <strong style={{ fontSize: ".82rem", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--text-primary)" }}>
                Sialkot Cricket Kits
              </strong>
            </Link>
          </div>
        </header>

        <div style={{ maxWidth: 580, margin: "70px auto", padding: "40px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(242, 169, 40, 0.12)", color: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <ShoppingBag size={36} />
          </div>
          <h1 style={{ fontSize: "1.6rem", color: "#fff", margin: "0 0 10px", fontWeight: 800 }}>
            Your Cart is Empty
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: ".92rem", lineHeight: 1.6, marginBottom: 28 }}>
            You cannot proceed to checkout without selecting items. Please select equipment from our catalogue first.
          </p>
          <Link
            href="/shop"
            className="checkout-primary-cta"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", textDecoration: "none", fontSize: ".95rem" }}
          >
            <ShoppingBag size={18} /> Browse Equipment Catalogue
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--surface-alt)", minHeight: "100vh", paddingBottom: 80, color: "var(--text-primary)" }}>
      {/* Slim Header */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: ".85rem clamp(1rem, 4vw, 4rem)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: ".6rem", textDecoration: "none" }}>
            <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="Sialkot Cricket Kits" style={{ width: 38, height: 38, objectFit: "contain" }} />
            <strong style={{ fontSize: ".82rem", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--text-primary)" }}>
              Sialkot Cricket Kits
            </strong>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".76rem", color: "var(--text-muted)" }}>
              <Lock size={14} color="#22c55e" />
              <span>Secure Manual Transfer Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps Header */}
      <div style={{ maxWidth: 1100, margin: "24px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: 30 }}>
          {[
            { s: 1, label: "Contact & Delivery" },
            { s: 2, label: "Review Order" },
            { s: 3, label: "Payment Method" },
            { s: 4, label: "Transfer Details" },
            { s: 5, label: "Upload Evidence" },
          ].map(({ s, label }) => {
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => { if (isCompleted) setStep(s as Step); }}
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
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".82rem",
                    fontWeight: 700,
                    background: isCompleted ? "#22c55e" : isActive ? "var(--primary)" : "#1e293b",
                    color: isCompleted || isActive ? "#000" : "#94a3b8",
                    transition: "all .2s ease",
                  }}
                >
                  {isCompleted ? <Check size={16} color="#000" /> : s}
                </div>
                <span style={{ fontSize: ".72rem", fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "var(--text-muted)", textAlign: "center" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 28, alignItems: "start" }}>
          {/* Left Column: Multi-Step Flow */}
          <div>
            {/* ── STEP 1: CONTACT & DELIVERY ── */}
            {step === 1 && (
              <div className="checkout-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
                <h2 style={{ fontSize: "1.2rem", margin: "0 0 4px", fontWeight: 700 }}>Step 1 — Contact &amp; Delivery Details</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: ".84rem", margin: "0 0 20px" }}>
                  Please enter your delivery destination and contact number for tracked dispatch updates.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="checkout-field-label">Full Name *</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="e.g. Imran Khan"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">WhatsApp / Phone * (with country code)</label>
                    <input
                      className="checkout-input"
                      type="tel"
                      placeholder="+44 7700 900123 / +92 300 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">Email Address (for official receipt)</label>
                    <input
                      className="checkout-input"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="checkout-field-label">Destination Country *</label>
                    <select
                      className="checkout-select"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {getCountryFlag(c)} {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="checkout-field-label">Street Address</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="House/Apartment number, street, landmark"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">City</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="e.g. London / Lahore"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">State / Region / County</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="e.g. Greater London / Punjab"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">Postal / ZIP Code</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="e.g. SW1A 1AA / 51310"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">Delivery Notes (Optional)</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="Leave with neighbor, ring buzzer, etc."
                      value={formData.deliveryInstructions}
                      onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-primary-cta"
                  style={{ marginTop: 24, width: "100%" }}
                  onClick={() => {
                    if (!formData.fullName.trim()) {
                      setErrorMessage("Please enter your Full Name before proceeding.");
                      return;
                    }
                    if (!formData.phone.trim() && !formData.email.trim()) {
                      setErrorMessage("Please enter a WhatsApp/Phone number or Email.");
                      return;
                    }
                    setErrorMessage(null);
                    setStep(2);
                  }}
                >
                  Proceed to Review Order <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ── STEP 2: REVIEW ORDER ── */}
            {step === 2 && (
              <div className="checkout-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
                <button className="checkout-back-btn" type="button" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Back to Contact Details
                </button>

                <h2 style={{ fontSize: "1.2rem", margin: "12px 0 4px", fontWeight: 700 }}>Step 2 — Review Your Order</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: ".84rem", margin: "0 0 16px" }}>
                  Verify your items and delivery destination before continuing to payment details.
                </p>

                <div style={{ background: "rgba(242, 169, 40, 0.08)", border: "1px solid rgba(242, 169, 40, 0.25)", padding: "10px 14px", borderRadius: 8, fontSize: ".82rem", color: "#f2a928", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Info size={16} />
                  <span>Provisional Order Reference: <strong>{provisionalRef}</strong></span>
                </div>

                {/* Items List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {lines.map((line) => (
                    <div
                      key={line.product.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                      }}
                    >
                      <img
                        src={line.product.image}
                        alt={line.product.name}
                        style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, background: "#09101d" }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: ".88rem", display: "block", color: "#fff" }}>{line.product.name}</strong>
                        <span style={{ fontSize: ".76rem", color: "var(--text-muted)" }}>Category: {line.product.category} · Qty: {line.quantity}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ color: "var(--primary)", fontSize: ".92rem" }}>
                          {formatPrice(line.product.price * line.quantity)}
                        </strong>
                        <small style={{ display: "block", color: "var(--text-muted)", fontSize: ".72rem" }}>
                          {formatPrice(line.product.price)} each
                        </small>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div style={{ background: "rgba(0,0,0,0.25)", padding: 16, borderRadius: 10, marginBottom: 20 }}>
                  <div className="order-summary-line"><span>Subtotal ({totalItemCount} items)</span><strong>{formatPrice(subtotal)}</strong></div>
                  <div className="order-summary-line"><span>Tracked Courier ({formData.country})</span><strong>{formatPrice(shippingCalc.shippingFee)}</strong></div>
                  <div className="order-summary-divider" />
                  <div className="order-total-line"><span className="label">Total Order Value</span><span className="value">{formatPrice(grandTotal)}</span></div>
                </div>

                <button
                  type="button"
                  className="checkout-primary-cta"
                  style={{ width: "100%" }}
                  onClick={() => setStep(3)}
                >
                  Select Payment Method <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ── STEP 3: SELECT PAYMENT METHOD ── */}
            {step === 3 && (
              <div className="checkout-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
                <button className="checkout-back-btn" type="button" onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Back to Order Review
                </button>

                <h2 style={{ fontSize: "1.2rem", margin: "12px 0 4px", fontWeight: 700 }}>Step 3 — Select Payment Method</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: ".84rem", margin: "0 0 16px" }}>
                  Choose manual bank wire or remittance. Card payments are currently handled via bank transfer until the official UBL card gateway is enabled.
                </p>

                {/* Advance Deposit Option */}
                <div style={{ marginBottom: 20 }}>
                  <label className="checkout-field-label">Payment Option</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setDepositPercent(100)}
                      className={`payment-method-option${depositPercent === 100 ? " selected" : ""}`}
                    >
                      <span className="payment-method-label">100% Full Payment</span>
                      <small style={{ color: "var(--text-muted)", fontSize: ".74rem", display: "block" }}>Pay full amount upfront ({formatPrice(grandTotal)})</small>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositPercent(50)}
                      className={`payment-method-option${depositPercent === 50 ? " selected" : ""}`}
                    >
                      <span className="payment-method-label">50% Advance Deposit</span>
                      <small style={{ color: "var(--text-muted)", fontSize: ".74rem", display: "block" }}>Pay {formatPrice(Math.round(grandTotal * 0.5 * 100) / 100)} now, balance before dispatch</small>
                    </button>
                  </div>
                </div>

                {/* Primary Payment Option Card */}
                <div
                  style={{
                    border: "2px solid var(--primary)",
                    background: "rgba(242, 169, 40, 0.05)",
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Building2 size={20} color="var(--primary)" />
                    <strong style={{ fontSize: "1rem", color: "#fff" }}>
                      Bank Transfer / International Money Transfer
                    </strong>
                    <span className="deposit-option-badge" style={{ background: "rgba(34, 197, 94, 0.2)", color: "#4ade80", marginLeft: "auto" }}>
                      Recommended
                    </span>
                  </div>
                  <p style={{ fontSize: ".84rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    Transfer the final order amount using our verified UBL bank details. After completing your transfer via mobile banking, Taptap Send, Remitly, Wise, or exchange, upload your receipt screenshot on the next step.
                  </p>
                </div>

                {/* Domestic COD Notice if applicable */}
                {formData.country === "Pakistan" && (
                  <div style={{ padding: 14, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 16, fontSize: ".82rem", color: "var(--text-secondary)" }}>
                    💡 <em>For domestic Pakistan deliveries requiring partial advance verification, our team will coordinate on WhatsApp.</em>
                  </div>
                )}

                <button
                  type="button"
                  className="checkout-primary-cta"
                  style={{ width: "100%", marginTop: 8 }}
                  onClick={() => setStep(4)}
                >
                  View UBL Bank Transfer Instructions <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ── STEP 4: PAYMENT INSTRUCTIONS ── */}
            {step === 4 && (
              <div className="checkout-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
                <button className="checkout-back-btn" type="button" onClick={() => setStep(3)}>
                  <ChevronLeft size={16} /> Back to Payment Method
                </button>

                <h2 style={{ fontSize: "1.2rem", margin: "12px 0 4px", fontWeight: 700 }}>Step 4 — UBL Beneficiary &amp; Transfer Instructions</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: ".84rem", margin: "0 0 16px" }}>
                  Please complete your transfer to the official UBL account below. Enter your order reference in the payment description.
                </p>

                {/* Total Due Banner */}
                <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1.5px solid rgba(34, 197, 94, 0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <span style={{ fontSize: ".75rem", textTransform: "uppercase", color: "#94a3b8", display: "block" }}>
                      Amount Due ({depositPercent}% {depositPercent < 100 ? "Deposit" : "Full"})
                    </span>
                    <strong style={{ fontSize: "1.4rem", color: "#4ade80" }}>{formatPrice(depositDueNow)}</strong>
                    {balanceRemaining > 0 && (
                      <small style={{ display: "block", color: "var(--text-muted)", fontSize: ".76rem" }}>
                        Remaining balance ({formatPrice(balanceRemaining)}) due before dispatch.
                      </small>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: ".72rem", textTransform: "uppercase", color: "#94a3b8", display: "block" }}>
                      Your Transfer Reference
                    </span>
                    <strong style={{ color: "var(--primary)", fontSize: "1rem", fontFamily: "monospace" }}>{provisionalRef}</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(provisionalRef, "Order Ref")}
                      style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: ".74rem", display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", marginTop: 2 }}
                    >
                      {copiedKey === "Order Ref" ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === "Order Ref" ? "Ref copied!" : "Copy Ref"}</span>
                    </button>
                  </div>
                </div>

                {/* Official Disclosure Notice */}
                <div style={{ background: "rgba(242, 169, 40, 0.08)", border: "1px solid rgba(242, 169, 40, 0.3)", borderRadius: 10, padding: 12, marginBottom: 18, fontSize: ".82rem", color: "#f2a928", lineHeight: 1.5 }}>
                  <AlertTriangle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  <strong>Important Beneficiary Notice:</strong> {UBL_PAYMENT_CONFIG.beneficiaryNotice}
                </div>

                {/* Centralized UBL Details Box */}
                <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: ".92rem", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                    <Building2 size={16} color="var(--primary)" />
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
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        fontSize: ".84rem",
                      }}
                    >
                      <span style={{ color: "var(--text-secondary)", fontSize: ".8rem" }}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ color: "#fff", fontFamily: label === "IBAN" || label === "Account Number" || label === "SWIFT / BIC" ? "monospace" : "inherit" }}>
                          {val}
                        </strong>
                        <button
                          type="button"
                          className="payment-info-copy"
                          onClick={() => copyToClipboard(val, label)}
                          aria-label={`Copy ${label}`}
                        >
                          {copiedKey === label ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transfer Channels Box */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: ".85rem", color: "#fff", margin: "0 0 6px" }}>Supported Transfer Providers</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {TRANSFER_CHANNELS.map((ch) => (
                      <span
                        key={ch.id}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border)",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: ".75rem",
                          color: "#cbd5e1",
                        }}
                      >
                        {ch.name}
                      </span>
                    ))}
                  </div>
                  <small style={{ color: "var(--text-muted)", fontSize: ".74rem", display: "block", lineHeight: 1.4 }}>
                    {TRANSFER_CHANNELS_NOTICE}
                  </small>
                </div>

                {/* Security Warning */}
                <div style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 10, padding: 12, marginBottom: 24, fontSize: ".8rem", color: "#38bdf8", lineHeight: 1.4 }}>
                  <ShieldCheck size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  {PAYMENT_SECURITY_WARNING}
                </div>

                <button
                  type="button"
                  className="checkout-primary-cta"
                  style={{ width: "100%" }}
                  onClick={() => setStep(5)}
                >
                  I Have Transferred — Upload Payment Evidence <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ── STEP 5: SUBMIT PAYMENT EVIDENCE ── */}
            {step === 5 && (
              <div className="checkout-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
                <button className="checkout-back-btn" type="button" onClick={() => setStep(4)}>
                  <ChevronLeft size={16} /> Back to Transfer Details
                </button>

                <h2 style={{ fontSize: "1.2rem", margin: "12px 0 4px", fontWeight: 700 }}>Step 5 — Submit Payment Evidence</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: ".84rem", margin: "0 0 20px" }}>
                  Attach your official receipt or screenshot. Uploading evidence will submit your order for <strong>Payment Under Verification</strong> status.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label className="checkout-field-label">Sender’s Full Name</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="Name on bank/remittance account"
                      value={evidenceData.senderName}
                      onChange={(e) => setEvidenceData({ ...evidenceData, senderName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">Country Payment Sent From</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder="e.g. United Kingdom, USA, UAE"
                      value={evidenceData.senderCountry}
                      onChange={(e) => setEvidenceData({ ...evidenceData, senderCountry: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">Transfer Provider / Method</label>
                    <select
                      className="checkout-select"
                      value={evidenceData.provider}
                      onChange={(e) => setEvidenceData({ ...evidenceData, provider: e.target.value })}
                    >
                      {TRANSFER_CHANNELS.map((ch) => (
                        <option key={ch.id} value={ch.name}>
                          {ch.name} ({ch.popularIn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="checkout-field-label">Transfer / Reference Number</label>
                    <input
                      className="checkout-input"
                      type="text"
                      placeholder={provisionalRef}
                      value={evidenceData.transferReference}
                      onChange={(e) => setEvidenceData({ ...evidenceData, transferReference: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">Amount Sent</label>
                    <input
                      className="checkout-input"
                      type="number"
                      step="any"
                      placeholder={String(depositDueNow)}
                      value={evidenceData.amountSent}
                      onChange={(e) => setEvidenceData({ ...evidenceData, amountSent: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="checkout-field-label">Currency Sent</label>
                    <select
                      className="checkout-select"
                      value={evidenceData.currencySent}
                      onChange={(e) => setEvidenceData({ ...evidenceData, currencySent: e.target.value })}
                    >
                      {Object.values(currencies).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="checkout-field-label">Transfer Date</label>
                    <input
                      className="checkout-input"
                      type="date"
                      value={evidenceData.transferDate}
                      onChange={(e) => setEvidenceData({ ...evidenceData, transferDate: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="checkout-field-label">Customer Note / Special Specifications (Optional)</label>
                    <textarea
                      className="checkout-input"
                      rows={2}
                      placeholder="Bat weight preference, grain request, handle shape..."
                      value={evidenceData.customerNote}
                      onChange={(e) => setEvidenceData({ ...evidenceData, customerNote: e.target.value })}
                    />
                  </div>
                </div>

                {/* ── File Upload Box ── */}
                <div style={{ marginBottom: 20 }}>
                  <label className="checkout-field-label">Payment Receipt / Screenshot Proof (Max 8 MB)</label>

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
                        border: isDragOver ? "2px dashed var(--primary)" : "2px dashed #334155",
                        background: isDragOver ? "rgba(242,169,40,0.08)" : "rgba(255,255,255,0.02)",
                        borderRadius: 12,
                        padding: "24px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all .2s ease",
                      }}
                    >
                      <UploadCloud size={36} color="var(--primary)" style={{ margin: "0 auto 8px", display: "block" }} />
                      <strong style={{ fontSize: ".9rem", color: "#fff", display: "block" }}>
                        Click to select or drag &amp; drop your receipt screenshot
                      </strong>
                      <span style={{ fontSize: ".76rem", color: "var(--text-muted)", display: "block", marginTop: 4 }}>
                        Supports JPG, PNG, WEBP images or PDF document (up to 8 MB)
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "rgba(34, 197, 94, 0.06)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: 12,
                        padding: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      {receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Receipt Preview"
                          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
                        />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FileText size={24} color="#38bdf8" />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: ".86rem", color: "#fff", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {receiptFile.name}
                        </strong>
                        <small style={{ color: "#4ade80", fontSize: ".75rem" }}>
                          {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB · Attached &amp; ready
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={removeFile}
                        style={{ background: "rgba(239,68,68,0.15)", border: "none", color: "#f87171", padding: 6, borderRadius: 6, cursor: "pointer" }}
                        title="Remove receipt"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="checkout-error" role="alert" style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", borderRadius: 8, color: "#f87171", fontSize: ".84rem" }}>
                    {errorMessage}
                  </div>
                )}

                {/* Mandatory Payment Receipt Submit Button */}
                <button
                  type="button"
                  onClick={() => handleSubmitManualOrder()}
                  className="checkout-primary-cta"
                  style={{
                    width: "100%",
                    opacity: !receiptFile || isSubmitting ? 0.7 : 1,
                    cursor: !receiptFile ? "not-allowed" : isSubmitting ? "wait" : "pointer",
                    background: !receiptFile
                      ? "rgba(255, 255, 255, 0.08)"
                      : "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
                    color: !receiptFile ? "var(--text-muted)" : "#000",
                    border: !receiptFile ? "1px solid var(--border)" : "none",
                    fontWeight: 800,
                    padding: "14px 20px",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: ".92rem",
                    transition: "all .2s ease",
                  }}
                  disabled={!receiptFile || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      Uploading Receipt &amp; Submitting Order…
                    </>
                  ) : !receiptFile ? (
                    <>
                      <Lock size={16} />
                      Upload Payment Receipt to Continue
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Submit Order for Verification
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Card */}
          <div>
            <div className="checkout-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, position: "sticky", top: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: ".98rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  <ShoppingBag size={18} color="var(--primary)" />
                  <span>Order Summary</span>
                </h3>
                <span style={{ fontSize: ".76rem", color: "var(--text-muted)" }}>{totalItemCount} item{totalItemCount !== 1 ? "s" : ""}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
                {lines.map((l) => (
                  <div key={l.product.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".82rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={l.product.image} alt={l.product.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
                      <div>
                        <span style={{ color: "#fff", display: "block", fontWeight: 500 }}>{l.product.name}</span>
                        <small style={{ color: "var(--text-muted)" }}>Qty: {l.quantity}</small>
                      </div>
                    </div>
                    <strong>{formatPrice(l.product.price * lineQuantity(l.quantity))}</strong>
                  </div>
                ))}
              </div>

              <div className="order-summary-divider" style={{ margin: "10px 0" }} />

              <div className="order-summary-line" style={{ fontSize: ".82rem" }}><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <div className="order-summary-line" style={{ fontSize: ".82rem" }}><span>Delivery ({formData.country})</span><strong>{formatPrice(shippingCalc.shippingFee)}</strong></div>
              <div className="order-summary-divider" style={{ margin: "10px 0" }} />
              <div className="order-total-line" style={{ fontSize: "1.05rem" }}><span className="label">Order Total</span><span className="value">{formatPrice(grandTotal)}</span></div>

              {depositPercent < 100 && (
                <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(34, 197, 94, 0.08)", borderRadius: 8, border: "1px solid rgba(34, 197, 94, 0.2)", fontSize: ".8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#4ade80", fontWeight: 700 }}>
                    <span>Advance Deposit Due Now ({depositPercent}%):</span>
                    <span>{formatPrice(depositDueNow)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: ".74rem", marginTop: 2 }}>
                    <span>Balance Before Dispatch:</span>
                    <span>{formatPrice(balanceRemaining)}</span>
                  </div>
                </div>
              )}

              {/* Trust Box */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8, fontSize: ".76rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck size={14} color="#22c55e" />
                  <span>Beneficiary: ALYAN WAZIR (UBL Bank)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Truck size={14} color="var(--primary)" />
                  <span>Tracked Courier: {shippingCalc.destination.estimatedDelivery}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Building2 size={14} color="#38bdf8" />
                  <span>Factory Direct from Sialkot, Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function lineQuantity(qty: number) {
  return typeof qty === "number" && qty > 0 ? qty : 1;
}
