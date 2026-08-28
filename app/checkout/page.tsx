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
  Package,
  Truck,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { calculateShippingFee, SHIPPING_DESTINATIONS, getCountryFlag } from "@/src/lib/shipping";

type PaymentMethodType =
  | "card"
  | "bank"
  | "payoneer"
  | "wise"
  | "pakistan"
  | "remitly";

type Step = 1 | 2 | 3 | 4;

const DEPOSIT_OPTIONS = [
  { percent: 50, label: "50% Deposit", sub: "Most common — balance due before dispatch", badge: "Recommended" },
  { percent: 35, label: "35% Deposit", sub: "Partial commitment — larger balance before dispatch", badge: "" },
  { percent: 100, label: "Pay in Full", sub: "Single payment — highest priority queue", badge: "" },
  { percent: 30, label: "30% Minimum Deposit", sub: "Minimum to lock your slot in production", badge: "Min deposit" },
];

const PAYMENT_METHODS: { id: PaymentMethodType; label: string; icon: React.ReactNode }[] = [
  { id: "card", label: "Credit / Debit Card (Stripe)", icon: <CreditCard size={18} /> },
  { id: "bank", label: "Bank Transfer (IBAN / SWIFT)", icon: <Building2 size={18} /> },
  { id: "payoneer", label: "Payoneer", icon: <Wallet size={18} /> },
  { id: "wise", label: "Wise International Transfer", icon: <Globe size={18} /> },
  { id: "pakistan", label: "Pakistan Local (JazzCash / EasyPaisa / Raast)", icon: <Send size={18} /> },
  { id: "remitly", label: "Remitly / Western Union / MoneyGram", icon: <Send size={18} /> },
];

const BANK_DETAILS = {
  accountName: "Mian Talha Alyan",
  iban: "PK07UNIL0109000411049685",
  swift: "UNILPKKA",
  bank: "United Bank Limited (UBL)",
  branch: "Sialkot, Pakistan",
};

