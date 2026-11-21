import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/src/data/guides";
import "./guides.css";

export const metadata: Metadata = {
  alternates: { canonical: "/guides" },
  title: "Cricket Bat Buying Guides",
  description:
    "Cricket bat size chart, how to choose a bat, how to knock in a new bat, and beauty processed vs bonafide willow. Practical guides from a bat shop in Sialkot.",
};

export default function GuidesIndex() {
  return (
    <main className="guides-page">
      <header className="guides-hero">
        <p className="eyebrow">From our shop in Sialkot</p>
        <h1>Cricket bat guides</h1>
        <p>Straight answers to the questions players send us every day.</p>
      </header>
      <ul className="guides-grid">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="guide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image} alt={g.imageAlt} loading="lazy" decoding="async" />
              <h2>{g.title}</h2>
              <p>{g.summary}</p>
              <span className="guide-card-cta">Read the guide</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
