"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  HelpCircle,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { AdminFeedbackProvider } from "@/src/components/AdminFeedbackContext";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const isLoginPage = pathname === "/admin" || pathname === "/admin/";

  useEffect(() => {
    if (!isLoginPage) {
      // Check auth status
      fetch("/api/admin/auth/check")
        .then((res) => res.json())
        .then((data) => {
          if (!data.authenticated) {
            router.push("/admin");
          }
        })
        .catch(() => router.push("/admin"));

      // Fetch stats for unread badge
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setUnreadCount(res.data.unreadEnquiries || 0);
          }
        })
        .catch(() => {});
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  if (isLoginPage) {
    return (
      <AdminFeedbackProvider>
        <div className="admin-body">{children}</div>
      </AdminFeedbackProvider>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
    {
      label: "Enquiries",
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
            <img src="/assets/brand/sialkot-cricket-kits-logo.png" alt="Sialkot Cricket Kits" />
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
      </div>
    </AdminFeedbackProvider>
  );
}
