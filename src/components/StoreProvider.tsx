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
  Lock,
  Truck,
} from "lucide-react";
import { formatPrice, products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { calculateShippingFee, SHIPPING_DESTINATIONS, getCountryFlag } from "@/src/lib/shipping";

export type CartItem = {
  productId: string;
  quantity: number;
};

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
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");

  const lines = cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const totalItemCount = lines.reduce((total, item) => total + item.quantity, 0);
  const shippingCalculation = calculateShippingFee(selectedCountry, totalItemCount);
  const grandTotal = subtotal + shippingCalculation.shippingFee;
  // Default deposit is 50%
  const depositDueNow = Math.round((grandTotal * 0.5) * 100) / 100;

  // WhatsApp message for the cart
  const cartMessage = `Hello Sialkot Cricket Kits,\n\nI would like to order:\n\n${lines
    .map(
      (item, index) =>
        `${index + 1}. ${item.product.name}\n   Quantity: ${item.quantity}\n   Price: ${formatPrice(item.product.price)} each`
    )
    .join("\n\n")}\n\nSubtotal: ${formatPrice(subtotal)}\nDelivery to: ${selectedCountry}\nShipping: ${formatPrice(shippingCalculation.shippingFee)}\nOrder Total: ${formatPrice(grandTotal)}\n\nPlease confirm my order. Thank you!`;

  return (
    <div className={`cart-layer${isCartOpen ? " is-open" : ""}`} aria-hidden={!isCartOpen}>
      <button
        className="cart-backdrop"
        aria-label="Close cart"
        onClick={() => setCartOpen(false)}
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="cart-drawer-head" style={{ flexShrink: 0 }}>
          <div>
            <span className="mini-label">Your basket</span>
            <h2 id="cart-title">
              Cart
              {totalItemCount > 0 && (
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)", marginLeft: ".4rem" }}>
                  ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Empty state */}
        {lines.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={36} />
            <h3>Your cart is empty</h3>
            <p>Browse our cricket equipment and add items to your cart.</p>
            <Link
              className="button primary compact"
              href="/shop"
              onClick={() => setCartOpen(false)}
            >
              Explore equipment
            </Link>
          </div>
        ) : (
          <>
            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 1.1rem" }}>
              {/* Cart items */}
              <div className="cart-lines" style={{ paddingTop: ".5rem" }}>
                {lines.map(({ product, quantity }) => (
                  <article className="cart-line" key={product.id}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }}
                    />
                    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <strong style={{ fontSize: ".86rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {product.name}
                      </strong>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <small style={{ color: "var(--red)", fontWeight: 700 }}>
                          {formatPrice(product.price)}
                        </small>
                        <div className="quantity-control" style={{ marginLeft: "auto" }}>
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            aria-label={`Reduce ${product.name} quantity`}
                          >
                            <Minus size={12} />
                          </button>
                          <span>{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => removeFromCart(product.id)}
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </article>
                ))}
              </div>

              {/* Delivery country */}
              <div style={{ marginTop: "1rem", paddingBottom: ".5rem" }}>
                <label
                  htmlFor="cart-country"
                  style={{
                    display: "block", fontSize: ".7rem", fontWeight: 700,
                    color: "var(--text-secondary)", textTransform: "uppercase",
                    letterSpacing: ".08em", marginBottom: ".4rem"
                  }}
                >
                  <Truck size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4, color: "var(--gold)" }} />
                  Delivery country
                </label>
                <select
                  id="cart-country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="delivery-country-select"
                  style={{ fontSize: ".85rem" }}
                >
                  {Object.keys(SHIPPING_DESTINATIONS).map((c) => {
                    const flag = getCountryFlag(c);
                    return (
                      <option key={c} value={c}>
                        {flag} {c}
                      </option>
                    );
                  })}
                </select>
                {/* Shipping info */}
                <div style={{
                  marginTop: ".5rem", display: "flex", justifyContent: "space-between",
                  alignItems: "center", fontSize: ".78rem", color: "var(--text-secondary)"
                }}>
                  <span>
                    Tracked courier delivery · {shippingCalculation.destination.estimatedDelivery}
                  </span>
                </div>
                {totalItemCount > 1 && (
                  <div style={{
                    marginTop: ".35rem", fontSize: ".74rem", color: "#0d5e38",
                    background: "var(--success-light)", padding: ".35rem .6rem",
                    borderRadius: 6, fontWeight: 600
                  }}>
                    Combined shipping — you save {formatPrice(shippingCalculation.totalSaved)}!
                  </div>
                )}
                {totalItemCount === 1 && (
                  <div style={{ marginTop: ".35rem", fontSize: ".74rem", color: "var(--text-muted)" }}>
                    Add another bat — saves on shipping ({formatPrice(shippingCalculation.destination.additionalItemGbp)}/extra bat)
                  </div>
                )}
              </div>
            </div>

            {/* Sticky summary + CTAs */}
            <div
              className="cart-summary"
              style={{ padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: ".45rem" }}
            >
              {/* Price breakdown */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", color: "var(--text-secondary)" }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", color: "var(--text-secondary)" }}>
                <span>Delivery ({selectedCountry})</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatPrice(shippingCalculation.shippingFee)}</span>
              </div>

              <div style={{ height: 1, background: "var(--border)", margin: ".2rem 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--text-primary)" }}>Order total</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatPrice(grandTotal)}</span>
              </div>

              {/* Pay today highlight */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: ".6rem .8rem",
                background: "var(--accent-light)",
                border: "1px solid rgba(242,169,40,.25)",
                borderRadius: 8, marginTop: ".15rem"
              }}>
                <div>
                  <div style={{ fontSize: ".76rem", color: "var(--text-secondary)", fontWeight: 600 }}>Pay today (50% deposit)</div>
                  <div style={{ fontSize: ".7rem", color: "var(--text-muted)" }}>Balance before dispatch</div>
                </div>
                <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--orange)" }}>{formatPrice(depositDueNow)}</span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="checkout-primary-cta"
                onClick={() => setCartOpen(false)}
                style={{ marginTop: ".35rem" }}
              >
                <Lock size={15} />
                Proceed to Checkout
              </Link>

              {/* WhatsApp secondary */}
              <a
                className="checkout-secondary-cta"
                href={whatsappUrl(cartMessage)}
                target="_blank"
                rel="noreferrer"
              >
                💬 Order via WhatsApp
              </a>

              {/* Clear cart — visually minimal */}
              <button
                className="text-button"
                onClick={clearCart}
                style={{ fontSize: ".72rem", color: "var(--text-muted)", paddingBlock: ".35rem" }}
              >
                Remove all items
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
