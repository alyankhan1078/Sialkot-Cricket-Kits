"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";

export type CartItem = { productId: string; quantity: number };

type StoreContextValue = {
  cart: CartItem[];
  favourites: string[];
  cartCount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleFavourite: (productId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function validateCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is CartItem => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof (item as CartItem).productId === "string" &&
      (item as CartItem).productId.length > 0 &&
      typeof (item as CartItem).quantity === "number" &&
      Number.isInteger((item as CartItem).quantity) &&
      (item as CartItem).quantity > 0 &&
      (item as CartItem).quantity <= 999
    );
  });
}

function validateFavourites(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const rawCart = JSON.parse(localStorage.getItem("sck-cart") || "[]");
        setCart(validateCartItems(rawCart));
      } catch {
        setCart([]);
      }

      try {
        const rawFavs = JSON.parse(localStorage.getItem("sck-favourites") || "[]");
        setFavourites(validateFavourites(rawFavs));
      } catch {
        setFavourites([]);
      }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("sck-cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("sck-favourites", JSON.stringify(favourites));
  }, [favourites, hydrated]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", isCartOpen);
    return () => document.body.classList.remove("drawer-open");
  }, [isCartOpen]);

  const value = useMemo<StoreContextValue>(() => ({
    cart,
    favourites,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    isCartOpen,
    setCartOpen,
    addToCart(productId, quantity = 1) {
      if (!productId || quantity <= 0) return;
      setCart((current) => {
        const existing = current.find((item) => item.productId === productId);
        return existing
          ? current.map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.min(999, item.quantity + quantity) }
                : item
            )
          : [...current, { productId, quantity: Math.min(999, quantity) }];
      });
      setCartOpen(true);
    },
    updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        setCart((current) => current.filter((item) => item.productId !== productId));
        return;
      }
      const safeQuantity = Math.min(999, Math.max(1, Math.floor(quantity)));
      setCart((current) =>
        current.map((item) =>
          item.productId === productId ? { ...item, quantity: safeQuantity } : item
        )
      );
    },
    removeFromCart(productId) {
      setCart((current) => current.filter((item) => item.productId !== productId));
    },
    clearCart() {
      setCart([]);
    },
    toggleFavourite(productId) {
      if (!productId) return;
      setFavourites((current) =>
        current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId]
      );
    },
  }), [cart, favourites, isCartOpen]);

  return (
    <StoreContext.Provider value={value}>
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
  const lines = cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = lines.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const checkoutMessage = `Hello Sialkot Cricket Kits,\n\nI would like to order:\n\n${lines
    .map(
      (item, index) =>
        `${index + 1}. ${item.product.name}\n   Quantity: ${item.quantity}\n   Price: ${formatPrice(
          item.product.price
        )} each`
    )
    .join("\n\n")}\n\nSubtotal: ${formatPrice(
    subtotal
  )}\n\nPlease confirm current stock, shipping charges and estimated delivery time. Shipping charges will be confirmed separately. Thank you.`;

  return (
    <div className={`cart-layer${isCartOpen ? " is-open" : ""}`} aria-hidden={!isCartOpen}>
      <button className="cart-backdrop" aria-label="Close cart" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer-head">
          <div>
            <span className="mini-label">Your selection</span>
            <h2 id="cart-title">Cart</h2>
          </div>
          <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>
        {lines.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={34} />
            <h3>Your cart is empty</h3>
            <p>Add equipment from the shop, then send the complete order through WhatsApp.</p>
            <button className="button primary" onClick={() => setCartOpen(false)}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map(({ product, quantity }) => (
                <article className="cart-line" key={product.id}>
                  <img src={product.image} alt="" />
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
            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p>Delivery is calculated after your destination and order are confirmed.</p>
              <a
                className="button whatsapp wide"
                href={whatsappUrl(checkoutMessage)}
                target="_blank"
                rel="noreferrer"
              >
                Checkout on WhatsApp
              </a>
              <button className="text-button" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
