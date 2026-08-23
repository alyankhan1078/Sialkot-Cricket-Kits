"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  CreditCard,
  Building2,
  Send,
  Wallet,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Globe,
  Lock,
  Truck,
} from "lucide-react";
import { formatPrice, products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { calculateShippingFee, SHIPPING_DESTINATIONS } from "@/src/lib/shipping";

export type CartItem = {
  productId: string;
  quantity: number;
};

type PaymentMethodType = "card" | "payoneer" | "wise" | "bank" | "pakistan" | "remitly";

type StoreContextValue = {
  cart: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  favourites: string[];
  toggleFavourite: (productId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = "sialkot-cricket-kits:cart";
const FAVOURITES_STORAGE_KEY = "sialkot-cricket-kits:favourites";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedFavs = window.localStorage.getItem(FAVOURITES_STORAGE_KEY);
      if (savedFavs) {
        setFavourites(JSON.parse(savedFavs));
      }
    } catch {
      // Ignore storage read errors in restricted contexts
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      window.localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(favourites));
    } catch {
      // Ignore storage write errors in restricted contexts
    }
  }, [cart, favourites, hasHydrated]);

  const toggleFavourite = (productId: string) => {
    setFavourites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const addToCart = (productId: string, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { productId, quantity }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        isCartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        favourites,
        toggleFavourite,
      }}
    >
      {children}
      <CartDrawer />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeFromCart, clearCart } = useStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("card");
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isStripeLoading, setStripeLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const lines = cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const totalItemCount = lines.reduce((total, item) => total + item.quantity, 0);
  const shippingCalculation = calculateShippingFee(selectedCountry, totalItemCount);
  const grandTotal = subtotal + shippingCalculation.shippingFee;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getPaymentMethodLabel = (method: PaymentMethodType) => {
    switch (method) {
      case "card": return "Credit / Debit Card (Stripe)";
      case "payoneer": return "Payoneer (B2B & Global Receiving)";
      case "wise": return "Wise International Transfer";
      case "bank": return "UBL Bank Wire (IBAN / SWIFT)";
      case "pakistan": return "Pakistan Local (JazzCash / Nayapay / SadaPay / Raast / EasyPaisa)";
      case "remitly": return "Remitly / Western Union / MoneyGram";
    }
  };

  const checkoutMessage = `Hello Sialkot Cricket Kits,\n\nI would like to order:\n\n${lines
    .map(
      (item, index) =>
        `${index + 1}. ${item.product.name}\n   Quantity: ${item.quantity}\n   Price: ${formatPrice(
          item.product.price
        )} each`
    )
    .join("\n\n")}\n\nItems Subtotal: ${formatPrice(
    subtotal
  )}\nDelivery Destination: ${selectedCountry}\nTracked Courier Shipping: ${formatPrice(
    shippingCalculation.shippingFee
  )}${shippingCalculation.totalSaved > 0 ? ` (Bulk Shipping Discount: Saved ${formatPrice(shippingCalculation.totalSaved)}!)` : ""}\nGrand Total: ${formatPrice(
    grandTotal
  )}\nPreferred Payment Method: ${getPaymentMethodLabel(selectedMethod)}\n\nPlease confirm order details and share live bat preparation video. Thank you!`;

  const handleStripeCheckout = async () => {
    try {
      setStripeLoading(true);
      setCardError(null);

      const res = await fetch("/api/checkout/stripe", {
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
          country: selectedCountry,
          shippingFee: shippingCalculation.shippingFee,
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        if (data.notConfigured) {
          // Open WhatsApp with card request note
          window.open(whatsappUrl(checkoutMessage + `\n(I would like to pay by Credit/Debit Card online)`), "_blank");
        } else {
          setCardError(data.error || "Card checkout could not be started.");
        }
      }
    } catch (err: any) {
      setCardError("Card checkout could not be started. Please confirm order on WhatsApp.");
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <div className={`cart-layer${isCartOpen ? " is-open" : ""}`} aria-hidden={!isCartOpen}>
      <button className="cart-backdrop" aria-label="Close cart" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer-head">
          <div>
            <span className="mini-label">Your selection</span>
            <h2 id="cart-title">Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
          </div>
          <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>
        {lines.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={34} />
            <h3>Your cart is empty</h3>
            <p>Add equipment from the shop, then select your payment method to checkout.</p>
            <button className="button primary" onClick={() => setCartOpen(false)}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map(({ product, quantity }) => (
                <article className="cart-line" key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <small>{formatPrice(product.price)}</small>
                    <div className="quantity-control">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label={`Reduce ${product.name} quantity`}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label={`Increase ${product.name} quantity`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div style={{
              margin: "12px 0",
              padding: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-color, #2a313d)",
              borderRadius: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent, #f59e0b)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Choose Payment Method
                </span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Worldwide & Local</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "card" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "card" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "card" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <CreditCard size={16} color={selectedMethod === "card" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>Card / Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("wise")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "wise" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "wise" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "wise" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Send size={16} color={selectedMethod === "wise" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>Wise Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("bank")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "bank" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "bank" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "bank" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Building2 size={16} color={selectedMethod === "bank" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>Bank Wire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("pakistan")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "pakistan" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "pakistan" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "pakistan" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Wallet size={16} color={selectedMethod === "pakistan" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>🇵🇰 Raast/Jazz</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("payoneer")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "payoneer" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "payoneer" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "payoneer" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Globe size={16} color={selectedMethod === "payoneer" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>Payoneer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("wise")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "wise" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "wise" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "wise" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Send size={16} color={selectedMethod === "wise" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>Wise Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("bank")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "bank" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "bank" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "bank" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Building2 size={16} color={selectedMethod === "bank" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>UBL Wire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("pakistan")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "pakistan" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "pakistan" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "pakistan" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Wallet size={16} color={selectedMethod === "pakistan" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>🇵🇰 PK Wallets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("remitly")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "remitly" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "remitly" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "remitly" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <ShieldCheck size={16} color={selectedMethod === "remitly" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>Remitly / WU</span>
                </button>
              </div>

              {/* Dynamic Payment Instruction Badges */}
              {selectedMethod === "card" && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <strong style={{ color: "#4ade80", display: "block", marginBottom: 2 }}>💳 Visa, Mastercard, Apple Pay, Google Pay</strong>
                  Instant online card processing with 256-bit encryption. Click Direct Checkout below.
                </div>
              )}

              {selectedMethod === "payoneer" && (
                <div style={{ background: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Payoneer: <strong>alyankhan1078@gmail.com</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("alyankhan1078@gmail.com", "payoneer")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                    >
                      {copiedKey === "payoneer" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "payoneer" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
                    Title: <strong>Alyan Wazir</strong> · Customer ID: <strong>99767685</strong> · Connected UBL Account
                  </div>
                </div>
              )}

              {selectedMethod === "wise" && (
                <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Wise Tag / Email: <strong>sialkotcricketkits@gmail.com</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("sialkotcricketkits@gmail.com", "wise")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                    >
                      {copiedKey === "wise" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "wise" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginTop: 4 }}>Fastest & lowest-fee transfer for UK, Europe, USA, Canada & Australia.</span>
                </div>
              )}

              {selectedMethod === "bank" && (
                <div style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span>IBAN: <strong>PK93UNIL0109000304929964</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("PK93UNIL0109000304929964", "iban")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                    >
                      {copiedKey === "iban" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "iban" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>UBL Bank · SWIFT: <strong>UNILPKKA</strong> · Title: <strong>ALYAN WAZIR</strong> · Branch: 0881-Wana</div>
                </div>
              )}

              {selectedMethod === "pakistan" && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span>JazzCash / Nayapay / SadaPay / Raast: <strong>03275756188</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("03275756188", "raast")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                    >
                      {copiedKey === "raast" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "raast" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 4, marginTop: 4 }}>
                    <span>EasyPaisa Account: <strong>03499585519</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("03499585519", "easypaisa")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                    >
                      {copiedKey === "easypaisa" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "easypaisa" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>Account Title: <strong>ALYAN WAZIR</strong></div>
                </div>
              )}

              {selectedMethod === "remitly" && (
                <div style={{ background: "rgba(234, 179, 8, 0.08)", border: "1px solid rgba(234, 179, 8, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <span>Instant international payout via <strong>Remitly, Western Union, MoneyGram & TapTap Send</strong> to UBL account (ALYAN WAZIR).</span>
                </div>
              )}
            </div>

            <div className="cart-summary">
              {/* Country Destination Selector */}
              <div style={{ marginBottom: 12, background: "rgba(0,0,0,0.3)", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <Truck size={14} color="var(--accent, #f59e0b)" /> Destination Country:
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{shippingCalculation.destination.estimatedDelivery.split("(")[0]}</span>
                </div>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    background: "#0f172a",
                    border: "1px solid #334155",
                    color: "#fff",
                    fontSize: "0.82rem",
                  }}
                >
                  {Object.keys(SHIPPING_DESTINATIONS).map((c) => (
                    <option key={c} value={c}>
                      {c} ({formatPrice(SHIPPING_DESTINATIONS[c].baseGbp)} base)
                    </option>
                  ))}
                </select>
              </div>

              {/* Breakdown */}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: "0.88rem", marginBottom: 4 }}>
                <span>Items Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: "0.88rem", marginBottom: 4 }}>
                <span>Tracked Courier Shipping</span>
                <strong style={{ color: "var(--accent, #f59e0b)" }}>{formatPrice(shippingCalculation.shippingFee)}</strong>
              </div>

              {shippingCalculation.totalSaved > 0 && (
                <div style={{ background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "6px 10px", borderRadius: 6, fontSize: "0.75rem", color: "#4ade80", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 4 }}>
                  <span>🎉 Multi-Bat Shipping Savings:</span>
                  <strong>Save {formatPrice(shippingCalculation.totalSaved)}!</strong>
                </div>
              )}

              {/* Grand Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border-color, #2a313d)", marginTop: 6, marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", display: "block" }}>Grand Total</span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Incl. Express Courier</span>
                </div>
                <strong style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent, #f59e0b)" }}>{formatPrice(grandTotal)}</strong>
              </div>

              {cardError && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "8px 12px", borderRadius: 8, fontSize: "0.8rem", marginBottom: 10 }}>
                  {cardError}
                </div>
              )}

              {/* Action Buttons */}
              <Link
                href="/checkout"
                className="button primary wide"
                onClick={() => setCartOpen(false)}
                style={{
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: "1rem",
                  padding: "12px 16px",
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                <Lock size={18} /> Proceed to Direct Checkout ({formatPrice(grandTotal)})
              </Link>

              {selectedMethod === "card" && (
                <button
                  type="button"
                  className="button secondary wide"
                  onClick={handleStripeCheckout}
                  disabled={isStripeLoading}
                  style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {isStripeLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Processing Card Checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} /> Direct Card Payment
                    </>
                  )}
                </button>
              )}

              <a
                className={`button whatsapp wide`}
                href={whatsappUrl(checkoutMessage)}
                target="_blank"
                rel="noreferrer"
              >
                {selectedMethod === "card" ? "Or Order on WhatsApp" : `Or Order via ${getPaymentMethodLabel(selectedMethod).split("(")[0]} on WhatsApp`}
              </a>

              <button className="text-button" onClick={clearCart} style={{ marginTop: 8 }}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
