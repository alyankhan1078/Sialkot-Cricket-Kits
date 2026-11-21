import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/src/data/guides";
import "../guides.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return { title: "Guide not found" };
  const url = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: guide.title, description: guide.description, url, images: [guide.image] },
  };
}

const SITE = "https://sialkotcricketkits.com";

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const url = `${SITE}/guides/${guide.slug}`;
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: [`${SITE}${guide.image}`],
    dateModified: guide.updated,
    datePublished: guide.updated,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Sialkot Cricket Kits", url: SITE },
    publisher: { "@id": `${SITE}/#store` },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: url },
    ],
  };
  const ld = (o: object) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

  return (
    <main className="guides-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(articleJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(breadcrumbJsonLd)} />
      <article className="guide-article">
        <nav className="guide-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/guides">Guides</Link>
        </nav>
        <h1>{guide.title}</h1>
        <p className="guide-meta">
          Sialkot Cricket Kits &middot; Updated{" "}
          {new Date(guide.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="guide-hero-img" src={guide.image} alt={guide.imageAlt} decoding="async" />
        <div className="guide-body">{guide.body}</div>
      </article>
      <aside className="guide-more" aria-label="More guides">
        <h2>More guides</h2>
        <ul className="guides-grid">
          {others.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="guide-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image} alt={g.imageAlt} loading="lazy" decoding="async" />
                <h3>{g.title}</h3>
                <p>{g.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
