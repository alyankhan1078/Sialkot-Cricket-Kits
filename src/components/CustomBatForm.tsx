"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export function CustomBatForm() {
  const [form, setForm] = useState({
    name: "",
    country: "",
    size: "Short Handle",
    handle: "Short Handle",
    weight: "",
    profile: "Duckbill",
    services: [] as string[],
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, value: string | string[]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleService = (service: string) =>
    update(
      "services",
      form.services.includes(service)
        ? form.services.filter((item) => item !== service)
        : [...form.services, service]
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = `Hello Sialkot Cricket Kits,\n\nI would like to request a custom cricket bat.\n\nName: ${
      form.name || "Not provided"
    }\nCountry: ${form.country || "Not provided"}\nBat size: ${form.size}\nHandle: ${
      form.handle
    }\nPreferred weight: ${form.weight || "Please advise"}\nProfile: ${
      form.profile
    }\nAdditional services: ${form.services.join(", ") || "None selected"}\nNotes: ${
      form.notes || "None"
    }\n\nPlease confirm the recommended edition, price, current willow options, build time and shipping charges. I would also like current pictures and a live ping video before confirmation. Thank you.`;

    // Save to database
    try {
      fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_bat",
          name: form.name,
          country: form.country,
          message: form.notes || `Custom bat request: ${form.size}, ${form.handle}, ${form.profile}`,
          product: "Custom Bat",
          extras: {
            size: form.size,
            handle: form.handle,
            weight: form.weight,
            profile: form.profile,
            services: form.services,
            notes: form.notes,
          },
        }),
      }).catch(() => {});
    } catch {
      // non-blocking
    }

    setSubmitted(true);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

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
          <span>Country</span>
          <input
            required
            maxLength={100}
            value={form.country}
            onChange={(event) => update("country", event.target.value)}
          />
        </label>
      </div>
      <div className="form-grid two">
        <label>
          <span>Bat size</span>
          <select value={form.size} onChange={(event) => update("size", event.target.value)}>
            <option>Short Handle</option>
            <option>Long Handle</option>
            <option>Harrow</option>
            <option>Size 6</option>
            <option>Size 5</option>
            <option>Size 4</option>
          </select>
        </label>
        <label>
          <span>Handle preference</span>
          <select value={form.handle} onChange={(event) => update("handle", event.target.value)}>
            <option>Short Handle</option>
            <option>Long Handle</option>
            <option>Please advise</option>
          </select>
        </label>
      </div>
      <div className="form-grid two">
        <label>
          <span>Preferred weight</span>
          <input
            maxLength={50}
            value={form.weight}
            onChange={(event) => update("weight", event.target.value)}
            placeholder="e.g. 1180 g"
          />
        </label>
        <label>
          <span>Profile</span>
          <select value={form.profile} onChange={(event) => update("profile", event.target.value)}>
            <option>Duckbill</option>
            <option>Mid</option>
            <option>High</option>
            <option>Full</option>
            <option>Concave</option>
            <option>Traditional</option>
            <option>Please advise</option>
          </select>
        </label>
      </div>
      <fieldset>
        <legend>Additional services</legend>
        <div className="checkbox-row">
          {["Knocking-in", "Name engraving", "Live ping video"].map((service) => (
            <label key={service}>
              <input
                type="checkbox"
                checked={form.services.includes(service)}
                onChange={() => toggleService(service)}
              />
              <span>{service}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <span>Additional requirements</span>
        <textarea
          rows={4}
          maxLength={2000}
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          placeholder="Tell us your playing style or any preference."
        />
      </label>
      <button className="button whatsapp wide" type="submit">
        <MessageCircle size={18} /> Send specifications on WhatsApp
      </button>
      {submitted && (
        <p style={{ color: "#34d399", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          ✓ Specifications recorded in database! WhatsApp opened in a new tab.
        </p>
      )}
      <p className="form-note">
        Custom builds normally require approximately 7-8 working days after specification approval and a
        30% advance payment.
      </p>
    </form>
  );
}
