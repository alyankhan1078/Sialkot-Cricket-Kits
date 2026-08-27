"use client";

import {
  ShieldCheck,
  Truck,
  Video,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";

export function HomeAuthorityTicker() {
  const items = [
    { icon: Truck, text: "Worldwide Express Courier to UK, USA, Australia, NZ & Europe" },
    { icon: ShieldCheck, text: "100% Genuine Grade 1+ English Willow Clefts" },
    { icon: Video, text: "Live 4K Mallet & Ball Rebound Video via WhatsApp Before Dispatch" },
    { icon: Award, text: "Master Handcrafted in Sialkot, Pakistan · Est. 1982" },
    { icon: Flame, text: "Direct Workshop Prices · Up to 70% Below Retail Middlemen" },
    { icon: Sparkles, text: "Pre-Fitted Toe Armour & Laser Engraved Personalization" },
  ];

  return (
    <div className="authority-ticker-wrap">
      <div className="authority-ticker-track">
        {[...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="ticker-pill">
              <Icon size={14} className="ticker-icon" />
              <span>{item.text}</span>
              <span className="ticker-sep">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
