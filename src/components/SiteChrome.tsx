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
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { categoryOrder } from "@/src/data/products";

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

// Category structure for catalogue menu
const catalogueColumns: CatalogueColumn[] = [
  {
    heading: "Cricket Bats",
    badge: "Master Willow",
    icon: "🏏",
    items: [
      { name: "Beauty Processed Bats", href: "/shop?category=Beauty%20Processed%20Bats", highlight: "Pro Grade 1+" },
      { name: "Bonafide Bats", href: "/shop?category=Bonafide%20Bats", highlight: "Match Profiles" },
      { name: "Junior & Harrow Bats", href: "/shop?category=Junior%20%26%20Harrow%20Bats", highlight: "Sizes 4-6" },
      { name: "Custom Bat Lab", href: "/custom-bat", isSpecial: true, highlight: "Bespoke Specs" },
    ],
  },
  {
    heading: "Protective Gear",
    badge: "Test Grade",
    icon: "🛡️",
    items: [
      { name: "Batting Pads", href: "/shop?category=Batting%20Pads" },
      { name: "Batting Gloves", href: "/shop?category=Batting%20Gloves" },
      { name: "Keeping Gloves", href: "/shop?category=Keeping%20Gloves" },
      { name: "Helmets", href: "/shop?category=Helmets" },
      { name: "Thigh Pads", href: "/shop?category=Thigh%20Pads" },
      { name: "Keeping Inners", href: "/shop?category=Keeping%20Inners" },
      { name: "Keeping Guards", href: "/shop?category=Keeping%20Guards" },
    ],
  },
  {
    heading: "Luggage & Teamwear",
    badge: "Tournament Grade",
    icon: "🎒",
    items: [
      { name: "Kit & Duffle Bags", href: "/shop?category=Kit%20%26%20Duffle%20Bags", highlight: "Wheeled / Stand" },
      { name: "Teamwear", href: "/shop?category=Teamwear" },
      { name: "Waterproof Caps", href: "/shop?category=Waterproof%20Caps" },
      { name: "Other Accessories", href: "/shop?category=Other%20Accessories" },
    ],
  },
];

// Customer-facing nav links
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
  const [catalogueDropdownOpen, setCatalogueDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [settings, setSettings] = useState({
    whatsappNumber: "+92 323 1438214",
    contactEmail: "sialkotcricketkits@gmail.com",
    contactPhone: "+92 323 1438214",
    factoryAddress: "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
    businessName: "Sialkot Cricket Kits",
    announcementText:
      "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
    catalogueUrl: "/Sialkot_Cricket_Kits_Product_Catalogue_2026.pdf",
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
          {/* Catalogue Dropdown Trigger */}
          <div
            className="nav-catalogue-wrapper"
            ref={dropdownRef}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              type="button"
              className={`nav-catalogue-btn ${catalogueDropdownOpen ? "is-open" : ""}`}
              onClick={() => setCatalogueDropdownOpen((prev) => !prev)}
              aria-expanded={catalogueDropdownOpen}
              aria-haspopup="true"
              aria-label="Catalogue categories menu"
            >
              <span>Catalogue</span>
              <ChevronDown
                size={13}
                className={`nav-cat-chevron ${catalogueDropdownOpen ? "rotate" : ""}`}
              />
            </button>

            {/* Mega Dropdown Panel */}
            <div className={`nav-catalogue-megamenu ${catalogueDropdownOpen ? "is-active" : ""}`}>
              <div className="megamenu-inner">
                <div className="megamenu-header-strip">
                  <div className="megamenu-header-left">
                    <span className="megamenu-badge">Factory Direct</span>
                    <span className="megamenu-header-title">Official 2026 Equipment Catalogue</span>
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

                <div className="megamenu-footer-strip">
                  <Link
                    href="/custom-bat"
                    className="megamenu-footer-card"
                    onClick={handleNavClick}
                  >
                    <Sparkles size={16} className="gold-icon" />
                    <div>
                      <strong>Custom Bat Workshop</strong>
                      <span>Hand-carved to your exact match specs &amp; grains</span>
                    </div>
                  </Link>
                  <a
                    href={settings.catalogueUrl || "/Sialkot_Cricket_Kits_Product_Catalogue_2026.pdf"}
                    download
                    className="megamenu-footer-card"
                  >
                    <Download size={16} className="gold-icon" />
                    <div>
                      <strong>Download PDF Price Sheet</strong>
                      <span>Complete 2026 catalogue with GBP pricing</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <Link href="/shop">Shop All</Link>
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
