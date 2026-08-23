"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Building2,
  Send,
  Wallet,
  Globe,
  ShieldCheck,
  Check,
  Copy,
  Lock,
  ArrowRight,
  ShoppingBag,
  Loader2,
  Sparkles,
  Package,
  Truck,
  CheckCircle2,
  Percent,
  Sliders,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { formatPrice, products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { calculateShippingFee, SHIPPING_DESTINATIONS, getCountryFlag } from "@/src/lib/shipping";

type PaymentMethodType =
  | "card"
  | "bank"
  | "payoneer"
  | "wise"
  | "pakistan"
  | "remitly";

const countries = [
  "United Kingdom",
  "Pakistan",
  "United States",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Saudi Arabia",
  "New Zealand",
  "South Africa",
  "Ireland",
  "Germany",
  "Netherlands",
  "Singapore",
  "Qatar",
  "Oman",
  "Bahrain",
  "Kuwait",
  "Other International",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useStore();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United Kingdom",
    paymentMethod: "card" as PaymentMethodType,
    transactionRef: "",
    notes: "",
  });

  const [depositPercent, setDepositPercent] = useState<number>(50);
  const [showCustomDeposit, setShowCustomDeposit] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lines = cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const totalItemCount = lines.reduce((total, item) => total + item.quantity, 0);
  const shippingCalculation = calculateShippingFee(formData.country, totalItemCount);
  const grandTotal = subtotal + shippingCalculation.shippingFee;
  const depositDueNow = Math.round((grandTotal * (depositPercent / 100)) * 100) / 100;
  const balanceRemaining = Math.round((grandTotal - depositDueNow) * 100) / 100;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethodTitle = (method: PaymentMethodType) => {
    switch (method) {
      case "card": return "Credit / Debit Card (Stripe)";
      case "bank": return "UBL Direct Bank Wire (IBAN / SWIFT)";
      case "payoneer": return "Payoneer (B2B & Global Receiving)";
      case "wise": return "Wise International Transfer";
      case "pakistan": return "Pakistan Local (JazzCash / Nayapay / SadaPay / Raast / EasyPaisa)";
      case "remitly": return "Remitly / Western Union / MoneyGram";
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setErrorMessage("Your cart is empty. Please add products to checkout.");
      return;
    }
    if (!formData.fullName || !formData.phone) {
      setErrorMessage("Please enter your full name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. If Card payment selected, trigger Stripe Checkout session
      if (formData.paymentMethod === "card") {
        const stripeRes = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: lines.map((l) => ({
              id: l.product.id,
              name: l.product.name,
              category: l.product.category,
              price: l.product.price,
              quantity: l.quantity,
              image: l.product.image,
            })),
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            country: formData.country,
            shippingFee: shippingCalculation.shippingFee,
            totalAmount: grandTotal,
            depositPercent: depositPercent,
            depositDueNow: depositDueNow,
            balanceRemaining: balanceRemaining,
            notes: formData.notes,
          }),
        });

        const stripeData = await stripeRes.json();

        if (stripeData.success && stripeData.url) {
          clearCart();
          window.location.href = stripeData.url;
          return;
        }

        // If Stripe keys are not configured yet, save as pending direct order
      }

      // 2. Direct On-Site Order Creation
      const orderRes = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          items: lines.map((l) => ({
            id: l.product.id,
            name: l.product.name,
            category: l.product.category,
            price: l.product.price,
            quantity: l.quantity,
          })),
          subtotal: subtotal,
          shippingFee: shippingCalculation.shippingFee,
          totalAmount: grandTotal,
          depositPercentage: depositPercent,
          amountPaidNow: depositDueNow,
          balanceRemaining: balanceRemaining,
          paymentMethod: getMethodTitle(formData.paymentMethod),
          transactionRef: formData.transactionRef,
          notes: formData.notes,
        }),
      });

      const orderData = await orderRes.json();

      if (orderData.success && orderData.orderId) {
        clearCart();
        router.push(`/checkout/success?orderId=${encodeURIComponent(orderData.orderId)}`);
      } else {
        setErrorMessage(orderData.error || "Failed to process your order. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage("Network error while submitting order. Please check your connection or contact us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <main className="checkout-empty-page" style={{ maxWidth: 800, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ background: "#141922", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: "48px 24px" }}>
          <ShoppingBag size={56} style={{ color: "#f2a928", marginBottom: 16 }} />
          <h1 style={{ fontSize: "1.8rem", color: "#fff", marginBottom: 8 }}>Your Shopping Cart is Empty</h1>
          <p style={{ color: "#94a3b8", maxWidth: 440, margin: "0 auto 24px" }}>
            Add match-grade cricket bats, protective gear, or accessories from our catalogue to proceed with direct checkout.
          </p>
          <Link href="/shop" className="button primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #f2a928 0%, #d97706 100%)", color: "#000", fontWeight: 700 }}>
            Browse Store Catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0c1017", color: "#ffffff", paddingBottom: 60 }}>
      {/* Checkout Header Hero */}
      <section style={{ background: "linear-gradient(180deg, #141922 0%, #0c1017 100%)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", padding: "40px 24px 30px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <span style={{ color: "#f2a928", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
            🛡️ Certified Factory Direct Checkout
          </span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: "0 0 10px", color: "#ffffff", letterSpacing: "-0.02em" }}>
            Secure Order Confirmation
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: 0 }}>
            Handcrafted Sialkot match equipment with live video inspection &amp; express DHL/FedEx courier tracking worldwide.
          </p>

          {/* 4-Step Progress Ribbon */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(242, 169, 40, 0.15)", border: "1px solid rgba(242, 169, 40, 0.35)", padding: "6px 12px", borderRadius: 999, fontSize: "0.78rem", color: "#f2a928", fontWeight: 600 }}>
              <span>1. Delivery &amp; Contact</span>
            </div>
            <span style={{ color: "#475569" }}>→</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(242, 169, 40, 0.15)", border: "1px solid rgba(242, 169, 40, 0.35)", padding: "6px 12px", borderRadius: 999, fontSize: "0.78rem", color: "#f2a928", fontWeight: 600 }}>
              <span>2. Confirmation Plan (35% / 50% / Full)</span>
            </div>
            <span style={{ color: "#475569" }}>→</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "6px 12px", borderRadius: 999, fontSize: "0.78rem", color: "#cbd5e1" }}>
              <span>3. Payment Channel</span>
            </div>
            <span style={{ color: "#475569" }}>→</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "6px 12px", borderRadius: 999, fontSize: "0.78rem", color: "#cbd5e1" }}>
              <span>4. Live Ping Demo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Checkout Container */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 20px" }}>
        <form onSubmit={handleSubmitOrder} style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 28, alignItems: "start" }}>
          
          {/* Left Column: Form Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* 1. Contact & Delivery Destination Card */}
            <div style={{ background: "#141922", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: 12 }}>
                <h2 style={{ fontSize: "1.15rem", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#f2a928", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>1</span>
                  <span>Contact &amp; Delivery Destination</span>
                </h2>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Step 1 of 3</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. James Anderson"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                    Email Address * (For Invoice)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                  Phone / WhatsApp Number * (For Courier Live Tracking &amp; Ping Video Demo)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +44 7123 456789 or +92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              {/* Destination Country with Flag and Combined Shipping Rate */}
              <div style={{ marginBottom: 14, background: "rgba(255, 255, 255, 0.03)", padding: 14, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ color: "#ffffff", fontSize: "0.84rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <Truck size={16} color="#f2a928" /> Destination Country (Combined Shipping) *
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 600 }}>
                    ⚡ {shippingCalculation.destination.estimatedDelivery}
                  </span>
                </div>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1.5px solid #2d3748", color: "#fff", fontSize: "0.92rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {countries.map((c) => {
                    const flag = getCountryFlag(c);
                    const dest = SHIPPING_DESTINATIONS[c];
                    return (
                      <option key={c} value={c}>
                        {flag} {c} {dest ? `— ${formatPrice(dest.baseGbp)} base (+${formatPrice(dest.additionalItemGbp)}/extra bat)` : ""}
                      </option>
                    );
                  })}
                </select>

                <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#94a3b8" }}>
                  <span>📦 Tracked Express Courier:</span>
                  <strong style={{ color: "#f2a928", fontSize: "0.9rem" }}>{formatPrice(shippingCalculation.shippingFee)}</strong>
                </div>

                {shippingCalculation.totalSaved > 0 ? (
                  <div style={{ marginTop: 8, background: "rgba(34, 197, 94, 0.14)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "6px 10px", borderRadius: 6, fontSize: "0.76rem", color: "#4ade80", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🎉 <strong>Combined Shipping Active:</strong> {totalItemCount} items packed in one parcel</span>
                    <strong style={{ background: "#22c55e", color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>Save {formatPrice(shippingCalculation.totalSaved)}!</strong>
                  </div>
                ) : (
                  <div style={{ marginTop: 6, fontSize: "0.74rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                    <span>💡 Extra bats ship for only +{formatPrice(shippingCalculation.destination.additionalItemGbp)} each in combined parcel</span>
                  </div>
                )}
              </div>

              {/* Address Fields */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                  Street Address / House No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 42 High Street, Flat 2B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="London / Lahore"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                    State / County
                  </label>
                  <input
                    type="text"
                    placeholder="Greater London"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    placeholder="SW1A 1AA"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Order Confirmation & Flexible Deposit Plan Card */}
            <div style={{ background: "#141922", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: 12 }}>
                <h2 style={{ fontSize: "1.15rem", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#f2a928", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>2</span>
                  <span>Order Confirmation &amp; Deposit Plan</span>
                </h2>
                <span style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#4ade80", padding: "3px 8px", borderRadius: 6, fontSize: "0.74rem", fontWeight: 600 }}>
                  Flexible Confirmation
                </span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.84rem", margin: "0 0 16px", lineHeight: 1.5 }}>
                Custom willow equipment begins hand-crafting upon deposit confirmation. Choose your advance plan below. Balance is only payable upon receiving your live video inspection demo before courier pickup.
              </p>

              {/* 4 Plan Options Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                
                {/* Option 1: 50% Half Payment (Recommended) */}
                <label style={{
                  padding: "14px",
                  borderRadius: 10,
                  border: depositPercent === 50 && !showCustomDeposit ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: depositPercent === 50 && !showCustomDeposit ? "rgba(242, 169, 40, 0.14)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="depositPlan"
                    checked={depositPercent === 50 && !showCustomDeposit}
                    onChange={() => {
                      setDepositPercent(50);
                      setShowCustomDeposit(false);
                    }}
                    style={{ accentColor: "#f2a928", marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <strong style={{ color: "#fff", fontSize: "0.92rem" }}>50% Half Advance</strong>
                      <span style={{ color: "#f2a928", fontSize: "0.75rem", fontWeight: 700 }}>★ Standard</span>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#f2a928", margin: "2px 0 4px" }}>
                      Pay {formatPrice(Math.round(grandTotal * 0.5 * 100) / 100)} Today
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>
                      Balance {formatPrice(Math.round(grandTotal * 0.5 * 100) / 100)} due upon video approval before dispatch.
                    </span>
                  </div>
                </label>

                {/* Option 2: 35% Flexible Booking */}
                <label style={{
                  padding: "14px",
                  borderRadius: 10,
                  border: depositPercent === 35 && !showCustomDeposit ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: depositPercent === 35 && !showCustomDeposit ? "rgba(242, 169, 40, 0.14)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="depositPlan"
                    checked={depositPercent === 35 && !showCustomDeposit}
                    onChange={() => {
                      setDepositPercent(35);
                      setShowCustomDeposit(false);
                    }}
                    style={{ accentColor: "#f2a928", marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <strong style={{ color: "#fff", fontSize: "0.92rem" }}>35% Booking Deposit</strong>
                      <span style={{ color: "#60a5fa", fontSize: "0.75rem", fontWeight: 700 }}>Flexible</span>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#f2a928", margin: "2px 0 4px" }}>
                      Pay {formatPrice(Math.round(grandTotal * 0.35 * 100) / 100)} Today
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>
                      Balance {formatPrice(Math.round(grandTotal * 0.65 * 100) / 100)} due upon video approval before dispatch.
                    </span>
                  </div>
                </label>

                {/* Option 3: 100% Full Payment Upfront */}
                <label style={{
                  padding: "14px",
                  borderRadius: 10,
                  border: depositPercent === 100 && !showCustomDeposit ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: depositPercent === 100 && !showCustomDeposit ? "rgba(242, 169, 40, 0.14)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="depositPlan"
                    checked={depositPercent === 100 && !showCustomDeposit}
                    onChange={() => {
                      setDepositPercent(100);
                      setShowCustomDeposit(false);
                    }}
                    style={{ accentColor: "#f2a928", marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <strong style={{ color: "#fff", fontSize: "0.92rem" }}>100% Full Payment</strong>
                      <span style={{ color: "#4ade80", fontSize: "0.75rem", fontWeight: 700 }}>Full Upfront</span>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#f2a928", margin: "2px 0 4px" }}>
                      Pay {formatPrice(grandTotal)} Total
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>
                      Expedited express workshop queue and priority courier booking.
                    </span>
                  </div>
                </label>

                {/* Option 4: 30% Minimum Booking Deposit */}
                <label style={{
                  padding: "14px",
                  borderRadius: 10,
                  border: depositPercent === 30 && !showCustomDeposit ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: depositPercent === 30 && !showCustomDeposit ? "rgba(242, 169, 40, 0.14)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="depositPlan"
                    checked={depositPercent === 30 && !showCustomDeposit}
                    onChange={() => {
                      setDepositPercent(30);
                      setShowCustomDeposit(false);
                    }}
                    style={{ accentColor: "#f2a928", marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <strong style={{ color: "#fff", fontSize: "0.92rem" }}>30% Minimum Deposit</strong>
                      <span style={{ color: "#fca5a5", fontSize: "0.75rem", fontWeight: 700 }}>Lock Slot</span>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#f2a928", margin: "2px 0 4px" }}>
                      Pay {formatPrice(Math.round(grandTotal * 0.3 * 100) / 100)} Today
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>
                      Minimum required amount to lock your manufacturing cleft.
                    </span>
                  </div>
                </label>

              </div>

              {/* Optional Custom Percentage Slider Toggle */}
              <div style={{ marginTop: 10, background: "rgba(255, 255, 255, 0.02)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setShowCustomDeposit(!showCustomDeposit)}
                    style={{ background: "none", border: "none", color: "#f2a928", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
                  >
                    <Sliders size={14} /> {showCustomDeposit ? "Hide Custom Percentage" : "Choose Custom Deposit Percentage (30% – 100%)"}
                  </button>
                  {showCustomDeposit && (
                    <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.85rem" }}>
                      {depositPercent}% ({formatPrice(depositDueNow)})
                    </span>
                  )}
                </div>

                {showCustomDeposit && (
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="range"
                      min={30}
                      max={100}
                      step={5}
                      value={depositPercent}
                      onChange={(e) => setDepositPercent(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#f2a928", cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>
                      <span>30% Min</span>
                      <span>35%</span>
                      <span>50% (Standard)</span>
                      <span>75%</span>
                      <span>100% Full</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Direct Payment Channel Selector */}
            <div style={{ background: "#141922", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: 12 }}>
                <h2 style={{ fontSize: "1.15rem", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#f2a928", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>3</span>
                  <span>Choose Payment Channel</span>
                </h2>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Step 3 of 3</span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.84rem", margin: "0 0 16px" }}>
                Select how you wish to complete your {depositPercent === 100 ? "full order payment" : `${depositPercent}% confirmation advance`}.
              </p>

              {/* 6 Payment Method Channels Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                
                {/* Method 1: Card */}
                <label style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "card" ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: formData.paymentMethod === "card" ? "rgba(242, 169, 40, 0.12)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "card" })}
                    style={{ accentColor: "#f2a928" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.88rem", display: "block" }}>Credit / Debit Card</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.73rem" }}>Visa, Mastercard, Apple Pay, Google Pay</span>
                  </div>
                </label>

                {/* Method 2: Payoneer */}
                <label style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "payoneer" ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: formData.paymentMethod === "payoneer" ? "rgba(242, 169, 40, 0.12)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payoneer"
                    checked={formData.paymentMethod === "payoneer"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "payoneer" })}
                    style={{ accentColor: "#f2a928" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.88rem", display: "block" }}>Payoneer Transfer</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.73rem" }}>B2B &amp; Direct Receiving (GBP/USD/EUR)</span>
                  </div>
                </label>

                {/* Method 3: Wise */}
                <label style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "wise" ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: formData.paymentMethod === "wise" ? "rgba(242, 169, 40, 0.12)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wise"
                    checked={formData.paymentMethod === "wise"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "wise" })}
                    style={{ accentColor: "#f2a928" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.88rem", display: "block" }}>Wise Transfer</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.73rem" }}>Fast UK/USA/AU bank wire</span>
                  </div>
                </label>

                {/* Method 4: UBL Wire */}
                <label style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "bank" ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: formData.paymentMethod === "bank" ? "rgba(242, 169, 40, 0.12)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === "bank"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "bank" })}
                    style={{ accentColor: "#f2a928" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.88rem", display: "block" }}>UBL Bank Wire</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.73rem" }}>Direct IBAN &amp; SWIFT Transfer</span>
                  </div>
                </label>

                {/* Method 5: Pakistan Local Wallets */}
                <label style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "pakistan" ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: formData.paymentMethod === "pakistan" ? "rgba(242, 169, 40, 0.12)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pakistan"
                    checked={formData.paymentMethod === "pakistan"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "pakistan" })}
                    style={{ accentColor: "#f2a928" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.88rem", display: "block" }}>🇵🇰 Pakistan Wallets</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.73rem" }}>JazzCash, SadaPay, Nayapay, EasyPaisa</span>
                  </div>
                </label>

                {/* Method 6: Remitly / WU */}
                <label style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "remitly" ? "2px solid #f2a928" : "1px solid #2d3748",
                  background: formData.paymentMethod === "remitly" ? "rgba(242, 169, 40, 0.12)" : "#181f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="remitly"
                    checked={formData.paymentMethod === "remitly"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "remitly" })}
                    style={{ accentColor: "#f2a928" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.88rem", display: "block" }}>Remitly / Western Union</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.73rem" }}>MoneyGram, TapTap Send &amp; IMT</span>
                  </div>
                </label>

              </div>

              {/* Dynamic Account Details Box */}
              {formData.paymentMethod === "card" && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: 16, borderRadius: 10 }}>
                  <strong style={{ color: "#4ade80", display: "block", marginBottom: 4 }}>💳 Instant Card Processing (Stripe)</strong>
                  <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: 0 }}>
                    You will be directed to complete secure card payment for {depositPercent === 100 ? `full order amount (${formatPrice(grandTotal)})` : `${depositPercent}% advance confirmation deposit (${formatPrice(depositDueNow)})`}.
                  </p>
                </div>
              )}

              {formData.paymentMethod === "payoneer" && (
                <div style={{ background: "rgba(242, 169, 40, 0.08)", border: "1px solid rgba(242, 169, 40, 0.2)", padding: 16, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ color: "#f2a928" }}>Payoneer Receiving Account</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("alyankhan1078@gmail.com", "payoneer_email")}
                      style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                    >
                      {copiedKey === "payoneer_email" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "payoneer_email" ? "Copied" : "Copy Email"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: 4 }}>
                    <div>Email / Payoneer ID: <strong>alyankhan1078@gmail.com</strong></div>
                    <div>Account Title: <strong>Alyan Wazir</strong> · Customer ID: <strong>99767685</strong></div>
                    <div>Connected Bank: <strong>United Bank Limited (UBL - 0881304929964)</strong></div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === "wise" && (
                <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: 16, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ color: "#60a5fa" }}>Wise International Details</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("sialkotcricketkits@gmail.com", "wise_email")}
                      style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                    >
                      {copiedKey === "wise_email" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "wise_email" ? "Copied" : "Copy Wise Tag"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: 4 }}>
                    <div>Wise Tag / Email: <strong>sialkotcricketkits@gmail.com</strong></div>
                    <div>Account Title: <strong>ALYAN WAZIR</strong></div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === "bank" && (
                <div style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)", padding: 16, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ color: "#c084fc" }}>UBL Bank Account (Direct Wire)</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("PK93UNIL0109000304929964", "iban")}
                      style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                    >
                      {copiedKey === "iban" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "iban" ? "Copied" : "Copy IBAN"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: 4 }}>
                    <div>Account Title: <strong>ALYAN WAZIR</strong> · Account No: <strong>0881304929964</strong></div>
                    <div>IBAN: <strong>PK93UNIL0109000304929964</strong> · SWIFT: <strong>UNILPKKA</strong></div>
                    <div>Bank Name: <strong>United Bank Limited (UBL)</strong> · Branch: <strong>0881-Wana</strong></div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === "pakistan" && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: 16, borderRadius: 10 }}>
                  <strong style={{ color: "#4ade80", display: "block", marginBottom: 8 }}>🇵🇰 Pakistan Local Wallets &amp; Raast</strong>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>JazzCash / Nayapay / SadaPay / Raast ID: <strong>03275756188</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("03275756188", "pk_wallets")}
                        style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}
                      >
                        {copiedKey === "pk_wallets" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "pk_wallets" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 4 }}>
                      <span>EasyPaisa Account: <strong>03499585519</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("03499585519", "easypaisa_num")}
                        style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}
                      >
                        {copiedKey === "easypaisa_num" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "easypaisa_num" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div>Account Title: <strong>ALYAN WAZIR</strong></div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === "remitly" && (
                <div style={{ background: "rgba(242, 169, 40, 0.08)", border: "1px solid rgba(242, 169, 40, 0.2)", padding: 16, borderRadius: 10 }}>
                  <strong style={{ color: "#f2a928", display: "block", marginBottom: 6 }}>International Money Transfer (Remitly / Western Union / TapTap)</strong>
                  <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                    Send direct bank deposit to <strong>UBL Account #0881304929964 (IBAN: PK93UNIL0109000304929964)</strong> under name <strong>ALYAN WAZIR</strong>.
                  </p>
                </div>
              )}

              {/* Transaction Ref Input for Non-Card */}
              {formData.paymentMethod !== "card" && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.82rem", marginBottom: 6, fontWeight: 600 }}>
                    Transaction ID / Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-94829 or Bank Reference"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.9rem" }}
                  />
                  <small style={{ color: "#94a3b8", display: "block", marginTop: 4, fontSize: "0.75rem" }}>
                    You can also submit proof of payment directly to our team on WhatsApp after placing the order.
                  </small>
                </div>
              )}
            </div>

            {/* 4. Customization Specs & Workshop Notes */}
            <div style={{ background: "#141922", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: "24px" }}>
              <label style={{ display: "block", color: "#fff", fontSize: "0.95rem", fontWeight: 700, marginBottom: 8 }}>
                Customization Specs &amp; Workshop Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Specify preferred bat weight (e.g. 2lbs 8oz), handle shape (oval/round), laser engraving text, or special courier delivery instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, background: "#181f2b", border: "1px solid #2d3748", color: "#fff", fontSize: "0.88rem", resize: "vertical" }}
              />
            </div>
          </div>

          {/* Right Column: Order Summary Sticky Sidebar */}
          <div style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#141922", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: 22 }}>
              <h2 style={{ fontSize: "1.15rem", color: "#fff", margin: "0 0 14px", paddingBottom: 10, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontWeight: 700 }}>
                Order Summary ({lines.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto", marginBottom: 14, paddingRight: 4 }}>
                {lines.map(({ product, quantity }) => (
                  <div key={product.id} style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 8 }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #2d3748", background: "#181f2b" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ color: "#fff", fontSize: "0.84rem", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {product.name}
                      </strong>
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        Qty: {quantity} × {formatPrice(product.price)}
                      </span>
                    </div>
                    <span style={{ color: "#f2a928", fontWeight: 700, fontSize: "0.88rem" }}>
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal & Shipping Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 12, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.86rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>Items Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>Tracked Courier ({formData.country})</span>
                  <strong style={{ color: "#f2a928" }}>{formatPrice(shippingCalculation.shippingFee)}</strong>
                </div>

                {shippingCalculation.totalSaved > 0 && (
                  <div style={{ background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.25)", padding: "4px 8px", borderRadius: 6, fontSize: "0.75rem", color: "#4ade80", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>✨ Combined Shipping Savings:</span>
                    <strong>Save {formatPrice(shippingCalculation.totalSaved)}!</strong>
                  </div>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#94a3b8" }}>Total Order Value:</span>
                  <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{formatPrice(grandTotal)}</strong>
                </div>
              </div>

              {/* Confirmation Deposit Breakdown Box */}
              <div style={{ margin: "14px 0 16px", background: "rgba(242, 169, 40, 0.08)", border: "1px solid rgba(242, 169, 40, 0.25)", padding: 12, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.98rem", display: "block" }}>Due Today ({depositPercent}% Deposit)</strong>
                    <span style={{ color: "#fde68a", fontSize: "0.72rem" }}>Required to Confirm &amp; Begin Crafting</span>
                  </div>
                  <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#f2a928" }}>
                    {formatPrice(depositDueNow)}
                  </span>
                </div>

                {depositPercent < 100 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 6, marginTop: 6, fontSize: "0.76rem", color: "#94a3b8" }}>
                    <span>Balance Due on Dispatch:</span>
                    <strong style={{ color: "#cbd5e1" }}>{formatPrice(balanceRemaining)}</strong>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: "0.82rem", marginBottom: 14 }}>
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="button primary wide"
                style={{
                  padding: "13px 18px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
                  color: "#000000",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing Order...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Complete Order &amp; Confirm ({formatPrice(depositDueNow)})
                  </>
                )}
              </button>

              {/* WhatsApp Alternative */}
              <a
                className="button whatsapp wide"
                href={whatsappUrl(`Hello Sialkot Cricket Kits, I would like to confirm my order for ${lines.map(l => `${l.quantity}x ${l.product.name}`).join(", ")} (Total Order: £${grandTotal}, ${depositPercent}% Advance Deposit: £${depositDueNow}). Country: ${formData.country}. Name: ${formData.fullName || "Customer"}`)}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginTop: 8,
                  padding: "9px 12px",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  color: "#34d399",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                💬 Place Order via WhatsApp
              </a>

              {/* Guarantees */}
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6, fontSize: "0.75rem", color: "#94a3b8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={14} color="#22c55e" /> 100% Genuine Handcrafted Sialkot Willow
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={14} color="#22c55e" /> Live Bat Ping &amp; Prep Video Sent on WhatsApp
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={14} color="#22c55e" /> Worldwide Tracked Express Courier Dispatch
                </div>
              </div>
            </div>
          </div>

        </form>
      </section>
    </main>
  );
}
