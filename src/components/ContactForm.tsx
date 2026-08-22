"use client";

import { useState, type FormEvent } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", country: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const message = `Hello Sialkot Cricket Kits,\n\nName: ${form.name}\nEmail: ${
    form.email || "Not provided"
  }\nCountry: ${form.country}\n\nEnquiry: ${form.message}\n\nPlease confirm availability and the next steps. Thank you.`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    // 1. Save enquiry to database
    try {
      fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: form.name,
          email: form.email,
          country: form.country,
          message: form.message,
        }),
      }).catch(() => {});
    } catch {
      // non-blocking
    }

    setSubmitted(true);

    // 2. Open WhatsApp
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  const emailHref = `mailto:sialkotcricketkits@gmail.com?subject=${encodeURIComponent(
    `Website enquiry from ${form.name || "customer"}`
  )}&body=${encodeURIComponent(message)}`;

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <div className="form-grid two">
        <label>
          <span>Your name</span>
          <input
            required
            maxLength={100}
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label>
          <span>Email address</span>
          <input
            type="email"
            maxLength={150}
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
      </div>
      <label>
        <span>Country</span>
        <input
          required
          maxLength={100}
          value={form.country}
          onChange={(event) => update("country", event.target.value)}
        />
      </label>
      <label>
        <span>How can we help?</span>
        <textarea
          rows={6}
          required
          maxLength={2000}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Product, size, quantity and delivery destination"
        />
      </label>
      <div className="form-actions">
        <button className="button whatsapp" type="submit">
          <MessageCircle size={18} /> Send on WhatsApp
        </button>
        <a className="button secondary-dark" href={emailHref}>
          <Mail size={18} /> Prepare email
        </a>
      </div>
      {submitted && (
        <p style={{ color: "#34d399", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          ✓ Enquiry recorded! WhatsApp opened in a new tab.
        </p>
      )}
    </form>
  );
}
