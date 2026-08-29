"use client";

import { useState, type FormEvent } from "react";
import { Mail, MessageCircle, Check, Copy, ExternalLink } from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", country: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const message = `Hello Sialkot Cricket Kits,\n\nName: ${form.name || "Customer"}\nEmail: ${
    form.email || "Not provided"
  }\nCountry: ${form.country || "Not specified"}\n\nEnquiry: ${form.message}\n\nPlease confirm availability and the next steps. Thank you.`;

  const submitToDatabase = async () => {
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: form.name,
          email: form.email,
          country: form.country,
          message: form.message,
        }),
      });
    } catch {
      // non-blocking
    }
  };

  const handleWhatsAppSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submitToDatabase();
    setSubmitted(true);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("sialkotcricketkits@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const subject = `Website enquiry from ${form.name || "Customer"}`;
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=sialkotcricketkits@gmail.com&su=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`;
  const outlookWebUrl = `https://outlook.live.com/default.aspx?rru=compose&to=sialkotcricketkits@gmail.com&subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`;
  const yahooWebUrl = `https://compose.mail.yahoo.com/?to=sialkotcricketkits@gmail.com&subj=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`;
  const standardMailto = `mailto:sialkotcricketkits@gmail.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`;

  return (
    <form className="enquiry-form" onSubmit={handleWhatsAppSubmit}>
      <div className="form-grid two">
        <label>
          <span>Your name</span>
          <input
            required
            maxLength={100}
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            placeholder="e.g. Michael Clarke"
          />
        </label>
        <label>
          <span>Email address (Gmail, Outlook, Yahoo, etc.)</span>
          <input
            type="email"
            maxLength={150}
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            placeholder="e.g. name@example.com / user@yahoo.com"
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
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="e.g. United Kingdom, Pakistan, UAE, USA"
        />
      </label>
      <label>
        <span>How can we help?</span>
        <textarea
          rows={5}
          required
          maxLength={2000}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Product, size, weight preference, quantity and delivery destination"
        />
      </label>

      <div className="form-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <button className="button whatsapp" type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <MessageCircle size={18} /> Send on WhatsApp
        </button>

        <button
          type="button"
          className="button secondary-dark"
          onClick={() => {
            submitToDatabase();
            setShowEmailOptions((prev) => !prev);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        >
          <Mail size={18} /> Send via Email
        </button>
      </div>

      {showEmailOptions && (
        <div
          style={{
            marginTop: 14,
            padding: "16px 18px",
            background: "#f8fafc",
            border: "1.5px solid #cbd5e1",
            borderRadius: 10,
            color: "#0f172a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <strong style={{ fontSize: ".88rem", color: "#0f172a" }}>Choose your email service:</strong>
            <button
              type="button"
              onClick={handleCopyEmail}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: ".78rem",
                color: "#1e293b",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy Official Email"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
            <a
              href={gmailWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                color: "#dc2626",
                fontSize: ".84rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>Gmail Web</span> <ExternalLink size={12} />
            </a>

            <a
              href={outlookWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                color: "#0284c7",
                fontSize: ".84rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>Outlook Web</span> <ExternalLink size={12} />
            </a>

            <a
              href={yahooWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                color: "#7c3aed",
                fontSize: ".84rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>Yahoo Mail</span> <ExternalLink size={12} />
            </a>

            <a
              href={standardMailto}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                color: "#475569",
                fontSize: ".84rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>Mail App</span>
            </a>
          </div>
        </div>
      )}

      {submitted && (
        <p style={{ color: "#16a34a", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 600 }}>
          ✓ Enquiry recorded! WhatsApp opened in a new tab.
        </p>
      )}
    </form>
  );
}
