import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Handshake, MapPin, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Sialkot Cricket Kits",
  description: "Learn about Sialkot Cricket Kits, our catalogue, custom equipment service, customer communication and worldwide order support.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero about-hero"><div><p className="eyebrow">Based in Sialkot, Pakistan</p><h1>Equipment supported by clear communication.</h1><p>We help players review current products, compare catalogue options and confirm specifications before ordering.</p></div></section>
      <section className="story-section"><div><p className="eyebrow dark">Our approach</p><h2>From product selection to delivery planning.</h2></div><div><p>Sialkot Cricket Kits supplies cricket bats, protective equipment, wicketkeeping gear, kit bags, accessories and teamwear from Sialkot, Pakistan.</p><p>Our customer process focuses on confirming the exact model, current stock, product specifications and destination before payment. Customers can request original pictures and live product or bat ping videos through our official WhatsApp number.</p><p>Customized equipment is discussed individually so that preferences such as bat weight, handle and profile can be reviewed before production begins.</p></div></section>
      <section className="values-grid"><article><MapPin /><h3>Sialkot based</h3><p>Factory contact and order support are coordinated from Model Town, Sialkot.</p></article><article><Eye /><h3>Product visibility</h3><p>Request current images or a live product video before confirming your order.</p></article><article><PackageCheck /><h3>Order confirmation</h3><p>Stock, specification, packing, shipping cost and timing are confirmed before payment.</p></article><article><Handshake /><h3>Long-term service</h3><p>Clear communication supports repeat orders and long-term customer relationships.</p></article></section>
      <section className="about-cta"><div><p className="eyebrow">Review the current range</p><h2>Start with the approved catalogue.</h2></div><Link className="button primary" href="/shop">Shop equipment <ArrowRight size={18} /></Link></section>
    </main>
  );
}

