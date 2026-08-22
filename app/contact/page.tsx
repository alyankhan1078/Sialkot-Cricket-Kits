import type { Metadata } from "next";
import { Globe2, Mail, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "@/src/components/ContactForm";
import { whatsappUrl } from "@/src/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Sialkot Cricket Kits",
  description: "Contact Sialkot Cricket Kits through WhatsApp or email for product stock, specifications, live videos and worldwide delivery guidance.",
};

const mapsUrl = "https://www.google.com/maps/search/?api=1&query=House+207+Gulshan+Street+Model+Town+Sialkot+Pakistan";

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero compact-hero"><div><p className="eyebrow">Product & order support</p><h1>Talk to our Sialkot team.</h1><p>Send the product name, required quantity and delivery country for a clear stock and shipping confirmation.</p></div></section>
      <section className="contact-cards"><article><MessageCircle /><span>WhatsApp</span><a href={whatsappUrl("Hello Sialkot Cricket Kits, I would like to discuss an order.")} target="_blank" rel="noreferrer">+92 323 1438214</a><p>Fastest option for stock, pictures and live videos.</p></article><article><Mail /><span>Email</span><a href="mailto:sialkotcricketkits@gmail.com">sialkotcricketkits@gmail.com</a><p>For detailed quotations and international enquiries.</p></article><article><MapPin /><span>Factory address</span><a href={mapsUrl} target="_blank" rel="noreferrer">House No. 207, Gulshan Street, Model Town, Sialkot</a><p>Superior Cricket Factory, Sialkot, Pakistan.</p></article><article><Globe2 /><span>Delivery</span><strong>Worldwide</strong><p>Charges and timing are confirmed for each destination.</p></article></section>
      <section className="contact-layout"><div><p className="eyebrow dark">Send an enquiry</p><h2>Tell us what you need.</h2><p>Include the product, size, quantity and country. This form prepares a WhatsApp message or email on your device.</p><ContactForm /></div><aside><h3>Before you pay</h3><ul><li>Confirm current product stock.</li><li>Confirm bat specifications where applicable.</li><li>Confirm shipping charges and delivery estimate.</li><li>Use payment details received through the official WhatsApp or email.</li></ul><a className="button outline-dark wide" href={mapsUrl} target="_blank" rel="noreferrer"><MapPin size={18} /> Open address in Maps</a></aside></section>
    </main>
  );
}

