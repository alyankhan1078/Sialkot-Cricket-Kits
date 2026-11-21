import Link from "next/link";
import { Hammer, MessageCircle, ShieldCheck, Truck, Video } from "lucide-react";
import { getProducts } from "@/src/lib/data-service";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { WorkshopHero } from "@/src/components/home/WorkshopHero";
import { Rail } from "@/src/components/home/Rail";
import { categoryOrder } from "@/src/data/products";
import { CATEGORY_SEO } from "@/src/lib/category-seo";
import "./home.css";

export const metadata = {
  alternates: { canonical: "/" },
  title: { absolute: "Cricket Bats & Kit Made in Sialkot | Sialkot Cricket Kits" },
  description:
    "Cricket bats, pads, gloves and team kit from our shop in Sialkot, Pakistan. See photos and a ping video of your bat on WhatsApp before it ships. Tracked delivery worldwide.",
};

// Names of other companies' brands. We keep those products off the homepage showcase.
const OTHER_BRANDS = /gray|nicolls|kookaburra|\bgm\b|gunn|\bsg\b|\bss\b|mrf|new balance|\bdsc\b|\bca\b|masuri|shrey|adidas|nike|puma|moonwalkr|aero|\bton\b/i;

const FEATURE_ID = "beauty-processed-bats-apex-pro";

const fmt = (n: number) => `£${Number(n).toLocaleString("en-GB")}`;

