"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  MessageCircle,
  Play,
  ShieldAlert,
  Sparkles,
  Volume2,
} from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export function PingSoundExperience() {
  return (
    <section className="ping-experience-section">
      <div className="ping-container">
        <div className="ping-grid">
          {/* Left Text Column */}
          <div className="ping-copy">
            <div className="ping-eyebrow">
              <span className="ping-dot" />
              <span>Signature Factory Guarantee</span>
            </div>

            <h2 className="ping-title">
              Hear the Sound of <br />
              <span className="gold-text">Explosive Willow Rebound.</span>
            </h2>

            <p className="ping-description">
              Never buy a bat blind from a catalogue. Before any bat is packed in our Sialkot workshop,
              our master batmakers tap the blade from toe to shoulder with an official hardwood mallet
              and drop a 5.5oz match leather ball to prove its acoustic resonance and ping.
            </p>

            <div className="ping-features-list">
              <div className="ping-feat">
                <CheckCircle2 size={18} className="feat-check" />
                <div>
                  <strong>Acoustic Resonance Verification:</strong> High-pitch chime signifies optimal pressing density and active fiber matrix.
                </div>
              </div>
              <div className="ping-feat">
                <CheckCircle2 size={18} className="feat-check" />
                <div>
                  <strong>Zero Dead-Spot Guarantee:</strong> Every inch of the 35cm hitting zone is tested for instantaneous spring and rebound.
                </div>
              </div>
              <div className="ping-feat">
                <CheckCircle2 size={18} className="feat-check" />
                <div>
                  <strong>Personalized WhatsApp Video:</strong> We shoot a 30-second 4K video showing YOUR bat's ping, scale weight, and grain count before you pay.
                </div>
              </div>
            </div>

            <div className="ping-actions">
              <a
                href={whatsappUrl(
                  "Hello Sialkot Cricket Kits, please send me sample live bat ping videos of your current Grade 1+ bats."
                )}
                target="_blank"
                rel="noreferrer"
                className="ping-btn-whatsapp"
              >
                <MessageCircle size={18} />
                <span>Request Live Ping Video on WhatsApp</span>
              </a>
              <Link href="/custom-bat" className="ping-btn-custom">
                <span>Configure Custom Bat</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Visual Sound Wave Card */}
          <div className="ping-visual-card">
            <div className="ping-card-inner">
              <div className="soundwave-header">
                <div className="soundwave-tag">
                  <Volume2 size={16} />
                  <span>Acoustic Frequency Monitor</span>
                </div>
                <span className="frequency-pill">High Spring Rebound (2,840 Hz)</span>
              </div>

              {/* Animated / styled soundwave bars */}
              <div className="waveform-display">
                {[40, 65, 85, 30, 95, 100, 75, 45, 90, 80, 60, 95, 100, 85, 50, 70, 90, 100, 75, 55, 95, 80, 40].map(
                  (height, idx) => (
                    <span
                      key={idx}
                      className="wave-bar"
                      style={{ height: `${height}%`, animationDelay: `${idx * 0.06}s` }}
                    />
                  )
                )}
              </div>

              {/* Bat testing illustration frame */}
              <div className="ping-demo-frame">
                <img
                  src="/assets/products/bats/bounce-edition/bounce-front-detail.webp"
                  alt="Mallet and bat ping testing in Sialkot workshop"
                  className="ping-demo-img"
                />
                <div className="demo-overlay-badge">
                  <div className="demo-play-btn">
                    <Play size={14} fill="currentColor" />
                  </div>
                  <div>
                    <strong>4K Mallet Ping Demo</strong>
                    <span>Tap to view live video on WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Metrics beneath */}
              <div className="ping-metrics-row">
                <div className="p-metric">
                  <span className="p-num">100%</span>
                  <span className="p-lbl">Grade 1+ Clefts</span>
                </div>
                <div className="p-metric">
                  <span className="p-num">5.5 oz</span>
                  <span className="p-lbl">Match Ball Tested</span>
                </div>
                <div className="p-metric">
                  <span className="p-num">24 Hours</span>
                  <span className="p-lbl">Video Turnaround</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
