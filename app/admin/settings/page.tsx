"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Lock,
  Globe,
  CheckCircle2,
  CreditCard,
  Building2,
  Wallet,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { DBSettings } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

export default function AdminSettingsPage() {
  const { showToast } = useAdminFeedback();
  const [activeTab, setActiveTab] = useState<"general" | "payments" | "security">("general");

  const [settings, setSettings] = useState<DBSettings>({
    whatsappNumber: "+92 327 5756188",
    contactEmail: "sialkotcricketkits@gmail.com",
    contactPhone: "+92 327 5756188",
    factoryAddress: "Superior Cricket Factory, House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
    businessName: "Sialkot Cricket Kits",
    announcementText: "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
    catalogueUrl: "/catalogue/Sialkot-Cricket-Kits-Catalogue-2026.pdf",
    instagramUrl: "https://www.instagram.com/sialkotcricketkits?igsi=aDBzenZrcnJjbXJi&utm_source=qr",
    facebookUrl: "https://www.facebook.com/share/1PTo3qxPAn/?mibextid=wwXIfr",
    tiktokUrl: "https://www.tiktok.com/@sialkotcricketkits",

    // Safepay Pakistan Hosted Checkout (Primary Gateway)
    safepayApiKey: "",
    safepaySecretKey: "",
    safepayWebhookSecret: "",
    safepayEnvironment: "sandbox",
    safepayEnabled: true,

    // UBL Bank Detail Verification Lock
    ublDetailsVerifiedByAdmin: true,
    ublDetailsVerifiedAt: new Date().toISOString(),
    ublDetailsVerifiedBy: "Administrator",

    // Bank details (UBL)
    bankName: "United Bank Limited (UBL)",
    accountTitle: "ALYAN WAZIR",
    accountNumber: "0881304929964",
    iban: "PK93UNIL0109000304929964",
    swiftBic: "UNILPKKA",
    bankBranch: "0881-Wana",
    bankEnabled: true,

    // Pakistani Wallets & Raast
    raastId: "03275756188",
    raastTitle: "ALYAN WAZIR",
    raastEnabled: true,
    jazzcashNumber: "03275756188",
    jazzcashTitle: "ALYAN WAZIR",
    jazzcashEnabled: true,
    nayapayNumber: "03275756188",
    nayapayTitle: "ALYAN WAZIR",
    nayapayEnabled: true,
    sadapayNumber: "03275756188",
    sadapayTitle: "ALYAN WAZIR",
    sadapayEnabled: true,
    easypaisaNumber: "03275756188",
    easypaisaTitle: "ALYAN WAZIR",
    easypaisaEnabled: true,

    // International Remittance & Digital
    payoneerEmail: "sialkotcricketkits@gmail.com",
    payoneerEnabled: true,
    wiseEmail: "sialkotcricketkits@gmail.com",
    wiseTag: "@sialkotcricket",
    wiseEnabled: true,
    remitlyEnabled: true,
    westernUnionEnabled: true,
    moneygramEnabled: true,
    worldRemitEnabled: true,
    taptapSendEnabled: true,

    // Stripe Card Processing
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSaved(true);
        showToast("Settings & payment details saved successfully!", "success");
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        showToast(data.error || "Failed to save settings", "error");
      }
    } catch {
      showToast("Network error while saving settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match");
      showToast("Passwords do not match", "warning");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters");
      showToast("Password must be at least 6 characters", "warning");
      return;
    }

    setSavingPassword(true);
    setPasswordMsg("");

    try {
      const res = await fetch("/api/admin/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg("Password updated successfully!");
        showToast("Admin password updated successfully!", "success");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg(data.error || "Failed to update password");
        showToast(data.error || "Failed to update password", "error");
      }
    } catch {
      setPasswordMsg("Network error");
      showToast("Network error while updating password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div style={{ color: "var(--adm-muted)", padding: "2rem" }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="admin-header">
        <div>
          <h1>Settings & Payment Gateways</h1>
          <p>Configure storefront contact information, accepted payment channels, bank accounts, and admin security.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--adm-border)", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "general" ? "2px solid var(--adm-primary)" : "2px solid transparent",
            color: activeTab === "general" ? "#fff" : "var(--adm-muted)",
            fontWeight: activeTab === "general" ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.95rem",
          }}
        >
          <Globe size={18} /> Store & Contact Info
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "payments" ? "2px solid var(--adm-primary)" : "2px solid transparent",
            color: activeTab === "payments" ? "#fff" : "var(--adm-muted)",
            fontWeight: activeTab === "payments" ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.95rem",
          }}
        >
          <CreditCard size={18} /> Payment Methods & Bank Accounts
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "security" ? "2px solid var(--adm-primary)" : "2px solid transparent",
            color: activeTab === "security" ? "#fff" : "var(--adm-muted)",
            fontWeight: activeTab === "security" ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.95rem",
          }}
        >
          <Lock size={18} /> Admin Security
        </button>
      </div>

      {settingsSaved && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            color: "#34d399",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={18} />
          <span>Settings updated and saved successfully!</span>
        </div>
      )}

      {/* Tab 1: General Store Settings */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveSettings} className="admin-card">
          <h2 style={{ fontSize: "1.2rem", margin: "0 0 1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Globe size={20} color="var(--adm-primary)" />
            <span>Storefront Contact Information</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="admin-form-group">
              <label>Business Name</label>
              <input
                className="admin-input"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>WhatsApp Number (Primary Checkout)</label>
              <input
                className="admin-input"
                placeholder="+92 327 5756188"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="admin-form-group">
              <label>Contact Email</label>
              <input
                type="email"
                className="admin-input"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Contact Phone</label>
              <input
                className="admin-input"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Factory / Workshop Address</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={settings.factoryAddress}
              onChange={(e) => setSettings({ ...settings, factoryAddress: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label>Announcement Bar Message</label>
            <input
              className="admin-input"
              value={settings.announcementText}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label>Catalogue PDF Download Link</label>
            <input
              className="admin-input"
              value={settings.catalogueUrl}
              onChange={(e) => setSettings({ ...settings, catalogueUrl: e.target.value })}
            />
          </div>

          <div style={{ margin: "1.25rem 0 0.5rem", borderTop: "1px solid var(--adm-border)", paddingTop: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", color: "#fff", margin: "0 0 0.85rem" }}>Official Social Media Channels</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label>Instagram Profile URL</label>
                <input
                  className="admin-input"
                  placeholder="https://www.instagram.com/..."
                  value={settings.instagramUrl || ""}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Facebook Page URL</label>
                <input
                  className="admin-input"
                  placeholder="https://www.facebook.com/..."
                  value={settings.facebookUrl || ""}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>TikTok Profile URL</label>
                <input
                  className="admin-input"
                  placeholder="https://www.tiktok.com/@..."
                  value={settings.tiktokUrl || ""}
                  onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ marginTop: "1rem" }}
            disabled={savingSettings}
          >
            <Save size={16} />
            <span>{savingSettings ? "Saving..." : "Save Store Settings"}</span>
          </button>
        </form>
      )}

      {/* Tab 2: Payment Methods & Bank Accounts */}
      {activeTab === "payments" && (
        <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* UBL Bank Details & Admin Verification Lock */}
          <div className="admin-card" style={{ border: "1.5px solid rgba(242, 169, 40, 0.4)", background: "linear-gradient(135deg, rgba(242, 169, 40, 0.04) 0%, rgba(17, 24, 39, 0.8) 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ fontSize: "1.15rem", margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building2 size={20} color="#f2a928" />
                <span>Official UBL Beneficiary Bank Account (Centralized)</span>
              </h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(34, 197, 94, 0.15)", padding: "4px 10px", borderRadius: "999px", color: "#4ade80", fontSize: "0.75rem", fontWeight: 700 }}>
                <span>🔒 Beneficiary: ALYAN WAZIR</span>
              </div>
            </div>

            <p style={{ color: "var(--adm-muted)", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.5 }}>
              All customer bank transfers and international remittances are deposited into the verified UBL account titled <strong>ALYAN WAZIR</strong>.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: "10px", marginBottom: "1rem" }}>
              <div><small style={{ color: "var(--adm-muted)", display: "block" }}>Bank Name</small><strong style={{ color: "#fff" }}>United Bank Limited (UBL)</strong></div>
              <div><small style={{ color: "var(--adm-muted)", display: "block" }}>Beneficiary Title</small><strong style={{ color: "#f2a928" }}>ALYAN WAZIR</strong></div>
              <div><small style={{ color: "var(--adm-muted)", display: "block" }}>Account Number</small><code style={{ color: "#38bdf8", fontSize: ".9rem" }}>0881304929964</code></div>
              <div><small style={{ color: "var(--adm-muted)", display: "block" }}>IBAN</small><code style={{ color: "#38bdf8", fontSize: ".9rem" }}>PK93UNIL0109000304929964</code></div>
              <div><small style={{ color: "var(--adm-muted)", display: "block" }}>SWIFT / BIC</small><code style={{ color: "#fff" }}>UNILPKKA</code></div>
              <div><small style={{ color: "var(--adm-muted)", display: "block" }}>Branch Name</small><span style={{ color: "#fff" }}>0881 – Wana</span></div>
            </div>

            {/* Verification Lock Checkbox */}
            <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "8px", padding: "12px 14px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: ".82rem", color: "#4ade80", lineHeight: 1.4 }}>
                <input
                  type="checkbox"
                  checked={settings.ublDetailsVerifiedByAdmin ?? true}
                  onChange={(e) => setSettings({ ...settings, ublDetailsVerifiedByAdmin: e.target.checked })}
                  style={{ marginTop: 2, accentColor: "#22c55e", width: 16, height: 16 }}
                />
                <span>
                  <strong>Admin Verification Lock:</strong> I have verified these payment details against the UBL app, official bank statement or UBL Account Maintenance Certificate.
                </span>
              </label>
            </div>
          </div>

          {/* Future UBL Card Gateway Notice */}
          <div className="admin-card" style={{ border: "1px dashed #334155" }}>
            <h3 style={{ fontSize: ".98rem", margin: "0 0 6px", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={16} color="#94a3b8" />
              <span>Future UBL Internet Payment Gateway (IPG) Integration</span>
            </h3>
            <p style={{ color: "var(--adm-muted)", fontSize: ".82rem", margin: 0, lineHeight: 1.5 }}>
              The architecture is prepared for the official UBL Internet Payment Gateway. Card checkout remains disabled (<code>UBL_CARD_GATEWAY_ENABLED = false</code>) until production merchant credentials are confirmed.
            </p>
          </div>
          <div className="admin-card" style={{ border: "1px solid rgba(34, 197, 94, 0.35)", background: "linear-gradient(135deg, rgba(34, 197, 94, 0.04) 0%, rgba(17, 24, 39, 0.8) 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ fontSize: "1.15rem", margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={20} color="#22c55e" />
                <span>Safepay Pakistan Hosted Checkout (Primary Gateway)</span>
              </h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(34, 197, 94, 0.15)", padding: "4px 10px", borderRadius: "999px", color: "#4ade80", fontSize: "0.75rem", fontWeight: 700 }}>
                <span>🏦 Direct UBL Settlement</span>
              </div>
            </div>
            <p style={{ color: "var(--adm-muted)", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.5 }}>
              Safepay processes Debit &amp; Credit Cards (Visa, Mastercard, PayPak, UnionPay), Raast, and Mobile Wallets with secure hosted checkout. All collected PKR funds settle directly to your verified UBL merchant bank account.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label>Environment Mode</label>
                <select
                  className="admin-select"
                  value={settings.safepayEnvironment || "sandbox"}
                  onChange={(e) => setSettings({ ...settings, safepayEnvironment: e.target.value as any })}
                >
                  <option value="sandbox">Sandbox / Test Mode (Recommended during setup)</option>
                  <option value="production">Production / Live Payments (Requires verified Safepay account)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Safepay Public / API Key</label>
                <input
                  className="admin-input"
                  placeholder="sec_..."
                  value={settings.safepayApiKey || ""}
                  onChange={(e) => setSettings({ ...settings, safepayApiKey: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Safepay Secret Key (Server-side)</label>
                <input
                  type="password"
                  className="admin-input"
                  placeholder="sec_..."
                  value={settings.safepaySecretKey || ""}
                  onChange={(e) => setSettings({ ...settings, safepaySecretKey: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Safepay Webhook Secret</label>
                <input
                  type="password"
                  className="admin-input"
                  placeholder="whsec_..."
                  value={settings.safepayWebhookSecret || ""}
                  onChange={(e) => setSettings({ ...settings, safepayWebhookSecret: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#64748b" }}>
              💡 Webhook URL to register in Safepay Merchant Dashboard: <code>https://sialkotcricketkits.co.uk/api/webhooks/safepay</code>
            </div>
          </div>

          {/* Card Processing / Stripe */}
          <div className="admin-card">
            <h2 style={{ fontSize: "1.15rem", margin: "0 0 1rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CreditCard size={20} color="#3b82f6" />
              <span>Credit / Debit Card Processing (Stripe / Apple Pay / Google Pay)</span>
            </h2>
            <p style={{ color: "var(--adm-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Enable direct card payments during cart checkout. If left empty, card checkout defaults to WhatsApp payment verification.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label>Stripe Publishable Key</label>
                <input
                  className="admin-input"
                  placeholder="pk_live_... or pk_test_..."
                  value={settings.stripePublishableKey || ""}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Stripe Secret Key</label>
                <input
                  type="password"
                  className="admin-input"
                  placeholder="sk_live_... or sk_test_..."
                  value={settings.stripeSecretKey || ""}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Direct Bank Wire / IBAN */}
          <div className="admin-card">
            <h2 style={{ fontSize: "1.15rem", margin: "0 0 1rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Building2 size={20} color="#a855f7" />
              <span>Official Bank Account (IBAN & SWIFT)</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label>Bank Name</label>
                <input
                  className="admin-input"
                  value={settings.bankName || ""}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="Meezan Bank / HBL / UBL"
                />
              </div>

              <div className="admin-form-group">
                <label>Account Title</label>
                <input
                  className="admin-input"
                  value={settings.accountTitle || ""}
                  onChange={(e) => setSettings({ ...settings, accountTitle: e.target.value })}
                  placeholder="Sialkot Cricket Kits"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label>Account Number</label>
                <input
                  className="admin-input"
                  value={settings.accountNumber || ""}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  placeholder="01080105891234"
                />
              </div>

              <div className="admin-form-group">
                <label>IBAN Number</label>
                <input
                  className="admin-input"
                  value={settings.iban || ""}
                  onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                  placeholder="PK36MEZN0001080105891234"
                />
              </div>

              <div className="admin-form-group">
                <label>SWIFT / BIC Code</label>
                <input
                  className="admin-input"
                  value={settings.swiftBic || ""}
                  onChange={(e) => setSettings({ ...settings, swiftBic: e.target.value })}
                  placeholder="MEZNPKKA"
                />
              </div>
            </div>
          </div>

          {/* Pakistan Mobile Wallets & Microfinance */}
          <div className="admin-card">
            <h2 style={{ fontSize: "1.15rem", margin: "0 0 1rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Wallet size={20} color="#22c55e" />
              <span>Pakistan Domestic Wallets, Microfinance & Raast ID</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label>Raast ID (Instant Transfer)</label>
                <input
                  className="admin-input"
                  value={settings.raastId || ""}
                  onChange={(e) => setSettings({ ...settings, raastId: e.target.value })}
                  placeholder="03275756188"
                />
              </div>

              <div className="admin-form-group">
                <label>JazzCash Number</label>
                <input
                  className="admin-input"
                  value={settings.jazzcashNumber || ""}
                  onChange={(e) => setSettings({ ...settings, jazzcashNumber: e.target.value })}
                  placeholder="03275756188"
                />
              </div>

              <div className="admin-form-group">
                <label>Nayapay Number</label>
                <input
                  className="admin-input"
                  value={settings.nayapayNumber || ""}
                  onChange={(e) => setSettings({ ...settings, nayapayNumber: e.target.value })}
                  placeholder="03275756188"
                />
              </div>

              <div className="admin-form-group">
                <label>SadaPay Number</label>
                <input
                  className="admin-input"
                  value={settings.sadapayNumber || ""}
                  onChange={(e) => setSettings({ ...settings, sadapayNumber: e.target.value })}
                  placeholder="03275756188"
                />
              </div>

              <div className="admin-form-group">
                <label>EasyPaisa Number</label>
                <input
                  className="admin-input"
                  value={settings.easypaisaNumber || ""}
                  onChange={(e) => setSettings({ ...settings, easypaisaNumber: e.target.value })}
                  placeholder="03275756188"
                />
              </div>

              <div className="admin-form-group">
                <label>Account Title</label>
                <input
                  className="admin-input"
                  value={settings.jazzcashTitle || "ALYAN WAZIR"}
                  onChange={(e) => setSettings({ ...settings, jazzcashTitle: e.target.value, easypaisaTitle: e.target.value, raastTitle: e.target.value, nayapayTitle: e.target.value, sadapayTitle: e.target.value })}
                  placeholder="ALYAN WAZIR"
                />
              </div>
            </div>
          </div>

          {/* International Remittance (Payoneer / Wise / Remitly / WU) */}
          <div className="admin-card">
            <h2 style={{ fontSize: "1.15rem", margin: "0 0 1rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Send size={20} color="#f59e0b" />
              <span>International Remittance (Payoneer, Wise & Remitly)</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label>Payoneer Email</label>
                <input
                  className="admin-input"
                  value={settings.payoneerEmail || ""}
                  onChange={(e) => setSettings({ ...settings, payoneerEmail: e.target.value })}
                  placeholder="sialkotcricketkits@gmail.com"
                />
              </div>

              <div className="admin-form-group">
                <label>Wise Email or Tag</label>
                <input
                  className="admin-input"
                  value={settings.wiseEmail || ""}
                  onChange={(e) => setSettings({ ...settings, wiseEmail: e.target.value })}
                  placeholder="sialkotcricketkits@gmail.com"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: "fit-content", padding: "12px 28px", fontSize: "1rem" }}
            disabled={savingSettings}
          >
            <Save size={18} />
            <span>{savingSettings ? "Saving Changes..." : "Save Payment Settings"}</span>
          </button>
        </form>
      )}

      {/* Tab 3: Security */}
      {activeTab === "security" && (
        <form onSubmit={handleUpdatePassword} className="admin-card" style={{ maxWidth: 500 }}>
          <h2 style={{ fontSize: "1.2rem", margin: "0 0 1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock size={20} color="#f59e0b" />
            <span>Change Admin Password</span>
          </h2>

          {passwordMsg && (
            <div
              style={{
                background: passwordMsg.includes("success") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: passwordMsg.includes("success") ? "#34d399" : "#f87171",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.85rem",
              }}
            >
              {passwordMsg}
            </div>
          )}

          <div className="admin-form-group">
            <label>New Password</label>
            <input
              type="password"
              className="admin-input"
              required
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="admin-input"
              required
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={savingPassword}
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}
