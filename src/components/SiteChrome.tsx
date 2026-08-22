"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X, Shield } from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { whatsappUrl } from "@/src/lib/whatsapp";

const navItems = [
  ["Shop", "/shop"],
  ["Custom Bat", "/custom-bat"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useStore();
  const [settings, setSettings] = useState({
    whatsappNumber: "+92 323 1438214",
    contactEmail: "sialkotcricketkits@gmail.com",
    contactPhone: "+92 323 1438214",
    factoryAddress: "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
    businessName: "Sialkot Cricket Kits",
    announcementText:
      "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
  });

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

  // If on admin routes, render children without consumer chrome
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="announcement-bar">
        <span>Worldwide delivery available</span>
        <span>Live product & ping videos</span>
        <span>Custom equipment from Sialkot</span>
      </div>
      <header className="site-header">
        <Link className="brand-lockup" href="/" aria-label="Sialkot Cricket Kits home">
          <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="Sialkot Cricket Kits" />
          <span>
            <strong>{settings.businessName}</strong>
            <small>Performance equipment · Sialkot</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="header-icon" href="/shop?focus=search" aria-label="Search products">
            <Search size={19} />
          </Link>
          <button
            className="header-icon cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart with ${cartCount} items`}
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
          <a
            className="button whatsapp compact desktop-whatsapp"
            href={whatsappUrl(
              "Hello Sialkot Cricket Kits, I would like information about your current cricket equipment catalogue."
            )}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <details className="mobile-menu">
            <summary aria-label="Open navigation">
              <Menu className="menu-open" size={22} />
              <X className="menu-close" size={22} />
            </summary>
            <nav aria-label="Mobile navigation">
              <Link href="/">Home</Link>
              {navItems.map(([label, href]) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
              <Link href="/payment">Payment guidance</Link>
              <Link href="/admin">Admin Panel</Link>
            </nav>
          </details>
        </div>
      </header>
      {children}
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
          <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", opacity: 0.7 }}>
            <Shield size={12} /> Admin Panel
          </Link>
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
      <a
        className="floating-whatsapp"
        href={whatsappUrl("Hello Sialkot Cricket Kits, I would like information about your products.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Sialkot Cricket Kits on WhatsApp"
      >
        WhatsApp <span>{settings.whatsappNumber}</span>
      </a>
    </>
  );
}
