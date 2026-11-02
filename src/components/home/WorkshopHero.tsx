import Link from "next/link";
import { ArrowRight, Hammer, MessageCircle, Truck, ShieldCheck } from "lucide-react";
import { CUSTOM_BAT_CONFIG } from "@/src/lib/custom-bat-config";
import "./workshop-hero.css";

type HeroProduct = { id: string; price: number; active?: boolean };

// The three bats in the hero are real photos of real bats from our workshop.
// Weights are the ones written on each pictured bat.
const HERO_BATS = [
  { id: "beauty-processed-bats-apex-pro", label: "Apex Pro", img: "apex-pro", weight: "1150 g" },
  { id: "beauty-processed-bats-special-edition", label: "Special Edition", img: "special-edition", weight: "1112 g" },
  { id: "beauty-processed-bats-vvip-bat", label: "VVIP", img: "vvip", weight: "1160 g" },
] as const;

const CUSTOM_FROM = Math.min(...CUSTOM_BAT_CONFIG.beautyProcessedTiers.map((t) => t.price));

export function WorkshopHero({ products }: { products: HeroProduct[] }) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const bats = HERO_BATS.map((b) => ({ ...b, product: byId.get(b.id) })).filter((b) => b.product && b.product.active !== false);

  return (
    <>
      <section className="wh" aria-labelledby="wh-title">
        <div className="wh-inner">
          <div className="wh-copy">
            <p className="wh-eyebrow">Workshop direct · Sialkot, Pakistan</p>
            <h1 id="wh-title" className="wh-title">
              Cricket bats, <span>hand&#8209;made in Sialkot.</span>
            </h1>
            <p className="wh-lede">
              Bonafide and beauty-processed willow bats, plus custom bats built to your size, weight and handle. Ask for a
              ping video of your bat on WhatsApp before it ships.
            </p>
            <div className="wh-ctas">
              <Link href="/shop?category=Beauty%20Processed%20Bats" className="wh-btn wh-btn-primary">
                Shop bats <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/custom-bat" className="wh-btn wh-btn-ghost">
                Build a custom bat <span className="wh-from">from £{CUSTOM_FROM}</span>
              </Link>
            </div>
          </div>

          {bats.length > 0 && (
            <div className="wh-bats" aria-label="Bats from the workshop">
              {bats.map((b, i) => (
                <Link key={b.id} href={`/product/${b.id}`} className={`wh-bat ${i === 1 ? "wh-bat-mid" : ""}`}>
                  <span className="wh-bat-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/assets/hero/bats/${b.img}-520.webp`}
                      srcSet={`/assets/hero/bats/${b.img}-280.webp 280w, /assets/hero/bats/${b.img}-520.webp 520w`}
                      sizes="(max-width: 700px) 30vw, 200px"
                      width={520}
                      height={650}
                      alt={`${b.label} cricket bat from our Sialkot workshop, pictured bat ${b.weight}`}
                      loading="eager"
                      fetchPriority={i === 1 ? "high" : "auto"}
                      decoding="async"
                    />
                  </span>
                  <span className="wh-bat-meta">
                    <strong>{b.label}</strong>
                    <span className="wh-bat-price">£{Number(b.product!.price).toLocaleString("en-GB")}</span>
                    <span className="wh-bat-weight">Pictured<span className="wh-hide-sm"> bat</span> {b.weight}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="wh-strip">
        <ul className="wh-trust" aria-label="Why buy from us">
          <li><Hammer size={18} aria-hidden="true" /> Made in our Sialkot workshop</li>
          <li><MessageCircle size={18} aria-hidden="true" /> Ping &amp; product videos on WhatsApp</li>
          <li><ShieldCheck size={18} aria-hidden="true" /> Every payment checked by our team</li>
          <li><Truck size={18} aria-hidden="true" /> Worldwide delivery · prices in GBP</li>
        </ul>
      </div>
    </>
  );
}
