import type { Metadata } from "next";
import { ShopClient } from "@/src/components/ShopClient";
import { ShieldCheck, Truck, Video, Award, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Official 2026 Catalogue | Sialkot Cricket Kits",
  description: "Browse over 100+ match-grade cricket bats, batting pads, gloves, keeping gear, kit bags, and teamwear handcrafted in Sialkot with direct worldwide tracked shipping.",
};

export default function ShopPage() {
  return (
    <main className="shop-page" style={{ background: "#0c1017", minHeight: "100vh", color: "#ffffff" }}>
      {/* Executive Hero Cover Showcase */}
      <section
        style={{
          position: "relative",
          minHeight: "420px",
          background: "linear-gradient(90deg, rgba(12,16,23,0.96) 0%, rgba(12,16,23,0.85) 45%, rgba(12,16,23,0.4) 100%), url('/images/shop-catalogue-cover.jpg') center/cover no-repeat",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          padding: "50px 24px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", zIndex: 2 }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(242, 169, 40, 0.15)", border: "1px solid rgba(242, 169, 40, 0.4)", padding: "6px 14px", borderRadius: 999, marginBottom: 16 }}>
              <Sparkles size={15} color="#f2a928" />
              <span style={{ color: "#f2a928", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Official 2026 Factory Catalogue
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, margin: "0 0 14px", color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.15, textTransform: "uppercase" }}>
              Shop Cricket Equipment.
            </h1>

            <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 640 }}>
              Search 100+ championship match-grade articles handcrafted directly in Sialkot, Pakistan. Direct express tracked courier dispatch to UK, USA, Australia, New Zealand, Europe &amp; Pakistan.
            </p>

            {/* 4 Feature Trust Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.06)", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "8px 14px", borderRadius: 10, fontSize: "0.82rem", color: "#f8fafc" }}>
                <Award size={16} color="#f2a928" />
                <span>Grade 1+ English Willow</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.06)", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "8px 14px", borderRadius: 10, fontSize: "0.82rem", color: "#f8fafc" }}>
                <Video size={16} color="#4ade80" />
                <span>Live Video Ping Demo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.06)", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "8px 14px", borderRadius: 10, fontSize: "0.82rem", color: "#f8fafc" }}>
                <Truck size={16} color="#60a5fa" />
                <span>Tracked Express Courier</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.06)", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "8px 14px", borderRadius: 10, fontSize: "0.82rem", color: "#f8fafc" }}>
                <ShieldCheck size={16} color="#f2a928" />
                <span>Flexible 35% / 50% Deposit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalogue Section with Formal Left Sidebar & Product Grid */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 20px 60px" }}>
        <ShopClient />
      </section>
    </main>
  );
}

