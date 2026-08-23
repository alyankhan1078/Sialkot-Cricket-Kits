"use client";

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
} from "lucide-react";
import { formatPrice, products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";

export type CartItem = {
  productId: string;
  quantity: number;
};

type PaymentMethodType = "card" | "wise" | "bank" | "pakistan" | "remitly" | "paypal";

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isStripeLoading, setStripeLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const lines = cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getPaymentMethodLabel = (method: PaymentMethodType) => {
    switch (method) {
      case "card": return "Credit / Debit Card (Stripe)";
      case "wise": return "Wise International Transfer";
      case "bank": return "Direct Bank Wire (IBAN / SWIFT)";
      case "pakistan": return "Pakistan Local (Raast / JazzCash / EasyPaisa / Bank)";
      case "remitly": return "Remitly / Western Union / MoneyGram";
      case "paypal": return "PayPal";
    }
  };

  const checkoutMessage = `Hello Sialkot Cricket Kits,\n\nI would like to order:\n\n${lines
    .map(
      (item, index) =>
        `${index + 1}. ${item.product.name}\n   Quantity: ${item.quantity}\n   Price: ${formatPrice(
          item.product.price
        )} each`
    )
    .join("\n\n")}\n\nSubtotal: ${formatPrice(
    subtotal
  )}\nPreferred Payment Method: ${getPaymentMethodLabel(selectedMethod)}\n\nPlease confirm shipping charges to my location and final payable amount. Thank you!`;

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
      setCardError("Unable to connect to card processor. You can complete your order directly on WhatsApp.");
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

                <button
                  type="button"
                  onClick={() => setSelectedMethod("paypal")}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: selectedMethod === "paypal" ? "1.5px solid var(--accent, #f59e0b)" : "1px solid #334155",
                    background: selectedMethod === "paypal" ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 41, 59, 0.5)",
                    color: selectedMethod === "paypal" ? "#fff" : "#cbd5e1",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Sparkles size={16} color={selectedMethod === "paypal" ? "var(--accent, #f59e0b)" : "#94a3b8"} />
                  <span>PayPal</span>
                </button>
              </div>

              {/* Dynamic Payment Instruction Badges */}
              {selectedMethod === "card" && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <strong style={{ color: "#4ade80", display: "block", marginBottom: 2 }}>💳 Visa, Mastercard, Apple Pay, Google Pay</strong>
                  Instant online card processing with 256-bit encryption. Click the Card Checkout button below.
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
                    <span>IBAN: <strong>PK36MEZN0001080105891234</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("PK36MEZN0001080105891234", "iban")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                    >
                      {copiedKey === "iban" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "iban" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Meezan Bank · SWIFT: <strong>MEZNPKKA</strong> · Title: Sialkot Cricket Kits</div>
                </div>
              )}

              {selectedMethod === "pakistan" && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span>Raast / JazzCash: <strong>03231438214</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("03231438214", "raast")}
                      style={{ background: "none", border: "none", color: "var(--accent, #f59e0b)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                    >
                      {copiedKey === "raast" ? <Check size={14} color="#4ade80" /> : <Copy size={14} />} {copiedKey === "raast" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Account Title: <strong>Alyan Khan / Sialkot Cricket Kits</strong> (EasyPaisa / HBL / Meezan)</div>
                </div>
              )}

              {selectedMethod === "remitly" && (
                <div style={{ background: "rgba(234, 179, 8, 0.08)", border: "1px solid rgba(234, 179, 8, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <span>Instant international payout via <strong>Remitly, Western Union, MoneyGram & TapTap Send</strong>. Beneficiary details confirmed directly on WhatsApp.</span>
                </div>
              )}

              {selectedMethod === "paypal" && (
                <div style={{ background: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.2)", padding: "10px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <span>PayPal recipient: <strong>sialkotcricketkits@gmail.com</strong>. Invoice or balance transfer option available.</span>
                </div>
              )}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p style={{ margin: "4px 0 12px" }}>Tracked worldwide express delivery (DHL / FedEx) confirmed on checkout.</p>

              {cardError && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "8px 12px", borderRadius: 8, fontSize: "0.8rem", marginBottom: 10 }}>
                  {cardError}
                </div>
              )}

              {/* Action Buttons */}
              {selectedMethod === "card" && (
                <button
                  type="button"
                  className="button primary wide"
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
                      <CreditCard size={18} /> Pay by Card / Apple Pay ({formatPrice(subtotal)})
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
                {selectedMethod === "card" ? "Or Confirm on WhatsApp" : `Confirm Order via ${getPaymentMethodLabel(selectedMethod).split("(")[0]}`}
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
