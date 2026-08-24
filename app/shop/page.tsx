import type { Metadata } from "next";
import { ShopClient } from "@/src/components/ShopClient";

export const metadata: Metadata = {
  title: "Official 2026 Catalogue | Sialkot Cricket Kits",
  description: "Browse over 100+ match-grade cricket bats, batting pads, gloves, keeping gear, kit bags, and teamwear handcrafted in Sialkot with direct worldwide tracked shipping.",
};

export default function ShopPage() {
  return (
    <main className="shop-page" style={{ background: "#0c1017", minHeight: "100vh", color: "#ffffff" }}>
      <ShopClient />
    </main>
  );
}
