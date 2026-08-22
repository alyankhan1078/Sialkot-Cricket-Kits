"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
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
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch {
      setError("Network error. Please try again.");
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
        padding: "1rem",
      }}
    >
      <div
        className="admin-card"
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: "rgba(16, 185, 129, 0.15)",
            color: "var(--adm-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <Lock size={28} />
        </div>

        <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem", color: "#fff" }}>
          Admin Authentication
        </h1>
        <p style={{ color: "var(--adm-muted)", fontSize: "0.875rem", margin: "0 0 2rem" }}>
          Enter your password to access the Sialkot Cricket Kits management dashboard.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              padding: "0.75rem",
              borderRadius: "8px",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              textAlign: "left",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="admin-input"
              placeholder="Enter admin password (default: admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem", padding: "0.8rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--adm-card-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "var(--adm-muted)",
            fontSize: "0.75rem",
          }}
        >
          <ShieldCheck size={14} color="var(--adm-primary)" />
          <span>Protected Session · Sialkot Cricket Kits</span>
        </div>
      </div>
    </div>
  );
}