const countries = Object.keys(SHIPPING_DESTINATIONS);

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, formatPrice, currency, setCurrency, currencies } = useStore();

  const [step, setStep] = useState<Step>(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: currency === "PKR" ? "Pakistan" : currency === "USD" ? "United States" : currency === "AUD" ? "Australia" : "United Kingdom",
    notes: "",
    transactionRef: "",
  });
  const [depositPercent, setDepositPercent] = useState(50);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("card");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lines = cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((t, i) => t + i.product.price * i.quantity, 0);
  const totalItemCount = lines.reduce((t, i) => t + i.quantity, 0);
  const shippingCalc = calculateShippingFee(formData.country, totalItemCount);
  const grandTotal = subtotal + shippingCalc.shippingFee;
  const depositDueNow = Math.round(grandTotal * (depositPercent / 100) * 100) / 100;
  const balanceRemaining = Math.round((grandTotal - depositDueNow) * 100) / 100;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethodTitle = (method: PaymentMethodType) => {
    const m = PAYMENT_METHODS.find((x) => x.id === method);
    return m?.label ?? method;
  };

  // Validation per step
  const canContinueStep1 = lines.length > 0;
  const canContinueStep2 = formData.fullName.trim() !== "" && formData.phone.trim() !== "";
  const canContinueStep3 = depositPercent > 0 && paymentMethod !== undefined;

  const cartMessage = `Hello Sialkot Cricket Kits,\n\nI would like to order:\n\n${lines
    .map((l, i) => `${i + 1}. ${l.product.name} (x${l.quantity}) — ${formatPrice(l.product.price)} each`)
    .join("\n")}\n\nSubtotal: ${formatPrice(subtotal)}\nDelivery to: ${formData.country}\nShipping: ${formatPrice(shippingCalc.shippingFee)}\nOrder Total: ${formatPrice(grandTotal)}\nDeposit (${depositPercent}%): ${formatPrice(depositDueNow)}\n\nName: ${formData.fullName}\nPhone: ${formData.phone}\n\nPlease confirm my order. Thank you!`;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) { setErrorMessage("Your cart is empty."); return; }
    if (!formData.fullName || !formData.phone) { setErrorMessage("Please enter your name and phone number."); return; }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (paymentMethod === "card") {
        const res = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: lines.map((l) => ({ id: l.product.id, name: l.product.name, category: l.product.category, price: l.product.price, quantity: l.quantity, image: l.product.image })),
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            country: formData.country,
            shippingFee: shippingCalc.shippingFee,
            totalAmount: grandTotal,
            depositPercent,
            depositDueNow,
            balanceRemaining,
            notes: formData.notes,
          }),
        });
        const data = await res.json();
        if (data.success && data.url) { clearCart(); window.location.href = data.url; return; }
      }

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
          items: lines.map((l) => ({ id: l.product.id, name: l.product.name, category: l.product.category, price: l.product.price, quantity: l.quantity })),
          subtotal,
          shippingFee: shippingCalc.shippingFee,
          totalAmount: grandTotal,
          depositPercentage: depositPercent,
          amountPaidNow: depositDueNow,
          balanceRemaining,
          paymentMethod: getMethodTitle(paymentMethod),
          transactionRef: formData.transactionRef,
          notes: formData.notes,
        }),
      });

      const orderData = await orderRes.json();
      if (orderData.success && orderData.orderId) {
        clearCart();
        router.push(`/checkout/success?orderId=${encodeURIComponent(orderData.orderId)}`);
      } else {
        setErrorMessage(orderData.error || "Failed to process your order. Please try again or contact us on WhatsApp.");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection or contact us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <main style={{ maxWidth: 640, margin: "5rem auto", padding: "0 1.2rem", textAlign: "center" }}>
        <div className="checkout-card">
          <ShoppingBag size={48} style={{ color: "var(--gold)", marginBottom: 16 }} />
          <h1 style={{ fontSize: "1.6rem", marginBottom: 8 }}>Your cart is empty</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Add cricket equipment from our catalogue to proceed with checkout.
          </p>
          <Link className="checkout-primary-cta" href="/shop">
            Browse equipment <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  // ── Step indicator ──────────────────────────────────────────────────────────
  const STEPS = [
    { n: 1, label: "Order" },
    { n: 2, label: "Delivery" },
    { n: 3, label: "Payment" },
    { n: 4, label: "Review" },
  ];

  const StepIndicator = () => (
    <div className="checkout-steps" role="list" aria-label="Checkout progress">
      {STEPS.map(({ n, label }, idx) => {
        const isDone = step > n;
        const isActive = step === n;
        return (
          <>
            <div
              key={n}
              className={`checkout-step-item${isActive ? " active" : isDone ? " done" : ""}`}
              role="listitem"
              aria-current={isActive ? "step" : undefined}
            >
              <div className="checkout-step-num">
                {isDone ? <Check size={12} /> : n}
              </div>
              <span>{label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div key={`div-${n}`} className="checkout-step-divider" aria-hidden="true" />
            )}
          </>
        );
      })}
    </div>
  );

  // ── Order summary sidebar ────────────────────────────────────────────────────
  const OrderSummary = () => (
    <div className="checkout-card">
      <h3 className="checkout-card-title" style={{ fontSize: ".92rem" }}>
        Order summary
      </h3>
      {lines.map(({ product, quantity }) => (
        <div className="checkout-product-line" key={product.id}>
          <img src={product.image} alt={product.name} />
          <div>
            <div className="checkout-product-name">{product.name}</div>
            <div className="checkout-product-qty">Qty: {quantity}</div>
          </div>
          <div className="checkout-product-price">{formatPrice(product.price * quantity)}</div>
        </div>
      ))}

      <div className="order-summary-divider" style={{ margin: ".75rem 0 .4rem" }} />

      <div className="order-summary-line">
        <span>Subtotal ({totalItemCount} item{totalItemCount > 1 ? "s" : ""})</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
      <div className="order-summary-line">
        <span>Delivery — {formData.country}</span>
        <strong>{formatPrice(shippingCalc.shippingFee)}</strong>
      </div>
      {shippingCalc.totalSaved > 0 && (
        <div style={{ fontSize: ".74rem", color: "#0d5e38", background: "var(--success-light)", padding: ".3rem .6rem", borderRadius: 5, marginBottom: ".2rem", fontWeight: 600 }}>
          Combined shipping — you save {formatPrice(shippingCalc.totalSaved)}
        </div>
      )}

      <div className="order-summary-divider" />

      <div className="order-total-line">
        <span className="label">Order total</span>
        <span className="value">{formatPrice(grandTotal)}</span>
      </div>

      {step >= 3 && (
        <>
          <div className="order-pay-today-line">
            <span className="label">Pay today ({depositPercent}% deposit)</span>
            <span className="value">{formatPrice(depositDueNow)}</span>
          </div>
          <div className="order-balance-line">
            <span>Balance before dispatch</span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatPrice(balanceRemaining)}</span>
          </div>
        </>
      )}

      <div className="checkout-trust-note" style={{ marginTop: ".75rem" }}>
        <ShieldCheck size={13} /> Factory direct · Tracked courier · Live ping video
      </div>
    </div>
  );

  // ── Step 1: Order review ─────────────────────────────────────────────────────
  const Step1 = () => (
    <div>
      <h2 className="checkout-card-title" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Your order
      </h2>
      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        {lines.map(({ product, quantity }) => (
          <div className="checkout-product-line" key={product.id}>
            <img src={product.image} alt={product.name} />
            <div>
              <div className="checkout-product-name">{product.name}</div>
              <div className="checkout-product-qty">Qty: {quantity}</div>
            </div>
            <div className="checkout-product-price">{formatPrice(product.price * quantity)}</div>
          </div>
        ))}
      </div>

      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: ".84rem", color: "var(--text-secondary)", margin: "0 0 .6rem", lineHeight: 1.5 }}>
          All items are inspected before dispatch. You will receive live product photos and a bat ping video via WhatsApp before courier handover.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
          {[
            { icon: <Package size={13} />, text: "Factory direct inspection" },
            { icon: <Truck size={13} />, text: "Tracked express courier" },
            { icon: <ShieldCheck size={13} />, text: "Flexible deposit from 30%" },
            { icon: <CheckCircle2 size={13} />, text: "Live ping video before dispatch" },
          ].map(({ icon, text }) => (
            <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".74rem", color: "var(--text-secondary)", background: "var(--surface-subtle)", border: "1px solid var(--border)", padding: ".3rem .65rem", borderRadius: 5, fontWeight: 600 }}>
              <span style={{ color: "var(--gold)" }}>{icon}</span> {text}
            </span>
          ))}
        </div>
      </div>

      <button
        className="checkout-primary-cta"
        onClick={() => setStep(2)}
        disabled={!canContinueStep1}
        style={{ pointerEvents: canContinueStep1 ? "auto" : "none", opacity: canContinueStep1 ? 1 : .6 }}
      >
        Continue to Delivery <ArrowRight size={16} />
      </button>

      <a
        className="checkout-secondary-cta"
        href={whatsappUrl(cartMessage)}
        target="_blank"
        rel="noreferrer"
        style={{ marginTop: ".6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}
      >
        💬 Complete order via WhatsApp instead
      </a>
    </div>
  );

  // ── Step 2: Delivery ─────────────────────────────────────────────────────────
  const Step2 = () => (
    <div>
      <button className="checkout-back-btn" onClick={() => setStep(1)}>
        <ChevronLeft size={16} /> Back to order
      </button>
      <h2 className="checkout-card-title" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Your details &amp; delivery
      </h2>

      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <div className="checkout-grid-2" style={{ marginBottom: "1rem" }}>
          <div>
            <label className="checkout-field-label" htmlFor="co-name">Full name *</label>
            <input
              id="co-name"
              className="checkout-input"
              type="text"
              required
              placeholder="e.g. James Anderson"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="checkout-field-label" htmlFor="co-email">Email address (for invoice)</label>
            <input
              id="co-email"
              className="checkout-input"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="checkout-field-label" htmlFor="co-phone">
            WhatsApp / phone number * <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(for courier tracking &amp; ping video)</span>
          </label>
          <input
            id="co-phone"
            className="checkout-input"
            type="tel"
            required
            placeholder="+44 7123 456789 or +92 300 1234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="checkout-field-label" htmlFor="co-address">Street address</label>
          <input
            id="co-address"
            className="checkout-input"
            type="text"
            placeholder="e.g. 42 High Street, Flat 2B"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="checkout-grid-3">
          <div>
            <label className="checkout-field-label" htmlFor="co-city">City</label>
            <input id="co-city" className="checkout-input" type="text" placeholder="London" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
          </div>
          <div>
            <label className="checkout-field-label" htmlFor="co-state">State / County</label>
            <input id="co-state" className="checkout-input" type="text" placeholder="Optional" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
          </div>
          <div>
            <label className="checkout-field-label" htmlFor="co-postal">Postcode</label>
            <input id="co-postal" className="checkout-input" type="text" placeholder="SW1A 1AA" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Delivery country + shipping */}
      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <label className="checkout-field-label" htmlFor="co-country">
          <Truck size={13} style={{ display: "inline", verticalAlign: "middle", color: "var(--gold)", marginRight: 4 }} />
          Delivery country
        </label>
        <select
          id="co-country"
          className="delivery-country-select"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
        >
          {countries.map((c) => (
            <option key={c} value={c}>{getCountryFlag(c)} {c}</option>
          ))}
        </select>

        <div className="delivery-info-box" style={{ marginTop: ".6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".3rem" }}>
            <span>Tracked express courier</span>
            <span className="delivery-cost">{formatPrice(shippingCalc.shippingFee)}</span>
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--text-secondary)" }}>
            Estimated delivery: {shippingCalc.destination.estimatedDelivery}
          </div>
          {shippingCalc.totalSaved > 0 ? (
            <div className="combined-shipping-note">
              Combined shipping active — you save {formatPrice(shippingCalc.totalSaved)} on {totalItemCount} items
            </div>
          ) : (
            <div style={{ fontSize: ".74rem", color: "var(--text-muted)", marginTop: ".3rem" }}>
              Additional bats add only {formatPrice(shippingCalc.destination.additionalItemGbp)} each in the same parcel
            </div>
          )}
        </div>
      </div>

      <button
        className="checkout-primary-cta"
        onClick={() => setStep(3)}
        disabled={!canContinueStep2}
        style={{ pointerEvents: canContinueStep2 ? "auto" : "none", opacity: canContinueStep2 ? 1 : .6 }}
      >
        Continue to Payment <ArrowRight size={16} />
      </button>
    </div>
  );

  // ── Step 3: Payment ──────────────────────────────────────────────────────────
  const Step3 = () => (
    <div>
      <button className="checkout-back-btn" onClick={() => setStep(2)}>
        <ChevronLeft size={16} /> Back to delivery
      </button>
      <h2 className="checkout-card-title" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Deposit &amp; payment method
      </h2>

      {/* Deposit selector */}
      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <p className="checkout-card-subtitle">
          Choose how much you would like to pay now. The remaining balance is due before we dispatch your order.
        </p>
        <div className="deposit-options">
          {DEPOSIT_OPTIONS.map(({ percent, label, sub, badge }) => {
            const amount = Math.round(grandTotal * (percent / 100) * 100) / 100;
            const isSelected = depositPercent === percent;
            return (
              <button
                key={percent}
                type="button"
                className={`deposit-option${isSelected ? " selected" : ""}`}
                onClick={() => setDepositPercent(percent)}
              >
                <div className="deposit-option-radio">
                  <div className="deposit-option-radio-inner" />
                </div>
                <div className="deposit-option-body">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
                    <span className="deposit-option-title">{label}</span>
                    {badge && <span className="deposit-option-badge">{badge}</span>}
                  </div>
                  <span className="deposit-option-amount">{formatPrice(amount)}</span>
                  <span className="deposit-option-sub">{sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment method */}
      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <h3 className="checkout-card-title" style={{ fontSize: ".95rem" }}>How would you like to pay?</h3>
        <div className="payment-methods">
          {PAYMENT_METHODS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={`payment-method-option${paymentMethod === id ? " selected" : ""}`}
              onClick={() => setPaymentMethod(id)}
            >
              <span className="payment-method-icon">{icon}</span>
              <span className="payment-method-label">{label}</span>
            </button>
          ))}
        </div>

        {/* Payment detail info */}
        {paymentMethod === "bank" && (
          <div className="payment-info-box amber" style={{ marginTop: ".75rem" }}>
            <p style={{ margin: "0 0 .5rem", fontWeight: 700, fontSize: ".84rem" }}>Bank transfer details</p>
            {Object.entries({ "Account name": BANK_DETAILS.accountName, "IBAN": BANK_DETAILS.iban, "SWIFT / BIC": BANK_DETAILS.swift, "Bank": BANK_DETAILS.bank }).map(([k, v]) => (
              <div key={k} className="payment-info-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(242,169,40,.15)", padding: ".35rem 0" }}>
                <span style={{ fontSize: ".78rem", color: "var(--text-secondary)" }}>{k}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: ".78rem", fontWeight: 700 }}>{v}</span>
                  <button className="payment-info-copy" onClick={() => copyToClipboard(v, k)} aria-label={`Copy ${k}`}>
                    {copiedKey === k ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {paymentMethod === "card" && (
          <div className="payment-info-box blue" style={{ marginTop: ".75rem" }}>
            <Lock size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            You will be redirected to a secure Stripe payment page to complete your card payment.
          </div>
        )}

        {paymentMethod === "payoneer" && (
          <div className="payment-info-box green" style={{ marginTop: ".75rem" }}>
            Send to Payoneer email: <strong>sialkotcricketkits@gmail.com</strong>
          </div>
        )}

        {paymentMethod === "wise" && (
          <div className="payment-info-box blue" style={{ marginTop: ".75rem" }}>
            Send via Wise to: <strong>sialkotcricketkits@gmail.com</strong>. Include your order details in the reference.
          </div>
        )}

        {paymentMethod === "pakistan" && (
          <div className="payment-info-box amber" style={{ marginTop: ".75rem" }}>
            <strong>JazzCash / EasyPaisa / Raast:</strong> 03231438214<br />
            <strong>SadaPay / NayaPay:</strong> sialkotcricketkits@gmail.com
          </div>
        )}

        {paymentMethod === "remitly" && (
          <div className="payment-info-box blue" style={{ marginTop: ".75rem" }}>
            Please contact us on WhatsApp for Remitly / Western Union / MoneyGram transfer details.
          </div>
        )}
      </div>

      <button
        className="checkout-primary-cta"
        onClick={() => setStep(4)}
        disabled={!canContinueStep3}
        style={{ pointerEvents: canContinueStep3 ? "auto" : "none", opacity: canContinueStep3 ? 1 : .6 }}
      >
        Review &amp; Confirm <ArrowRight size={16} />
      </button>
    </div>
  );

  // ── Step 4: Review & Submit ──────────────────────────────────────────────────
  const Step4 = () => (
    <form onSubmit={handleSubmitOrder}>
      <button className="checkout-back-btn" type="button" onClick={() => setStep(3)}>
        <ChevronLeft size={16} /> Back to payment
      </button>
      <h2 className="checkout-card-title" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Review &amp; confirm
      </h2>

      {/* Summary rows */}
      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".65rem 1.5rem", fontSize: ".84rem" }}>
          <div><span style={{ color: "var(--text-muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 2 }}>Name</span><strong>{formData.fullName}</strong></div>
          <div><span style={{ color: "var(--text-muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 2 }}>Phone</span><strong>{formData.phone}</strong></div>
          <div><span style={{ color: "var(--text-muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 2 }}>Email</span><strong>{formData.email || "—"}</strong></div>
          <div><span style={{ color: "var(--text-muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 2 }}>Country</span><strong>{formData.country}</strong></div>
          <div><span style={{ color: "var(--text-muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 2 }}>Deposit</span><strong>{depositPercent}%</strong></div>
          <div><span style={{ color: "var(--text-muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 2 }}>Payment</span><strong>{getMethodTitle(paymentMethod)}</strong></div>
        </div>
      </div>

      {/* Transaction ref if applicable */}
      {paymentMethod !== "card" && (
        <div className="checkout-card" style={{ marginBottom: "1rem" }}>
          <label className="checkout-field-label" htmlFor="co-ref">
            Transaction reference <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — enter after sending payment)</span>
          </label>
          <input
            id="co-ref"
            className="checkout-input"
            type="text"
            placeholder="e.g. TXN-123456 or transfer receipt number"
            value={formData.transactionRef}
            onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
          />
        </div>
      )}

      {/* Notes */}
      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <label className="checkout-field-label" htmlFor="co-notes">Order notes <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
        <textarea
          id="co-notes"
          className="checkout-input"
          rows={3}
          placeholder="Bat weight preference, handle type, engraving request, or anything else…"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          style={{ minHeight: 80, resize: "vertical" }}
        />
      </div>

      {/* Totals */}
      <div className="checkout-card" style={{ marginBottom: "1rem" }}>
        <div className="order-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
        <div className="order-summary-line"><span>Delivery ({formData.country})</span><strong>{formatPrice(shippingCalc.shippingFee)}</strong></div>
        <div className="order-summary-divider" />
        <div className="order-total-line"><span className="label">Order total</span><span className="value">{formatPrice(grandTotal)}</span></div>
        <div className="order-pay-today-line">
          <span className="label">Pay today ({depositPercent}% deposit)</span>
          <span className="value">{formatPrice(depositDueNow)}</span>
        </div>
        <div className="order-balance-line">
          <span>Balance before dispatch</span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatPrice(balanceRemaining)}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="checkout-error" role="alert">{errorMessage}</div>
      )}

      <button
        type="submit"
        className="checkout-primary-cta"
        disabled={isSubmitting}
        style={{ pointerEvents: isSubmitting ? "none" : "auto", opacity: isSubmitting ? .7 : 1 }}
      >
        {isSubmitting ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing…</> : <><Lock size={15} /> Place Order — Pay {formatPrice(depositDueNow)} today</>}
      </button>

      <a
        className="checkout-secondary-cta"
        href={whatsappUrl(cartMessage)}
        target="_blank"
        rel="noreferrer"
        style={{ marginTop: ".6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}
      >
        💬 Complete order via WhatsApp instead
      </a>

      <div className="checkout-trust-note">
        <Lock size={12} /> Secure checkout · Factory direct · No hidden fees
      </div>
    </form>
  );

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <main style={{ background: "var(--surface-alt)", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Slim checkout header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: ".85rem clamp(1rem, 4vw, 4rem)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="Sialkot Cricket Kits" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <strong style={{ fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--text-primary)" }}>
              Sialkot Cricket Kits
            </strong>
          </Link>
          <span style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".74rem", color: "var(--text-muted)" }}>
            <Lock size={13} /> Secure checkout
          </span>
        </div>
      </div>

      <div className="checkout-page-container">
        <StepIndicator />

        <div className="checkout-form-grid">
          {/* Left: step content */}
          <div>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
          </div>

          {/* Right: order summary sidebar */}
          <div className="checkout-summary-sticky">
            <OrderSummary />

            {/* Delivery estimate */}
            <div className="checkout-card" style={{ fontSize: ".82rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".5rem" }}>
                <Truck size={15} style={{ color: "var(--gold)" }} />
                <strong style={{ color: "var(--text-primary)", fontSize: ".88rem" }}>Delivery</strong>
              </div>
              <div style={{ marginBottom: ".25rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>{formData.country}</strong>
              </div>
              <div>{shippingCalc.destination.estimatedDelivery}</div>
              <div style={{ marginTop: ".3rem", fontSize: ".74rem", color: "var(--text-muted)" }}>
                Tracked DHL / FedEx express courier
              </div>
            </div>

            {/* WhatsApp support */}
            <a
              href={whatsappUrl("Hello Sialkot Cricket Kits, I need help completing my checkout order.")}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: ".5rem",
                padding: ".7rem .9rem", background: "#e8f7ef",
                border: "1px solid rgba(22,139,82,.2)", borderRadius: 8,
                fontSize: ".78rem", fontWeight: 700, color: "#0d5e38",
                textDecoration: "none",
              }}
            >
              💬 Need help? Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
