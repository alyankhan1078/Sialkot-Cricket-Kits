"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  X,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Video,
  Truck,
  CreditCard,
  Layers,
  Sparkles,
  Download,
  Flame,
  ArrowRight,
  Instagram,
  Facebook,
  PhoneCall,
  Award,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { categoryOrder } from "@/src/data/products";

// TikTok SVG Icon component
const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c.004-.004.008-.007.012-.011.05-.05.097-.102.142-.156.09-.107.172-.22.247-.338.077-.123.143-.252.199-.387.057-.14.1-.284.13-.432V9.06a8.16 8.16 0 0 0 5-1.74v-.63z" />
  </svg>
);

interface CatalogueItem {
  name: string;
  href: string;
  highlight?: string;
  isSpecial?: boolean;
}

interface CatalogueColumn {
  heading: string;
  badge: string;
  icon: string;
  items: CatalogueItem[];
}

// Category structure for Gray-Nicolls style mega menu
const catalogueColumns: CatalogueColumn[] = [
  {
    heading: "Cricket Bats",
    badge: "Master Willow",
    icon: "🏏",
    items: [
      { name: "Beauty Processed Bats", href: "/shop?category=Beauty%20Processed%20Bats", highlight: "Pro Grade 1+" },
      { name: "Bonafide Match Bats", href: "/shop?category=Bonafide%20Bats", highlight: "Contoured Spine" },
      { name: "Junior & Harrow Bats", href: "/shop?category=Junior%20%26%20Harrow%20Bats", highlight: "Sizes 4-6" },
      { name: "Custom Bat Lab", href: "/custom-bat", isSpecial: true, highlight: "Bespoke Specs" },
    ],
  },
  {
    heading: "Protective Gear",
    badge: "Test Match Grade",
    icon: "🛡️",
    items: [
      { name: "Batting Pads", href: "/shop?category=Batting%20Pads", highlight: "Featherlight Cane" },
      { name: "Batting Gloves", href: "/shop?category=Batting%20Gloves", highlight: "Split Finger" },
      { name: "Keeping Gloves", href: "/shop?category=Keeping%20Gloves" },
      { name: "Helmets", href: "/shop?category=Helmets" },
      { name: "Thigh Pads & Guards", href: "/shop?category=Thigh%20Pads" },
      { name: "Keeping Inners", href: "/shop?category=Keeping%20Inners" },
    ],
  },
  {
    heading: "Luggage & Teamwear",
    badge: "Tour Grade",
    icon: "🎒",
    items: [
      { name: "Kit & Duffle Bags", href: "/shop?category=Kit%20%26%20Duffle%20Bags", highlight: "Wheeled & Stand" },
      { name: "Teamwear & Whites", href: "/shop?category=Teamwear" },
      { name: "Waterproof Caps", href: "/shop?category=Waterproof%20Caps" },
      { name: "Cricket Accessories", href: "/shop?category=Other%20Accessories" },
    ],
  },
];

