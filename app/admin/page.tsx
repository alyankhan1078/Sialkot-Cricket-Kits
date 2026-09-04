"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  Mail,
  KeyRound,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAlreadyAuth, setIsAlreadyAuth] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if valid Supabase session already exists
    fetch("/api/admin/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setIsAlreadyAuth(true);
          setAdminUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/dashboard");
      } else {
        // Generic security response: never disclose whether email or password was wrong
        setError(data.error || "Invalid administrator credentials.");
      }
    } catch {
      setError("Unable to complete sign in. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      setIsAlreadyAuth(false);
      setAdminUser(null);
    } catch {}
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        padding: "1.5rem 1rem",
        background: "radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)",
      }}
    >
      <div
        className="admin-card"
        style={{
          maxWidth: "440px",
          width: "100%",
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)",
          borderRadius: 20,
          background: "rgba(15, 23, 42, 0.92)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.5) 100%)",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
          }}
        >
          <Lock size={30} />
        </div>

        <h1
          style={{
            fontSize: "1.55rem",
            fontWeight: 800,
            margin: "0 0 0.4rem",
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          Administrator Sign In
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1.75rem", lineHeight: 1.5 }}>
          Authorized administrator credentials are required to access management controls.
        </p>

        {isAlreadyAuth ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: 14,
              padding: "1.25rem",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={22} color="#10b981" />
              <div>
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.92rem" }}>
                  Active Administrator Session
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                  {adminUser?.email || "Authorized Administrator"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                className="admin-btn admin-btn-primary"
                style={{ flex: 1, justifyContent: "center", padding: "0.75rem" }}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="admin-btn admin-btn-secondary"
                style={{ padding: "0.75rem" }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.84rem",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  lineHeight: 1.45,
                }}
              >
                <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 2, color: "#ef4444" }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label
                  htmlFor="admin-email"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: ".82rem",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: 6,
                  }}
                >
                  <Mail size={14} color="#10b981" />
                  <span>Authorised Email Address</span>
                </label>
                <input
                  id="admin-email"
                  type="email"
                  className="admin-input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: 10,
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid #334155",
                    color: "#ffffff",
                    fontSize: ".9rem",
                  }}
                />
              </div>

              <div className="admin-form-group" style={{ margin: 0 }}>
                <label
                  htmlFor="admin-password"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: ".82rem",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: 6,
                  }}
                >
                  <KeyRound size={14} color="#10b981" />
                  <span>Admin Password</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    className="admin-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      padding: "0.75rem 2.75rem 0.75rem 1rem",
                      borderRadius: 10,
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid #334155",
                      color: "#ffffff",
                      fontSize: ".9rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 4,
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "0.5rem",
                  padding: "0.85rem",
                  fontSize: ".92rem",
                  fontWeight: 800,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                disabled={loading}
              >
                {loading ? "Verifying Credentials..." : "Sign In"}
                <ArrowRight size={17} />
              </button>
            </form>
          </>
        )}

        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.35rem",
            color: "#64748b",
            fontSize: "0.74rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontWeight: 700 }}>
            <ShieldCheck size={15} />
            <span>Supabase Auth · Role-Based Access Control</span>
          </div>
          <span>12-Hour Encrypted Session · Rate-Limited Verification</span>
        </div>
      </div>
    </div>
  );
}
