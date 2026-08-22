import type { Metadata } from "next";
import { ShopClient } from "@/src/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop Cricket Equipment | Sialkot Cricket Kits",
  description: "Browse current cricket bats, pads, gloves, keeping equipment, kit bags, accessories and teamwear with prices in PKR.",
};

export default function ShopPage() {
  return (
    <main className="shop-page">
      <section className="page-hero compact-hero"><div><p className="eyebrow">Official 2026 catalogue</p><h1>Shop cricket equipment.</h1><p>Search more than 100 current listings. Prices are in PKR and shipping is confirmed separately.</p></div></section>
      <section className="shop-shell"><ShopClient /></section>
    </main>
  );
}

