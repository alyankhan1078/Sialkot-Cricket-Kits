"use client";

import { useState, type FormEvent } from "react";
import { Mail, MessageCircle, Check, Copy, ExternalLink, Send, AlertCircle, ShieldCheck } from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { BUSINESS_CONFIG } from "@/src/lib/business-config";
import { POPULAR_DESTINATIONS, REMAINING_COUNTRIES } from "@/src/lib/countries";

const ENQUIRY_TYPES = [
  "Product Availability",
  "Shipping Quote",
  "Custom Cricket Bat",
  "Bulk Order",
  "OEM / Private Label",
  "Existing Order",
  "General Enquiry",
];

const ALL_COUNTRIES_LIST = [
  ...POPULAR_DESTINATIONS,
  ...REMAINING_COUNTRIES,
];

export function ContactForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "United Kingdom",
    enquiryType: "Product Availability",
    productModel: "",
    quantity: "1",
    orderNumber: "",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);

  const update = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!form.country.trim()) {
      newErrors.country = "Please select or enter your delivery country";
    }

    if (!form.message.trim()) {
      newErrors.message = "Please write your enquiry message";
    } else if (form.message.trim().length < 5) {
      newErrors.message = "Message must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildMessage = () => {
    let msg = `Hello Sialkot Cricket Kits,\n\nI would like assistance with an enquiry:`;
    msg += `\n• Full Name: ${form.fullName || "Customer"}`;
    msg += `\n• Email: ${form.email || "Not provided"}`;
    if (form.phone) msg += `\n• Phone/WhatsApp: ${form.phone}`;
    msg += `\n• Delivery Country: ${form.country}`;
    msg += `\n• Enquiry Type: ${form.enquiryType}`;
    if (form.productModel) msg += `\n• Product / Model: ${form.productModel}`;
    if (form.quantity) msg += `\n• Quantity: ${form.quantity}`;
    if (form.orderNumber) msg += `\n• Order Ref: ${form.orderNumber}`;
    msg += `\n\n• Message:\n${form.message}`;
    msg += `\n\nPlease confirm availability, pricing and dispatch details. Thank you!`;
    return msg;
  };

  const submitToDatabase = async () => {
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          country: form.country,
          enquiryType: form.enquiryType,
          productModel: form.productModel,
          quantity: form.quantity,
          orderNumber: form.orderNumber,
          message: form.message,
        }),
      });
    } catch {
      // non-blocking
    }
  };

  const handleWhatsAppSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    await submitToDatabase();
    setSubmitted(true);
    const msg = buildMessage();
    window.open(whatsappUrl(msg), "_blank", "noopener,noreferrer");
  };

  const handleEmailTrigger = async () => {
    if (!validate()) return;
    await submitToDatabase();
    setShowEmailOptions(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(BUSINESS_CONFIG.primaryEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const messageText = buildMessage();
  const subject = `Sialkot Cricket Kits Enquiry — ${form.enquiryType} [${form.fullName || "Customer"}]`;
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    BUSINESS_CONFIG.primaryEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
  const outlookWebUrl = `https://outlook.live.com/default.aspx?rru=compose&to=${encodeURIComponent(
    BUSINESS_CONFIG.primaryEmail
  )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
  const yahooWebUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(
    BUSINESS_CONFIG.primaryEmail
  )}&subj=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
  const standardMailto = `mailto:${BUSINESS_CONFIG.primaryEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(messageText)}`;

  return (
    <form className="contact-enquiry-form" onSubmit={handleWhatsAppSubmit} noValidate>
      {/* 2-Column Responsive Form Fields */}
      <div className="contact-form-grid">
        {/* Full Name */}
        <div className="contact-form-field">
          <label htmlFor="contact-fullName">
            Full Name <span className="req-star">*</span>
          </label>
          <input
            id="contact-fullName"
            type="text"
            required
            maxLength={100}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Enter your full name"
            className={errors.fullName ? "has-error" : ""}
          />
          {errors.fullName && <span className="contact-field-error"><AlertCircle size={13} /> {errors.fullName}</span>}
        </div>

        {/* Email Address */}
        <div className="contact-form-field">
          <label htmlFor="contact-email">
            Email Address <span className="req-star">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            maxLength={150}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="e.g. david@example.com"
            className={errors.email ? "has-error" : ""}
          />
          {errors.email && <span className="contact-field-error"><AlertCircle size={13} /> {errors.email}</span>}
        </div>

        {/* WhatsApp / Phone Number */}
        <div className="contact-form-field">
          <label htmlFor="contact-phone">
            WhatsApp / Phone Number <span className="opt-tag">(Optional)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            maxLength={50}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. +44 7911 123456"
          />
        </div>

        {/* Destination Country */}
        <div className="contact-form-field">
          <label htmlFor="contact-country">
            Destination Country <span className="req-star">*</span>
          </label>
          <select
            id="contact-country"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className={`contact-select ${errors.country ? "has-error" : ""}`}
          >
            {ALL_COUNTRIES_LIST.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          {errors.country && <span className="contact-field-error"><AlertCircle size={13} /> {errors.country}</span>}
        </div>

        {/* Enquiry Type */}
        <div className="contact-form-field">
          <label htmlFor="contact-enquiryType">
            Enquiry Type <span className="req-star">*</span>
          </label>
          <select
            id="contact-enquiryType"
            value={form.enquiryType}
            onChange={(e) => update("enquiryType", e.target.value)}
            className="contact-select"
          >
            {ENQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Product / Model */}
        <div className="contact-form-field">
          <label htmlFor="contact-productModel">
            Product / Model <span className="opt-tag">(Optional)</span>
          </label>
          <input
            id="contact-productModel"
            type="text"
            maxLength={100}
            value={form.productModel}
            onChange={(e) => update("productModel", e.target.value)}
            placeholder="e.g. Apex Pro Grade 1+ Bat / Test Pads"
          />
        </div>

        {/* Quantity */}
        <div className="contact-form-field">
          <label htmlFor="contact-quantity">
            Quantity
          </label>
          <input
            id="contact-quantity"
            type="text"
            maxLength={20}
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            placeholder="e.g. 1 bat / 10 kit sets"
          />
        </div>

        {/* Existing Order Number */}
        <div className="contact-form-field">
          <label htmlFor="contact-orderNumber">
            Order Reference <span className="opt-tag">(Optional)</span>
          </label>
          <input
            id="contact-orderNumber"
            type="text"
            maxLength={40}
            value={form.orderNumber}
            onChange={(e) => update("orderNumber", e.target.value)}
            placeholder="e.g. SCK-84920"
          />
        </div>
      </div>

      {/* Message Textarea */}
      <div className="contact-form-field full-width">
        <label htmlFor="contact-message">
          Enquiry Message <span className="req-star">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          maxLength={2000}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Please describe your requirements (e.g. bat weight 2lb 8oz, grain preference, custom laser engraving, international express courier timeline)..."
          className={errors.message ? "has-error" : ""}
        />
        {errors.message && <span className="contact-field-error"><AlertCircle size={13} /> {errors.message}</span>}
      </div>

      {/* Action Buttons */}
      <div className="contact-form-actions">
        <button
          type="submit"
          className="contact-submit-btn whatsapp"
          id="contact-whatsapp-submit"
        >
          <MessageCircle size={18} />
          <span>Send on WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleEmailTrigger}
          className="contact-submit-btn email"
          id="contact-email-trigger"
        >
          <Mail size={18} />
          <span>Send via Email</span>
        </button>
      </div>

      {/* Email Client Choice Tray */}
      {showEmailOptions && (
        <div className="contact-email-tray">
          <div className="email-tray-header">
            <span className="tray-title">Choose your preferred email client:</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="copy-email-btn"
            >
              {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              <span>{copied ? "Copied Official Email!" : "Copy Email Address"}</span>
            </button>
          </div>

          <div className="email-tray-grid">
            <a
              href={gmailWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="email-client-link gmail"
            >
              <span>Gmail Web</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={outlookWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="email-client-link outlook"
            >
              <span>Outlook Web</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={yahooWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="email-client-link yahoo"
            >
              <span>Yahoo Mail</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={standardMailto}
              className="email-client-link default-app"
            >
              <span>Default Mail App</span>
            </a>
          </div>
        </div>
      )}

      {submitted && (
        <div className="contact-success-banner">
          <Check size={16} />
          <span>Enquiry logged! WhatsApp opened in a new tab with your pre-filled details.</span>
        </div>
      )}
    </form>
  );
}
