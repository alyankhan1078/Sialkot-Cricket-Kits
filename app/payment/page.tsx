import type { Metadata } from "next";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export const metadata: Metadata = {
  title: "Payment Guidance | Sialkot Cricket Kits",
  description: "Review accepted payment channels and verify official payment instructions with Sialkot Cricket Kits before transferring funds.",
  // Security fix: payment page must NOT be indexed — it contains sensitive guidance
  robots: { index: false, follow: false },
};

const methods = [
  "TapTap Send",
  "Remitly",
  "MoneyGram",
  "Wise",
  "Western Union",
  "WorldRemit",
  "International Money Transfer through a bank",
  "International Money Transfer through an exchange",
];

export default function PaymentPage() {
  return (
    <main>
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Verified order payments</p>
          <h1>Payment guidance.</h1>
          <p>Confirm the product, stock, shipping and final payable amount through our official contact before transferring funds.</p>
        </div>
      </section>

      <section className="payment-layout">
        <div>
          <p className="eyebrow dark">Accepted channels</p>
          <h2>International payment options.</h2>
          <div className="method-grid">
            {methods.map((method) => (
              <span key={method}><ShieldCheck size={17} /> {method}</span>
            ))}
          </div>
        </div>

        {/* Security fix: Full bank details removed from public page.
            Real payment instructions are shared ONLY via verified WhatsApp/email after order confirmation. */}
        <aside className="bank-card">
          <ShieldCheck size={28} />
          <span className="mini-label">Verified Payment Instructions</span>
          <h2>Never share payment details on a public page</h2>
          <p>
            For your security, full payment instructions (bank account, IBAN, SWIFT) are shared
            <strong> only after your order is confirmed</strong> through our official WhatsApp
            number or business email. This prevents fraudsters from copying real account details
            to impersonate us.
          </p>
          <p>
            Do <strong>not</strong> send money to any number or email you received unsolicited.
            Always confirm through the official channel below.
          </p>
          <a
            className="button whatsapp wide"
            href={whatsappUrl("Hello Sialkot Cricket Kits, my order has been confirmed and I would like verified payment instructions.")}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} /> Request verified payment instructions
          </a>
        </aside>
      </section>

      <section className="payment-warning">
        <div>
          <h2>Important payment safety</h2>
          <p>
            Do not send payment using details received from an unknown number or social account.
            Confirm the final amount and recipient details through WhatsApp{" "}
            <strong>+92 323 1438214</strong> or <strong>sialkotcricketkits@gmail.com</strong>.
            Sialkot Cricket Kits does not ask customers to enter bank-card information on this website.
          </p>
        </div>
      </section>
    </main>
  );
}
