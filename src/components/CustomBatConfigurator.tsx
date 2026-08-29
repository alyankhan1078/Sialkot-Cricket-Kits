"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Video,
  Clock3,
  MessageCircle,
  Lock,
  ArrowRight,
  ShoppingBag,
  Sliders,
  ChevronRight,
  Info,
  CheckCircle2,
  Layers,
  Award,
  Flame,
  Truck,
  Building2,
  HelpCircle,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { products } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import {
  CUSTOM_BAT_CONFIG,
  calculateAdvancePayment,
  generateCustomBatWhatsAppMessage,
  type CustomBatTier,
} from "@/src/lib/custom-bat-config";
import { ALL_COUNTRIES } from "@/src/lib/countries";

export function CustomBatConfigurator() {
  const router = useRouter();
  const { addToCart, formatPrice, currency } = useStore();

  // ── Step 1: Size & Category ──
  const [selectedSizeId, setSelectedSizeId] = useState<string>("adult-sh");

  // ── Step 2: Construction Mode & Type (for Adult) ──
  const [constructionMode, setConstructionMode] = useState<"specific" | "budget">("specific");
  const [selectedConstruction, setSelectedConstruction] = useState<"Beauty Processed" | "Bonafide">("Beauty Processed");

  // ── Step 3: Quality Tier & Price ──
  const [selectedPrice, setSelectedPrice] = useState<number>(140);
  const [selectedTierLabel, setSelectedTierLabel] = useState<string>("Essential Custom");

  // ── Step 4: Specifications ──
  const [handle, setHandle] = useState<string>("Short Handle");
  const [weight, setWeight] = useState<string>("1180 g (2.9½ lbs)");
  const [customWeightInput, setCustomWeightInput] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("Duckbill");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerCountry, setCustomerCountry] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState<string>("");

  // ── Step 5: Additional Services & Interactive Engraving ──
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "knocking-in",
    "live-ping-video",
  ]);
  const [engravingText, setEngravingText] = useState<string>("");
  const [isEngravingConfirmed, setIsEngravingConfirmed] = useState<boolean>(false);
  const [engravingError, setEngravingError] = useState<string | null>(null);

  // ── Step 6: Advance Payment Percentage (Minimum 30%) ──
  const [advancePercent, setAdvancePercent] = useState<number>(30);

  // ── UI States ──
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Find active size option
  const activeSize = useMemo(() => {
    return (
      CUSTOM_BAT_CONFIG.sizes.find((s) => s.id === selectedSizeId) ||
      CUSTOM_BAT_CONFIG.sizes[0]
    );
  }, [selectedSizeId]);

  const isJuniorSize = activeSize.category === "junior";

  // Dynamic price resolution for junior sizes from existing product catalogue (single source of truth)
  const juniorCatalogPrice = useMemo(() => {
    if (!isJuniorSize || !activeSize.catalogProductId) return activeSize.fallbackPrice || 70;
    const catProd = products.find((p) => p.id === activeSize.catalogProductId);
    return catProd ? catProd.price : activeSize.fallbackPrice || 70;
  }, [isJuniorSize, activeSize]);

  // Determine active price and label when options change
  useEffect(() => {
    if (isJuniorSize) {
      setSelectedPrice(juniorCatalogPrice);
      setSelectedTierLabel(`Junior ${activeSize.name}`);
      return;
    }

    if (constructionMode === "budget") {
      const defaultBudget = CUSTOM_BAT_CONFIG.budgetTiers.find((t) => t.price === selectedPrice)
        ? selectedPrice
        : 300;
      const tier = CUSTOM_BAT_CONFIG.budgetTiers.find((t) => t.price === defaultBudget) || CUSTOM_BAT_CONFIG.budgetTiers[2];
      setSelectedPrice(tier.price);
      setSelectedTierLabel(tier.label);
      return;
    }

    if (selectedConstruction === "Beauty Processed") {
      const currentExists = CUSTOM_BAT_CONFIG.beautyProcessedTiers.some((t) => t.price === selectedPrice);
      if (!currentExists) {
        const defaultTier = CUSTOM_BAT_CONFIG.beautyProcessedTiers[0];
        setSelectedPrice(defaultTier.price);
        setSelectedTierLabel(defaultTier.label);
      } else {
        const tier = CUSTOM_BAT_CONFIG.beautyProcessedTiers.find((t) => t.price === selectedPrice);
        if (tier) setSelectedTierLabel(tier.label);
      }
    } else {
      const currentExists = CUSTOM_BAT_CONFIG.bonafideTiers.some((t) => t.price === selectedPrice);
      if (!currentExists) {
        const defaultTier = CUSTOM_BAT_CONFIG.bonafideTiers.find((t) => t.isPopular) || CUSTOM_BAT_CONFIG.bonafideTiers[2];
        setSelectedPrice(defaultTier.price);
        setSelectedTierLabel(defaultTier.label);
      } else {
        const tier = CUSTOM_BAT_CONFIG.bonafideTiers.find((t) => t.price === selectedPrice);
        if (tier) setSelectedTierLabel(tier.label);
      }
    }
  }, [selectedSizeId, isJuniorSize, juniorCatalogPrice, constructionMode, selectedConstruction]);

  // Calculation of advance deposit & remaining balance
  const { advanceAmount, remainingBalance } = useMemo(() => {
    return calculateAdvancePayment(selectedPrice, advancePercent);
  }, [selectedPrice, advancePercent]);

  // Selected Profile
  const activeProfile = useMemo(() => {
    return (
      CUSTOM_BAT_CONFIG.profiles.find((p) => p.id === selectedProfileId) ||
      CUSTOM_BAT_CONFIG.profiles[0]
    );
  }, [selectedProfileId]);

  const isEngravingSelected = selectedServices.includes("name-engraving");

  // Handle service toggle
  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const willInclude = !prev.includes(serviceId);
      if (serviceId === "name-engraving") {
        if (!willInclude) {
          // unchecking: clear error & confirmed state
          setIsEngravingConfirmed(false);
          setEngravingError(null);
        } else {
          // checking: clear error & prepare input
          setEngravingError(null);
        }
      }
      return willInclude ? [...prev, serviceId] : prev.filter((id) => id !== serviceId);
    });
  };

  // Confirm Engraving button handler
  const handleConfirmEngraving = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const trimmed = engravingText.trim();
    if (!trimmed) {
      setEngravingError("Please enter the text you want engraved.");
      return;
    }
    setEngravingText(trimmed);
    setIsEngravingConfirmed(true);
    setEngravingError(null);
  };

  // Edit Engraving button handler
  const handleEditEngraving = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEngravingConfirmed(false);
    setEngravingError(null);
  };

  // Find matching product ID for checkout cart handoff
  const customProductId = useMemo(() => {
    if (isJuniorSize && activeSize.catalogProductId) {
      return activeSize.catalogProductId;
    }

    if (constructionMode === "budget") {
      return `custom-bat-recommended-build-${selectedPrice}`;
    }

    if (selectedConstruction === "Beauty Processed") {
      if (selectedPrice === 140) return "custom-bat-beauty-processed-140-essential";
      if (selectedPrice === 190) return "custom-bat-beauty-processed-190-performance";
      if (selectedPrice === 220) return "custom-bat-beauty-processed-220-advanced";
      if (selectedPrice === 230) return "custom-bat-beauty-processed-230-premium";
      if (selectedPrice === 250) return "custom-bat-beauty-processed-250-top";
      return "custom-bat-beauty-processed-140-essential";
    } else {
      if (selectedPrice === 220) return "custom-bat-bonafide-220-entry";
      if (selectedPrice === 250) return "custom-bat-bonafide-250-performance";
      if (selectedPrice === 300) return "custom-bat-bonafide-300-professional";
      if (selectedPrice === 400) return "custom-bat-bonafide-400-elite";
      if (selectedPrice === 500) return "custom-bat-bonafide-500-top-spec";
      return "custom-bat-bonafide-300-professional";
    }
  }, [isJuniorSize, activeSize, constructionMode, selectedConstruction, selectedPrice]);

  // Resolved final weight string
  const finalWeight = customWeightInput.trim() ? customWeightInput.trim() : weight;

  // Selected service names for display
  const selectedServiceNames = useMemo(() => {
    return selectedServices
      .map((id) => CUSTOM_BAT_CONFIG.services.find((s) => s.id === id)?.name)
      .filter(Boolean) as string[];
  }, [selectedServices]);

  // WhatsApp Message
  const whatsappMessage = useMemo(() => {
    return generateCustomBatWhatsAppMessage({
      name: customerName,
      country: customerCountry,
      size: activeSize.name,
      construction: isJuniorSize
        ? "Junior Willow Spec"
        : constructionMode === "budget"
        ? "Recommended Budget Build"
        : selectedConstruction,
      priceLevel: selectedPrice,
      priceLabel: selectedTierLabel,
      handle,
      weight: finalWeight,
      profile: activeProfile.name,
      services: selectedServiceNames,
      engravingText: isEngravingSelected && engravingText.trim() ? engravingText.trim() : undefined,
      notes: specialNotes,
      advancePercent,
      advanceAmount,
      remainingBalance,
    });
  }, [
    customerName,
    customerCountry,
    activeSize.name,
    isJuniorSize,
    constructionMode,
    selectedConstruction,
    selectedPrice,
    selectedTierLabel,
    handle,
    finalWeight,
    activeProfile.name,
    selectedServiceNames,
    isEngravingSelected,
    engravingText,
    specialNotes,
    advancePercent,
    advanceAmount,
    remainingBalance,
  ]);

  // Submit Enquiry to backend & proceed to checkout
  const handleProceedToCheckout = async () => {
    // ── Engraving Validation ──
    if (isEngravingSelected) {
      const trimmed = engravingText.trim();
      if (!trimmed) {
        setEngravingError("Please enter the text you want engraved.");
        const servicesSection = document.getElementById("step-services");
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      if (!isEngravingConfirmed) {
        setIsEngravingConfirmed(true);
      }
    }

    setIsSubmitting(true);
    setStatusNotice(null);

    // Save custom bat specs to localStorage so Checkout Review Order page can display it
    try {
      if (typeof window !== "undefined") {
        if (isEngravingSelected && engravingText.trim()) {
          window.localStorage.setItem(
            "sialkot-custom-bat-engraving",
            JSON.stringify({
              text: engravingText.trim(),
              size: activeSize.name,
              construction: selectedConstruction,
              tier: selectedTierLabel,
              price: selectedPrice,
            })
          );
        } else {
          window.localStorage.removeItem("sialkot-custom-bat-engraving");
        }
      }
    } catch {}

    // 1. Record custom enquiry lead in database
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_bat",
          name: customerName || "Customer",
          country: customerCountry || "Unspecified",
          message: specialNotes || `Custom Bat Configuration: ${activeSize.name}, ${selectedConstruction}, £${selectedPrice}, ${activeProfile.name}, ${finalWeight}, ${advancePercent}% Advance`,
          product: `Custom Bat - ${selectedConstruction} (£${selectedPrice})`,
          extras: {
            size: activeSize.name,
            sizeId: selectedSizeId,
            construction: isJuniorSize ? "Junior Willow" : selectedConstruction,
            price: selectedPrice,
            tierLabel: selectedTierLabel,
            handle,
            weight: finalWeight,
            profile: activeProfile.name,
            services: selectedServiceNames,
            engraving: isEngravingSelected && engravingText.trim() ? { selected: true, text: engravingText.trim(), confirmed: true } : { selected: false },
            notes: specialNotes,
            advancePercent,
            advanceAmount,
            remainingBalance,
          },
        }),
      }).catch(() => {});
    } catch {}

    // 2. Add configured product to cart
    try {
      addToCart(customProductId, 1);
    } catch (err) {
      console.error("Failed to add custom bat to cart:", err);
    }

    // 3. Navigate smoothly to checkout
    router.push("/checkout");
  };

  // Dispatch WhatsApp enquiry directly
  const handleOpenWhatsApp = async () => {
    if (isEngravingSelected && !engravingText.trim()) {
      setEngravingError("Please enter the text you want engraved.");
      document.getElementById("step-services")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_bat",
          name: customerName || "Customer",
          country: customerCountry || "Unspecified",
          message: specialNotes || `WhatsApp Custom Bat Enquiry: ${activeSize.name}, £${selectedPrice}`,
          product: `Custom Bat - £${selectedPrice}`,
          extras: {
            size: activeSize.name,
            price: selectedPrice,
            tierLabel: selectedTierLabel,
            engravingText: isEngravingSelected ? engravingText.trim() : undefined,
            advancePercent,
          },
        }),
      }).catch(() => {});
    } catch {}

    window.open(whatsappUrl(whatsappMessage), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="configurator-container">
      {/* ── HEADER / HERO ASSURANCE BAR ── */}
      <div className="configurator-hero-card">
        <div className="configurator-hero-tag">
          <Sparkles size={14} />
          <span>Sialkot Master Bat-Maker Workshop</span>
        </div>
        <h1 className="configurator-hero-title">
          Custom Cricket Bat Configurator
        </h1>
        <p className="configurator-hero-subtitle">
          Configure your exact willow cleft, blade profile, handle geometry, and balance. Handcrafted to order by master craftsmen in Sialkot, Pakistan.
        </p>

        {/* Step Progress Tracker Pill */}
        <div className="configurator-progress-bar">
          {[
            { num: 1, label: "Size" },
            { num: 2, label: "Build" },
            { num: 3, label: "Price" },
            { num: 4, label: "Specs" },
            { num: 5, label: "Services" },
            { num: 6, label: "Advance" },
          ].map(({ num, label }) => (
            <div key={num} className="configurator-progress-step active">
              <span className="step-num">{num}</span>
              <span className="step-name">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONFIGURATOR GRID (65% Left / 35% Right on Desktop, 1-Col on Mobile) ── */}
      <div className="configurator-layout-grid">
        {/* Left Column: Interactive Steps */}
        <div className="configurator-steps-column">
          {/* ══════════════════════════════════════════════
              STEP 1: CHOOSE BAT SIZE & PLAYER CATEGORY
              ══════════════════════════════════════════════ */}
          <section className="configurator-step-box" id="step-size">
            <div className="configurator-step-header">
              <div className="configurator-step-badge">1</div>
              <div>
                <h2 className="configurator-step-title">Choose Your Bat Size</h2>
                <p className="configurator-step-desc">
                  Select who the bat is for. Junior and youth bat pricing is synchronized directly from our catalogue.
                </p>
              </div>
            </div>

            <div className="configurator-tiles-grid sizes-grid">
              {CUSTOM_BAT_CONFIG.sizes.map((option) => {
                const isSelected = selectedSizeId === option.id;
                const isJunior = option.category === "junior";
                const displayPrice = isJunior
                  ? products.find((p) => p.id === option.catalogProductId)?.price || option.fallbackPrice || 70
                  : null;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedSizeId(option.id);
                    }}
                    className={`configurator-tile ${isSelected ? "selected" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <div className="tile-top-row">
                      <strong className="tile-title">{option.name}</strong>
                      {isSelected ? (
                        <span className="tile-check">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="tile-radio-circle" />
                      )}
                    </div>

                    <p className="tile-desc">{option.description}</p>

                    <div className="tile-bottom-price">
                      {isJunior ? (
                        <span className="tile-price-tag">
                          From <strong>{formatPrice(displayPrice || 70)}</strong>
                        </span>
                      ) : (
                        <span className="tile-action-badge">
                          {option.badge || "Configure Pro Bat →"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              STEP 2: CHOOSE BAT QUALITY & CONSTRUCTION (ADULT)
              ══════════════════════════════════════════════ */}
          {!isJuniorSize && (
            <section className="configurator-step-box" id="step-construction">
              <div className="configurator-step-header">
                <div className="configurator-step-badge">2</div>
                <div>
                  <h2 className="configurator-step-title">Choose Bat Construction</h2>
                  <p className="configurator-step-desc">
                    Choose between our two signature craftsmanship options, or select a target budget for a tailored recommendation.
                  </p>
                </div>
              </div>

              {/* Mode Toggle Pills */}
              <div className="configurator-mode-switch">
                <button
                  type="button"
                  onClick={() => setConstructionMode("specific")}
                  className={`mode-pill ${constructionMode === "specific" ? "active" : ""}`}
                >
                  <Layers size={15} />
                  <span>Select Specific Willow Construction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConstructionMode("budget")}
                  className={`mode-pill ${constructionMode === "budget" ? "active" : ""}`}
                >
                  <HelpCircle size={15} />
                  <span>Recommend Within My Budget</span>
                </button>
              </div>

              {/* Specific Construction Option Cards */}
              {constructionMode === "specific" && (
                <div className="configurator-construction-cards">
                  {/* 1. BEAUTY PROCESSED */}
                  <div
                    onClick={() => setSelectedConstruction("Beauty Processed")}
                    className={`construction-card ${
                      selectedConstruction === "Beauty Processed" ? "selected" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="construction-card-head">
                      <div className="construction-title-wrap">
                        <Flame size={18} color="#d97706" />
                        <strong className="construction-name">BEAUTY PROCESSED</strong>
                      </div>
                      {selectedConstruction === "Beauty Processed" && (
                        <span className="tile-check">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="construction-desc">
                      Professionally prepared English Willow with specialized heat-pressing and aesthetic grain enhancement. Provides solid power, clean face aesthetics, and excellent value.
                    </p>
                    <div className="construction-range-badge">
                      5 Price Levels: <strong>£140 – £250</strong>
                    </div>
                  </div>

                  {/* 2. BONAFIDE */}
                  <div
                    onClick={() => setSelectedConstruction("Bonafide")}
                    className={`construction-card ${
                      selectedConstruction === "Bonafide" ? "selected" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="construction-card-head">
                      <div className="construction-title-wrap">
                        <Award size={18} color="#16a34a" />
                        <strong className="construction-name">BONAFIDE</strong>
                      </div>
                      {selectedConstruction === "Bonafide" && (
                        <span className="tile-check">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="construction-desc">
                      Higher-grade unbleached natural English Willow for competitive league and professional players. Hand-selected clefts with supreme power-to-weight ratio and explosive rebound.
                    </p>
                    <div className="construction-range-badge">
                      5 Price Levels: <strong>£220 – £500</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Alternative Budget Route */}
              {constructionMode === "budget" && (
                <div className="budget-route-box">
                  <div className="budget-route-info">
                    <Info size={18} color="#0284c7" />
                    <span>
                      Not sure which willow cleft to select? Pick your target budget below and our master bat-makers will select the most suitable cleft, pressing, and balance for you.
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ══════════════════════════════════════════════
              STEP 3: CHOOSE PRICE LEVEL
              ══════════════════════════════════════════════ */}
          <section className="configurator-step-box" id="step-price">
            <div className="configurator-step-header">
              <div className="configurator-step-badge">3</div>
              <div>
                <h2 className="configurator-step-title">
                  {isJuniorSize ? "Catalogue Pricing & Specifications" : "Choose Your Price Level"}
                </h2>
                <p className="configurator-step-desc">
                  {isJuniorSize
                    ? "Selected junior size price from official Sialkot factory catalogue."
                    : constructionMode === "budget"
                    ? "Select your target budget level."
                    : `Select your desired ${selectedConstruction} quality tier.`}
                </p>
              </div>
            </div>

            {/* If Junior Size: Single Clear Price Card */}
            {isJuniorSize ? (
              <div className="junior-pricing-card selected">
                <div className="junior-pricing-left">
                  <span className="junior-pricing-tag">Official Junior Catalogue Specification</span>
                  <strong className="junior-pricing-name">{activeSize.name}</strong>
                  <p className="junior-pricing-desc">{activeSize.description}</p>
                </div>
                <div className="junior-pricing-right">
                  <span className="junior-price-val">{formatPrice(selectedPrice)}</span>
                  <span className="junior-badge">Catalogue Price</span>
                </div>
              </div>
            ) : constructionMode === "budget" ? (
              /* Budget Tiers Grid (£150, £200, £300, £400, £500) */
              <div className="configurator-price-cards-grid">
                {CUSTOM_BAT_CONFIG.budgetTiers.map((tier) => {
                  const isSelected = selectedPrice === tier.price;
                  return (
                    <div
                      key={tier.price}
                      onClick={() => {
                        setSelectedPrice(tier.price);
                        setSelectedTierLabel(tier.label);
                      }}
                      className={`price-card ${isSelected ? "selected" : ""}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="price-card-header">
                        <div className="price-val-block">
                          <strong className="price-num">{formatPrice(tier.price)}</strong>
                          <span className="price-label">{tier.label}</span>
                        </div>
                        {tier.badge && (
                          <span className={`tier-badge ${tier.isTopSpec ? "top-spec" : "popular"}`}>
                            {tier.badge}
                          </span>
                        )}
                        {isSelected && (
                          <span className="tile-check">
                            <Check size={13} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="price-subtitle">{tier.subtitle}</span>
                      <p className="price-desc">{tier.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : selectedConstruction === "Beauty Processed" ? (
              /* Beauty Processed Tiers Grid (£140, £190, £220, £230, £250) */
              <div className="configurator-price-cards-grid">
                {CUSTOM_BAT_CONFIG.beautyProcessedTiers.map((tier) => {
                  const isSelected = selectedPrice === tier.price;
                  return (
                    <div
                      key={tier.price}
                      onClick={() => {
                        setSelectedPrice(tier.price);
                        setSelectedTierLabel(tier.label);
                      }}
                      className={`price-card ${isSelected ? "selected" : ""}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="price-card-header">
                        <div className="price-val-block">
                          <strong className="price-num">{formatPrice(tier.price)}</strong>
                          <span className="price-label">{tier.label}</span>
                        </div>
                        {tier.badge && (
                          <span className="tier-badge popular">{tier.badge}</span>
                        )}
                        {isSelected && (
                          <span className="tile-check">
                            <Check size={13} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="price-subtitle">{tier.subtitle}</span>
                      <p className="price-desc">{tier.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Bonafide Tiers Grid (£220, £250, £300, £400, £500) */
              <div className="configurator-price-cards-grid">
                {CUSTOM_BAT_CONFIG.bonafideTiers.map((tier) => {
                  const isSelected = selectedPrice === tier.price;
                  return (
                    <div
                      key={tier.price}
                      onClick={() => {
                        setSelectedPrice(tier.price);
                        setSelectedTierLabel(tier.label);
                      }}
                      className={`price-card ${isSelected ? "selected" : ""}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="price-card-header">
                        <div className="price-val-block">
                          <strong className="price-num">{formatPrice(tier.price)}</strong>
                          <span className="price-label">{tier.label}</span>
                        </div>
                        {tier.badge && (
                          <span className={`tier-badge ${tier.isTopSpec ? "top-spec" : "popular"}`}>
                            {tier.badge}
                          </span>
                        )}
                        {isSelected && (
                          <span className="tile-check">
                            <Check size={13} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="price-subtitle">{tier.subtitle}</span>
                      <p className="price-desc">{tier.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════
              STEP 4: CONFIGURE BAT SPECIFICATIONS
              ══════════════════════════════════════════════ */}
          <section className="configurator-step-box" id="step-specs">
            <div className="configurator-step-header">
              <div className="configurator-step-badge">4</div>
              <div>
                <h2 className="configurator-step-title">Configure Bat Specifications</h2>
                <p className="configurator-step-desc">
                  Tailor the handle, weight, blade profile, and balance to match your individual batting style.
                </p>
              </div>
            </div>

            <div className="configurator-form-stack">
              {/* Synchronized Size Indicator */}
              <div className="config-form-row">
                <label className="config-field-label">
                  <span>BAT SIZE</span>
                  <span className="label-sync-badge">✓ Synchronized from Step 1</span>
                </label>
                <div className="config-synced-val-box">
                  <strong style={{ color: "#0f172a", fontSize: ".92rem" }}>
                    {activeSize.name}
                  </strong>
                  <span style={{ fontSize: ".76rem", color: "#64748b" }}>
                    {activeSize.description}
                  </span>
                </div>
              </div>

              {/* Handle Preference */}
              <div className="config-form-row">
                <label htmlFor="config-handle" className="config-field-label">
                  <span>HANDLE PREFERENCE</span>
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="config-chips-row">
                  {CUSTOM_BAT_CONFIG.handles.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHandle(h.name)}
                      className={`config-chip ${handle === h.name ? "selected" : ""}`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Weight */}
              <div className="config-form-row">
                <label className="config-field-label">
                  <span>PREFERRED WEIGHT</span>
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="config-chips-row">
                  {CUSTOM_BAT_CONFIG.weightPresets.map((preset) => (
                    <button
                      key={preset.g}
                      type="button"
                      onClick={() => {
                        setWeight(`${preset.g} g (${preset.lbs})`);
                        setCustomWeightInput("");
                      }}
                      className={`config-chip ${
                        weight.includes(String(preset.g)) && !customWeightInput ? "selected" : ""
                      }`}
                    >
                      {preset.g} g ({preset.lbs})
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    className="config-text-input"
                    placeholder="Or enter custom weight (e.g. 1175g, 2.10, light pickup...)"
                    value={customWeightInput}
                    onChange={(e) => setCustomWeightInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Blade Profile Selector Cards */}
              <div className="config-form-row">
                <label className="config-field-label">
                  <span>BAT PROFILE &amp; SWEET SPOT</span>
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="config-profiles-grid">
                  {CUSTOM_BAT_CONFIG.profiles.map((p) => {
                    const isSelected = selectedProfileId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`profile-card ${isSelected ? "selected" : ""}`}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="profile-card-top">
                          <strong className="profile-title">{p.name}</strong>
                          {isSelected && (
                            <span className="tile-check">
                              <Check size={13} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <span className="profile-tagline">{p.tagline}</span>
                        <p className="profile-desc">{p.description}</p>
                        <div className="profile-meta-list">
                          <div>
                            <span className="meta-k">Sweet Spot:</span> {p.sweetSpot}
                          </div>
                          <div>
                            <span className="meta-k">Pickup:</span> {p.pickup}
                          </div>
                          <div>
                            <span className="meta-k">Best For:</span> {p.idealFor}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Playing Style & Custom Specifications */}
              <div className="config-form-row">
                <label htmlFor="config-notes" className="config-field-label">
                  <span>PLAYING STYLE &amp; CUSTOM REQUIREMENTS</span>
                  <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".74rem", textTransform: "none" }}>
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="config-notes"
                  className="config-textarea"
                  rows={3}
                  maxLength={1500}
                  placeholder="Tell us your preferred pickup, balance, edge thickness, sticker preference, or playing style..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                />
              </div>

              {/* Customer Contact Details */}
              <div className="config-form-grid-two">
                <div>
                  <label htmlFor="config-customer-name" className="config-field-label">
                    <span>YOUR NAME</span>
                    <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".74rem", textTransform: "none" }}>
                      (For custom engraving/order)
                    </span>
                  </label>
                  <input
                    id="config-customer-name"
                    type="text"
                    className="config-text-input"
                    placeholder="e.g. Alyan Wazir"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="config-customer-country" className="config-field-label">
                    <span>DESTINATION COUNTRY</span>
                    <span style={{ color: "#64748b", fontWeight: 500, fontSize: ".74rem", textTransform: "none" }}>
                      (For dispatch estimation)
                    </span>
                  </label>
                  <select
                    id="config-customer-country"
                    className="config-select-input"
                    value={customerCountry}
                    onChange={(e) => setCustomerCountry(e.target.value)}
                  >
                    <option value="">Select country...</option>
                    {ALL_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              STEP 5: ADDITIONAL SERVICES & INTERACTIVE ENGRAVING
              ══════════════════════════════════════════════ */}
          <section className="configurator-step-box" id="step-services">
            <div className="configurator-step-header">
              <div className="configurator-step-badge">5</div>
              <div>
                <h2 className="configurator-step-title">Additional Services &amp; Approval</h2>
                <p className="configurator-step-desc">
                  Select preparation and pre-dispatch verification services for your custom bat.
                </p>
              </div>
            </div>

            <div className="configurator-services-list">
              {CUSTOM_BAT_CONFIG.services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                const isEngravingCard = service.id === "name-engraving";

                return (
                  <div
                    key={service.id}
                    className={`service-card ${isSelected ? "selected" : ""} ${
                      isEngravingCard ? "engraving-service-card" : ""
                    }`}
                  >
                    {/* Service Header Row */}
                    <div
                      className="service-card-main-row"
                      onClick={() => toggleService(service.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isEngravingCard ? isSelected : undefined}
                    >
                      <div className="service-card-left">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="service-checkbox"
                          aria-label={service.name}
                        />
                        <div>
                          <strong className="service-name">{service.name}</strong>
                          <p className="service-desc">{service.description}</p>
                        </div>
                      </div>
                      <div className="service-card-right">
                        <span className="service-included-badge">Included Free</span>
                      </div>
                    </div>

                    {/* ── EXPANDED ENGRAVING SECTION (When selected) ── */}
                    {isEngravingCard && isSelected && (
                      <div
                        className="service-engraving-expanded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="engraving-divider" />

                        {!isEngravingConfirmed ? (
                          /* Input & Confirmation Mode */
                          <div className="engraving-input-block">
                            <label htmlFor="engraving-text-input" className="engraving-field-label">
                              <span>What would you like engraved?</span>
                              <span className="engraving-counter">
                                {engravingText.length} / 30 characters
                              </span>
                            </label>
                            <p id="engraving-helper" className="engraving-field-helper">
                              Enter the exact name, initials, number or short text you want laser engraved on your bat.
                            </p>

                            <div className="engraving-input-row">
                              <input
                                id="engraving-text-input"
                                type="text"
                                maxLength={30}
                                value={engravingText}
                                onChange={(e) => {
                                  setEngravingText(e.target.value);
                                  if (engravingError) setEngravingError(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleConfirmEngraving();
                                  }
                                }}
                                placeholder="e.g. ALYAN WAZIR, AW 07, KING 18"
                                className={`config-text-input engraving-text-input ${
                                  engravingError ? "has-error" : ""
                                }`}
                                aria-invalid={!!engravingError}
                                aria-describedby="engraving-helper"
                                autoFocus={!engravingText}
                              />
                              <button
                                type="button"
                                onClick={handleConfirmEngraving}
                                className="engraving-confirm-btn"
                              >
                                <Check size={16} strokeWidth={3} />
                                <span>Confirm Engraving</span>
                              </button>
                            </div>

                            {engravingError && (
                              <div className="engraving-error-msg" role="alert">
                                <AlertCircle size={14} />
                                <span>{engravingError}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Confirmed Preview Mode */
                          <div className="engraving-confirmed-box">
                            <div className="engraving-confirmed-left">
                              <div className="engraving-confirmed-badge">
                                <CheckCircle2 size={16} color="#16a34a" />
                                <strong>✓ Engraving Confirmed</strong>
                              </div>
                              <div className="engraving-confirmed-text">
                                &ldquo;{engravingText.trim()}&rdquo;
                              </div>
                              <p className="engraving-confirmed-note">
                                Please check spelling carefully. Your bat will be engraved exactly as entered.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleEditEngraving}
                              className="engraving-edit-btn"
                              aria-label="Edit engraving text"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              STEP 6: ADVANCE PAYMENT SELECTION (CRITICAL FEATURE)
              ══════════════════════════════════════════════ */}
          <section className="configurator-step-box highlight-payment" id="step-advance">
            <div className="configurator-step-header">
              <div className="configurator-step-badge">6</div>
              <div>
                <h2 className="configurator-step-title">Choose Your Advance Payment</h2>
                <p className="configurator-step-desc">
                  Customized manufacturing begins immediately upon specification approval and receipt of your chosen advance deposit. Minimum deposit is 30%.
                </p>
              </div>
            </div>

            <div className="configurator-advance-grid">
              {CUSTOM_BAT_CONFIG.advanceOptions.map((opt) => {
                const isSelected = advancePercent === opt.percent;
                const calcs = calculateAdvancePayment(selectedPrice, opt.percent);

                return (
                  <div
                    key={opt.percent}
                    onClick={() => setAdvancePercent(opt.percent)}
                    className={`advance-card ${isSelected ? "selected" : ""}`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="advance-card-top">
                      <div>
                        <span className="advance-badge">{opt.badge}</span>
                        <strong className="advance-percent-title">{opt.percent}% Advance</strong>
                      </div>
                      {isSelected ? (
                        <span className="tile-check">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="tile-radio-circle" />
                      )}
                    </div>

                    <p className="advance-desc">{opt.description}</p>

                    <div className="advance-calc-box">
                      <div className="advance-calc-row now">
                        <span>Due Today ({opt.percent}%):</span>
                        <strong>{formatPrice(calcs.advanceAmount)}</strong>
                      </div>
                      <div className="advance-calc-row later">
                        <span>Balance at Dispatch:</span>
                        <span>{opt.percent === 100 ? "£0.00 (Paid in Full)" : formatPrice(calcs.remainingBalance)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Custom Bat Summary & CTAs */}
        <aside className="configurator-summary-column">
          <div className="configurator-sticky-summary">
            <div className="summary-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingBag size={18} color="#b45309" />
                <h3 className="summary-title">Custom Bat Summary</h3>
              </div>
              <span className="summary-factory-badge">Direct From Sialkot</span>
            </div>

            {/* Spec Breakdown */}
            <div className="summary-specs-list">
              <div className="summary-spec-row">
                <span className="spec-k">Bat Size</span>
                <strong className="spec-v">{activeSize.name}</strong>
              </div>

              <div className="summary-spec-row">
                <span className="spec-k">Construction</span>
                <strong className="spec-v">
                  {isJuniorSize
                    ? "Junior Catalogue Spec"
                    : constructionMode === "budget"
                    ? "Recommended Budget Build"
                    : selectedConstruction}
                </strong>
              </div>

              <div className="summary-spec-row">
                <span className="spec-k">Selected Tier</span>
                <strong className="spec-v">{selectedTierLabel}</strong>
              </div>

              <div className="summary-spec-row">
                <span className="spec-k">Blade Profile</span>
                <strong className="spec-v">{activeProfile.name}</strong>
              </div>

              <div className="summary-spec-row">
                <span className="spec-k">Handle</span>
                <strong className="spec-v">{handle}</strong>
              </div>

              <div className="summary-spec-row">
                <span className="spec-k">Target Weight</span>
                <strong className="spec-v">{finalWeight}</strong>
              </div>

              {selectedServiceNames.length > 0 && (
                <div className="summary-spec-row services">
                  <span className="spec-k">Services</span>
                  <span className="spec-v-services">
                    {selectedServiceNames.join(" · ")}
                  </span>
                </div>
              )}

              {/* Dedicated Laser Engraving Summary Box */}
              {isEngravingSelected && Boolean(engravingText.trim()) && (
                <div className="summary-engraving-card">
                  <div className="summary-engraving-top">
                    <span className="spec-k">Laser Engraving</span>
                    <span className="summary-engraving-badge">
                      {isEngravingConfirmed ? "✓ Confirmed" : "Entered"}
                    </span>
                  </div>
                  <strong className="summary-engraving-text">
                    &ldquo;{engravingText.trim()}&rdquo;
                  </strong>
                  <span className="summary-engraving-note">
                    Please check spelling carefully. Engraved exactly as entered.
                  </span>
                </div>
              )}
            </div>

            <div className="summary-divider" />

            {/* Total Price & Advance Breakdown */}
            <div className="summary-pricing-breakdown">
              <div className="summary-price-line total">
                <span>Total Bat Value</span>
                <strong>{formatPrice(selectedPrice)}</strong>
              </div>

              <div className="summary-price-line advance-choice">
                <span>Selected Advance Deposit</span>
                <span className="advance-pill">{advancePercent}%</span>
              </div>

              {/* Dynamic Pay Now Highlight */}
              <div className="summary-pay-today-box">
                <div>
                  <span className="pay-today-label">PAY TODAY ({advancePercent}% ADVANCE)</span>
                  <span className="pay-today-sub">To begin custom workshop production</span>
                </div>
                <strong className="pay-today-val">{formatPrice(advanceAmount)}</strong>
              </div>

              {remainingBalance > 0 ? (
                <div className="summary-balance-row">
                  <span>Balance Due Before Dispatch:</span>
                  <strong>{formatPrice(remainingBalance)}</strong>
                </div>
              ) : (
                <div className="summary-balance-row full">
                  <span>✓ Full payment upfront — no balance remaining</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="summary-actions-wrap">
              {/* Primary Ecommerce CTA */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isSubmitting}
                className="configurator-primary-cta"
              >
                <span>Continue to Checkout</span>
                <ArrowRight size={18} />
              </button>

              {/* Secondary WhatsApp CTA */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="configurator-whatsapp-cta"
              >
                <MessageCircle size={17} />
                <span>Send Specifications on WhatsApp</span>
              </button>
            </div>

            {/* Process Assurance Badges */}
            <div className="summary-assurances-list">
              <div className="assurance-item">
                <CircleCheckIcon />
                <div>
                  <strong>Specification Approval</strong>
                  <p>Confirm size, handle, weight, profile and any extra services before final payment.</p>
                </div>
              </div>

              <div className="assurance-item">
                <Video size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Pictures &amp; Live Ping Approval</strong>
                  <p>Request current willow pictures and a live ball-ping video before production confirmation.</p>
                </div>
              </div>

              <div className="assurance-item">
                <Clock3 size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Production Timing</strong>
                  <p>Customized orders normally require approximately 7–8 working days after specification approval.</p>
                </div>
              </div>

              <div className="assurance-item">
                <Building2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Official Sialkot Factory Direct</strong>
                  <p>Direct export from Sialkot, Pakistan with 256-bit encrypted checkout and UBL bank transfer assurance.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CircleCheckIcon() {
  return <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />;
}