// Customer-facing nav links
const navItems = [
  ["Bespoke Bat Lab", "/custom-bat"],
  ["2026 Catalogue", "/shop"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
  ["Payment", "/payment"],
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cartCount, setCartOpen, favourites } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogueDropdownOpen, setCatalogueDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [settings, setSettings] = useState({
    whatsappNumber: "+92 323 1438214",
    contactEmail: "sialkotcricketkits@gmail.com",
    contactPhone: "+92 323 1438214",
    factoryAddress: "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
    businessName: "Sialkot Cricket Kits",
    announcementText:
      "Direct from Sialkot Master Batmakers · Worldwide Express Tracked Courier · Live Video Ping Verification",
    catalogueUrl: "/Sialkot_Cricket_Kits_Product_Catalogue_2026.pdf",
    instagramUrl: "https://www.instagram.com/sialkotcricketkits?igsi=aDBzenZrcnJjbXJi&utm_source=qr",
    facebookUrl: "https://www.facebook.com/share/1PTo3qxPAn/?mibextid=wwXIfr",
    tiktokUrl: "https://www.tiktok.com/@sialkotcricketkits",
  });
  const drawerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollYRef = useRef(0);
  const lastScrollY = useRef(0);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  // Close menu & dropdown when route changes
  useEffect(() => {
    setMenuOpen(false);
    setCatalogueDropdownOpen(false);
  }, [pathname]);

  // Click outside to close desktop catalogue dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatalogueDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setCatalogueDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setCatalogueDropdownOpen(false);
    }, 180);
  };

  // Escape key, body scroll lock, scroll-to-close
  useEffect(() => {
    if (!menuOpen) return;

    scrollYRef.current = window.scrollY;
    lastScrollY.current = window.scrollY;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      const totalDelta = Math.abs(window.scrollY - scrollYRef.current);
      if (delta > 8 || totalDelta > 40) {
        setMenuOpen(false);
      }
      lastScrollY.current = window.scrollY;
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [menuOpen]);

  // Body class for scroll lock
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
    setCatalogueDropdownOpen(false);
  };

  return (
    <>
      {/* Gray-Nicolls Style Announcement Bar */}
      <div className="announcement-bar gn-announcement" role="banner">
        <div className="gn-announcement-inner">
          <div className="gn-announcement-left">
            <span className="gn-live-dot" />
            <span>{settings.announcementText}</span>
          </div>
          <div className="gn-announcement-right">
            <a
              href={whatsappUrl("Hello Master Batmaker, I would like live advice on bat specifications.")}
              target="_blank"
              rel="noreferrer"
              className="gn-top-link"
            >
              💬 WhatsApp Consultation
            </a>
            <span className="gn-top-sep">|</span>
            <a
              href={settings.catalogueUrl || "/Sialkot_Cricket_Kits_Product_Catalogue_2026.pdf"}
              download
              className="gn-top-link"
            >
              📄 2026 PDF Catalogue
            </a>
          </div>
        </div>
      </div>

      {/* Gray-Nicolls Style Master Header */}
      <header className="site-header gn-header">
        <Link className="brand-lockup gn-brand-lockup" href="/" aria-label="Sialkot Cricket Kits home">
          <img
            src="/assets/brand/sialkot-cricket-kits-logo.png"
            alt="Sialkot Cricket Kits"
            className="gn-brand-logo"
            width={48}
            height={48}
          />
          <div className="gn-brand-text">
            <span className="gn-brand-title">SIALKOT CRICKET KITS</span>
            <span className="gn-brand-subtitle">MASTER BATMAKERS · EST. SIALKOT</span>
          </div>
        </Link>

        {/* Desktop Navigation with Gray-Nicolls Mega Menu */}
        <nav className="desktop-nav gn-desktop-nav" aria-label="Main navigation">
          {/* 1. Bats Mega Menu Trigger */}
          <div
            className="nav-catalogue-wrapper"
            ref={dropdownRef}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              type="button"
              className={`nav-catalogue-btn gn-nav-item ${catalogueDropdownOpen ? "is-open" : ""}`}
              onClick={() => setCatalogueDropdownOpen((prev) => !prev)}
              aria-expanded={catalogueDropdownOpen}
              aria-haspopup="true"
              aria-label="Equipment Catalogue Ranges Menu"
            >
              <span>EQUIPMENT RANGES</span>
              <ChevronDown
                size={12}
                className={`nav-cat-chevron ${catalogueDropdownOpen ? "rotate" : ""}`}
              />
            </button>

            {/* Gray-Nicolls Style Mega Dropdown Panel */}
            <div className={`nav-catalogue-megamenu gn-megamenu ${catalogueDropdownOpen ? "is-active" : ""}`}>
              <div className="megamenu-inner">
                <div className="megamenu-header-strip">
                  <div className="megamenu-header-left">
                    <span className="megamenu-badge">2026 SEASON</span>
                    <span className="megamenu-header-title">The Complete Match-Grade Equipment Catalogue</span>
                  </div>
                  <Link
                    href="/shop"
                    className="megamenu-header-all"
                    onClick={handleNavClick}
                  >
                    <span>View All 140+ Items</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="megamenu-columns">
                  {catalogueColumns.map((col) => (
                    <div key={col.heading} className="megamenu-col">
                      <div className="megamenu-col-header">
                        <span className="megamenu-col-icon">{col.icon}</span>
                        <div>
                          <strong className="megamenu-col-title">{col.heading}</strong>
                          <span className="megamenu-col-badge">{col.badge}</span>
                        </div>
                      </div>
                      <ul className="megamenu-list">
                        {col.items.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={`megamenu-link ${item.isSpecial ? "special" : ""}`}
                              onClick={handleNavClick}
                            >
                              <span>{item.name}</span>
                              {item.highlight && (
                                <span className={`megamenu-item-pill ${item.isSpecial ? "gold" : ""}`}>
                                  {item.highlight}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Mega-menu Spotlight Footer Cards */}
                <div className="megamenu-footer-strip">
                  <Link
                    href="/custom-bat"
                    className="megamenu-footer-card highlight"
                    onClick={handleNavClick}
                  >
                    <Sparkles size={18} className="gold-icon" />
                    <div>
                      <strong>Bespoke Custom Bat Lab</strong>
                      <span>Pick raw cleft, profile, handle shape &amp; laser engraving</span>
                    </div>
                    <ChevronRight size={16} style={{ marginLeft: "auto", opacity: 0.7 }} />
                  </Link>
                  <a
                    href={settings.catalogueUrl || "/Sialkot_Cricket_Kits_Product_Catalogue_2026.pdf"}
                    download
                    className="megamenu-footer-card"
                  >
                    <Download size={18} className="gold-icon" />
                    <div>
                      <strong>Download 2026 PDF Catalogue</strong>
                      <span>Full wholesale &amp; retail price breakdown in GBP</span>
                    </div>
                    <ChevronRight size={16} style={{ marginLeft: "auto", opacity: 0.7 }} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <Link href="/shop" className="gn-nav-item">
            ALL PRODUCTS
          </Link>
          <Link href="/custom-bat" className="gn-nav-item gn-nav-highlight">
            CUSTOM BAT LAB
          </Link>
          <Link href="/about" className="gn-nav-item">
            ABOUT &amp; HERITAGE
          </Link>
          <Link href="/contact" className="gn-nav-item">
            CONTACT
          </Link>
        </nav>

        {/* Gray-Nicolls Header Action Suite */}
        <div className="header-actions gn-header-actions">
          <Link
            className="header-icon gn-action-icon"
            href="/shop?focus=search"
            aria-label="Search products"
            title="Search Catalogue"
          >
            <Search size={18} />
          </Link>

          <Link
            className="header-icon gn-action-icon"
            href="/shop?filter=favourites"
            aria-label="Saved favourites"
            title="Favourites"
          >
            <Heart size={18} fill={favourites.length > 0 ? "currentColor" : "none"} />
            {favourites.length > 0 && <span className="gn-action-badge">{favourites.length}</span>}
          </Link>

          <button
            className="header-icon cart-button gn-action-icon"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? "s" : ""}` : ""}`}
            title="Shopping Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="gn-action-badge" aria-hidden="true">{cartCount}</span>}
          </button>

          <a
            className="button compact desktop-whatsapp gn-header-wa-btn"
            href={whatsappUrl(
              "Hello Sialkot Cricket Kits, I would like information about your current cricket equipment catalogue."
            )}
            target="_blank"
            rel="noreferrer"
          >
            <span>WhatsApp Us</span>
          </a>

          {/* Mobile Hamburger */}
          <button
            className="hamburger-button gn-hamburger"
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
            <div className="mobile-drawer-brand">
              <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="" width={32} height={32} />
              <strong>Menu</strong>
            </div>
            <button
              className="mobile-drawer-close"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mobile-drawer-body">
            {/* Catalogue Categories Section */}
            <div className="mobile-drawer-cat-section">
              <button
                type="button"
                className={`mobile-cat-accordion-toggle ${mobileCategoriesOpen ? "is-open" : ""}`}
                onClick={() => setMobileCategoriesOpen((prev) => !prev)}
              >
                <div className="mobile-cat-header-title">
                  <Layers size={16} className="cat-icon" />
                  <span>Catalogue Categories</span>
                  <span className="mobile-cat-badge">14</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`mobile-cat-chevron ${mobileCategoriesOpen ? "rotate" : ""}`}
                />
              </button>

              {mobileCategoriesOpen && (
                <div className="mobile-cat-items-grid">
                  <Link
                    href="/shop"
                    className="mobile-cat-item-all"
                    onClick={handleNavClick}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <span>⚡ Browse All Equipment (140+)</span>
                    <ChevronRight size={14} />
                  </Link>

                  {catalogueColumns.map((col) => (
                    <div key={col.heading} className="mobile-cat-group">
                      <div className="mobile-cat-group-label">
                        <span>{col.icon}</span>
                        <span>{col.heading}</span>
                      </div>
                      {col.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="mobile-cat-item-link"
                          onClick={handleNavClick}
                          tabIndex={menuOpen ? 0 : -1}
                        >
                          <span>{item.name}</span>
                          {item.highlight ? (
                            <span className="mobile-item-tag">{item.highlight}</span>
                          ) : (
                            <ChevronRight size={13} className="faint-chevron" />
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Site Nav Links */}
            <nav
              className="mobile-drawer-nav"
              aria-label="Mobile navigation"
              onClick={handleNavClick}
            >
              <div className="mobile-nav-divider">
                <span>Site Pages</span>
              </div>
              <Link
                href="/shop"
                className={pathname === "/shop" ? "active" : ""}
                tabIndex={menuOpen ? 0 : -1}
              >
                Shop Full Collection
                <ChevronRight size={15} style={{ marginLeft: "auto", opacity: 0.4 }} />
              </Link>
              {navItems.map(([label, href]) => (
                <Link
                  href={href}
                  key={href}
                  className={pathname === href ? "active" : ""}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {label}
                  <ChevronRight size={15} style={{ marginLeft: "auto", opacity: 0.4 }} />
                </Link>
              ))}
            </nav>
          </div>

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
            <div className="mobile-drawer-socials">
              <span className="mobile-drawer-social-label">Follow &amp; Watch Live Videos:</span>
              <div className="mobile-drawer-social-icons">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mobile-soc-icon insta"
                  aria-label="Follow Sialkot Cricket Kits on Instagram"
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <Instagram size={17} />
                  <span>Instagram</span>
                </a>
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mobile-soc-icon fb"
                  aria-label="Like Sialkot Cricket Kits on Facebook"
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <Facebook size={17} />
                  <span>Facebook</span>
                </a>
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mobile-soc-icon tt"
                  aria-label="Watch Sialkot Cricket Kits on TikTok"
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <TikTokIcon size={16} />
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children}

      {/* Footer — white/light */}
      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="Sialkot Cricket Kits Logo" />
          <div>
            <strong>{settings.businessName}</strong>
            <span>Cricket equipment crafted in Sialkot</span>
          </div>
          {/* Social Media Link Badges under Brand */}
          <div className="footer-brand-socials">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="footer-soc-badge insta"
              aria-label="Instagram: @sialkotcricketkits"
              title="Instagram: @sialkotcricketkits"
            >
              <Instagram size={17} />
              <span>Instagram</span>
            </a>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="footer-soc-badge fb"
              aria-label="Facebook: Sialkot Cricket Kits"
              title="Facebook: Sialkot Cricket Kits"
            >
              <Facebook size={17} />
              <span>Facebook</span>
            </a>
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="footer-soc-badge tt"
              aria-label="TikTok: @sialkotcricketkits"
              title="TikTok: @sialkotcricketkits"
            >
              <TikTokIcon size={15} />
              <span>TikTok</span>
            </a>
          </div>
        </div>

        <div>
          <h3>Explore</h3>
          <Link href="/shop">Shop equipment</Link>
          <Link href="/custom-bat">Custom bat service</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/payment">Payment guidance</Link>
          <a href={settings.catalogueUrl || "/Sialkot_Cricket_Kits_Product_Catalogue_2026.pdf"} download>
            2026 PDF Catalogue
          </a>
        </div>

        <div>
          <h3>Follow &amp; Watch</h3>
          <p style={{ fontSize: ".76rem", color: "var(--text-muted)", marginBottom: ".25rem", lineHeight: "1.4" }}>
            Live bat ping videos, grain inspection &amp; customer dispatches:
          </p>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-text-link"
          >
            <Instagram size={14} className="social-subicon insta" />
            <span>Instagram (@sialkotcricketkits)</span>
          </a>
          <a
            href={settings.facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-text-link"
          >
            <Facebook size={14} className="social-subicon fb" />
            <span>Facebook Page</span>
          </a>
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-text-link"
          >
            <TikTokIcon size={14} />
            <span>TikTok (@sialkotcricketkits)</span>
          </a>
        </div>

        <div>
          <h3>Contact &amp; Factory</h3>
          <a href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}>{settings.contactPhone}</a>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <p style={{ whiteSpace: "pre-line" }}>{settings.factoryAddress}</p>
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
