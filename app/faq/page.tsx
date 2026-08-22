import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getFaqs } from "@/src/lib/data-service";
import { whatsappUrl } from "@/src/lib/whatsapp";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Sialkot Cricket Kits",
  description:
    "Answers about worldwide delivery, English Willow bats, customization, live ping videos, stock confirmation and international ordering.",
};

export default async function FAQPage() {
  const faqs = await getFaqs();

  return (
    <main>
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Ordering information</p>
          <h1>Frequently asked questions.</h1>
          <p>Clear guidance for local and international customers before an order is confirmed.</p>
        </div>
      </section>
      <section className="faq-page-grid">
        {faqs.map((faq, index) => (
          <details key={faq.id} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {faq.question}
              <b>+</b>
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>
      <section className="simple-cta">
        <div>
          <p className="eyebrow dark">Need a specific answer?</p>
          <h2>Ask us directly.</h2>
        </div>
        <a
          className="button whatsapp"
          href={whatsappUrl("Hello Sialkot Cricket Kits, I have a question about your products and ordering process.")}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={18} /> WhatsApp support
        </a>
      </section>
    </main>
  );
}
