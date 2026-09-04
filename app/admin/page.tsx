"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, ArrowRight, Mail, KeyRound, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in on this device, redirect to dashboard
    fetch("/api/admin/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.push("/admin/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Authentication failed. Please check your admin credentials.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
        background: "linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #022c22 100%)",
      }}
    >
      <div
        className="admin-card"
        style={{
          maxWidth: "440px",
          width: "100%",
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.4) 100%)",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.25)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <Lock size={30} />
        </div>

        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, margin: "0 0 0.4rem", color: "#ffffff", letterSpacing: "-0.02em" }}>
          Admin Authentication
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1.75rem", lineHeight: 1.5 }}>
          Sign in with your authentic admin email and password to access the management panel.
        </p>

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
            <label htmlFor="admin-email" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
              <Mail size={14} color="#10b981" />
              <span>Authentic Admin Email</span>
            </label>
            <input
              id="admin-email"
              type="email"
              className="admin-input"
              placeholder="e.g. sialkotcricketkits@gmail.com"
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
            <label htmlFor="admin-password" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
              <KeyRound size={14} color="#10b981" />
              <span>Admin Password</span>
            </label>
            <input
              id="admin-password"
              type="password"
              className="admin-input"
              placeholder="Enter your admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
            <ArrowRight size={17} />
          </button>
        </form>

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
            <span>Device-Bound SSL Protected Session</span>
          </div>
          <span>Only authentic admin accounts are authorized to sign in</span>
        </div>
      </div>
    </div>
  );
}
