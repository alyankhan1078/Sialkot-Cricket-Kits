"use client";

import { useEffect, useState } from "react";
import { Save, Lock, Phone, Mail, MapPin, Globe, CheckCircle2 } from "lucide-react";
import type { DBSettings } from "@/src/lib/data-service";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<DBSettings>({
    whatsappNumber: "+92 323 1438214",
    contactEmail: "sialkotcricketkits@gmail.com",
    contactPhone: "+92 323 1438214",
    factoryAddress: "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
    businessName: "Sialkot Cricket Kits",
    announcementText: "Worldwide delivery available · Live product & ping videos · Custom equipment from Sialkot",
    catalogueUrl: "/catalogue/Sialkot-Cricket-Kits-Catalogue-2026.pdf",
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
          setSettings(res.data);
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
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Network error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters");
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
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg(data.error || "Failed to update password");
      }
    } catch {
      setPasswordMsg("Network error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div style={{ color: "var(--adm-muted)", padding: "2rem" }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <div className="admin-header">
        <div>
          <h1>Site & Contact Settings</h1>
          <p>Manage WhatsApp contact details, business information, announcement banner, and admin credentials.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* General Site Settings */}
        <form onSubmit={handleSaveSettings} className="admin-card">
          <h2 style={{ fontSize: "1.2rem", margin: "0 0 1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Globe size={20} color="var(--adm-primary)" />
            <span>Storefront Contact Information</span>
          </h2>

          {settingsSaved && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle2 size={16} />
              <span>Settings updated successfully!</span>
            </div>
          )}

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
            <label>WhatsApp Number (Used for all checkout & enquiries)</label>
            <input
              className="admin-input"
              placeholder="+92 323 1438214"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              required
            />
            <small style={{ color: "var(--adm-muted)", display: "block", marginTop: "0.25rem" }}>
              Include international code e.g. +92 323 1438214
            </small>
          </div>

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

          <div className="admin-form-group">
            <label>Factory / Office Address</label>
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

        {/* Change Admin Password */}
        <form onSubmit={handleUpdatePassword} className="admin-card" style={{ height: "fit-content" }}>
          <h2 style={{ fontSize: "1.2rem", margin: "0 0 1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock size={20} color="#f59e0b" />
            <span>Admin Security</span>
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
            className="admin-btn admin-btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={savingPassword}
          >
            {savingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
