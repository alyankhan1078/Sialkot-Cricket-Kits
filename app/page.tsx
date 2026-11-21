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
  title: { absolute: "Sialkot Cricket Bats & Kit, Direct from Our Bat Shop | Sialkot Cricket Kits" },
  description:
    "Sialkot cricket bats, pads, gloves and team kit, direct from our bat shop in Model Town, Sialkot. Ping video of your bat before it ships. Delivery across Pakistan and worldwide.",
};

// Names of other companies' brands. We keep those products off the homepage showcase.
const OTHER_BRANDS = /gray|nicolls|kookaburra|\bgm\b|gunn|\bsg\b|\bss\b|mrf|new balance|\bdsc\b|\bca\b|masuri|shrey|adidas|nike|puma|moonwalkr|aero|\bton\b/i;

const FEATURE_ID = "beauty-processed-bats-apex-pro";

const HOME_GUIDES = [
  {
    slug: "beauty-processed-vs-bonafide-cricket-bats",
    title: "Beauty processed or bonafide: which should I buy?",
    teaser: "Beauty processed bats get extra cosmetic finishing for a clean, even face. Bonafide bats are left natural, so you see the real grain.",
    image: "/assets/products/bats/apex-edition/apex-pro-edge-a.webp",
    imageAlt: "Edge of a beauty processed bat",
  },
  {
    slug: "how-to-choose-a-cricket-bat",
    title: "How heavy should my cricket bat be?",
    teaser: "Lighter than you think. Most club batters are happiest between 1,160 g and 1,250 g (2lb 9oz to 2lb 12oz).",
    image: "/assets/products/bats/apex-edition/apex-pro-profile-detail.webp",
    imageAlt: "Profile of a cricket bat",
  },
  {
    slug: "cricket-bat-size-chart",
    title: "What size bat does my child need?",
    teaser: "Go by height, not age: size 5 for about 152 to 159 cm, size 6 for 160 to 164 cm, Harrow for 165 to 169 cm.",
    image: "/assets/products/bats/apex-edition/apex-pro-toe-front.webp",
    imageAlt: "Toe of a cricket bat",
  },
];

const fmt = (n: number) => `£${Number(n).toLocaleString("en-GB")}`;

export default async function HomePage() {
  const products = await getProducts();
  const live = products.filter((p) => p.active !== false && p.image);

  const bats = live
    .filter((p) => ["Beauty Processed Bats", "Bonafide Bats"].includes(p.category) && !/custom/i.test(p.id) && !OTHER_BRANDS.test(p.name))
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
            {HOME_GUIDES.map((g) => (
              <article className="guide" key={g.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image} alt={g.imageAlt} loading="lazy" decoding="async" />
                <h3>{g.title}</h3>
                <p>{g.teaser}</p>
                <Link href={`/guides/${g.slug}`} className="guide-read">Read the guide</Link>
              </article>
            ))}
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

      {/* About the shop: plain text for buyers and search engines */}
      <section className="gn-section gn-about" aria-labelledby="about-title">
        <div className="gn-wrap gn-about-inner">
          <h2 id="about-title">Cricket bats from Sialkot</h2>
          <div>
            <p>
              Sialkot is one of the world&apos;s great centres for cricket bats and sports gear, and our shop is in Model
              Town. Our bats are weighed by hand with the weight written on the blade, and we&apos;ll send you photos and
              a ping video of the exact bat you&apos;re buying before it&apos;s packed.
            </p>
            <p>
              We sell beauty processed and bonafide bats, junior and Harrow size bats, custom bats made to your spec,
              plus batting pads, gloves, keeping gear, helmets, kit bags and teamwear. Orders ship with tracking across
              Pakistan and worldwide, including the UK, USA, Australia, New Zealand and Europe, with prices shown in
              GBP. Clubs can message us on WhatsApp for team orders.
            </p>
          </div>
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
