"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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
  Globe,
} from "lucide-react";
import { products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { calculateShippingFee, SHIPPING_DESTINATIONS, getCountryFlag } from "@/src/lib/shipping";
import { ALL_COUNTRIES } from "@/src/lib/countries";
import {
  CURRENCIES,
  CurrencyConfig,
  DEFAULT_CURRENCY,
  convertGbpToCurrency,
  detectCurrencyFromTimezone,
  formatCurrencyPrice,
  COUNTRY_TO_CURRENCY_MAP,
} from "@/src/lib/currency";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type AddedItemInfo = {
  productId: string;
  name: string;
  image: string;
  price: number;
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
  lastAddedItem: AddedItemInfo | null;
  clearLastAddedItem: () => void;
  currency: string;
  setCurrency: (code: string) => void;
  currencyConfig: CurrencyConfig;
  currencies: typeof CURRENCIES;
  formatPrice: (amountInGbp: number, showGbpSubtext?: boolean) => string;
  convertPrice: (amountInGbp: number) => number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = "sialkot-cricket-kits:cart";
const FAVOURITES_STORAGE_KEY = "sialkot-cricket-kits:favourites";
const CURRENCY_STORAGE_KEY = "sialkot-cricket-kits:currency";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<AddedItemInfo | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const pathname = usePathname();

  // Automatically ensure Cart Drawer is closed when user navigates to checkout pages
  useEffect(() => {
    if (pathname && pathname.startsWith("/checkout")) {
      setCartOpen(false);
    }
  }, [pathname]);

  // Initialize and auto-detect visitor currency
  useEffect(() => {
    try {
      // Safe migration: sanitize any legacy obsolete personal/test values in storage
      try {
        [CART_STORAGE_KEY, FAVOURITES_STORAGE_KEY, CURRENCY_STORAGE_KEY].forEach((k) => {
          const val = window.localStorage.getItem(k);
          if (val && typeof val === "string") {
            const lower = val.toLowerCase();
            if (
              lower.includes("awami") ||
              lower.includes("waziristan") ||
              lower.includes("alyankhan") ||
              lower.includes("03449832129")
            ) {
              const sanitized = val
                .replace(/AWAMI KUTHAB KHANA[^",]*/gi, "House No. 207, Gulshan Street, Model Town")
                .replace(/SOUTH WAZIRISTAN[^",]*/gi, "Sialkot")
                .replace(/alyankhan1078@gmail\.com/gi, "sialkotcricketkits@gmail.com")
                .replace(/\+?92\s*344\s*9832129/gi, "+92 323 1438214")
                .replace(/\+?92\s*349\s*9585519/gi, "+92 323 1438214")
                .replace(/\+?92\s*327\s*5756188/gi, "+92 323 1438214");
              window.localStorage.setItem(k, sanitized);
            }
          }
        });
      } catch {}

      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedFavs = window.localStorage.getItem(FAVOURITES_STORAGE_KEY);
      if (savedFavs) {
        setFavourites(JSON.parse(savedFavs));
      }

      // Check if user previously selected a currency
      const savedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency && CURRENCIES[savedCurrency]) {
        setCurrencyState(savedCurrency);
      } else {
        // Fast client-side timezone detection (e.g. Asia/Karachi -> PKR, US -> USD)
        const detectedTz = detectCurrencyFromTimezone();
        setCurrencyState(detectedTz);

        // Background server-side Geo IP detection for maximum accuracy
        fetch("/api/geo")
          .then((res) => res.json())
          .then((data) => {
            if (data?.currency && CURRENCIES[data.currency]) {
              const currentSaved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
              if (!currentSaved) {
                setCurrencyState(data.currency);
              }
            }
          })
          .catch(() => {});
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

  const setCurrency = useCallback((newCurrency: string) => {
    if (CURRENCIES[newCurrency]) {
      setCurrencyState(newCurrency);
      try {
        window.localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
      } catch {}
    }
  }, []);

  const formatPrice = useCallback(
    (amountInGbp: number, showGbpSubtext: boolean = false) => {
      return formatCurrencyPrice(amountInGbp, currency, { showGbpSubtext });
    },
    [currency]
  );

  const convertPrice = useCallback(
    (amountInGbp: number) => {
      return convertGbpToCurrency(amountInGbp, currency);
    },
    [currency]
  );

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.GBP;

  const toggleFavourite = (productId: string) => {
    setFavourites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const addToCart = (productId: string, quantity = 1) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setLastAddedItem({
        productId: prod.id,
        name: prod.name,
        image: prod.image,
        price: prod.price,
        quantity,
      });
    }

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

  const clearLastAddedItem = () => {
    setLastAddedItem(null);
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
    setLastAddedItem(null);
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
        lastAddedItem,
        clearLastAddedItem,
        currency,
        setCurrency,
        currencyConfig,
        currencies: CURRENCIES,
        formatPrice,
        convertPrice,
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
  const {
    cart,
    addToCart,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    lastAddedItem,
    clearLastAddedItem,
    currency,
    setCurrency,
    formatPrice,
  } = useStore();

  const [addedSuggestionId, setAddedSuggestionId] = useState<string | null>(null);

  const lines = cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const totalItemCount = lines.reduce((total, item) => total + item.quantity, 0);

  // Intelligent complementary product suggestion logic based on cart contents
  const hasBat = lines.some((l) => l.product.category.includes("Bat") && !l.product.category.includes("Pad") && !l.product.category.includes("Glove"));
  const hasGloves = lines.some((l) => l.product.category.includes("Glove"));
  const hasPads = lines.some((l) => l.product.category.includes("Pad"));
  const hasBag = lines.some((l) => l.product.category.includes("Bag"));
  const hasHelmet = lines.some((l) => l.product.category.includes("Helmet"));

  const targetCategories: string[] = [];
  if (hasBat) {
    if (!hasGloves) targetCategories.push("Batting Gloves");
    if (!hasPads) targetCategories.push("Batting Pads");
    if (!hasHelmet) targetCategories.push("Helmets");
    if (!hasBag) targetCategories.push("Kit & Duffle Bags");
    targetCategories.push("Other Accessories");
  } else if (hasGloves || hasPads) {
    if (!hasBat) targetCategories.push("Beauty Processed Bats", "Bonafide Bats");
    if (!hasGloves) targetCategories.push("Batting Gloves");
    if (!hasPads) targetCategories.push("Batting Pads");
    if (!hasHelmet) targetCategories.push("Helmets");
    if (!hasBag) targetCategories.push("Kit & Duffle Bags");
  } else if (hasBag || hasHelmet) {
    targetCategories.push("Beauty Processed Bats", "Batting Gloves", "Batting Pads", "Other Accessories");
  } else {
    targetCategories.push("Batting Gloves", "Batting Pads", "Beauty Processed Bats", "Other Accessories", "Kit & Duffle Bags");
  }

  // Pick top complementary products not already in the customer's cart, prioritizing Batting Gloves first
  const candidateProducts = products.filter(
    (p) =>
      targetCategories.includes(p.category) &&
      !cart.some((ci) => ci.productId === p.id)
  );

  // Strictly sort candidates according to targetCategories priority (Batting Gloves first, then Pads, Helmets, Bags)
  candidateProducts.sort((a, b) => {
    const rankA = targetCategories.indexOf(a.category);
    const rankB = targetCategories.indexOf(b.category);
    const priorityA = rankA === -1 ? 999 : rankA;
    const priorityB = rankB === -1 ? 999 : rankB;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // Within the same category, featured products come first
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const suggestedProducts = candidateProducts.slice(0, 8);

  const handleAddSuggested = (productId: string) => {
    addToCart(productId, 1);
    setAddedSuggestionId(productId);
    setTimeout(() => setAddedSuggestionId(null), 1800);
  };

  return (
    <div className={`cart-layer${isCartOpen ? " is-open" : ""}`} aria-hidden={!isCartOpen}>
      <button
        className="cart-backdrop"
        aria-label="Close cart"
        onClick={() => {
          setCartOpen(false);
          clearLastAddedItem();
        }}
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#ffffff" }}
      >
        {/* Header */}
        <div className="cart-drawer-head" style={{ flexShrink: 0, padding: "14px 18px", borderBottom: "1px solid #e2e8f0", background: "#ffffff" }}>
          <div>
            <span className="mini-label" style={{ color: "#b45309", fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", display: "block" }}>
              YOUR BASKET
            </span>
            <h2 id="cart-title" style={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", margin: "2px 0 0" }}>
              Cart {totalItemCount > 0 && <span style={{ fontSize: ".92rem", fontWeight: 600, color: "#64748b" }}>({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="cart-currency-select"
              aria-label="Change currency"
              title="Select Currency"
              style={{
                fontSize: ".76rem",
                fontWeight: 700,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "4px 6px",
                color: "#0f172a",
                cursor: "pointer",
              }}
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <button
              className="icon-button"
              onClick={() => {
                setCartOpen(false);
                clearLastAddedItem();
              }}
              aria-label="Close cart"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#0f172a",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {lines.length === 0 ? (
          <div className="empty-cart" style={{ display: "grid", placeItems: "center", alignContent: "center", flex: 1, padding: "2.5rem 1.5rem", textAlign: "center", color: "#0f172a" }}>
            <ShoppingBag size={42} color="#b45309" strokeWidth={1.5} />
            <h3 style={{ margin: "1rem 0 .5rem", textTransform: "uppercase", fontSize: "1.15rem", fontWeight: 800 }}>Your cart is empty</h3>
            <p style={{ maxWidth: 300, color: "#64748b", fontSize: ".86rem", lineHeight: 1.5, margin: "0 auto 1.25rem" }}>
              Explore our handcrafted cricket bats, pads, gloves, and protective equipment.
            </p>
            <Link
              className="button primary compact"
              href="/shop"
              onClick={() => setCartOpen(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
                color: "#000000",
                fontWeight: 800,
                padding: "10px 20px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: ".84rem",
              }}
            >
              Explore Equipment
            </Link>
          </div>
        ) : (
          <>
            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
              {/* Just Added Confirmation Hero Box */}
              {lastAddedItem && (
                <div
                  className="cart-just-added-box"
                  style={{
                    marginBottom: 12,
                    padding: "10px 12px",
                    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                    border: "1.5px solid #86efac",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".76rem", fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: ".04em" }}>
                      <span style={{ display: "inline-grid", placeItems: "center", width: 18, height: 18, background: "#16a34a", color: "#ffffff", borderRadius: "50%", fontSize: ".68rem", fontWeight: 900 }}>
                        ✓
                      </span>
                      <span>Added to your cart!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCartOpen(false);
                        clearLastAddedItem();
                      }}
                      style={{
                        background: "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 999,
                        padding: "3px 10px",
                        fontSize: ".68rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      ← Keep Shopping
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#ffffff", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(134, 239, 172, 0.6)" }}>
                    <img src={lastAddedItem.image} alt={lastAddedItem.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", border: "1px solid #e2e8f0" }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ fontSize: ".82rem", color: "#0f172a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lastAddedItem.name}
                      </strong>
                      <div style={{ fontSize: ".74rem", color: "#64748b", marginTop: 2, display: "flex", gap: 6 }}>
                        <span>Qty: {lastAddedItem.quantity}</span>
                        <span>·</span>
                        <span style={{ color: "#b45309", fontWeight: 700 }}>{formatPrice(lastAddedItem.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TOP ACTION: + ADD MORE PRODUCTS / CONTINUE SHOPPING ── */}
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  clearLastAddedItem();
                }}
                className="cart-top-add-more-btn"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#f8fafc",
                  border: "1.5px dashed #cbd5e1",
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: ".82rem",
                  padding: "10px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 14,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  transition: "all .15s ease",
                }}
              >
                <Plus size={15} color="#b45309" strokeWidth={2.5} />
                <span>＋ Add More Products</span>
              </button>

              {/* Cart Items List */}
              <div className="cart-lines" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lines.map(({ product, quantity }) => (
                  <article
                    className="cart-line"
                    key={product.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 12px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #cbd5e1", background: "#ffffff" }}
                    />
                    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <strong style={{ fontSize: ".86rem", color: "#0f172a", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {product.name}
                      </strong>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
                        <span style={{ color: "#b45309", fontWeight: 800, fontSize: ".86rem" }}>
                          {formatPrice(product.price)}
                        </span>
                        <div
                          className="quantity-control"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            background: "#ffffff",
                            overflow: "hidden",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            aria-label={`Reduce ${product.name} quantity`}
                            style={{ width: 26, height: 26, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "#475569" }}
                          >
                            <Minus size={11} />
                          </button>
                          <span style={{ padding: "0 8px", fontSize: ".82rem", fontWeight: 800, color: "#0f172a", minWidth: 20, textAlign: "center" }}>
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            aria-label={`Increase ${product.name} quantity`}
                            style={{ width: 26, height: 26, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "#475569" }}
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => removeFromCart(product.id)}
                      aria-label={`Remove ${product.name}`}
                      style={{
                        padding: 6,
                        color: "#94a3b8",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 6,
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))}
              </div>

              {/* ── INTELLIGENT COMPLEMENTARY CROSS-SELL: YOU MAY ALSO ADD ── */}
              {suggestedProducts.length > 0 && (
                <div
                  className="cart-cross-sell-section"
                  style={{
                    marginTop: 18,
                    padding: "14px 12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: ".9rem" }}>🏏</span>
                      <span style={{ fontSize: ".76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "#0f172a" }}>
                        You May Also Add
                      </span>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setCartOpen(false)}
                      style={{ fontSize: ".72rem", color: "#b45309", fontWeight: 700, textDecoration: "none" }}
                    >
                      View All (140+) →
                    </Link>
                  </div>

                  {/* Horizontal Scrollable Compact Cards */}
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      overflowX: "auto",
                      paddingBottom: 4,
                      WebkitOverflowScrolling: "touch",
                      scrollbarWidth: "none",
                    }}
                  >
                    {suggestedProducts.map((p) => {
                      const isJustAdded = addedSuggestionId === p.id;
                      return (
                        <div
                          key={p.id}
                          style={{
                            flex: "0 0 130px",
                            background: "#ffffff",
                            border: isJustAdded ? "1.5px solid #22c55e" : "1px solid #cbd5e1",
                            borderRadius: 10,
                            padding: "8px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                            transition: "all .18s ease",
                          }}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: "100%",
                              height: 80,
                              borderRadius: 6,
                              objectFit: "cover",
                              background: "#f1f5f9",
                              marginBottom: 6,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <strong
                              style={{
                                fontSize: ".74rem",
                                color: "#0f172a",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.25,
                                height: "2.5em",
                                marginBottom: 4,
                              }}
                            >
                              {p.name}
                            </strong>
                            <span style={{ fontSize: ".76rem", color: "#b45309", fontWeight: 800, display: "block" }}>
                              {formatPrice(p.price)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggested(p.id)}
                            style={{
                              marginTop: 8,
                              width: "100%",
                              padding: "5px 0",
                              borderRadius: 6,
                              border: "none",
                              background: isJustAdded ? "#22c55e" : "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
                              color: isJustAdded ? "#ffffff" : "#000000",
                              fontSize: ".74rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                              transition: "all .15s ease",
                            }}
                          >
                            {isJustAdded ? (
                              <>
                                <span>✓</span> Added
                              </>
                            ) : (
                              <>
                                <Plus size={12} strokeWidth={2.5} /> Add
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── STICKY SUMMARY + CHECKOUT CTA ── */}
            <div
              className="cart-summary"
              style={{
                padding: "14px 18px 18px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 -4px 16px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".88rem", fontWeight: 700, color: "#64748b" }}>Order Subtotal</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".76rem", color: "#64748b" }}>
                <span>Shipping</span>
                <span style={{ fontStyle: "italic", color: "#0284c7", fontWeight: 600 }}>
                  Calculated at checkout
                </span>
              </div>

              {/* Action Buttons: Continue Shopping & Proceed to Checkout */}
              <div className="cart-action-buttons-group" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* 1. Continue Shopping / Add More */}
                <button
                  type="button"
                  className="cart-continue-shopping-cta"
                  onClick={() => {
                    setCartOpen(false);
                    clearLastAddedItem();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                    minHeight: 44,
                    padding: "10px 16px",
                    background: "linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: ".84rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(2, 132, 199, 0.25)",
                    boxSizing: "border-box",
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>Continue Shopping &amp; Add More</span>
                </button>

                {/* 2. Primary Full-Width Proceed to Checkout CTA */}
                <Link
                  href="/checkout"
                  className="checkout-primary-cta"
                  onClick={() => {
                    setCartOpen(false);
                    clearLastAddedItem();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                    minHeight: 46,
                    padding: "12px 18px",
                    background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                    color: "#ffffff",
                    borderRadius: 10,
                    fontSize: ".86rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(220, 38, 38, 0.3)",
                    boxSizing: "border-box",
                  }}
                >
                  <Lock size={16} />
                  <span>Proceed to Checkout</span>
                </Link>
              </div>

              {/* Clear Cart */}
              <button
                className="text-button"
                onClick={clearCart}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: ".74rem",
                  color: "#94a3b8",
                  padding: "4px 0 0",
                  cursor: "pointer",
                  textAlign: "center",
                }}
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
