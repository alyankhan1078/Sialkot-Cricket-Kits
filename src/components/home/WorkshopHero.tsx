import Link from "next/link";
import { CUSTOM_BAT_CONFIG } from "@/src/lib/custom-bat-config";
import "./workshop-hero.css";

const CUSTOM_FROM = Math.min(...CUSTOM_BAT_CONFIG.beautyProcessedTiers.map((t) => t.price));

/** Campaign-style hero banner, photographed in our Sialkot shop. */
export function WorkshopHero() {
  return (
    <section className="gh" aria-labelledby="gh-title">
      <div className="gh-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="gh-bg"
          src="/assets/hero/shop-wall-1920.webp"
          srcSet="/assets/hero/shop-wall-1100.webp 1100w, /assets/hero/shop-wall-1920.webp 1920w"
          sizes="(max-width: 1400px) 100vw, 1400px"
          alt="Rows of cricket bats and pads on the wall of our shop in Sialkot"
          fetchPriority="high"
          decoding="async"
        />
        <div className="gh-content">
          <p className="gh-brand">Sialkot Cricket Kits</p>
          <h1 id="gh-title" className="gh-title">
            Straight from <span>Sialkot</span>
          </h1>
          <span className="gh-bar" aria-hidden="true" />
          <p className="gh-sub">Bats off our wall. Sent to your crease.</p>
          <div className="gh-ctas">
            <Link href="/shop?category=Beauty%20Processed%20Bats" className="btn-red btn-lg">
              Shop bats
            </Link>
            <Link href="/custom-bat" className="btn-outline-light btn-lg">
              Custom bat from £{CUSTOM_FROM}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
