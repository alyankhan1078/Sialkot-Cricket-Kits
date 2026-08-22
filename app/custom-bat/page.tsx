import type { Metadata } from "next";
import { CircleCheck, Clock3, MessageCircle, Video } from "lucide-react";
import { CustomBatForm } from "@/src/components/CustomBatForm";

export const metadata: Metadata = {
  title: "Custom Cricket Bat Service | Sialkot Cricket Kits",
  description:
    "Request a customized cricket bat with your preferred handle, weight, profile, knocking-in, engraving and live ping video.",
};

const profiles = ["Duckbill", "Mid", "High", "Full", "Concave", "Traditional"];

export default function CustomBatPage() {
  return (
    <main>
      <section className="page-hero custom-hero">
        <div>
          <p className="eyebrow">Your bat · Your game</p>
          <h1>Prepared to your specification.</h1>
          <p>
            Share the details that matter to you. We will discuss current willow options, recommended
            edition, price and delivery directly.
          </p>
        </div>
        <img src="/assets/products/bat-collection.webp" alt="Cricket bat available for custom specification" />
      </section>

      <section className="custom-layout">
        <div className="custom-content">
          <p className="eyebrow dark">Available choices</p>
          <h2>Build around your preference.</h2>
          <p>
            Choose short-handle or long-handle options, a preferred weight and the profile that suits
            your game. Final availability is confirmed before production.
          </p>
          <div className="profile-grid">
            {profiles.map((profile) => (
              <span key={profile}>{profile}</span>
            ))}
          </div>
          <div className="process-list">
            <article>
              <CircleCheck />
              <div>
                <h3>Specification approval</h3>
                <p>Confirm size, handle, weight, profile and any extra service.</p>
              </div>
            </article>
            <article>
              <Video />
              <div>
                <h3>Pictures and ping</h3>
                <p>Request current willow pictures and a live ping video before confirmation.</p>
              </div>
            </article>
            <article>
              <Clock3 />
              <div>
                <h3>Production timing</h3>
                <p>Customized orders normally require approximately 7-8 working days after approval.</p>
              </div>
            </article>
            <article>
              <MessageCircle />
              <div>
                <h3>30% advance</h3>
                <p>A 30% advance payment is normally required before customized production begins.</p>
              </div>
            </article>
          </div>
        </div>
        <div className="form-panel">
          <p className="mini-label">Custom bat enquiry</p>
          <h2>Send your requirements.</h2>
          <CustomBatForm />
        </div>
      </section>
    </main>
  );
}
