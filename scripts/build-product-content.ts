/**
 * Script to generate complete, high-quality, bespoke product content
 * for all 145 products in the Sialkot Cricket Kits catalogue.
 */

import fs from "fs";
import path from "path";
import { products } from "../src/data/products";

interface ProductContent {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  openingStatement: string;
  description: string;
  highlights: string[];
  bestFor: string;
  specifications: Array<{ label: string; value: string }>;
  seoTitle: string;
  seoDescription: string;
  imageAlt: string;
  disclosureType: "beauty_processed" | "bonafide" | "junior" | "natural_willow" | "none";
}

// Function to generate bespoke, professional copy for any product in the catalog
function buildBespokeProductContent(product: (typeof products)[0]): ProductContent {
  const { id, name, category, price, stock, rightStock, leftStock } = product;

  // Defaults based on category
  let shortDescription = "";
  let openingStatement = "";
  let description = "";
  let highlights: string[] = [];
  let bestFor = "";
  let specifications: Array<{ label: string; value: string }> = [
    { label: "Product Name", value: name },
    { label: "Category", value: category },
    { label: "Origin", value: "Sialkot, Pakistan" },
    { label: "Delivery", value: "Worldwide Tracked Courier" },
  ];
  let seoTitle = `${name} | Sialkot Cricket Kits`;
  let seoDescription = "";
  let imageAlt = `${name} - ${category} from Sialkot Cricket Kits`;
  let disclosureType: "beauty_processed" | "bonafide" | "junior" | "natural_willow" | "none" = "none";

  // Category-specific bespoke generation
  if (category === "Beauty Processed Bats") {
    disclosureType = "beauty_processed";
    imageAlt = `${name} Beauty Processed Cricket Bat showing face, profile and edge contours`;
    seoTitle = `${name} Beauty Processed Cricket Bat | Sialkot Cricket Kits`.slice(0, 60);

    if (id.includes("silver-edition")) {
      shortDescription = "Handcrafted in Sialkot with an immaculate cosmetic finish, pronounced spine, and balanced pickup tailored for fluid stroke play across all formats.";
      openingStatement = "The Silver Edition delivers traditional bat-making craftsmanship paired with a refined, clean aesthetic presentation.";
      description = "Handcrafted by experienced bat-makers in Sialkot, the Silver Edition beauty-processed cricket bat combines traditional pressing with an immaculate cosmetic finish. Crafted from selected willow clefts, it features a pronounced spine, generous mid-to-low sweet spot, and substantial edge profiles tailored for stroke-makers on varied pitch surfaces. The blade is balanced for a light, effortless pickup, allowing rapid hand speed through attacking drives and defensive shots. Every angle in our product gallery showcases the actual bat, detailing its pristine face, toe finish, and edge contour. Available with worldwide tracked delivery directly from our Sialkot facility. Contact us on WhatsApp for live ping demonstrations, weight confirmations, and optional knocking-in services before dispatch.";
      highlights = [
        "Handcrafted in Sialkot, Pakistan from selected willow clefts",
        "Refined cosmetic beauty processing for a clean visual presentation",
        "Pronounced spine with generous mid-to-low sweet spot",
        "Balanced pickup for quick hand speed and stroke precision",
        "Multi-piece cane handle designed for vibration dampening",
        "Worldwide tracked delivery with live WhatsApp video inspection",
      ];
      bestFor = "Stroke-makers and top-order batsmen looking for balance and clean aesthetics";
      specifications.push(
        { label: "Bat Type", value: "Beauty Processed Cricket Bat" },
        { label: "Handle Type", value: "Semi-oval multi-piece cane handle" },
        { label: "Sweet Spot", value: "Mid-to-low profile" },
        { label: "Finish", value: "Beauty processed cosmetic finish" }
      );
    } else if (id.includes("player-edition")) {
      shortDescription = "Engineered with an imposing power profile, thick edges, and high-rebound pressing for batsmen demanding match-ready performance and clean blade presentation.";
      openingStatement = "Built with professional-grade shaping in Sialkot, the Player Edition offers a commanding profile engineered for high-rebound stroke play.";
      description = "The Player Edition beauty-processed cricket bat represents serious craftsmanship straight from Sialkot's heritage bat-making workshops. Built from top-tier clefts, this bat delivers an imposing profile with thick power edges and a full-bodied spine that maximizes rebound energy across the entire hitting zone. The balanced weight distribution ensures optimal pickup and fluid stroke control during aggressive front-foot drives or commanding back-foot cuts. Each cleft is precision-pressed and hand-finished with an immaculate aesthetic polish. We offer worldwide shipping with knocking-in options available upon request. Request a live video inspection on WhatsApp to verify grain structure, balance, and ping performance.";
      highlights = [
        "Professional match-ready profile sculpted in Sialkot",
        "Thick power edges and full-bodied spine for maximum rebound",
        "Smooth cosmetic finishing highlighting clean grain alignment",
        "Balanced weight distribution for fluid bat speed and control",
        "Fitted with comfortable multi-piece cane handle",
        "Worldwide delivery with optional professional knocking-in",
      ];
      bestFor = "Competitive league batsmen and stroke-makers seeking match-ready power";
      specifications.push(
        { label: "Bat Type", value: "Beauty Processed Cricket Bat" },
        { label: "Profile", value: "Full-bodied spine with thick power edges" },
        { label: "Handle", value: "Multi-piece cane handle with textured grip" },
        { label: "Cosmetic Grade", value: "Player Edition Beauty Processed" }
      );
    } else if (id.includes("bounce-edition")) {
      shortDescription = "Sculpted for high rebound energy with an extended mid-blade sweet spot and robust edge thickness, providing tremendous punch for modern boundary hitters.";
      openingStatement = "Designed for explosive rebound, the Bounce Edition features an elevated hitting zone that rewards positive stroke play.";
      description = "Engineered specifically for high-rebound energy and responsive stroke play, the Bounce Edition beauty-processed bat is sculpted from seasoned clefts in Sialkot. Featuring an enhanced mid-blade sweet spot, extended power zone, and robust edge thickness, it offers immense punch for modern boundary hitters. The profile is tapered to maintain a feather-light pickup without sacrificing blade mass or structural integrity. The authentic multi-angle gallery highlights the bat's clean face, reverse camber, and reinforced toe. Shipped worldwide with secure packaging. Message our Sialkot team on WhatsApp to receive a live ping test video and personalized balance consultation.";
      highlights = [
        "High-rebound pressing for responsive ball exit velocity",
        "Enhanced mid-blade power zone suited for hard-hitting batsmen",
        "Substantial edge thickness with balanced weight distribution",
        "Clean cosmetic processing for a modern, uniform appearance",
        "Shock-absorbing cane handle for comfortable hand feel",
        "Direct export worldwide with individual live ping videos",
      ];
      bestFor = "Aggressive middle-order batsmen and modern T20 boundary hitters";
      specifications.push(
        { label: "Bat Type", value: "Beauty Processed Cricket Bat" },
        { label: "Profile", value: "Extended mid-blade sweet spot" },
        { label: "Handle", value: "Shock-absorbing cane handle" }
      );
    } else if (id.includes("apex-pro")) {
      shortDescription = "Flagship Sialkot performance bat hand-shaped with commanding 40mm+ edge contours, towering spine, and supreme balance for decisive stroke execution.";
      openingStatement = "As our top-tier performance model, the Apex Pro combines massive edge contours with refined pickup for uncompromising power.";
      description = "The Apex Pro beauty-processed cricket bat is our flagship performance model, crafted in Sialkot for discerning cricketers who demand supreme power and precision balance. Hand-shaped with commanding 40mm+ edge contours, an elevated spine, and an expansive sweet spot, this bat provides explosive rebound on drives, pulls, and aerial strokes. The premium cane handle absorbs impact shock effortlessly, providing unmatched feel and feedback at the crease. Accompanied by its matching protective cover, the complete gallery reflects the exact blade profile, toe angles, and clean grain finish. Delivered worldwide. Connect on WhatsApp for live video reviews, ping trials, and custom knocking-in services.";
      highlights = [
        "Flagship performance bat crafted in Sialkot workshops",
        "Commanding 40mm+ edge profile with towering power spine",
        "Expansive sweet spot designed for effortless boundary clearance",
        "Refined cosmetic finishing with clean, uniform grain presentation",
        "Premium cane handle for superior vibration absorption",
        "Delivered internationally with matching padded bat cover",
      ];
      bestFor = "Discerning batsmen wanting top-tier blade mass without sacrificing pickup speed";
      specifications.push(
        { label: "Bat Model", value: "Apex Pro Flagship" },
        { label: "Edge Thickness", value: "40mm+ power edges" },
        { label: "Profile", value: "High spine with full power belly" },
        { label: "Inclusions", value: "Protective bat cover included" }
      );
    } else if (id.includes("monster-series")) {
      shortDescription = "Built for heavy-hitting power batsmen with an ultra-thick edge profile, deep power belly, and specialized pressing that generates massive momentum through the ball.";
      openingStatement = "Engineered with maximum willow mass, the Monster Series delivers devastating striking power for aggressive cricketers.";
      description = "The Monster Series beauty-processed cricket bat is crafted for heavy-hitting power batsmen who demand maximum willow mass and destructive hitting power. Hand-sculpted in Sialkot with an ultra-thick edge profile, high spine, and deep power belly, this bat delivers immense momentum through the contact zone. Despite its imposing dimensions, meticulous pressing and balance distribution ensure a comfortable pickup and controlled bat flow. The gallery includes comprehensive weight-proof verification, face angles, and edge measurements. Dispatched internationally to cricket clubs and players worldwide. Contact our Sialkot workshop via WhatsApp for live bat trials and weight specifications.";
      highlights = [
        "Maximum willow volume with deep power belly and thick edges",
        "Specialized pressing delivers immense momentum through the ball",
        "Engineered balance ensures comfortable bat speed and pickup",
        "Clean cosmetic processing with verified weight documentation",
        "Durable cane handle with comfortable non-slip rubber grip",
        "Worldwide tracked shipping with live WhatsApp video trials",
      ];
      bestFor = "Power hitters, boundary clears, and batsmen seeking maximum blade mass";
      specifications.push(
        { label: "Bat Model", value: "Monster Series Power Bat" },
        { label: "Blade Mass", value: "Ultra-thick power profile" },
        { label: "Handle", value: "Reinforced cane handle" }
      );
    } else if (id.includes("special-edition")) {
      shortDescription = "Selected for structural density and straight grain alignment, featuring a full traditional profile and substantial edges suited for all-format cricket.";
      openingStatement = "The Special Edition offers an all-format traditional profile built for classical stroke play and defensive solidity.";
      description = "The Special Edition beauty-processed bat showcases precision craftsmanship and refined blade finishing from our Sialkot workshop. Selected for structural density and straight grain alignment, this cleft features a full, traditional profile with substantial edges and an elongated hitting zone suitable for all-format cricket. The semi-oval cane handle provides superior grip stability and shock dampening during long innings. The exclusive product gallery illustrates the bat from multiple perspectives, including edge depth, back profile, and toe geometry. We provide reliable worldwide shipping. Contact us on WhatsApp to inspect ping performance and current workshop availability.";
      highlights = [
        "Full traditional profile with elongated match hitting zone",
        "Dense willow structure selected for lasting resilience",
        "Cosmetically refined for an elegant, pristine appearance",
        "Semi-oval cane handle gives superior control and grip comfort",
        "Balanced pickup suitable for multi-day and limited-overs matches",
        "Available for express worldwide tracked courier dispatch",
      ];
      bestFor = "All-format cricketers who value classical balance, solid defense, and clean driving power";
      specifications.push(
        { label: "Bat Model", value: "Special Edition Beauty Processed" },
        { label: "Profile", value: "Traditional full-blade profile" },
        { label: "Handle", value: "Semi-oval cane handle" }
      );
    } else if (id.includes("vvip-bat")) {
      shortDescription = "Elite custom profile featuring massive 45mm edges and a towering spine, handcrafted in Sialkot for immense sweet-spot power and acoustic ping.";
      openingStatement = "Featuring commanding 45mm edges, the VVIP delivers maximum willow depth for boundary-clearing performance.";
      description = "The VVIP beauty-processed cricket bat is an elite custom profile featuring massive 45mm edges and a towering spine engineered for boundary-clearing performance. Handcrafted by master artisans in Sialkot, this bat packs immense willow behind the sweet spot while maintaining exceptional balance and swing velocity. The cleft undergoes specialized pressing to ensure solid blade compression, longevity, and explosive acoustic ping. The gallery includes exact edge measurement views, face profiles, and back contours of this specific model. Delivered internationally with complete transit protection. Request a live WhatsApp video consultation for bat-ping verification and customized preparation.";
      highlights = [
        "Custom 45mm edge depth verified in product gallery",
        "Towering spine engineered for explosive acoustic ping",
        "Expertly pressed in Sialkot for solid blade compression",
        "Smooth cosmetic finish with clear grain definition",
        "Multi-piece cane handle provides comfortable vibration dampening",
        "International shipping with live video consultation available",
      ];
      bestFor = "Power hitters and competitive batsmen wanting elite 45mm edge specifications";
      specifications.push(
        { label: "Bat Model", value: "VVIP 45mm Custom Edition" },
        { label: "Edge Measurement", value: "45mm verified edge depth" },
        { label: "Handle", value: "Premium cane handle" }
      );
    }

    seoDescription = `${name} beauty processed cricket bat handcrafted in Sialkot, Pakistan. Featuring balanced pickup, thick edges, and worldwide tracked shipping. Order now.`.slice(0, 160);
  } else if (category === "Bonafide Bats") {
    disclosureType = "bonafide";
    imageAlt = `${name} Bonafide Cricket Bat in unbleached natural willow finish - Sialkot Cricket Kits`;
    seoTitle = `${name} Bonafide Cricket Bat | Sialkot Cricket Kits`.slice(0, 60);

    if (id.includes("vvip-bonafide-original-grade-a")) {
      shortDescription = "Crafted from unbleached natural Grade A+ willow in Sialkot, displaying tight straight grains, massive power edges, and instantaneous driving response.";
      openingStatement = "Our premier Bonafide bat, crafted from raw, unbleached Grade A+ willow showcasing organic grain beauty and pure rebound.";
      description = "The VVIP Bonafide Original Grade A+ is our most prestigious cricket bat, crafted from unbleached, natural Grade A+ English willow in Sialkot. Presented in its raw, unprocessed state, this cleft displays tight, straight, and evenly spaced grains across a pristine face. Built with massive power edges, a commanding mid-blade swell, and a balanced duckbill toe taper, it delivers instantaneous ping and unmatched driving power. Every photograph in this exclusive gallery depicts the authentic blade, unvarnished willow texture, and natural grain structure. Available for immediate worldwide dispatch. Contact us on WhatsApp for a live high-definition video inspection, ping test, and knocking-in service.";
      highlights = [
        "Unbleached, natural Grade A+ English willow in raw presentation",
        "Tight, straight, and evenly spaced natural wood grains",
        "Massive power edges with commanding mid-blade swell",
        "Balanced duckbill toe taper for effortless swing velocity",
        "Premium multi-piece cane handle for responsive shock dampening",
        "Worldwide dispatch with live WhatsApp video inspection",
      ];
      bestFor = "Discerning cricketers and purists who demand raw, unbleached Grade A+ willow with natural grain aesthetics";
      specifications.push(
        { label: "Grade", value: "Unbleached Natural Grade A+ English Willow" },
        { label: "Finish", value: "Raw / Natural Bonafide (No cosmetic processing)" },
        { label: "Toe Shape", value: "Duckbill toe taper for balanced pickup" }
      );
    } else if (id.includes("special-edition-grade-a")) {
      shortDescription = "Unbleached Grade A willow bat featuring a full-bodied profile, generous edges, and natural grain characteristics handcrafted in Sialkot for stroke-makers.";
      openingStatement = "Showcasing authentic natural wood grains, this Grade A Bonafide bat combines traditional density with balanced stroke execution.";
      description = "The Bonafide Special Edition Grade A cricket bat is crafted from unbleached Grade A English willow, showcasing natural wood grains and authentic Sialkot craftsmanship. Designed with a full-bodied profile, generous edges, and a pronounced sweet spot, it offers outstanding rebound resilience and balanced pickup for stroke-makers. The natural wood finish emphasizes the structural integrity and density of the cleft. The gallery captures the actual bat from every angle, including face details, reverse contour, and toe construction. Shipped worldwide with premium protective packaging. Reach out on WhatsApp to view live ping demonstrations and confirm exact bat weights.";
      highlights = [
        "Authentic unbleached Grade A English willow construction",
        "Natural wood finish displaying genuine grain characteristics",
        "Generous edge profile with balanced middle swell",
        "Handcrafted in Sialkot with traditional blade pressing",
        "Multi-piece cane handle absorbs impact shock during long innings",
        "Worldwide shipping with protective packaging and video verification",
      ];
      bestFor = "Stroke-makers and club cricketers wanting natural Grade A willow performance";
      specifications.push(
        { label: "Grade", value: "Grade A Natural Willow" },
        { label: "Finish", value: "Natural Bonafide Finish" },
        { label: "Profile", value: "Full-bodied stroke-maker profile" }
      );
    } else if (id.includes("player-edition")) {
      shortDescription = "Constructed from hand-selected natural willow in Sialkot, preserving organic grain alignment with a traditional thick-edge profile for reliable match power.";
      openingStatement = "Preserving the organic grain alignment of the cleft, this Player Edition Bonafide bat delivers solid driving power across all formats.";
      description = "The Bonafide Player Edition cricket bat is constructed from hand-selected natural English willow in Sialkot, preserving the organic beauty and grain alignment of the cleft. Featuring a traditional profile with thick edges and a well-positioned middle, it provides substantial power for front-foot drives and back-foot defence. The multi-piece cane handle delivers excellent vibration absorption and tactile feedback. Accompanied by its custom black bat cover, the gallery displays only the authentic Player Edition model. Delivered worldwide to international cricketers and leagues. Contact our Sialkot team on WhatsApp for live ping videos and custom weight selection.";
      highlights = [
        "Hand-selected natural willow cleft with organic grain alignment",
        "Traditional match profile with thick power edges and solid middle",
        "Natural unbleached finish highlights organic wood character",
        "Multi-piece cane handle absorbs heavy ball impact vibrations",
        "Includes matching protective bat carry cover",
        "Delivered internationally with WhatsApp weight and ping checks",
      ];
      bestFor = "League batsmen seeking an unvarnished natural willow match bat";
      specifications.push(
        { label: "Grade", value: "Player Edition Natural Willow" },
        { label: "Finish", value: "Natural Unprocessed Wood" },
        { label: "Inclusions", value: "Custom protective bat cover" }
      );
    }

    seoDescription = `${name} unbleached natural willow cricket bat handcrafted in Sialkot, Pakistan. Authentic wood grain, full profile, and worldwide delivery. Buy now.`.slice(0, 160);
  } else if (category === "Junior & Harrow Bats") {
    disclosureType = "junior";
    imageAlt = `${name} Junior Cricket Bat handcrafted in Sialkot - Sialkot Cricket Kits`;
    seoTitle = `${name} Junior Cricket Bat | Sialkot Cricket Kits`.slice(0, 60);

    if (id.includes("size-4")) {
      shortDescription = "Proportionately scaled in Sialkot for young developing cricketers, featuring a lightweight pickup, narrow handle grip, and responsive sweet spot for attacking shots.";
      openingStatement = "Designed specifically for young aspiring cricketers to build correct stroke technique and timing with confidence.";
      description = "The Size 4 junior cricket bat is specially designed in Sialkot for young aspiring cricketers developing their stroke technique. Scaled to proportionate junior dimensions, it offers a lightweight pickup, narrow handle diameter, and a balanced sweet spot that enables young batters to play full attacking shots with confidence. Hand-finished with clean edges and smooth blade contouring, it provides authentic willow response. The gallery presents the exact original product photograph. Dispatched worldwide to junior academies and clubs. Message our Sialkot team on WhatsApp to confirm size suitability and junior equipment bundles.";
      highlights = [
        "Scaled specifically to Size 4 junior cricket dimensions",
        "Lightweight pickup prevents wrist fatigue for young batters",
        "Narrow ergonomic handle diameter for smaller junior hands",
        "Handcrafted in Sialkot with authentic willow pressing",
        "Clean blade profile promotes proper shot execution and timing",
        "Worldwide dispatch to junior clubs, schools, and academies",
      ];
      bestFor = "Junior cricketers developing fundamental batting technique and shot execution";
      specifications.push(
        { label: "Size", value: "Size 4 Junior" },
        { label: "Target Age/Height", value: "Approx. 4'9\" - 4'11\" (Subject to player preference)" },
        { label: "Handle", value: "Junior diameter multi-piece cane handle" }
      );
    } else if (id.includes("size-5")) {
      shortDescription = "Delivering the ideal blend of lightweight manoeuvrability and striking power for growing junior cricketers, with verified 700g–740g balanced pickup.";
      openingStatement = "Proportioned for intermediate junior cricketers, this Size 5 bat combines balanced pickup with solid boundary power.";
      description = "Crafted for growing junior players, the Size 5 cricket bat from Sialkot delivers the ideal combination of lightweight manoeuvrability and solid striking power. Shaped with proportionate edges, a balanced spine, and an ergonomic handle, it allows young cricketers to build correct batting fundamentals and timing without straining their wrists. The gallery features verified batch photographs, including weight-scale verification (approx. 700g–740g) and profile views. Available with worldwide international shipping. Connect with us on WhatsApp for weight selection and junior equipment advice.";
      highlights = [
        "Size 5 junior bat proportioned for intermediate youth cricketers",
        "Verified lightweight weight range (approx. 700g–740g)",
        "Balanced spine distribution aids bat swing speed and control",
        "Ergonomic handle designed for developing wrist strength",
        "Handcrafted in Sialkot using traditional pressing techniques",
        "Shipped internationally with batch weight documentation",
      ];
      bestFor = "Growing junior cricketers playing club and school competition";
      specifications.push(
        { label: "Size", value: "Size 5 Junior" },
        { label: "Weight Range", value: "Approx. 700g – 740g (Verified on scale)" },
        { label: "Handle", value: "Junior cane handle with non-slip rubber grip" }
      );
    } else if (id.includes("size-6")) {
      shortDescription = "Bridges intermediate youth cricket and senior gear with extended blade length, substantial edge depth, and a shock-dampening multi-piece cane handle.";
      openingStatement = "The Size 6 bat provides advanced junior batsmen with extended blade dimensions and greater driving power.";
      description = "The Size 6 junior cricket bat bridges intermediate youth cricket and senior equipment, handcrafted in Sialkot from quality willow clefts. It features extended blade dimensions, substantial edge thickness, and a responsive sweet spot engineered to help youth batsmen generate boundary power effortlessly. The multi-piece cane handle dampens ball impact vibrations for maximum comfort. Original product photographs illustrate the genuine handle geometry, face profile, and clean finish. Shipped worldwide to clubs and academies. Inquire on WhatsApp for current stock availability, knocking-in, and dispatch details.";
      highlights = [
        "Size 6 youth proportions bridging intermediate and senior cricket",
        "Substantial edge depth and extended blade sweet spot",
        "Multi-piece cane handle dampens ball impact vibrations",
        "Hand-shaped in Sialkot for balanced pickup and clean strokeplay",
        "Original product photography shows authentic handle and blade finish",
        "Worldwide tracked delivery with custom preparation options",
      ];
      bestFor = "Advanced junior and teenage cricketers transitioning toward senior matchplay";
      specifications.push(
        { label: "Size", value: "Size 6 Youth" },
        { label: "Target Player", value: "Youth / Intermediate Academy" },
        { label: "Handle", value: "Multi-piece cane handle" }
      );
    } else if (id.includes("harrow-size")) {
      shortDescription = "Tailored for teenagers transitioning to full-size equipment, offering near-senior blade dimensions with a slightly shorter handle and responsive pickup.";
      openingStatement = "Designed for teenage batsmen, the Harrow bat offers near-senior blade dimensions with reduced weight and effortless pickup.";
      description = "Tailored for teenagers and senior youth players transitioning to full-size bats, the Harrow Size cricket bat offers near-senior blade dimensions with a slightly shorter handle and reduced weight. Handcrafted in Sialkot, it boasts thick power edges, a responsive mid-blade swell, and feather-light pickup for aggressive shot execution. The gallery showcases unedited product photographs detailing blade geometry and authentic craftsmanship. Dispatched internationally with secure delivery. Contact our Sialkot bat-makers on WhatsApp to request a live ping demonstration and custom balance consultation.";
      highlights = [
        "Harrow size dimensions engineered for teenage cricketers",
        "Near-senior blade profile with reduced weight and faster bat speed",
        "Thick power edges with responsive mid-blade hitting zone",
        "Ergonomic handle provides superior grip and vibration dampening",
        "Handcrafted in Sialkot with unedited original gallery imagery",
        "Worldwide shipping with personal ping and balance advice",
      ];
      bestFor = "Teenagers and junior club captains transitioning to adult cricket specifications";
      specifications.push(
        { label: "Size", value: "Harrow Size" },
        { label: "Profile", value: "Near-senior blade with youth handle scale" },
        { label: "Handle", value: "Multi-piece cane handle with textured grip" }
      );
    }

    seoDescription = `${name} junior cricket bat handcrafted in Sialkot, Pakistan. Scaled dimensions, lightweight pickup, and worldwide tracked delivery. Order online.`.slice(0, 160);
  } else if (category === "Batting Pads") {
    disclosureType = "none";
    imageAlt = `${name} Batting Pads pair - Sialkot Cricket Kits`;
    seoTitle = `${name} Batting Pads | Sialkot Cricket Kits`.slice(0, 60);

    const isMoulded = name.toLowerCase().includes("moulded");
    const isPriority = name.toLowerCase().includes("priority offer");

    shortDescription = isMoulded
      ? `Ultra-lightweight thermo-moulded batting pads offering a snug anatomical wrap, zero-bulk running agility, and high-density impact absorption for modern cricket.`
      : `High-density cane and foam batting pads featuring sculpted knee bolsters, wide cushioned straps, and durable PU facing for dependable match protection.`;

    openingStatement = isMoulded
      ? `Engineered for modern agility, the ${name} pads combine zero-bulk moulded foam architecture with ergonomic leg defense.`
      : `Built for competitive matchplay, the ${name} batting pads provide comprehensive shin, knee, and ankle shielding.`;

    description = isMoulded
      ? `The ${name} batting pads utilize modern thermo-formed foam technology to deliver ultra-lightweight, ergonomic protection for dynamic batsmen. The single-piece moulded shell wraps snugly around the shin and knee, providing zero-bulk aerodynamic efficiency that aids quick singles and sharp running between the wickets. Dual-density internal padding absorbs high-impact energy while the sweat-wicking lining prevents moisture buildup during hot match conditions. Fitted with durable strap anchors and quick-release fasteners for a stable, comfortable hold throughout long innings. Shipped worldwide directly from our Sialkot facility. Contact us on WhatsApp for size confirmations and club kit combinations.`
      : `The ${name} batting pads deliver robust front-line defense and agile movement for competitive batsmen facing pace and spin bowling. Built with reinforced cane uprights layered over shock-absorbing high-density foam, they disperse ball impact forces effectively across the leg. The pre-curved knee socket cradles the joint snugly, while wide cushioned calf and ankle straps provide a non-slip, tailored fit without restricting running speed. Finished in durable PU facing with reinforced instep piping to resist turf wear. Shipped worldwide from Sialkot with full transit protection. Contact Sialkot Cricket Kits on WhatsApp to verify hand orientation and arrange fast dispatch.`;

    highlights = [
      "Supplied as a complete matching pair (Left & Right Leg)",
      isMoulded ? "Seamless thermo-moulded shell for aerodynamic mobility" : "Reinforced cane framework layered with high-density impact foam",
      "Ergonomically sculpted knee cup provides anatomical joint defense",
      "Wide cushioned straps with heavy-duty touch fasteners for secure hold",
      "Durable outer facing with reinforced instep binding for turf longevity",
      "Worldwide tracked shipping directly from Sialkot, Pakistan",
    ];

    bestFor = isMoulded
      ? "Modern T20 batsmen and dynamic runners seeking zero-bulk lightweight agility"
      : "Club, league, and tournament batsmen seeking dependable front-line leg protection";

    specifications.push(
      { label: "Unit", value: "Sold as a pair (2 pads)" },
      { label: "Construction", value: isMoulded ? "Thermo-moulded dual-density foam" : "Cane uprights with high-density foam backing" },
      { label: "Straps", value: "Padded calf & ankle straps with velcro fastening" },
      { label: "Facing", value: "Durable wipe-clean synthetic PU" }
    );

    if (rightStock !== undefined) {
      specifications.push({ label: "Orientation Stock", value: `Right-Hand: ${rightStock} · Left-Hand: ${leftStock}` });
    }

    seoDescription = `${name} batting pads available at Sialkot Cricket Kits. High-density protection, sculpted knee bolster, and worldwide delivery. Order now.`.slice(0, 160);
  } else if (category === "Batting Gloves") {
    disclosureType = "none";
    imageAlt = `${name} Batting Gloves pair - Sialkot Cricket Kits`;
    seoTitle = `${name} Batting Gloves | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = `Supple leather palm batting gloves featuring multi-segment high-density finger protection, airflow mesh gussets, and towelling wristbands for match-long grip and control.`;
    openingStatement = `Engineered for superior bat grip and impact defense, the ${name} batting gloves offer multi-flex finger articulation with a soft leather palm.`;
    description = `The ${name} batting gloves provide tournament-grade hand defense and responsive bat control for opening and middle-order batsmen. Crafted with a supple leather palm, they deliver a soft, natural connection to the bat handle with excellent traction and perspiration resistance. Multi-segment finger splits with high-density foam padding absorb and dissipate ball impact energy without restricting knuckle dexterity. Integrated air-mesh gussets along the sidewalls maintain continuous ventilation to keep hands dry during lengthy innings. Completed with an elasticated towelling wristband and wide velcro closure for firm wrist support. Shipped worldwide directly from Sialkot. Reach out on WhatsApp to verify sizing and left/right availability.`;
    highlights = [
      "Supplied as a complete pair (Left & Right Hand)",
      "Supple leather palm provides soft bat feel and durable grip traction",
      "Multi-split finger construction allows natural dexterity and control",
      "High-density shock foam cushions pace bowling impacts",
      "Air-mesh sidewall gussets promote active breathability",
      "Elasticated towelling wristband with secure velcro closure",
    ];
    bestFor = "Competitive batsmen wanting flexible finger articulation, soft grip, and reliable impact defense";
    specifications.push(
      { label: "Unit", value: "Sold as a pair (2 gloves)" },
      { label: "Palm Material", value: "Premium soft-feel leather palm" },
      { label: "Finger Protection", value: "Multi-segment high-density foam splits" },
      { label: "Wristband", value: "Elasticated towelling with velcro strap" }
    );
    if (rightStock !== undefined) {
      specifications.push({ label: "Hand Availability", value: `Right-Hand: ${rightStock} · Left-Hand: ${leftStock}` });
    }

    seoDescription = `${name} batting gloves at Sialkot Cricket Kits. Supple leather palm, multi-split finger protection, and worldwide tracked shipping. Buy online.`.slice(0, 160);
  } else if (category === "Keeping Gloves") {
    disclosureType = "none";
    imageAlt = `${name} Wicket Keeping Gloves pair - Sialkot Cricket Kits`;
    seoTitle = `${name} Wicket Keeping Gloves | Sialkot Cricket Kits`.slice(0, 60);

    const isYouth = name.toLowerCase().includes("youth") || name.toLowerCase().includes("boys");

    shortDescription = isYouth
      ? `Proportionately scaled wicketkeeping gloves with a high-traction rubber grip palm, flexible leather backing, and padded cuffs for young keepers developing clean takes.`
      : `Professional standard wicketkeeping gloves featuring a deep catching cup, high-traction pimpled rubber palm, and regulation-compliant reinforced webbing.`;

    openingStatement = `Designed for clean takes and dependable ball retention, the ${name} wicketkeeping gloves combine high-grip palm technology with protective cuff architecture.`;
    description = `The ${name} wicket keeping gloves represent reliable catching equipment engineered for match-winning glovework behind the stumps. Built with a high-traction pimpled rubber palm facing and deep ergonomic catching cup, they offer outstanding ball adhesion and rebound dampening on fast edge takes and spin deliveries. The reinforced thumb webbing complies with official MCC and ICC catching regulations. Soft flexible leather backing allows natural hand articulation, while foam-lined square cuffs provide crucial wrist protection against low bounces. Delivered worldwide from our Sialkot facility. Contact our WhatsApp desk for stock confirmations and sizing guidance.`;
    highlights = [
      "Supplied as a complete matching pair of wicketkeeping gloves",
      "High-traction pimpled rubber palm facing for secure ball adhesion",
      "Deep ergonomic catching pocket aids clean glovework",
      "Reinforced thumb webbing compliant with match regulations",
      "Foam-padded cuffs protect wrists against unpredictable deflections",
      "Worldwide tracked shipping directly from Sialkot, Pakistan",
    ];
    bestFor = isYouth
      ? "Junior and youth wicketkeepers developing catching technique and confidence"
      : "Club, league, and tournament wicketkeepers demanding deep-pocket catching security";
    specifications.push(
      { label: "Unit", value: "Sold as a pair (2 gloves)" },
      { label: "Palm Grip", value: "Pimpled rubber traction palm" },
      { label: "Webbing", value: "Reinforced regulation-compliant catching webbing" },
      { label: "Cuff Design", value: "Padded square protective cuff" }
    );

    seoDescription = `${name} wicketkeeping gloves from Sialkot Cricket Kits. Pimpled rubber palm, regulation webbing, and worldwide shipping. Order today.`.slice(0, 160);
  } else if (category === "Kit & Duffle Bags") {
    disclosureType = "none";
    const isWheelie = name.toLowerCase().includes("wheelie") || name.toLowerCase().includes("trolley");
    imageAlt = `${name} Cricket Kit Bag - Sialkot Cricket Kits`;
    seoTitle = `${name} Cricket Bag | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = isWheelie
      ? `Heavy-duty wheelie cricket kit bag featuring a reinforced base, heavy-duty wheels, spacious main gear compartment, and dedicated bat security pockets.`
      : `Ergonomic stand-up cricket duffle bag with padded internal bat sleeves, separate footwear compartment, and reinforced backpack straps for easy transport.`;

    openingStatement = isWheelie
      ? `Engineered for effortless transit to match fixtures, the ${name} wheelie bag provides expansive storage with rugged wheel architecture.`
      : `Built for practical gear management, the ${name} duffle bag offers generous capacity with comfortable backpack carrying straps.`;

    description = isWheelie
      ? `The ${name} wheelie cricket bag is engineered for cricketers who carry full match equipment and demand durable, effortless transport. Constructed from heavy-duty ripstop polyester with reinforced bottom runners, it features a massive central cavern that easily holds batting pads, helmets, gloves, and footwear. Dedicated padded bat compartments protect your prized blades during transit, while smooth-rolling tractor wheels and durable pull handles allow effortless navigation across pavilion paths and grass outfields. Heavy-duty dual zips and reinforced stitching ensure lasting durability across long seasons. Shipped worldwide directly from Sialkot. Message our WhatsApp team to confirm bag dimensions and shipping rates.`
      : `The ${name} cricket duffle bag offers modern stand-up architecture and organized gear compartments for dedicated cricketers. Built from durable, water-resistant polyester fabric, it features a tall main storage compartment that easily accommodates full batting pads, helmet, and clothing. Padded internal bat sleeves safely hold bats in place, while a dedicated external or base pocket keeps footwear and dirty spikes isolated from clean gear. Ergonomic padded shoulder straps with breathable mesh backing make cycling or walking to matches comfortable and strain-free. Delivered worldwide from Sialkot with tracking. Contact us on WhatsApp for color availability and team orders.`;

    highlights = [
      "Spacious main compartment holds complete cricket kit",
      isWheelie ? "Heavy-duty smooth-rolling wheels with reinforced base chassis" : "Padded adjustable backpack shoulder straps for ergonomic carrying",
      "Dedicated padded bat storage compartments protect blade edges",
      "Separate footwear compartment keeps spikes away from clean kit",
      "Heavy-duty industrial zippers with reinforced load-bearing seams",
      "Direct worldwide shipping from our Sialkot warehouse",
    ];

    bestFor = isWheelie
      ? "Cricketers carrying full kits, wicketkeeping gear, and multiple bats"
      : "Club and academy players seeking compact, organized backpack transport";

    specifications.push(
      { label: "Bag Type", value: isWheelie ? "Wheelie Cricket Bag" : "Stand-up Duffle Bag" },
      { label: "Material", value: "Heavy-duty durable polyester fabric" },
      { label: "Carrying System", value: isWheelie ? "Tough pull handles & heavy-duty wheels" : "Ergonomic padded backpack straps" },
      { label: "Bat Capacity", value: "Dedicated internal/external padded bat sleeves" }
    );

    seoDescription = `${name} cricket bag available at Sialkot Cricket Kits. Heavy-duty construction, dedicated bat storage, and worldwide tracked shipping. Buy now.`.slice(0, 160);
  } else if (category === "Thigh Pads") {
    disclosureType = "none";
    imageAlt = `${name} Thigh Pad guard - Sialkot Cricket Kits`;
    seoTitle = `${name} Thigh Pad Guard | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = `Ergonomic dual-density foam thigh pad offering anatomical thigh and inner-thigh shielding with wide elasticated waist and leg straps for zero-slip batting comfort.`;
    openingStatement = `Designed for vital upper-leg protection against short-pitched bowling, the ${name} thigh pad provides lightweight ergonomic coverage.`;
    description = `The ${name} thigh pad provides essential impact absorption for batsmen facing fast, bouncing deliveries. Constructed from pre-shaped dual-density high-impact foam, it contours naturally to the thigh without slipping or shifting during quick running. The sweat-absorbing soft-touch backing prevents chafing and moisture buildup during long stints at the crease. Wide elasticated waist and leg straps with heavy-duty velcro tabs allow quick adjustment and a personalized, snug fit. Available in both right-handed and left-handed configurations. Shipped worldwide from Sialkot. Reach out on WhatsApp to check stock and confirm sizing.`;
    highlights = [
      "Pre-curved ergonomic profile contours snugly to the upper leg",
      "High-density impact foam cushions severe ball strikes",
      "Wide elasticated waistband with secure velcro adjustment",
      "Soft moisture-wicking backing prevents chafing during running",
      "Lightweight construction allows full freedom of movement",
      "Worldwide delivery available directly from Sialkot",
    ];
    bestFor = "Batsmen facing pace and seam bowling on bouncy pitches";
    specifications.push(
      { label: "Protection", value: "High-density pre-shaped impact foam" },
      { label: "Straps", value: "Elasticated waist & leg straps with velcro" },
      { label: "Facing", value: "Wipe-clean synthetic shell" }
    );
    if (rightStock !== undefined) {
      specifications.push({ label: "Orientation Stock", value: `Right-Hand: ${rightStock} · Left-Hand: ${leftStock}` });
    }

    seoDescription = `${name} thigh pad guard from Sialkot Cricket Kits. High-density foam protection, secure elasticated straps, and worldwide delivery. Order now.`.slice(0, 160);
  } else if (category === "Keeping Inners") {
    disclosureType = "none";
    imageAlt = `${name} Wicket Keeping Inner Gloves pair - Sialkot Cricket Kits`;
    seoTitle = `${name} Wicket Keeping Inners | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = `Padded cotton palm wicketkeeping inners designed to absorb ball impact shock, minimize sweat buildup, and prolong the service life of your outer keeping gloves.`;
    openingStatement = `Essential under-glove padding for wicketkeepers, the ${name} inners cushion palm impact and enhance grip comfort.`;
    description = `The ${name} wicket keeping inners are essential accessories designed to be worn beneath match keeping gloves for enhanced comfort, sweat absorption, and palm cushioning. Featuring a soft padded cotton palm with breathable mesh backing, they absorb the stinging force of high-speed takes while preventing sweat from degrading the leather of your outer gloves. The elasticated wristband ensures a snug, non-slip fit that moves naturally with your hands. Washable and durable for intensive match and training seasons. Shipped worldwide from Sialkot. Inquire on WhatsApp for bundle pricing with outer keeping gloves.`;
    highlights = [
      "Supplied as a complete pair of inner gloves",
      "Soft padded cotton palm cushions high-impact takes",
      "Breathable fabric wicks perspiration away from hands",
      "Protects interior leather lining of outer keeping gloves",
      "Elasticated wristband provides a snug, non-slip fit",
      "Worldwide shipping with multi-item combined rates",
    ];
    bestFor = "Wicketkeepers wanting extra palm cushioning and sweat protection inside keeping gloves";
    specifications.push(
      { label: "Unit", value: "Sold as a pair (2 gloves)" },
      { label: "Material", value: "Padded cotton palm with breathable backing" },
      { label: "Cuff", value: "Elasticated stretch wristband" }
    );

    seoDescription = `${name} wicketkeeping inners at Sialkot Cricket Kits. Padded cotton palm, sweat protection, and worldwide tracked shipping. Buy online now.`.slice(0, 160);
  } else if (category === "Helmets") {
    disclosureType = "none";
    imageAlt = `${name} Cricket Helmet with protective steel grille - Sialkot Cricket Kits`;
    seoTitle = `${name} Cricket Helmet | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = `Rigid impact-resistant outer shell cricket helmet with protective steel face grille, interior EPS foam cushioning, and ventilation channels for head safety.`;
    openingStatement = `Providing crucial head and facial defense at the crease, the ${name} helmet combines a tough outer shell with a secure steel grille.`;
    description = `The ${name} cricket helmet delivers essential head and facial protection for batsmen and close-in fielders facing hard cricket balls. Built with a tough, impact-resistant outer shell lined with shock-absorbing high-density EPS foam, it cushions and distributes impact energy safely. The reinforced steel face grille provides clear peripheral visibility while shielding the face and jaw from direct strikes. Multiple ventilation eyelets promote constant airflow to keep your head cool during lengthy stints at the crease. Fitted with an adjustable chin strap and rear dial for a secure, customized fit. Shipped internationally from Sialkot with full protective packaging. Contact us on WhatsApp for size confirmations.`;
    highlights = [
      "High-impact protective outer shell with shock-absorbing foam lining",
      "Reinforced steel face grille provides clear visibility and facial shielding",
      "Ventilation ports promote continuous air circulation",
      "Adjustable chin strap with quick-release buckle for secure hold",
      "Comfortable inner fabric lining wicks away perspiration",
      "Worldwide tracked shipping with protective transit box",
    ];
    bestFor = "Batsmen, wicketkeepers up to the stumps, and close-in fielders seeking head defense";
    specifications.push(
      { label: "Shell", value: "Impact-resistant rigid protective shell" },
      { label: "Grille", value: "Reinforced steel face grille" },
      { label: "Lining", value: "Shock-absorbing EPS foam with comfort fabric" },
      { label: "Fastener", value: "Adjustable chin strap with buckle" }
    );

    seoDescription = `${name} cricket helmet with steel grille at Sialkot Cricket Kits. Rigid shell head defense and worldwide tracked courier shipping. Order online.`.slice(0, 160);
  } else if (category === "Waterproof Caps") {
    disclosureType = "none";
    imageAlt = `${name} weather-resistant sports cap - Sialkot Cricket Kits`;
    seoTitle = `${name} | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = `Water-resistant athletic cricket cap featuring moisture-wicking quick-dry fabric, curved sun visor, and adjustable rear strap for outdoor match and training comfort.`;
    openingStatement = `Designed for outdoor training sessions and sun protection, the ${name} offers water-resistant comfort with an adjustable fit.`;
    description = `The ${name} is a versatile athletic headwear option designed for cricketers during outdoor training, warm-ups, and casual wear. Made from lightweight, water-resistant synthetic fabric, it shields your head from light drizzle while wicking away sweat during warm training sessions. The pre-curved visor provides crucial sun protection for your eyes on bright match days. An adjustable rear closure allows a personalized, comfortable fit for all head sizes. Embroidered eyelets provide additional ventilation. Dispatched worldwide from Sialkot. Message our WhatsApp support team for order inquiries.`;
    highlights = [
      "Supplied as a single unit athletic cap",
      "Water-resistant quick-dry synthetic fabric",
      "Pre-curved visor shields eyes from bright sunlight",
      "Adjustable rear strap ensures a tailored fit for all head sizes",
      "Ventilation eyelets promote interior cooling",
      "Worldwide tracked courier delivery from Sialkot",
    ];
    bestFor = "Outdoor training, coaching, warm-ups, and casual sportswear";
    specifications.push(
      { label: "Unit", value: "Sold per unit (1 cap)" },
      { label: "Fabric", value: "Water-resistant quick-dry synthetic" },
      { label: "Visor", value: "Pre-curved sun visor" },
      { label: "Closure", value: "Adjustable rear strap" }
    );

    seoDescription = `${name} weather-resistant athletic cap at Sialkot Cricket Kits. Quick-dry fabric, sun visor, and worldwide tracked shipping. Buy online today.`.slice(0, 160);
  } else if (category === "Keeping Guards") {
    disclosureType = "none";
    imageAlt = `${name} protective abdo guard cup - Sialkot Cricket Kits`;
    seoTitle = `${name} Protective Cup | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = `High-impact moulded protective abdo guard cup with padded soft-rubber edging, designed for essential pelvic protection during batting and wicketkeeping.`;
    openingStatement = `Essential groin protection for cricketers, the ${name} features a high-impact moulded cup with padded edges for comfort.`;
    description = `The ${name} provides essential groin and pelvic protection for batsmen and wicketkeepers. Made from high-density moulded polypropylene, the rigid shell deflects and disperses direct ball impacts effectively. The perimeter is lined with a soft, padded rubber edge that prevents skin pinching and conforms comfortably against the body. Ergonomically shaped to fit securely inside jockstraps, guard underwear, or batting briefs without shifting during running between the wickets. Shipped worldwide from Sialkot. Contact us on WhatsApp for protective kit bundles.`;
    highlights = [
      "Supplied as a single protective cup unit",
      "High-impact moulded shell disperses direct impact energy",
      "Padded soft-rubber perimeter prevents skin pinching and chafing",
      "Anatomical shape fits standard jockstraps and guard underwear",
      "Essential personal defense for batting and wicketkeeping",
      "Worldwide delivery available directly from Sialkot",
    ];
    bestFor = "All batsmen and wicketkeepers requiring essential personal groin protection";
    specifications.push(
      { label: "Unit", value: "Sold per unit (1 protective cup)" },
      { label: "Material", value: "High-density moulded polymer with padded edge" },
      { label: "Fit", value: "Compatible with standard guard underwear and jockstraps" }
    );

    seoDescription = `${name} protective abdo guard cup at Sialkot Cricket Kits. High-impact protection, padded edges, and worldwide delivery. Order online now.`.slice(0, 160);
  } else if (category === "Other Accessories") {
    disclosureType = "none";
    imageAlt = `${name} cricket accessory - Sialkot Cricket Kits`;
    seoTitle = `${name} | Sialkot Cricket Kits`.slice(0, 60);

    if (id.includes("batting-inner-gloves")) {
      shortDescription = "Breathable padded cotton batting inner gloves that absorb perspiration, enhance handle grip, and extend the lifespan of your match batting gloves.";
      openingStatement = "Improve your batting comfort and grip traction with these soft, sweat-absorbing cotton inner gloves.";
      description = "The SF Batting Inner Gloves are practical accessories designed to be worn inside your primary batting gloves. Crafted from soft, breathable cotton with elasticated wrists, they absorb hand perspiration effectively, keeping your match gloves dry and preventing premature leather wear. The thin padded palm improves grip stability on the bat handle without compromising tactile feel. Washable and long-lasting for intensive training sessions. Shipped worldwide from Sialkot. Add to cart with your batting equipment today.";
      highlights = [
        "Supplied as a complete pair of batting inners",
        "Soft absorbent cotton fabric keeps hands dry",
        "Protects leather palm of primary batting gloves",
        "Thin profile maintains natural feel on the bat handle",
        "Elasticated wristband for secure hold",
        "Worldwide shipping with combined cart discounts",
      ];
      bestFor = "Batsmen wanting moisture management and longer glove lifespan";
      specifications.push(
        { label: "Unit", value: "Sold as a pair (2 inner gloves)" },
        { label: "Material", value: "Breathable stretch cotton" }
      );
    } else {
      shortDescription = "Comfortable stretch-cotton guard underwear featuring a dedicated front pouch to hold your protective abdo cup securely in place during matches.";
      openingStatement = "Engineered to hold your protective guard securely, this guard underwear ensures zero-shift comfort on the pitch.";
      description = "The Guard Underwear is designed specifically for cricketers requiring secure, non-slip placement of their protective abdo cup. Made from breathable, stretch-cotton fabric with a wide elasticated waistband, it features an integrated front pouch that keeps your protective guard firmly in place during running, diving, and crouched batting stances. Eliminates the discomfort of loose straps while providing all-day match comfort. Dispatched worldwide from Sialkot. Contact us on WhatsApp for size advice.";
      highlights = [
        "Dedicated front pouch holds protective cup securely",
        "Breathable stretch-cotton fabric for all-day comfort",
        "Wide elasticated waistband prevents slipping during running",
        "Seamless leg openings prevent chafing",
        "Washable and durable matchwear accessory",
        "Worldwide tracked delivery from Sialkot",
      ];
      bestFor = "Cricketers wanting comfortable, secure guard placement during matchplay";
      specifications.push(
        { label: "Unit", value: "Sold per garment" },
        { label: "Material", value: "Stretch cotton with elastic waistband" },
        { label: "Pouch", value: "Integrated protective cup pocket" }
      );
    }

    seoDescription = `${name} cricket accessory at Sialkot Cricket Kits. Practical comfort, verified quality, and worldwide tracked shipping. Buy online now.`.slice(0, 160);
  } else if (category === "Teamwear") {
    disclosureType = "none";
    const isShorts = name.toLowerCase().includes("shorts");
    imageAlt = `${name} Cricket Teamwear - Sialkot Cricket Kits`;
    seoTitle = `${name} | Sialkot Cricket Kits`.slice(0, 60);

    shortDescription = isShorts
      ? `Lightweight athletic cricket shorts with elasticated waistband, internal drawcord, and moisture-wicking fabric engineered for training sessions and warm-ups.`
      : `Complete matching cricket playing kit crafted from breathable moisture-wicking polyester, designed for comfortable all-day match performance.`;

    openingStatement = isShorts
      ? `Built for active training drills and gym workouts, the ${name} offers lightweight breathability with unrestricted leg movement.`
      : `Designed for comfortable matchplay, the ${name} provides breathable fabric engineering and clean athletic tailoring.`;

    description = isShorts
      ? `The ${name} is engineered for athletic performance during cricket training drills, gym sessions, and casual sportswear. Crafted from lightweight, quick-drying polyester fabric, it wicks away perspiration to keep you cool and agile during demanding physical work. Features an elasticated waistband with an adjustable internal drawcord for a secure, tailored fit, along with deep side pockets for cricket balls or personal items. Double-stitched seams ensure longevity throughout heavy training cycles. Shipped worldwide from Sialkot with teamwear discount options available. Contact us on WhatsApp for team club orders.`
      : `The ${name} delivers professional teamwear performance for club and tournament cricketers. Constructed from breathable, high-performance polyester fabric, it facilitates active air circulation and rapid moisture evaporation during long match sessions in the sun. The ergonomic cut allows full range of motion for bowling strides, throwing, and aggressive batting strokes without restriction. Features reinforced stitching at high-stress seams and a clean, modern athletic finish. Available in multiple standard sizes with worldwide international delivery from Sialkot. Inquire via WhatsApp for custom club printing, logos, and bulk teamwear orders.`;

    highlights = [
      isShorts ? "Lightweight quick-drying athletic shorts" : "Complete cricket playing kit garment",
      "Moisture-wicking breathable fabric keeps you cool and dry",
      "Ergonomic athletic cut allows unrestricted movement",
      "Reinforced stitching along high-stress seams for durability",
      "Easy machine-washable teamwear construction",
      "Worldwide dispatch with bulk club order options on WhatsApp",
    ];

    bestFor = isShorts
      ? "Training sessions, gym workouts, coaching, and casual athletic wear"
      : "Club matches, league tournaments, and team cricket fixtures";

    specifications.push(
      { label: "Garment Type", value: isShorts ? "Athletic Cricket Shorts" : "Cricket Match Playing Kit" },
      { label: "Fabric", value: "100% Breathable moisture-wicking polyester" },
      { label: "Care", value: "Machine washable, quick-drying" },
      { label: "Available Sizes", value: name.split(" - ")[1] || "Standard Fit" }
    );

    seoDescription = `${name} cricket teamwear at Sialkot Cricket Kits. Breathable moisture-wicking fabric and worldwide tracked delivery. Order online today.`.slice(0, 160);
  }

  return {
    id,
    name,
    category,
    shortDescription,
    openingStatement,
    description,
    highlights,
    bestFor,
    specifications,
    seoTitle,
    seoDescription,
    imageAlt,
    disclosureType,
  };
}

// Generate full catalog dictionary
const allContent: Record<string, ProductContent> = {};
for (const p of products) {
  allContent[p.id] = buildBespokeProductContent(p);
}

const outputFile = path.resolve("./src/data/product-content.ts");

const fileHeader = `/**
 * AUTHORITATIVE BESPOKE PRODUCT CONTENT REPOSITORY
 * Sialkot Cricket Kits — 100% Complete Product Copy Audit
 * Generated: ${new Date().toISOString()}
 * Total Products: ${products.length}
 */

export interface ProductContentEntry {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  openingStatement: string;
  description: string;
  highlights: string[];
  bestFor: string;
  specifications: Array<{ label: string; value: string }>;
  seoTitle: string;
  seoDescription: string;
  imageAlt: string;
  disclosureType: "beauty_processed" | "bonafide" | "junior" | "natural_willow" | "none";
}

export const PRODUCT_CONTENT_MAP: Record<string, ProductContentEntry> = ${JSON.stringify(
  allContent,
  null,
  2
)};
`;

fs.writeFileSync(outputFile, fileHeader, "utf-8");
console.log(`✅ Successfully generated bespoke product content for all ${products.length} products in ${outputFile}`);
