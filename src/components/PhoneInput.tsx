"use client";

import { useState, useRef, useEffect, useId, useTransition } from "react";
import { ChevronDown, Search, Check, AlertCircle, Phone, X, Sparkles, Globe } from "lucide-react";
import {
  ALL_PHONE_CODES,
  POPULAR_PHONE_CODES,
  getPhoneCountryByDialCode,
  getPhoneCountryByCode,
  PhoneCountryCode,
} from "@/src/lib/phone-codes";
import { validatePhone } from "@/src/lib/validation";

interface PhoneInputProps {
  value: string; // The national number or full number
  dialCode: string; // Calling code e.g. "+92"
  onChange: (phone: string, dialCode: string, fullE164: string) => void;
  onBlur?: () => void;
  error?: string | null;
  isValid?: boolean;
  disabled?: boolean;
  id?: string;
  autoFocus?: boolean;
}

export function PhoneInput({
  value,
  dialCode,
  onChange,
  onBlur,
  error,
  isValid = false,
  disabled = false,
  id: customId,
}: PhoneInputProps) {
  const generatedId = useId();
  const componentId = customId || generatedId;
  const listboxId = `${componentId}-dial-listbox`;
  const labelId = `${componentId}-label`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  const selectedPhoneCountry =
    getPhoneCountryByDialCode(dialCode) ||
    getPhoneCountryByCode("PK") ||
    ALL_PHONE_CODES[0];

  // Filter phone codes for the searchable dropdown
  const cleanSearch = searchQuery.trim().toLowerCase();
  const filteredCodes = cleanSearch
    ? ALL_PHONE_CODES.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanSearch) ||
          p.dialCode.includes(cleanSearch) ||
          p.code.toLowerCase() === cleanSearch
      )
    : null;

  // Safe outside click listener using click event
  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentClick(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelectCountry = (country: PhoneCountryCode) => {
    const valResult = validatePhone(value, country.dialCode);
    onChange(
      value,
      country.dialCode,
      valResult.e164 || `${country.dialCode}${value.replace(/\D/g, "")}`
    );
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.startsWith("+")) {
      const valResult = validatePhone(raw, dialCode);
      if (valResult.dialCode && valResult.nationalNumber) {
        onChange(valResult.nationalNumber, valResult.dialCode, valResult.e164 || raw);
        return;
      }
    }

    const valResult = validatePhone(raw, dialCode);
    onChange(raw, dialCode, valResult.e164 || `${dialCode}${raw.replace(/\D/g, "")}`);
  };

  return (
    <div
      ref={containerRef}
      className="phone-input-wrapper"
      style={{ position: "relative", width: "100%" }}
    >
      {/* Field Label */}
      <label
        id={labelId}
        htmlFor={componentId}
        className="checkout-field-label"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: ".78rem",
          fontWeight: 700,
          color: "#1e293b",
          textTransform: "uppercase",
          letterSpacing: ".06em",
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Phone size={14} color="#d97706" />
          <span>WHATSAPP / PHONE (WITH COUNTRY CODE)</span>
          <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
        </div>
        {isValid && !error && value.trim().length > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: "#16a34a",
              fontSize: ".72rem",
              fontWeight: 700,
            }}
          >
            <Check size={13} strokeWidth={2.5} /> Valid
          </span>
        )}
      </label>

      {/* Combined Dial Code Selector + National Number Input */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          height: 52,
          minHeight: 52,
          background: disabled ? "#f8fafc" : "#ffffff",
          border: error
            ? "1.5px solid #ef4444"
            : isOpen
            ? "1.5px solid var(--primary, #f2a928)"
            : isValid && value.trim().length > 0
            ? "1.5px solid #22c55e"
            : "1.5px solid #cbd5e1",
          borderRadius: 8,
          boxShadow: error
            ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
            : isOpen
            ? "0 0 0 3px rgba(242, 169, 40, 0.2)"
            : "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          overflow: "visible",
          boxSizing: "border-box",
        }}
      >
        {/* Country Dial Code Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label="Select country calling code"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 12px",
            background: "#f8fafc",
            border: "none",
            borderRight: "1px solid #e2e8f0",
            borderTopLeftRadius: 7,
            borderBottomLeftRadius: 7,
            color: "#0f172a",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: ".88rem",
            fontWeight: 600,
            outline: "none",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
            {selectedPhoneCountry.flag}
          </span>
          <span style={{ fontFamily: "monospace", color: "#0f172a", fontWeight: 700 }}>
            {selectedPhoneCountry.dialCode}
          </span>
          <ChevronDown
            size={14}
            color={isOpen ? "var(--primary, #f2a928)" : "#64748b"}
            style={{
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {/* National Number Input */}
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          <input
            ref={numberInputRef}
            id={componentId}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            disabled={disabled}
            value={value}
            onChange={handleNumberChange}
            onBlur={onBlur}
            placeholder={selectedPhoneCountry.example}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${componentId}-error` : undefined}
            style={{
              width: "100%",
              height: "100%",
              padding: "8px 36px 8px 12px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#0f172a",
              fontSize: "16px",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          {/* Validation Status Icon */}
          <div
            style={{
              position: "absolute",
              right: 12,
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            {isValid && !error && value.trim().length > 0 && (
              <Check size={16} color="#16a34a" />
            )}
            {error && <AlertCircle size={16} color="#ef4444" />}
          </div>
        </div>
      </div>

      {/* Field Error Message */}
      {error && (
        <div
          id={`${componentId}-error`}
          role="alert"
          className="checkout-field-error"
        >
          <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Searchable Dial Code Dropdown (Crisp Light Theme) */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 9999,
            width: "100%",
            maxWidth: "calc(100vw - 32px)",
            minWidth: 260,
            background: "#ffffff",
            border: "1.5px solid #cbd5e1",
            borderRadius: 10,
            boxShadow:
              "0 14px 36px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: 340,
            boxSizing: "border-box",
          }}
        >
          {/* Search Header */}
          <div
            style={{
              padding: "10px 12px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxSizing: "border-box",
            }}
          >
            <Search size={15} color="#d97706" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const q = e.target.value;
                startTransition(() => {
                  setSearchQuery(q);
                });
              }}
              placeholder="Search country or code (e.g. +92, UK)..."
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                outline: "none",
                color: "#0f172a",
                fontSize: "16px",
                padding: "6px 10px",
                boxSizing: "border-box",
              }}
              aria-label="Search country calling code"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Clear dial search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Listbox of Calling Codes */}
          <div
            id={listboxId}
            role="listbox"
            aria-label="Available country calling codes"
            style={{
              overflowY: "auto",
              padding: "4px 0",
              flex: 1,
            }}
          >
            {filteredCodes !== null ? (
              filteredCodes.length > 0 ? (
                filteredCodes.map((p) => {
                  const isSelected = selectedPhoneCountry.code === p.code;
                  return (
                    <div
                      key={p.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectCountry(p)}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isSelected ? "rgba(34, 197, 94, 0.08)" : "transparent",
                        borderLeft: isSelected ? "3px solid #22c55e" : "3px solid transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.15rem" }}>{p.flag}</span>
                        <span
                          style={{
                            fontSize: ".86rem",
                            color: isSelected ? "#15803d" : "#1e293b",
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: ".82rem",
                          fontFamily: "monospace",
                          color: "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        {p.dialCode}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "18px 12px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: ".82rem",
                  }}
                >
                  No matching calling codes found.
                </div>
              )
            ) : (
              <>
                {/* Popular Codes Section */}
                <div
                  style={{
                    padding: "6px 12px 3px",
                    fontSize: ".72rem",
                    fontWeight: 700,
                    color: "#d97706",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    borderBottom: "1px solid #f1f5f9",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Sparkles size={12} />
                  <span>Popular Destinations</span>
                </div>
                {POPULAR_PHONE_CODES.map((p) => {
                  const isSelected = selectedPhoneCountry.code === p.code;
                  return (
                    <div
                      key={p.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectCountry(p)}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isSelected ? "rgba(34, 197, 94, 0.08)" : "transparent",
                        borderLeft: isSelected ? "3px solid #22c55e" : "3px solid transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.15rem" }}>{p.flag}</span>
                        <span
                          style={{
                            fontSize: ".86rem",
                            color: isSelected ? "#15803d" : "#1e293b",
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: ".82rem",
                          fontFamily: "monospace",
                          color: "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        {p.dialCode}
                      </span>
                    </div>
                  );
                })}

                {/* All Calling Codes Section */}
                <div
                  style={{
                    padding: "8px 12px 3px",
                    fontSize: ".72rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    borderTop: "1px solid #e2e8f0",
                    borderBottom: "1px solid #f1f5f9",
                    background: "#f8fafc",
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Globe size={12} />
                  <span>All Countries (A – Z)</span>
                </div>
                {ALL_PHONE_CODES.filter((p) => !p.isPopular).map((p) => {
                  const isSelected = selectedPhoneCountry.code === p.code;
                  return (
                    <div
                      key={p.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectCountry(p)}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isSelected ? "rgba(34, 197, 94, 0.08)" : "transparent",
                        borderLeft: isSelected ? "3px solid #22c55e" : "3px solid transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.15rem" }}>{p.flag}</span>
                        <span
                          style={{
                            fontSize: ".86rem",
                            color: isSelected ? "#15803d" : "#1e293b",
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: ".82rem",
                          fontFamily: "monospace",
                          color: "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        {p.dialCode}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
