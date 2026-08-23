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

  const [depositPercent, setDepositPercent] = useState<50 | 100 | 30>(50);
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
        <div style={{ background: "var(--card-bg, #181c24)", border: "1px solid var(--border-color, #2a313d)", borderRadius: 16, padding: "48px 24px" }}>
          <ShoppingBag size={56} style={{ color: "var(--accent, #f59e0b)", marginBottom: 16 }} />
          <h1 style={{ fontSize: "1.8rem", color: "#fff", marginBottom: 8 }}>Your Shopping Cart is Empty</h1>
          <p style={{ color: "var(--text-secondary, #94a3b8)", maxWidth: 440, margin: "0 auto 24px" }}>
            Add match-grade cricket bats, protective gear, or accessories from our catalogue to proceed with direct checkout.
          </p>
          <Link href="/shop" className="button primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Browse Store Catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page-layout">
      {/* Hero */}
      <section className="page-hero compact-hero">
        <div>
          <span className="eyebrow" style={{ color: "var(--accent, #f59e0b)" }}>Secure Direct Checkout</span>
          <h1>Complete Your Order.</h1>
          <p>Direct website payment with verified express worldwide tracked shipping from Sialkot.</p>
        </div>
      </section>

      {/* Main Checkout Container */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <form onSubmit={handleSubmitOrder} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 32, alignItems: "start" }}>
          
          {/* Left Column: Customer Details, Address, and Payment Method */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* 1. Contact Information */}
            <div style={{ background: "var(--card-bg, #181c24)", border: "1px solid var(--border-color, #2a313d)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent, #f59e0b)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>1</span>
                <span>Contact Information</span>
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. James Anderson"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                    Email Address * (For Invoice)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                  Phone / WhatsApp Number * (For Delivery Tracking & Live Bat Video)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +44 7123 456789 or +92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div style={{ background: "var(--card-bg, #181c24)", border: "1px solid var(--border-color, #2a313d)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent, #f59e0b)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>2</span>
                <span>Delivery Address</span>
              </h2>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 600 }}>
                  Destination Country / Region *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0f172a", border: "1.5px solid #334155", color: "#fff", fontSize: "0.92rem", fontWeight: 600 }}
                >
                  {countries.map((c) => {
                    const flag = getCountryFlag(c);
                    const dest = SHIPPING_DESTINATIONS[c];
                    return (
                      <option key={c} value={c}>
                        {flag} {c} {dest ? `(${formatPrice(dest.baseGbp)} base tracked)` : ""}
                      </option>
                    );
                  })}
                </select>
                <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#94a3b8" }}>
                  <span>📦 {shippingCalculation.destination.estimatedDelivery}</span>
                  <strong style={{ color: "var(--accent, #f59e0b)" }}>{formatPrice(shippingCalculation.shippingFee)}</strong>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                  Street Address / House No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 42 High Street, Flat 2B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="London / Lahore"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                    State / County
                  </label>
                  <input
                    type="text"
                    placeholder="Greater London"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    placeholder="SW1A 1AA"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Order Confirmation & Advance Payment Plan */}
            <div style={{ background: "var(--card-bg, #181c24)", border: "1px solid var(--border-color, #2a313d)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent, #f59e0b)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>3</span>
                  <span>Order Confirmation &amp; Payment Plan</span>
                </h2>
                <span style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#4ade80", padding: "3px 8px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600 }}>
                  Min. 30% Required
                </span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 16px" }}>
                Choose your confirmation deposit amount. Handcrafted custom bats begin crafting upon deposit confirmation. Full video demonstration provided before final dispatch.
              </p>

              {/* 3 Deposit Option Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                
                {/* Option 1: 50% Half Advance (Recommended) */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: depositPercent === 50 ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: depositPercent === 50 ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="depositPlan"
                    value={50}
                    checked={depositPercent === 50}
                    onChange={() => setDepositPercent(50)}
                    style={{ accentColor: "var(--accent, #f59e0b)", marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <strong style={{ color: "#fff", fontSize: "0.95rem" }}>
                        50% Half Advance Payment <span style={{ color: "var(--accent, #f59e0b)", fontSize: "0.8rem", marginLeft: 6 }}>★ Recommended</span>
                      </strong>
                      <span style={{ color: "var(--accent, #f59e0b)", fontWeight: 700, fontSize: "1rem" }}>
                        Pay {formatPrice(Math.round(grandTotal * 0.5 * 100) / 100)} Today
                      </span>
                    </div>
                    <p style={{ color: "#cbd5e1", fontSize: "0.8rem", margin: 0, lineHeight: 1.4 }}>
                      Pay 50% now to confirm order &amp; start custom crafting. Remaining 50% ({formatPrice(Math.round(grandTotal * 0.5 * 100) / 100)}) payable upon live ping video approval before courier dispatch.
                    </p>
                  </div>
                </label>

                {/* Option 2: 100% Full Payment Upfront */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: depositPercent === 100 ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: depositPercent === 100 ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="depositPlan"
                    value={100}
                    checked={depositPercent === 100}
                    onChange={() => setDepositPercent(100)}
                    style={{ accentColor: "var(--accent, #f59e0b)", marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <strong style={{ color: "#fff", fontSize: "0.95rem" }}>
                        100% Full Payment Upfront
                      </strong>
                      <span style={{ color: "var(--accent, #f59e0b)", fontWeight: 700, fontSize: "1rem" }}>
                        Pay {formatPrice(grandTotal)} Total
                      </span>
                    </div>
                    <p style={{ color: "#cbd5e1", fontSize: "0.8rem", margin: 0, lineHeight: 1.4 }}>
                      Pay full order amount upfront for priority workshop queuing and expedited express DHL courier dispatch.
                    </p>
                  </div>
                </label>

                {/* Option 3: 30% Minimum Booking Deposit */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: depositPercent === 30 ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: depositPercent === 30 ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="depositPlan"
                    value={30}
                    checked={depositPercent === 30}
                    onChange={() => setDepositPercent(30)}
                    style={{ accentColor: "var(--accent, #f59e0b)", marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <strong style={{ color: "#fff", fontSize: "0.95rem" }}>
                        30% Minimum Booking Deposit
                      </strong>
                      <span style={{ color: "var(--accent, #f59e0b)", fontWeight: 700, fontSize: "1rem" }}>
                        Pay {formatPrice(Math.round(grandTotal * 0.3 * 100) / 100)} Today
                      </span>
                    </div>
                    <p style={{ color: "#cbd5e1", fontSize: "0.8rem", margin: 0, lineHeight: 1.4 }}>
                      Minimum allowable deposit (30%) to secure premium willow clef and queue slot. Remaining 70% ({formatPrice(Math.round(grandTotal * 0.7 * 100) / 100)}) payable before courier dispatch.
                    </p>
                  </div>
                </label>

              </div>
            </div>

            {/* 4. Direct Payment Method Selection */}
            <div style={{ background: "var(--card-bg, #181c24)", border: "1px solid var(--border-color, #2a313d)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent, #f59e0b)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>4</span>
                <span>Choose Payment Channel</span>
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 16px" }}>
                Select how you wish to pay your {depositPercent === 100 ? "full order" : `${depositPercent}% advance deposit`}.
              </p>

              {/* Payment Methods Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                
                {/* Method 1: Card */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "card" ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: formData.paymentMethod === "card" ? "rgba(245, 158, 11, 0.1)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "card" })}
                    style={{ accentColor: "var(--accent, #f59e0b)" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block" }}>Credit / Debit Card</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Visa, Mastercard, Apple Pay, Google Pay</span>
                  </div>
                </label>

                {/* Method 2: Payoneer */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "payoneer" ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: formData.paymentMethod === "payoneer" ? "rgba(245, 158, 11, 0.1)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payoneer"
                    checked={formData.paymentMethod === "payoneer"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "payoneer" })}
                    style={{ accentColor: "var(--accent, #f59e0b)" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block" }}>Payoneer Transfer</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>B2B &amp; Direct Receiving (GBP/USD/EUR)</span>
                  </div>
                </label>

                {/* Method 3: Wise */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "wise" ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: formData.paymentMethod === "wise" ? "rgba(245, 158, 11, 0.1)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wise"
                    checked={formData.paymentMethod === "wise"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "wise" })}
                    style={{ accentColor: "var(--accent, #f59e0b)" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block" }}>Wise Transfer</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Fast international UK/USA/AU bank transfer</span>
                  </div>
                </label>

                {/* Method 4: Direct Bank Wire (UBL) */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "bank" ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: formData.paymentMethod === "bank" ? "rgba(245, 158, 11, 0.1)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === "bank"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "bank" })}
                    style={{ accentColor: "var(--accent, #f59e0b)" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block" }}>UBL Bank Wire</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Direct IBAN &amp; SWIFT International Wire</span>
                  </div>
                </label>

                {/* Method 5: Pakistan Local Wallets */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "pakistan" ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: formData.paymentMethod === "pakistan" ? "rgba(245, 158, 11, 0.1)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pakistan"
                    checked={formData.paymentMethod === "pakistan"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "pakistan" })}
                    style={{ accentColor: "var(--accent, #f59e0b)" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block" }}>🇵🇰 Pakistan Wallets</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>JazzCash, Nayapay, SadaPay, Raast, EasyPaisa</span>
                  </div>
                </label>

                {/* Method 6: Remitly / WU / MoneyGram */}
                <label style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: formData.paymentMethod === "remitly" ? "2px solid var(--accent, #f59e0b)" : "1px solid #334155",
                  background: formData.paymentMethod === "remitly" ? "rgba(245, 158, 11, 0.1)" : "rgba(30, 41, 59, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="remitly"
                    checked={formData.paymentMethod === "remitly"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "remitly" })}
                    style={{ accentColor: "var(--accent, #f59e0b)" }}
                  />
                  <div>
                    <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block" }}>Remitly / Western Union</strong>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>MoneyGram, TapTap Send &amp; IMT Express</span>
                  </div>
                </label>

              </div>

              {/* Dynamic Account Details Box */}
              {formData.paymentMethod === "card" && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: 16, borderRadius: 10 }}>
                  <strong style={{ color: "#4ade80", display: "block", marginBottom: 4 }}>💳 Instant Card Processing (Stripe)</strong>
                  <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: 0 }}>
                    You will be directed to complete secure card payment for {depositPercent === 100 ? `full order amount (${formatPrice(grandTotal)})` : `${depositPercent}% advance deposit (${formatPrice(depositDueNow)})`}.
                  </p>
                </div>
              )}

              {formData.paymentMethod === "payoneer" && (
                <div style={{ background: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.2)", padding: 16, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ color: "#fb923c" }}>Payoneer Account Details</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("alyankhan1078@gmail.com", "payoneer_email")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                    >
                      {copiedKey === "payoneer_email" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "payoneer_email" ? "Copied" : "Copy Email"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: 4 }}>
                    <div>Email / Payoneer ID: <strong>alyankhan1078@gmail.com</strong></div>
                    <div>Account Title: <strong>Alyan Wazir</strong></div>
                    <div>Customer ID: <strong>99767685</strong></div>
                    <div>Connected Bank: <strong>United Bank Limited (UBL)</strong></div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === "wise" && (
                <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: 16, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ color: "#60a5fa" }}>Wise Transfer Details</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("sialkotcricketkits@gmail.com", "wise_email")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                    >
                      {copiedKey === "wise_email" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "wise_email" ? "Copied" : "Copy Email"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: 4 }}>
                    <div>Wise Tag / Email: <strong>sialkotcricketkits@gmail.com</strong></div>
                    <div>Account Title: <strong>ALYAN WAZIR</strong></div>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Fastest with lowest fees for UK, Europe, USA, Canada &amp; Australia buyers.</div>
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
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                    >
                      {copiedKey === "iban" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "iban" ? "Copied" : "Copy IBAN"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: 4 }}>
                    <div>Account Title: <strong>ALYAN WAZIR</strong></div>
                    <div>Account Number: <strong>0881304929964</strong></div>
                    <div>IBAN: <strong>PK93UNIL0109000304929964</strong></div>
                    <div>SWIFT / BIC: <strong>UNILPKKA</strong></div>
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
                        style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}
                      >
                        {copiedKey === "pk_wallets" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "pk_wallets" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 4 }}>
                      <span>EasyPaisa Account: <strong>03499585519</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("03499585519", "easypaisa_num")}
                        style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}
                      >
                        {copiedKey === "easypaisa_num" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "easypaisa_num" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div>Account Title: <strong>ALYAN WAZIR</strong></div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === "remitly" && (
                <div style={{ background: "rgba(234, 179, 8, 0.08)", border: "1px solid rgba(234, 179, 8, 0.2)", padding: 16, borderRadius: 10 }}>
                  <strong style={{ color: "#facc15", display: "block", marginBottom: 6 }}>International Money Transfer (Remitly / Western Union / TapTap)</strong>
                  <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                    Send direct bank deposit to <strong>UBL Account #0881304929964 (IBAN: PK93UNIL0109000304929964)</strong> under name <strong>ALYAN WAZIR</strong>.
                  </p>
                </div>
              )}

              {/* Transaction Ref Input for Non-Card */}
              {formData.paymentMethod !== "card" && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                    Transaction ID / Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-94829 or UBL Reference"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                  />
                  <small style={{ color: "#94a3b8", display: "block", marginTop: 4, fontSize: "0.75rem" }}>
                    You can also submit proof of payment directly to our team on WhatsApp after placing the order.
                  </small>
                </div>
              )}
            </div>

            {/* 5. Bat Customization & Order Notes */}
            <div style={{ background: "var(--card-bg, #181c24)", border: "1px solid var(--border-color, #2a313d)", borderRadius: 16, padding: 24 }}>
              <label style={{ display: "block", color: "#fff", fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>
                Customization Specs &amp; Order Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Specify preferred bat weight (e.g. 2lbs 8oz), handle shape (oval/round), laser engraving text, or special delivery instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", resize: "vertical" }}
              />
            </div>
          </div>

          {/* Right Column: Order Summary Sticky Sidebar */}
          <div style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--card-bg, #181c24)", border: "1px solid var(--border-color, #2a313d)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid var(--border-color, #2a313d)" }}>
                Order Summary ({lines.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 320, overflowY: "auto", marginBottom: 16, paddingRight: 4 }}>
                {lines.map(({ product, quantity }) => (
                  <div key={product.id} style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 10 }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "1px solid #334155" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ color: "#fff", fontSize: "0.85rem", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {product.name}
                      </strong>
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        Qty: {quantity} × {formatPrice(product.price)}
                      </span>
                    </div>
                    <span style={{ color: "var(--accent, #f59e0b)", fontWeight: 600, fontSize: "0.9rem" }}>
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal & Shipping Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--border-color, #2a313d)", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>Items Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>Delivery to {formData.country}</span>
                  <strong style={{ color: "var(--accent, #f59e0b)" }}>{formatPrice(shippingCalculation.shippingFee)}</strong>
                </div>

                {shippingCalculation.totalSaved > 0 && (
                  <div style={{ background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "6px 10px", borderRadius: 6, fontSize: "0.78rem", color: "#4ade80", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                    <span>🎉 Multi-Bat Shipping Savings:</span>
                    <strong>Save {formatPrice(shippingCalculation.totalSaved)}!</strong>
                  </div>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", paddingTop: 4 }}>
                  <span>Total Order Value</span>
                  <strong style={{ color: "#fff" }}>{formatPrice(grandTotal)}</strong>
                </div>

                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                  {shippingCalculation.destination.estimatedDelivery}
                </div>
              </div>

              {/* Confirmation Deposit Breakdown */}
              <div style={{ margin: "14px 0 16px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", padding: 12, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "1.05rem", display: "block" }}>Due Today ({depositPercent}% Deposit)</strong>
                    <span style={{ color: "#fde68a", fontSize: "0.75rem" }}>Required for Order Confirmation</span>
                  </div>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent, #f59e0b)" }}>
                    {formatPrice(depositDueNow)}
                  </span>
                </div>

                {depositPercent < 100 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 6, marginTop: 6, fontSize: "0.78rem", color: "#94a3b8" }}>
                    <span>Balance Due on Dispatch:</span>
                    <strong style={{ color: "#cbd5e1" }}>{formatPrice(balanceRemaining)}</strong>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="button primary wide"
                style={{
                  padding: "14px 20px",
                  fontSize: "1.02rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderRadius: 10,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Processing Order...
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Complete Order &amp; Pay ({formatPrice(depositDueNow)})
                  </>
                )}
              </button>

              {/* Guarantees */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.78rem", color: "#94a3b8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={15} color="#22c55e" /> 100% Genuine Handcrafted Sialkot Willow
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={15} color="#22c55e" /> Live Bat Ping &amp; Prep Video Sent on WhatsApp
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={15} color="#22c55e" /> Worldwide Tracked Express Courier Dispatch
                </div>
              </div>
            </div>
          </div>

        </form>
      </section>
    </main>
  );
}
