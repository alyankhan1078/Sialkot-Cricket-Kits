"use client";

import Link from "next/link";
import { Check, X, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export function FactoryDirectMatrix() {
  const comparisonRows = [
    {
      feature: "English Willow Origin",
      retail: "J.S. Wright & Sons Clefts (Imported)",
      sialkot: "J.S. Wright & Sons Clefts (Imported)",
      winner: "equal",
    },
    {
      feature: "Master Craftsmanship",
      retail: "Contracted factories in Sialkot, Pakistan",
      sialkot: "Handcrafted directly in our Sialkot workshop",
      winner: "sialkot",
    },
    {
      feature: "Typical Match Bat Price",
      retail: "£550 – £850 (GBP)",
      sialkot: "£160 – £260 (GBP) — Save up to 70%",
      winner: "sialkot",
    },
    {
      feature: "Celebrity Endorsement Markup",
      retail: "Included (£150+ added for player sponsorships)",
      sialkot: "£0 (Direct factory pricing)",
      winner: "sialkot",
    },
    {
      feature: "Individual Ping Video Pre-Dispatch",
      retail: "None (Sealed generic box from retailer shelf)",
      sialkot: "Personal 4K Mallet Ping Video via WhatsApp",
      winner: "sialkot",
    },
    {
      feature: "Bespoke Custom Weight & Profile",
      retail: "Unavailable or £100+ surcharge",
      sialkot: "Fully customizable in our workshop",
      winner: "sialkot",
    },
    {
      feature: "Global Express Delivery",
      retail: "Local only (high import duty added)",
      sialkot: "Tracked express to UK, AU, USA, NZ & more",
      winner: "sialkot",
    },
  ];

  return (
    <section className="matrix-section">
      <div className="matrix-container">
        {/* Header */}
        <div className="section-head-center">
          <span className="section-eyebrow">The Smart Cricketer's Choice</span>
          <h2 className="section-heading">
            Direct Workshop vs. <span className="gold-text">Big Brand Markups</span>
          </h2>
          <p className="section-subtext">
            Over 70% of the world&apos;s famous cricket brands outsource their bat manufacturing to Sialkot.
            By ordering direct, you get the exact same match willow without paying for corporate marketing.
          </p>
        </div>

        {/* Matrix Table Card */}
        <div className="matrix-table-wrapper">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="th-feature">Equipment Specification</th>
                <th className="th-retail">Big Commercial Brands</th>
                <th className="th-sialkot">
                  <span className="highlight-pill">Direct Factory</span>
                  Sialkot Cricket Kits
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "even-row" : "odd-row"}>
                  <td className="td-feature">
                    <strong>{row.feature}</strong>
                  </td>
                  <td className="td-retail">
                    <span className="retail-cell-val">{row.retail}</span>
                  </td>
                  <td className="td-sialkot">
                    <div className="sialkot-cell-val">
                      <span className="check-bullet"><Check size={14} /></span>
                      <span>{row.sialkot}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Banner */}
        <div className="matrix-footer-card">
          <div>
            <h3>Stop paying £600 for stickers. Pay for pure performance willow.</h3>
            <p>Every penny goes into the grade of the wood, the Singapore cane handle, and the master press.</p>
          </div>
          <Link href="/shop" className="matrix-cta-btn">
            <span>Shop Match Willow Now</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
