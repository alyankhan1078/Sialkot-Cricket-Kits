"use client";

import { Star, ShieldCheck, Quote } from "lucide-react";

interface Review {
  id: string;
  name: string;
  role: string;
  club: string;
  country: string;
  flag: string;
  bat: string;
  rating: number;
  content: string;
}

const REVIEWS: Review[] = [
  {
    id: "1",
    name: "James Henderson",
    role: "Opening Batsman",
    club: "Surrey Championship Division 1",
    country: "United Kingdom",
    flag: "🇬🇧",
    bat: "Apex Pro Grade 1+ (2lb 8.5oz)",
    rating: 5,
    content:
      "The ping on this Apex Pro is astonishing. Faced 85mph bowling on a green wicket and felt zero sting in the hands. The mallet ping video sent on WhatsApp before shipping matched the bat exactly. Saved over £400 compared to local UK cricket shops.",
  },
  {
    id: "2",
    name: "Mitchell Ross",
    role: "Middle Order & All-Rounder",
    club: "Melbourne Sub-District Cricket",
    country: "Australia",
    flag: "🇦🇺",
    bat: "VVIP Bonafide Players Edition",
    rating: 5,
    content:
      "Ordered with a custom duckbill profile and light 2lb 8oz pickup. Arrived in Victoria in under a week via DHL. The ball simply explodes off the 41mm edges. Already scored two match-winning 50s this season with it.",
  },
  {
    id: "3",
    name: "Imran Qureshi",
    role: "Club Captain",
    club: "Lone Star Premier League (Texas)",
    country: "United States",
    flag: "🇺🇸",
    bat: "Monster Series Grade 1+ (2lb 10oz)",
    rating: 5,
    content:
      "I was skeptical about ordering bats internationally from Pakistan, but the team's transparency is second to none. Live WhatsApp video of the scale weight and ball bounce made it effortless. Our whole squad now orders through them.",
  },
  {
    id: "4",
    name: "David Steyn",
    role: "Top Order Batsman",
    club: "Western Province Cricket Club",
    country: "South Africa",
    flag: "🇿🇦",
    bat: "Silver Special Edition (2lb 9oz)",
    rating: 5,
    content:
      "Master craftsmanship at its finest. The grains are perfectly straight, 11 grains across the face, and the balance makes it feel 2 ounces lighter than it is. Outstanding protection gear too.",
  },
];

export function GlobalPlayerReviews() {
  return (
    <section className="reviews-section">
      <div className="reviews-container">
        {/* Header */}
        <div className="section-head-center">
          <span className="section-eyebrow">Worldwide Match Endorsements</span>
          <h2 className="section-heading">
            Trusted by <span className="gold-text">League Cricketers Worldwide</span>
          </h2>
          <p className="section-subtext">
            Read unedited feedback from active league players in England, Australia, the USA, and South Africa
            scoring runs every weekend with our Sialkot clefts.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="reviews-grid">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="review-card">
              <div className="review-card-top">
                <div className="review-stars">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#f2a928" color="#f2a928" />
                  ))}
                </div>
                <div className="verified-chip">
                  <ShieldCheck size={14} />
                  <span>Verified Match Order</span>
                </div>
              </div>

              <p className="review-quote">&ldquo;{rev.content}&rdquo;</p>

              <div className="review-bat-tag">
                <span>Gear:</span> <strong>{rev.bat}</strong>
              </div>

              <div className="review-author">
                <div className="author-avatar">{rev.name[0]}</div>
                <div>
                  <div className="author-name-row">
                    <strong>{rev.name}</strong>
                    <span className="author-flag">{rev.flag}</span>
                  </div>
                  <span className="author-club">{rev.role} · {rev.club}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Delivery Strip */}
        <div className="global-delivery-bar">
          <div className="delivery-flags-group">
            <span className="flag-item">🇬🇧 United Kingdom</span>
            <span className="flag-item">🇦🇺 Australia</span>
            <span className="flag-item">🇺🇸 United States</span>
            <span className="flag-item">🇳🇿 New Zealand</span>
            <span className="flag-item">🇿🇦 South Africa</span>
            <span className="flag-item">🇨🇦 Canada</span>
            <span className="flag-item">🇦🇪 UAE</span>
            <span className="flag-item">🇵🇰 Pakistan</span>
          </div>
          <div className="delivery-summary-text">
            <span>✈ <strong>Tracked Express Courier</strong> with live tracking number emailed within 24 hours of packing.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
