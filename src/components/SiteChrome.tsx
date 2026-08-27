"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  X,
  ChevronRight,
  ShieldCheck,
  Video,
  Truck,
  CreditCard,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { whatsappUrl } from "@/src/lib/whatsapp";

// Customer-facing nav — no Home, no Shop, no Admin Panel
const navItems = [
  ["Custom Bat", "/custom-bat"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
  ["Payment Guidance", "/payment"],
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    whatsappNumber: "+92 323 1438214",
    contactEmail: "sialkotcricketkits@gmail.com",
    contactPhone: "+92 323 1438214",
    factoryAddress: "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
    businessName: "Sialkot Cricket Kits",
    announcementText:
      "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
  });
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const lastScrollY = useRef(0);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape key, body scroll lock, scroll-to-close
  useEffect(() => {
    if (!menuOpen) return;

    // Save scroll position for restoration
    scrollYRef.current = window.scrollY;
    lastScrollY.current = window.scrollY;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    // Auto-close on genuine vertical scroll gesture
    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      // Only close if user has scrolled more than 40px from position when menu opened
      const totalDelta = Math.abs(window.scrollY - scrollYRef.current);
      if (delta > 8 || totalDelta > 40) {
        setMenuOpen(false);
      }
      lastScrollY.current = window.scrollY;
    };

    document.addEventListener("keydown", handleKeyDown);
    // Use passive scroll listener for performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [menuOpen]);

  // Body class for scroll lock — minimal approach that avoids Safari jump
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  // If on admin routes, render children without consumer chrome
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Slim announcement bar */}
      <div className="announcement-bar" role="banner">
        <span>Worldwide delivery available</span>
        <span className="announcement-bar-sep">·</span>
        <span>Live product &amp; ping videos</span>
      </div>

      {/* Header — white/light */}
      <header className="site-header">
        <Link className="brand-lockup" href="/" aria-label="Sialkot Cricket Kits home">
          <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="Sialkot Cricket Kits" />
          <span>
            <strong>{settings.businessName}</strong>
            <small>Performance equipment · Sialkot</small>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/shop">Shop</Link>
          {navItems.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Header action icons */}
        <div className="header-actions">
          <Link
            className="header-icon"
            href="/shop?focus=search"
            aria-label="Search products"
          >
            <Search size={18} />
          </Link>

          <button
            className="header-icon cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? "s" : ""}` : ""}`}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && <span aria-hidden="true">{cartCount}</span>}
          </button>

          <a
            className="button compact desktop-whatsapp"
            href={whatsappUrl(
              "Hello Sialkot Cricket Kits, I would like information about your current cricket equipment catalogue."
            )}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

          {/* Hamburger — mobile only */}
          <button
            className="hamburger-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer-nav"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer-layer${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Backdrop — tap to close */}
        <button
          className="mobile-drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
        />

        {/* Drawer panel */}
        <div
          className="mobile-drawer-panel"
          ref={drawerRef}
          id="mobile-drawer-nav"
        >
          <div className="mobile-drawer-head">
            <strong>Menu</strong>
            <button
              className="mobile-drawer-close"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <nav
            className="mobile-drawer-nav"
            aria-label="Mobile navigation"
            onClick={handleNavClick}
          >
            {navItems.map(([label, href]) => (
              <Link
                href={href}
                key={href}
                className={pathname === href ? "active" : ""}
                tabIndex={menuOpen ? 0 : -1}
              >
                {label}
                <ChevronRight size={15} style={{ marginLeft: "auto", opacity: .4 }} />
              </Link>
            ))}
          </nav>

          <div className="mobile-drawer-footer">
            <a
              className="mobile-drawer-whatsapp"
              href={whatsappUrl(
                "Hello Sialkot Cricket Kits, I would like information about your cricket equipment."
              )}
              target="_blank"
              rel="noreferrer"
              tabIndex={menuOpen ? 0 : -1}
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {children}

      {/* Footer — white/light */}
      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="" />
          <div>
            <strong>{settings.businessName}</strong>
            <span>Cricket equipment crafted in Sialkot</span>
          </div>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/shop">Shop equipment</Link>
          <Link href="/custom-bat">Custom bat service</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/payment">Payment guidance</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}>{settings.contactPhone}</a>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <p style={{ whiteSpace: "pre-line" }}>{settings.factoryAddress}</p>
        </div>
        <div>
          <h3>Order support</h3>
          <p>
            Ask for current stock, original pictures, bat specifications, live ping videos and
            international shipping charges before payment.
          </p>
          <a
            className="footer-cta"
            href={whatsappUrl("Hello Sialkot Cricket Kits, I would like to discuss an order.")}
            target="_blank"
            rel="noreferrer"
          >
            Start a WhatsApp enquiry →
          </a>
        </div>
        <p className="footer-legal">
          Prices are in British Pounds (£ / GBP), excluding delivery, and remain subject to stock and
          specification confirmation. Product names and trademarks belong to their respective owners. ©{" "}
          {new Date().getFullYear()} {settings.businessName}.
        </p>
      </footer>

      {/* Floating WhatsApp — not shown on checkout */}
      {!pathname.startsWith("/checkout") && (
        <a
          className="floating-whatsapp"
          href={whatsappUrl("Hello Sialkot Cricket Kits, I would like information about your products.")}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Sialkot Cricket Kits on WhatsApp"
        >
          WhatsApp <span>{settings.whatsappNumber}</span>
        </a>
      )}
    </>
  );
}
