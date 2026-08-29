"use client";

import { useState, useRef, useEffect, useId, useTransition } from "react";
import {
  ChevronDown,
  Search,
  Check,
  Globe,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  ALL_COUNTRIES,
  POPULAR_DESTINATIONS,
  REMAINING_COUNTRIES,
  searchCountries,
  resolveCountry,
  CountryInfo,
} from "@/src/lib/countries";

interface CountrySelectorProps {
  value: string; // Country name or code (e.g. "United Kingdom" or "GB")
  onChange: (country: CountryInfo) => void;
  error?: string | null;
  disabled?: boolean;
  id?: string;
  autoFocus?: boolean;
}

export function CountrySelector({
  value,
  onChange,
  error,
  disabled = false,
  id: customId,
  autoFocus = false,
}: CountrySelectorProps) {
  const generatedId = useId();
  const componentId = customId || generatedId;
  const listboxId = `${componentId}-listbox`;
  const labelId = `${componentId}-label`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedCountry = resolveCountry(value);

  // Compute filtered country list
  const filteredCountries = searchQuery.trim()
    ? searchCountries(searchQuery)
    : null; // null means render grouped Popular + Remaining

  // Safe outside click listener using click event to preserve target interactions
  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentClick(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setActiveIndex(-1);
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

  // Handle country selection
  const handleSelect = (country: CountryInfo) => {
    onChange(country);
    setIsOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const currentList = filteredCountries
      ? filteredCountries
      : [...POPULAR_DESTINATIONS, ...REMAINING_COUNTRIES];

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
      setActiveIndex(-1);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < currentList.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : currentList.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < currentList.length) {
        handleSelect(currentList[activeIndex]);
      } else if (filteredCountries && filteredCountries.length > 0) {
        handleSelect(filteredCountries[0]);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="country-selector-wrapper"
      style={{ position: "relative", width: "100%" }}
      onKeyDown={handleKeyDown}
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
          <Globe size={14} color="#d97706" />
          <span>DESTINATION COUNTRY</span>
          <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
        </div>
        {selectedCountry && !error && (
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
            <Check size={13} strokeWidth={2.5} /> Selected
          </span>
        )}
      </label>

      {/* Main Combobox Trigger Button */}
      <button
        ref={triggerRef}
        id={componentId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-required="true"
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        style={{
          width: "100%",
          height: 52,
          minHeight: 52,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: disabled ? "#f8fafc" : "#ffffff",
          border: error
            ? "1.5px solid #ef4444"
            : isOpen
            ? "1.5px solid var(--primary, #f2a928)"
            : selectedCountry
            ? "1.5px solid #22c55e"
            : "1.5px solid #cbd5e1",
          borderRadius: 8,
          color: selectedCountry ? "#0f172a" : "#94a3b8",
          fontSize: "16px",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          boxShadow: isOpen
            ? "0 0 0 3px rgba(242, 169, 40, 0.2)"
            : error
            ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
            : "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {selectedCountry ? (
            <>
              <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>
                {selectedCountry.flag}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedCountry.name}
              </span>
              <span
                style={{
                  fontSize: ".72rem",
                  fontWeight: 700,
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: "#475569",
                }}
              >
                {selectedCountry.code}
              </span>
            </>
          ) : (
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: ".92rem" }}>
              Select your destination country
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {selectedCountry && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ code: "", name: "", flag: "" });
                setSearchQuery("");
              }}
              style={{
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label="Clear destination country selection"
              title="Clear selection"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={18}
            color={isOpen ? "var(--primary, #f2a928)" : "#64748b"}
            style={{
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
      </button>

      {/* Validation Error Message */}
      {error && (
        <div
          id="country-error"
          role="alert"
          className="checkout-field-error"
        >
          <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown Menu (Crisp Light Theme) */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            width: "100%",
            maxWidth: "100%",
            background: "#ffffff",
            border: "1.5px solid #cbd5e1",
            borderRadius: 10,
            boxShadow:
              "0 14px 36px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: 360,
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
            }}
          >
            <Search size={16} color="#d97706" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const q = e.target.value;
                startTransition(() => {
                  setSearchQuery(q);
                  setActiveIndex(0);
                });
              }}
              placeholder="Search destination country or city (e.g. Dubai, England, USA)..."
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                outline: "none",
                color: "#0f172a",
                fontSize: "16px",
                padding: "8px 10px",
                boxSizing: "border-box",
              }}
              aria-label="Search destination countries"
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
                aria-label="Clear search input"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Listbox Container */}
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Available destination countries"
            style={{
              overflowY: "auto",
              padding: "4px 0",
              flex: 1,
            }}
          >
            {/* Filtered Search View */}
            {filteredCountries !== null ? (
              filteredCountries.length > 0 ? (
                filteredCountries.map((c, index) => {
                  const isSelected = selectedCountry?.code === c.code;
                  const isActive = activeIndex === index;
                  return (
                    <div
                      key={c.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c)}
                      onMouseEnter={() => setActiveIndex(index)}
                      style={{
                        padding: "9px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isActive
                          ? "rgba(242, 169, 40, 0.12)"
                          : isSelected
                          ? "rgba(34, 197, 94, 0.08)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid var(--primary, #f2a928)"
                          : isSelected
                          ? "3px solid #22c55e"
                          : "3px solid transparent",
                        transition: "background 0.1s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
                          {c.flag}
                        </span>
                        <span
                          style={{
                            fontSize: ".88rem",
                            color: isSelected ? "#15803d" : "#1e293b",
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {c.name}
                        </span>
                        <span
                          style={{
                            fontSize: ".72rem",
                            color: "#64748b",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            padding: "1px 5px",
                            borderRadius: 3,
                          }}
                        >
                          {c.code}
                        </span>
                      </div>
                      {isSelected && <Check size={16} color="#16a34a" />}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: ".85rem",
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1e293b" }}>
                    No matching destinations found
                  </p>
                  <span style={{ fontSize: ".78rem" }}>
                    Please check the spelling or search by country name or city alias.
                  </span>
                </div>
              )
            ) : (
              /* Grouped View (Popular + Remaining) */
              <>
                {/* 1. Popular Destinations */}
                <div
                  style={{
                    padding: "6px 14px 4px",
                    fontSize: ".74rem",
                    fontWeight: 700,
                    color: "#d97706",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderBottom: "1px solid #f1f5f9",
                    background: "#f8fafc",
                  }}
                >
                  <Sparkles size={13} />
                  <span>Popular Destinations</span>
                </div>

                {POPULAR_DESTINATIONS.map((c, index) => {
                  const isSelected = selectedCountry?.code === c.code;
                  const isActive = activeIndex === index;
                  return (
                    <div
                      key={c.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c)}
                      onMouseEnter={() => setActiveIndex(index)}
                      style={{
                        padding: "9px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isActive
                          ? "rgba(242, 169, 40, 0.12)"
                          : isSelected
                          ? "rgba(34, 197, 94, 0.08)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid var(--primary, #f2a928)"
                          : isSelected
                          ? "3px solid #22c55e"
                          : "3px solid transparent",
                        transition: "background 0.1s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
                          {c.flag}
                        </span>
                        <span
                          style={{
                            fontSize: ".88rem",
                            color: isSelected ? "#15803d" : "#1e293b",
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {c.name}
                        </span>
                        <span
                          style={{
                            fontSize: ".72rem",
                            color: "#64748b",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            padding: "1px 5px",
                            borderRadius: 3,
                          }}
                        >
                          {c.code}
                        </span>
                      </div>
                      {isSelected && <Check size={16} color="#16a34a" />}
                    </div>
                  );
                })}

                {/* 2. All Remaining Countries Section */}
                <div
                  style={{
                    padding: "8px 14px 4px",
                    fontSize: ".74rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderTop: "1px solid #e2e8f0",
                    borderBottom: "1px solid #f1f5f9",
                    background: "#f8fafc",
                    marginTop: 4,
                  }}
                >
                  <Globe size={13} />
                  <span>All Countries (A – Z)</span>
                </div>

                {REMAINING_COUNTRIES.map((c, rIdx) => {
                  const globalIdx = POPULAR_DESTINATIONS.length + rIdx;
                  const isSelected = selectedCountry?.code === c.code;
                  const isActive = activeIndex === globalIdx;
                  return (
                    <div
                      key={c.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      style={{
                        padding: "9px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isActive
                          ? "rgba(242, 169, 40, 0.12)"
                          : isSelected
                          ? "rgba(34, 197, 94, 0.08)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid var(--primary, #f2a928)"
                          : isSelected
                          ? "3px solid #22c55e"
                          : "3px solid transparent",
                        transition: "background 0.1s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
                          {c.flag}
                        </span>
                        <span
                          style={{
                            fontSize: ".88rem",
                            color: isSelected ? "#15803d" : "#1e293b",
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {c.name}
                        </span>
                        <span
                          style={{
                            fontSize: ".72rem",
                            color: "#64748b",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            padding: "1px 5px",
                            borderRadius: 3,
                          }}
                        >
                          {c.code}
                        </span>
                      </div>
                      {isSelected && <Check size={16} color="#16a34a" />}
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
