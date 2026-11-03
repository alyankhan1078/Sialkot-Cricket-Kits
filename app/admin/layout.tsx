"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  HelpCircle,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
  MoreHorizontal,
  X,
} from "lucide-react";
import { AdminFeedbackProvider } from "@/src/components/AdminFeedbackContext";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  const isLoginPage = pathname === "/admin" || pathname === "/admin/";

  useEffect(() => {
    if (!isLoginPage) {
      // Check auth status
      fetch("/api/admin/auth/check")
        .then((res) => res.json())
        .then((data) => {
          if (!data.authenticated) {
            router.replace("/admin");
          } else {
            setIsAuthVerified(true);
          }
        })
        .catch(() => router.replace("/admin"));

      // Fetch stats for unread badge
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setUnreadCount(res.data.unreadEnquiries || 0);
            setPendingPayments(res.data.pendingPaymentVerifications || 0);
          }
        })
        .catch(() => {});
    }
    // The login page renders without the auth check (see the early return below).
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin");
    }
  };

  if (isLoginPage) {
    return (
      <AdminFeedbackProvider>
        <div className="admin-body">{children}</div>
      </AdminFeedbackProvider>
    );
  }

  if (!isAuthVerified) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0b1120",
          color: "#94a3b8",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
      >
        <span>Verifying Administrator Access...</span>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      label: "Orders & Sales",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: pendingPayments > 0 ? pendingPayments : undefined,
    },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
    {
      label: "Inbox",
      href: "/admin/enquiries",
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <AdminFeedbackProvider>
      <div className="admin-body">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <img src="/assets/brand/logo-160.webp" alt="Sialkot Cricket Kits" width={40} height={40} />
            <div>
              <strong>Sialkot Cricket</strong>
              <span>Admin Control Panel</span>
            </div>
          </div>

          <nav className="admin-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link ${active ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="admin-nav-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link
              href="/"
              target="_blank"
              className="admin-nav-link"
              style={{ color: "var(--adm-muted)" }}
            >
              <ExternalLink size={16} />
              <span>View Live Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="admin-nav-link"
              style={{ background: "transparent", border: "none", cursor: "pointer", width: "100%" }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">{children}</main>

        {/* Phone navigation: a bottom tab bar replaces the sidebar */}
        <nav className="admin-mobile-nav" aria-label="Admin">
          {[
            { label: "Home", href: "/admin/dashboard", icon: LayoutDashboard, badge: 0 },
            { label: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: pendingPayments },
            { label: "Inbox", href: "/admin/enquiries", icon: Mail, badge: unreadCount },
            { label: "Products", href: "/admin/products", icon: Package, badge: 0 },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-mobile-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setMoreOpen(false)}
              >
                <span className="admin-mobile-icon">
                  <Icon size={21} aria-hidden="true" />
                  {item.badge > 0 && <span className="admin-mobile-badge">{item.badge}</span>}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className={`admin-mobile-link ${moreOpen ? "active" : ""}`}
            aria-expanded={moreOpen}
            aria-controls="admin-more-sheet"
            onClick={() => setMoreOpen((v) => !v)}
          >
            <span className="admin-mobile-icon">
              <MoreHorizontal size={21} aria-hidden="true" />
            </span>
            <span>More</span>
          </button>
        </nav>

        {moreOpen && (
          <div className="admin-more-backdrop" onClick={() => setMoreOpen(false)}>
            <div
              id="admin-more-sheet"
              className="admin-more-sheet"
              role="dialog"
              aria-label="More admin pages"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-more-head">
                <strong>More</strong>
                <button type="button" aria-label="Close" onClick={() => setMoreOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              {[
                { label: "Categories", href: "/admin/categories", icon: Layers },
                { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
                { label: "Site Settings", href: "/admin/settings", icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="admin-more-link" onClick={() => setMoreOpen(false)}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link href="/" target="_blank" className="admin-more-link" onClick={() => setMoreOpen(false)}>
                <ExternalLink size={18} aria-hidden="true" />
                <span>View live site</span>
              </Link>
              <button type="button" className="admin-more-link" onClick={handleLogout}>
                <LogOut size={18} aria-hidden="true" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminFeedbackProvider>
  );
}
