import Link from "next/link";
import {
  ArrowRight,
  Download,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Video,
  LayoutGrid,
} from "lucide-react";
import { ProductCard } from "@/src/components/ProductCard";
import { getCategories, getFaqs, getProducts, getSettings } from "@/src/lib/data-service";
import { whatsappUrl } from "@/src/lib/whatsapp";

export default async function HomePage() {
  const [products, categories, faqs, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getFaqs(),
    getSettings(),
  ]);

  // Featured products (either marked featured or curated fallback)
  let featuredProducts = products.filter((p) => p.featured);
  if (featuredProducts.length === 0) {
    featuredProducts = products.slice(0, 4);
  } else {
    featuredProducts = featuredProducts.slice(0, 4);
  }

  const protection = products
    .filter((item) => ["Batting Pads", "Batting Gloves", "Keeping Gloves", "Helmets"].includes(item.category))
    .slice(0, 4);
  const bags = products.filter((item) => item.category === "Kit & Duffle Bags").slice(0, 4);

  const categoriesWithInfo = categories.slice(0, 8).map((category) => {
    const catProducts = products.filter((p) => p.category === category.name);
    return {
      name: category.name,
      count: catProducts.length,
      image: catProducts[0]?.image || "/assets/brand/sialkot-cricket-kits-logo.png",
    };
  });

  return (
    <main>
      {/* Hero — dark photography, premium */}
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Hand-selected in Sialkot · Delivered worldwide</p>
          <h1>
            Built for players who inspect <em>every detail.</em>
          </h1>
          <p>
            Explore exact product galleries for beauty-processed, bonafide, junior and Harrow bats—plus
            professional protection, wicketkeeping equipment and kit bags.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/shop">
              Shop equipment <ArrowRight size={17} />
            </Link>
            <a
              className="button ghost"
              href={whatsappUrl(
                "Hello Sialkot Cricket Kits, I would like help choosing cricket equipment from your current catalogue."
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
          </div>
          {/* Hero assurance — shown on desktop only (hidden on mobile via CSS) */}
          <div className="hero-assurance">
            <span>
              <ShieldCheck size={16} /> Grade 1+ English Willow
            </span>
            <span>
              <Video size={16} /> Live ping videos
            </span>
            <span>
              <Truck size={16} /> Worldwide delivery
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/assets/products/bats/apex-edition/apex-pro-front-b.webp"
            alt="Apex Pro beauty-processed cricket bat from Sialkot Cricket Kits"
          />
          <div className="hero-stamp">
            <span>Original product galleries</span>
            <strong>Face · profile · edge · toe</strong>
            <Link href="/shop?category=Beauty%20Processed%20Bats">Explore cricket bats →</Link>
          </div>
        </div>
      </section>

      {/* Trust strip — compact horizontal, replaces mobile hero trust cards */}
      <div className="trust-strip">
        <span className="trust-strip-item">
          <ShieldCheck size={14} /> Grade 1+ English Willow
        </span>
        <span className="trust-strip-item">
          <Video size={14} /> Live ping videos
        </span>
        <span className="trust-strip-item">
          <Truck size={14} /> Worldwide delivery
        </span>
        <span className="trust-strip-item">
          <PackageCheck size={14} /> Flexible deposit from 30%
        </span>
      </div>

      {/* Categories entry — direct, obvious */}
      <div className="categories-section">
        <Link
          className="categories-entry-button"
          href="/shop"
          aria-label="Browse all categories"
        >
          <LayoutGrid size={18} className="cat-icon" style={{ color: "var(--gold)" }} />
          <span>Browse Categories</span>
          <ArrowRight size={16} className="cat-chevron" style={{ color: "var(--text-muted)" }} />
        </Link>
      </div>

      {/* Category strip */}
      <section className="category-strip">
        <div className="section-intro compact">
          <p className="eyebrow dark">Complete your kit</p>
          <h2>Shop by category.</h2>
          <Link href="/shop">
            View the complete shop <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {categoriesWithInfo.map((category) => (
            <Link
              className="category-card"
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              key={category.name}
            >
              <img src={category.image} alt="" loading="lazy" />
              <div>
                <span>{category.count} listings</span>
                <h3>{category.name}</h3>
              </div>
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="section dark-section">
        <div className="section-intro light">
          <p className="eyebrow">Selected from the catalogue</p>
          <h2>Featured equipment.</h2>
          <p>Individual prices shown in GBP. Confirm stock and specification before payment.</p>
        </div>
        <div className="product-grid four">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* Protection section */}
      <section className="section light-section">
        <div className="section-intro">
          <p className="eyebrow dark">Protection &amp; wicketkeeping</p>
          <h2>Confidence at the crease.</h2>
          <p>Choose from current pad, glove, keeping and helmet listings with model-specific pricing.</p>
        </div>
        <div className="product-grid four">
          {protection.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
        <Link className="inline-link" href="/shop?category=Batting%20Pads">
          Explore protective equipment <ArrowRight size={16} />
        </Link>
      </section>

      {/* Kit bags split */}
      <section className="split-feature">
        <div className="split-image">
          <img src={bags[0]?.image || "/assets/products/bat-collection.webp"} alt="Cricket kit bag" />
        </div>
        <div className="split-copy">
          <p className="eyebrow">Kit, duffle, wheelie &amp; trolley</p>
          <h2>Carry the whole game.</h2>
          <p>
            Browse the complete bag range with original stock photographs, current quantities and
            individual catalogue pricing.
          </p>
          <ul>
            <li>Standard and premium editions</li>
            <li>Duffle, wheelie and trolley formats</li>
            <li>Original product images from current stock</li>
          </ul>
          <Link className="button primary" href="/shop?category=Kit%20%26%20Duffle%20Bags">
            Shop kit bags <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Service grid */}
      <section className="service-grid">
        <article>
          <ShieldCheck />
          <h3>Catalogue accuracy</h3>
          <p>Prices and quantities are maintained dynamically in the official product catalogue.</p>
        </article>
        <article>
          <Video />
          <h3>See before ordering</h3>
          <p>Ask for current product pictures or a live bat ping video through our official WhatsApp.</p>
        </article>
        <article>
          <SlidersHorizontal />
          <h3>Custom bat service</h3>
          <p>Discuss weight, handle, profile, knocking-in and name engraving before production.</p>
        </article>
        <article>
          <PackageCheck />
          <h3>International support</h3>
          <p>We confirm stock, packing, shipping cost and estimated delivery for your destination.</p>
        </article>
      </section>

      {/* Custom bat CTA */}
      <section className="custom-cta">
        <div>
          <p className="eyebrow">Your bat · Your specification</p>
          <h2>Choose the details that suit your game.</h2>
          <p>
            Short or long handle, preferred weight, duckbill, mid, high, full, concave or traditional
            profile—with optional knocking-in and name engraving.
          </p>
        </div>
        <div className="custom-steps">
          <span>
            <b>01</b> Send your specification
          </span>
          <span>
            <b>02</b> Review available willow
          </span>
          <span>
            <b>03</b> Confirm with live ping video
          </span>
          <span>
            <b>04</b> Production after advance
          </span>
        </div>
        <Link className="button primary" href="/custom-bat">
          Build a custom bat <ArrowRight size={17} />
        </Link>
      </section>

      {/* Catalogue CTA */}
      <section className="catalogue-cta">
        <div>
          <p className="eyebrow dark">Complete price catalogue</p>
          <h2>Download the full 2026 stock sheet.</h2>
          <p>
            Review bats, gloves, pads, keeping equipment, bags, thigh pads, accessories and teamwear in
            one professionally prepared PDF.
          </p>
        </div>
        <div>
          <a className="button dark" href={settings.catalogueUrl} download>
            <Download size={17} /> Download catalogue
          </a>
          <a
            className="button outline-dark"
            href={whatsappUrl("Hello Sialkot Cricket Kits, I have reviewed your catalogue and would like to place an order.")}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} /> Send a shortlist
          </a>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="section faq-preview">
        <div className="section-intro">
          <p className="eyebrow dark">Before you order</p>
          <h2>Clear answers.</h2>
        </div>
        <div className="faq-grid">
          {faqs.slice(0, 4).map((faq) => (
            <details key={faq.id}>
              <summary>
                {faq.question}
                <span>+</span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
        <Link className="inline-link" href="/faq">
          Read all FAQs <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
