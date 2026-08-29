"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ShoppingBag, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Application Error Caught]:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#09101d",
        color: "#ffffff",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(242, 169, 40, 0.15)",
            color: "#f2a928",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h1 style={{ fontSize: "1.4rem", margin: "0 0 8px", fontWeight: 800, color: "#ffffff" }}>
          Temporary Connection Glitch
        </h1>

        <p style={{ color: "#94a3b8", fontSize: ".9rem", lineHeight: 1.6, margin: "0 0 24px" }}>
          We encountered a temporary issue while updating this section. Your cart items and order selections are safely preserved.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              width: "100%",
              padding: "12px 20px",
              background: "#f2a928",
              color: "#0f172a",
              border: "none",
              borderRadius: 8,
              fontSize: ".92rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <RefreshCw size={16} /> Recover Checkout Page
          </button>

          <Link
            href="/shop"
            style={{
              width: "100%",
              padding: "12px 20px",
              background: "#1e293b",
              color: "#ffffff",
              border: "1px solid #334155",
              borderRadius: 8,
              fontSize: ".92rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxSizing: "border-box",
            }}
          >
            <ShoppingBag size={16} /> View Equipment Catalogue
          </Link>

          <Link
            href="/"
            style={{
              color: "#64748b",
              fontSize: ".82rem",
              textDecoration: "underline",
              marginTop: 6,
              display: "inline-block",
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