export default async function HomePage() {
  const products = await getProducts();
  const live = products.filter((p) => p.active !== false && p.image);

  const bats = live
    .filter((p) => ["Beauty Processed Bats", "Bonafide Bats"].includes(p.category) && !/custom/i.test(p.id))
    .sort((a, b) => Number(a.price) - Number(b.price));

  const feature = live.find((p) => p.id === FEATURE_ID);
  const featureImages = (feature?.images?.length ? feature.images : feature ? [feature.image] : []).slice(0, 3);
  const spotlight = ["beauty-processed-bats-apex-pro", "beauty-processed-bats-special-edition", "beauty-processed-bats-vvip-bat"]
    .map((id) => live.find((p) => p.id === id))
    .filter(Boolean) as typeof live;

  const categoryTiles = categoryOrder
    .map((name) => {
      const inCat = live.filter((p) => p.category === name);
      const pick = inCat.find((p) => !OTHER_BRANDS.test(p.name)) ?? inCat[0];
      return { name, count: inCat.length, image: pick?.image, label: CATEGORY_SEO[name]?.heading ?? name };
    })
    .filter((c) => c.count > 0 && c.image);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cricket bats from Sialkot Cricket Kits",
    itemListElement: bats.slice(0, 12).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://sialkotcricketkits.com/product/${p.id}`,
      name: p.name,
    })),
  };

  return (
    <main className="world-homepage gn-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }} />

      <WorkshopHero />

      {/* Bat range rail */}
      {bats.length > 0 && (
        <section className="gn-section" aria-labelledby="bats-title">
          <div className="gn-wrap">
            <header className="gn-head">
              <h2 id="bats-title">Cricket bats</h2>
              <p>Every bat is weighed by hand and the weight is written on the blade.</p>
            </header>
            <Rail label="Cricket bats">
              {bats.map((p) => (
                <li key={p.id} className="rail-item">
                  <Link href={`/product/${p.id}`} className="gn-card gn-card-photo">
                    <span className="gn-card-img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={`${p.name} cricket bat`} loading="lazy" decoding="async" width={400} height={400} />
                    </span>
                    <span className="gn-card-tag">{p.category === "Bonafide Bats" ? "Bonafide" : "Beauty processed"}</span>
                    <span className="gn-card-name">{p.name}</span>
                    <span className="gn-card-price">{fmt(p.price)}</span>
                  </Link>
                </li>
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* Feature bat, styled like a signature-range block */}
      {feature && (
        <section className="gn-section gn-feature-wrap" aria-labelledby="feature-title">
          <div className="gn-wrap">
            <div className="gn-feature">
              <div className="gn-feature-copy">
                <h2 id="feature-title" className="gn-feature-name">
                  Apex <span>Pro</span>
                </h2>
                <p className="gn-feature-meta">Beauty processed &nbsp;|&nbsp; Our best seller</p>
                <p className="gn-feature-text">
                  Our flagship match bat. Thick edges, a raised spine and a big sweet spot for driving and pulling, on a
                  cane handle that takes the sting out of the hit.
                </p>
                <ul className="gn-points">
                  <li><strong>40mm+</strong><span>Edges</span></li>
                  <li><strong>Raised</strong><span>Spine</span></li>
                  <li><strong>Cane</strong><span>Handle</span></li>
                </ul>
                <div className="gn-feature-ctas">
                  <Link href={`/product/${feature.id}`} className="btn-red">Shop Apex Pro &middot; {fmt(feature.price)}</Link>
                  <Link href="/shop?category=Beauty%20Processed%20Bats" className="btn-text">View full range</Link>
                </div>
              </div>
              <div className="gn-feature-gallery">
                {featureImages.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={`Apex Pro cricket bat, view ${i + 1}`} loading="lazy" decoding="async" className={i === 0 ? "is-main" : ""} />
                ))}
              </div>
            </div>

            {spotlight.length > 1 && (
              <ul className="gn-thumbs" aria-label="More signature bats">
                {spotlight.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.id}`} className={`gn-thumb${p.id === FEATURE_ID ? " is-active" : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" loading="lazy" decoding="async" />
                      <strong>{p.name}</strong>
                      <span>{fmt(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Custom bat banner */}
      <section className="gn-banner" aria-labelledby="custom-title">
        <div className="gn-banner-inner">
          <div className="gn-banner-copy">
            <p className="gn-banner-kicker">Made to order in Sialkot</p>
            <h2 id="custom-title" className="gn-banner-title">Built to your spec</h2>
            <span className="gn-bar" aria-hidden="true" />
            <p className="gn-banner-sub">
              Your weight, handle, profile and edges, with your name on the blade. Ready in about 7 to 8 working days.
            </p>
            <Link href="/custom-bat" className="btn-red btn-lg">Design your bat</Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="gn-banner-img"
            src="/assets/products/bats/special-edition/special-edition-front-a.webp"
            alt="A finished bat with its number, name and weight written on the blade"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* Categories rail */}
      <section className="gn-section" aria-labelledby="cats-title">
        <div className="gn-wrap">
          <header className="gn-head">
            <h2 id="cats-title">Shop by category</h2>
          </header>
          <Rail label="Categories">
            {categoryTiles.map((c) => (
              <li key={c.name} className="rail-item">
                <Link href={`/shop?category=${encodeURIComponent(c.name)}`} className="gn-card gn-card-cat">
                  <span className="gn-card-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt="" loading="lazy" decoding="async" width={400} height={400} />
                  </span>
                  <span className="gn-card-name">{c.label}</span>
                  <span className="gn-card-price">{c.count} {c.count === 1 ? "product" : "products"}</span>
                </Link>
              </li>
            ))}
          </Rail>
        </div>
      </section>

      {/* Buying guides */}
      <section className="gn-section gn-guides" aria-labelledby="guides-title">
        <div className="gn-wrap">
          <header className="gn-head">
            <h2 id="guides-title">Bat buying guide</h2>
            <p>Three questions we get asked every day.</p>
          </header>
          <div className="guide-grid">
            <article className="guide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/products/bats/apex-edition/apex-pro-edge-a.webp" alt="Edge of a beauty processed bat" loading="lazy" decoding="async" />
              <h3>Beauty processed or bonafide: which should I buy?</h3>
              <p>
                Beauty processed bats get extra cosmetic finishing for a clean, even face. Bonafide bats are left natural
                and unbleached, so you see the real grain and the odd natural mark.
              </p>
              <details>
                <summary>Read more</summary>
                <p>
                  The finish doesn&apos;t make a bat play better on its own. Judge any bat on its pick-up, its ping and its
                  weight, which is why we&apos;ll send you a video of the exact bat before you pay. If you like to read the
                  grain, go bonafide. If you want a clean-looking match bat, go beauty processed.
                </p>
              </details>
            </article>
            <article className="guide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/products/bats/apex-edition/apex-pro-profile-detail.webp" alt="Profile of a cricket bat" loading="lazy" decoding="async" />
              <h3>How heavy should my cricket bat be?</h3>
              <p>
                Lighter than you think. Most club batters are happiest between 1,160 g and 1,250 g (2lb 9oz to 2lb 12oz).
              </p>
              <details>
                <summary>Read more</summary>
                <p>
                  Under 1,160 g suits juniors and wristy stroke-makers who want quick hands. Over 1,250 g suits big hitters
                  on true pitches. If you&apos;re between two weights, take the lighter one: it&apos;ll feel better in the
                  30th over than in the first. Every bat we sell has its weight written on the blade.
                </p>
              </details>
            </article>
            <article className="guide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/products/bats/apex-edition/apex-pro-toe-front.webp" alt="Toe of a cricket bat" loading="lazy" decoding="async" />
              <h3>What size bat does my child need?</h3>
              <p>Go by height, not age. A bat that&apos;s too long is the most common mistake with junior players.</p>
              <details>
                <summary>Read more</summary>
                <p>
                  As a rough guide: size 4 for about 130 to 137 cm, size 5 for 137 to 145 cm, size 6 for 145 to 152 cm,
                  and Harrow for 152 to 160 cm. Above that, a full-size short handle. Send us your child&apos;s height on
                  WhatsApp and we&apos;ll confirm the size before it ships.
                </p>
              </details>
            </article>
          </div>
        </div>
      </section>

      {/* WhatsApp sign-up, in place of a newsletter */}
      <section className="gn-join" aria-labelledby="join-title">
        <div className="gn-wrap gn-join-inner">
          <div>
            <h2 id="join-title">Need help choosing?</h2>
            <p>Send us your height, how you bat and your budget. We&apos;ll reply with real photos of what&apos;s on the wall today.</p>
          </div>
          <a
            href={whatsappUrl("Hello Sialkot Cricket Kits, I'd like some help choosing my kit.")}
            target="_blank"
            rel="noreferrer"
            className="btn-red btn-lg"
          >
            <MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="gn-benefits" aria-label="Why buy from us">
        <ul className="gn-wrap">
          <li><Truck size={26} aria-hidden="true" /><div><strong>Tracked worldwide</strong><span>Delivered to your door, prices in GBP</span></div></li>
          <li><Video size={26} aria-hidden="true" /><div><strong>See it first</strong><span>Photos and a ping video on request</span></div></li>
          <li><ShieldCheck size={26} aria-hidden="true" /><div><strong>Payments checked</strong><span>Every receipt confirmed by our team</span></div></li>
          <li><Hammer size={26} aria-hidden="true" /><div><strong>Made in Sialkot</strong><span>Custom bats in 7 to 8 working days</span></div></li>
        </ul>
      </section>
    </main>
  );
}
