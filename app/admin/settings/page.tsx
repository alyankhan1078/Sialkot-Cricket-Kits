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
    whatsappNumber: "+92 323 1438214",
    contactEmail: "sialkotcricketkits@gmail.com",
    contactPhone: "+92 327 5756188",
    factoryAddress: "Superior Cricket Factory, House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
    businessName: "Sialkot Cricket Kits",
    announcementText: "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
    catalogueUrl: "/catalogue/Sialkot-Cricket-Kits-Catalogue-2026.pdf",

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
    easypaisaNumber: "03499585519",
    easypaisaTitle: "ALYAN WAZIR",
    easypaisaEnabled: true,

    // International Remittance & Digital
    payoneerEmail: "alyankhan1078@gmail.com",
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
                placeholder="+92 323 1438214"
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
                  placeholder="03499585519"
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
                  placeholder="alyankhan1078@gmail.com"
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
