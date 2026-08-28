"use client";

import { useState, useRef, useEffect, useId } from "react";
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

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedCountry = resolveCountry(value);

  // Compute filtered country list
  const filteredCountries = searchQuery.trim()
    ? searchCountries(searchQuery)
    : null; // null means render grouped Popular + Remaining

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setActiveIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle country selection
  const handleSelect = (country: CountryInfo) => {
    onChange(country);
    setIsOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
    triggerRef.current?.focus();
  };

  // Keyboard navigation for trigger and search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    // Flat list of currently visible countries for indexing
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
      setActiveIndex((prev) =>
        prev < currentList.length - 1 ? prev + 1 : 0
      );
      // Scroll into view
      scrollActiveOptionIntoView(
        activeIndex < currentList.length - 1 ? activeIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : currentList.length - 1
      );
      scrollActiveOptionIntoView(
        activeIndex > 0 ? activeIndex - 1 : currentList.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < currentList.length) {
        handleSelect(currentList[activeIndex]);
      } else if (filteredCountries && filteredCountries.length > 0) {
        handleSelect(filteredCountries[0]);
      }
    }
  };

  const scrollActiveOptionIntoView = (index: number) => {
    if (!listboxRef.current) return;
    const option = listboxRef.current.querySelector(
      `[data-option-index="${index}"]`
    );
    if (option) {
      option.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="country-selector-container"
      style={{ position: "relative", width: "100%" }}
      onKeyDown={handleKeyDown}
    >
      {/* Accessible Field Label */}
      <label
        id={labelId}
        htmlFor={componentId}
        className="checkout-field-label"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: ".82rem",
          fontWeight: 700,
          color: "#f1f5f9",
          textTransform: "uppercase",
          letterSpacing: ".06em",
          marginBottom: 6,
        }}
      >
        <Globe size={15} color="var(--primary, #f2a928)" />
        <span>DESTINATION COUNTRY *</span>
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: "100%",
          minHeight: 46,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: selectedCountry
            ? "rgba(15, 23, 42, 0.85)"
            : "rgba(15, 23, 42, 0.65)",
          border: error
            ? "1.5px solid #ef4444"
            : isOpen
            ? "1.5px solid var(--primary, #f2a928)"
            : "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 8,
          color: selectedCountry ? "#ffffff" : "#94a3b8",
          fontSize: ".9rem",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          boxShadow: isOpen
            ? "0 0 0 3px rgba(242, 169, 40, 0.25)"
            : error
            ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
            : "none",
          transition: "all 0.18s ease-in-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {selectedCountry ? (
            <>
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>
                {selectedCountry.flag}
              </span>
              <span style={{ fontWeight: 600, color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedCountry.name}
              </span>
              <span
                style={{
                  fontSize: ".74rem",
                  fontWeight: 700,
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: "#cbd5e1",
                }}
              >
                {selectedCountry.code}
              </span>
            </>
          ) : (
            <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: ".9rem" }}>
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
                triggerRef.current?.focus();
              }}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "none",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
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
            color={isOpen ? "var(--primary, #f2a928)" : "#94a3b8"}
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
            fontSize: ".8rem",
            color: "#f87171",
            fontWeight: 500,
          }}
        >
          <AlertCircle size={14} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#0f172a",
            border: "1px solid rgba(242, 169, 40, 0.35)",
            borderRadius: 10,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: 380,
          }}
        >
          {/* Search Header */}
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(15, 23, 42, 0.98)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Search size={16} color="var(--primary, #f2a928)" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search by country, code, or alias (e.g. Dubai, England, USA)..."
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: ".88rem",
                padding: "4px 0",
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
                  color: "#94a3b8",
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
              padding: "6px 0",
              flex: 1,
            }}
          >
            {/* Case A: Filtered Results */}
            {filteredCountries !== null ? (
              filteredCountries.length > 0 ? (
                filteredCountries.map((c, index) => {
                  const isSelected = selectedCountry?.code === c.code;
                  const isActive = activeIndex === index;
                  return (
                    <div
                      key={c.code}
                      data-option-index={index}
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
                          ? "rgba(242, 169, 40, 0.15)"
                          : isSelected
                          ? "rgba(34, 197, 94, 0.12)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid var(--primary, #f2a928)"
                          : "3px solid transparent",
                        transition: "background 0.12s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{c.flag}</span>
                        <span style={{ fontSize: ".88rem", color: isSelected ? "#4ade80" : "#f1f5f9", fontWeight: isSelected ? 700 : 500 }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: ".72rem", color: "#94a3b8", background: "rgba(255, 255, 255, 0.05)", padding: "1px 5px", borderRadius: 3 }}>
                          {c.code}
                        </span>
                      </div>
                      {isSelected && <Check size={16} color="#22c55e" />}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: ".85rem",
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#cbd5e1" }}>
                    No matching destinations found
                  </p>
                  <span style={{ fontSize: ".78rem" }}>
                    Please check the spelling or search using standard country names.
                  </span>
                </div>
              )
            ) : (
              /* Case B: Grouped View (Popular Destinations + All Countries) */
              <>
                {/* 1. Popular Destinations Section */}
                <div
                  style={{
                    padding: "6px 14px 4px",
                    fontSize: ".74rem",
                    fontWeight: 700,
                    color: "var(--primary, #f2a928)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    background: "rgba(0, 0, 0, 0.2)",
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
                      data-option-index={index}
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
                          ? "rgba(242, 169, 40, 0.15)"
                          : isSelected
                          ? "rgba(34, 197, 94, 0.12)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid var(--primary, #f2a928)"
                          : "3px solid transparent",
                        transition: "background 0.12s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{c.flag}</span>
                        <span style={{ fontSize: ".88rem", color: isSelected ? "#4ade80" : "#f1f5f9", fontWeight: isSelected ? 700 : 500 }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: ".72rem", color: "#94a3b8", background: "rgba(255, 255, 255, 0.05)", padding: "1px 5px", borderRadius: 3 }}>
                          {c.code}
                        </span>
                      </div>
                      {isSelected && <Check size={16} color="#22c55e" />}
                    </div>
                  );
                })}

                {/* 2. All Remaining Countries Section */}
                <div
                  style={{
                    padding: "8px 14px 4px",
                    fontSize: ".74rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    background: "rgba(0, 0, 0, 0.2)",
                    marginTop: 6,
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
                      data-option-index={globalIdx}
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
                          ? "rgba(242, 169, 40, 0.15)"
                          : isSelected
                          ? "rgba(34, 197, 94, 0.12)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid var(--primary, #f2a928)"
                          : "3px solid transparent",
                        transition: "background 0.12s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{c.flag}</span>
                        <span style={{ fontSize: ".88rem", color: isSelected ? "#4ade80" : "#f1f5f9", fontWeight: isSelected ? 700 : 500 }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: ".72rem", color: "#94a3b8", background: "rgba(255, 255, 255, 0.05)", padding: "1px 5px", borderRadius: 3 }}>
                          {c.code}
                        </span>
                      </div>
                      {isSelected && <Check size={16} color="#22c55e" />}
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
