export const categoryOrder = [
  "Beauty Processed Bats",
  "Bonafide Bats",
  "Junior & Harrow Bats",
  "Batting Gloves",
  "Batting Pads",
  "Keeping Gloves",
  "Kit & Duffle Bags",
  "Thigh Pads",
  "Keeping Inners",
  "Helmets",
  "Waterproof Caps",
  "Keeping Guards",
  "Other Accessories",
  "Teamwear",
] as const;

export type Category = (typeof categoryOrder)[number];

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number | "Available" | "Confirm on WhatsApp";
  rightStock?: number | string;
  leftStock?: number | string;
  image: string;
  images?: string[];
  description: string;
  shortDescription: string;
  openingStatement: string;
  highlights: string[];
  bestFor: string;
  specifications: ProductSpecification[];
  seoTitle: string;
  seoDescription: string;
  imageAlt: string;
  disclosureType: "beauty_processed" | "bonafide" | "junior" | "natural_willow" | "none";
  featured?: boolean;
  isBestSeller?: boolean;
};

import { PRODUCT_CONTENT_MAP } from "./product-content.ts";

const item = (number: number) => `/assets/products/item-${String(number).padStart(3, "0")}.webp`;
const batImage = "/assets/products/bat-collection.webp";
const brandImage = "/assets/brand/sialkot-cricket-kits-logo.png";
const vvipBonafideGallery = [
  "/assets/products/vvip-bonafide-original-front-a.webp",
  "/assets/products/vvip-bonafide-original-front-b.webp",
  "/assets/products/vvip-bonafide-original-edge.webp",
  "/assets/products/vvip-bonafide-original-back.webp",
];
const silverEditionGallery = [
  "/assets/products/bats/silver-edition/silver-beauty-processed-front-full-a.webp",
  "/assets/products/bats/silver-edition/silver-beauty-processed-front-detail-a.webp",
  "/assets/products/bats/silver-edition/silver-beauty-processed-front-detail-b.webp",
  "/assets/products/bats/silver-edition/silver-beauty-processed-edge-profile-a.webp",
  "/assets/products/bats/silver-edition/silver-beauty-processed-edge-profile-b.webp",
  "/assets/products/bats/silver-edition/silver-beauty-processed-edge-toe-a.webp",
  "/assets/products/bats/silver-edition/silver-beauty-processed-front-toe-detail.webp",
];
const bounceEditionGallery = [
  "/assets/products/bats/bounce-edition/bounce-front-a.webp",
  "/assets/products/bats/bounce-edition/bounce-front-b.webp",
  "/assets/products/bats/bounce-edition/bounce-front-detail.webp",
  "/assets/products/bats/bounce-edition/bounce-reverse.webp",
  "/assets/products/bats/bounce-edition/bounce-edge-a.webp",
  "/assets/products/bats/bounce-edition/bounce-edge-b.webp",
];
const apexProGallery = [
  "/assets/products/bats/apex-edition/apex-pro-front-a.webp",
  "/assets/products/bats/apex-edition/apex-pro-front-b.webp",
  "/assets/products/bats/apex-edition/apex-pro-reverse.webp",
  "/assets/products/bats/apex-edition/apex-pro-edge-a.webp",
  "/assets/products/bats/apex-edition/apex-pro-edge-b.webp",
  "/assets/products/bats/apex-edition/apex-pro-profile-detail.webp",
  "/assets/products/bats/apex-edition/apex-pro-toe-front.webp",
  "/assets/products/bats/apex-edition/apex-pro-toe-reverse.webp",
];
const monsterSeriesGallery = [
  "/assets/products/bats/monster-series/monster-front-a.webp",
  "/assets/products/bats/monster-series/monster-front-b.webp",
  "/assets/products/bats/monster-series/monster-reverse.webp",
  "/assets/products/bats/monster-series/monster-edge-a.webp",
  "/assets/products/bats/monster-series/monster-edge-b.webp",
  "/assets/products/bats/monster-series/monster-weight-proof.webp",
];
const specialBeautyGallery = [
  "/assets/products/bats/special-edition/special-edition-front-a.webp",
  "/assets/products/bats/special-edition/special-edition-front-b.webp",
  "/assets/products/bats/special-edition/special-edition-front-c.webp",
  "/assets/products/bats/special-edition/special-edition-reverse.webp",
  "/assets/products/bats/special-edition/special-edition-edge.webp",
];
const vvipBeautyGallery = [
  "/assets/products/bats/vvip-bat/vvip-45mm-front-a.webp",
  "/assets/products/bats/vvip-bat/vvip-45mm-front-b.webp",
  "/assets/products/bats/vvip-bat/vvip-45mm-reverse.webp",
  "/assets/products/bats/vvip-bat/vvip-45mm-profile-a.webp",
  "/assets/products/bats/vvip-bat/vvip-45mm-edge-a.webp",
  "/assets/products/bats/vvip-bat/vvip-45mm-edge-b.webp",
  "/assets/products/bats/vvip-bat/vvip-45mm-measurement.webp",
];
const specialGradeAGallery = [
  "/assets/products/bats/bonafide-special-grade-a/special-edition-grade-a-front.webp",
  "/assets/products/bats/bonafide-special-grade-a/special-edition-grade-a-front-detail.webp",
  "/assets/products/bats/bonafide-special-grade-a/special-edition-grade-a-reverse.webp",
  "/assets/products/bats/bonafide-special-grade-a/special-edition-grade-a-edge-a.webp",
  "/assets/products/bats/bonafide-special-grade-a/special-edition-grade-a-edge-b.webp",
  "/assets/products/bats/bonafide-special-grade-a/special-edition-grade-a-toe.webp",
];
const playerBonafideGallery = [
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-front-a.webp",
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-front-b.webp",
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-front-detail.webp",
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-reverse.webp",
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-edge-a.webp",
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-edge-b.webp",
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-toe-front.webp",
  "/assets/products/bats/bonafide-player-edition/player-edition-bonafide-toe-reverse.webp",
];
const size4Gallery = [
  "/assets/products/bats/size-4/size-4-front-detail.webp",
];
const size5Gallery = [
  "/assets/products/bats/size-5/size-5-weight-0740.webp",
  "/assets/products/bats/size-5/size-5-weight-0700-a.webp",
  "/assets/products/bats/size-5/size-5-weight-0700-b.webp",
  "/assets/products/bats/size-5/size-5-pair-front.webp",
  "/assets/products/bats/size-5/size-5-pair-reverse.webp",
  "/assets/products/bats/size-5/size-5-profile-and-front.webp",
];
const harrowOriginalGallery = [
  "/assets/products/bats/harrow-original/harrow-original-front.webp",
  "/assets/products/bats/harrow-original/harrow-original-reverse.webp",
  "/assets/products/bats/harrow-original/harrow-original-edge-a.webp",
  "/assets/products/bats/harrow-original/harrow-original-edge-b.webp",
];

const slugify = (value: string) => value
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const productDescriptions: Record<string, string> = {
  "beauty-processed-bats-silver-edition": "Handcrafted by master bat-makers in Sialkot, the Silver Edition beauty-processed cricket bat combines traditional shaping with a refined cosmetic finish. Selected from premium English willow clefts, it features a pronounced spine, generous mid-to-low sweet spot, and substantial edge profiles tailored for stroke-makers on varied pitch surfaces. The bat is balanced for a light, effortless pickup, allowing rapid hand speed through the shot. Every photograph in this dedicated gallery showcases the actual bat, detailing its pristine face, toe finish, and edge contour. Available with worldwide delivery directly from our Sialkot facility. Contact us on WhatsApp for live ping demonstrations and exact weight confirmations before dispatch.",
  "beauty-processed-bats-player-edition": "The Player Edition beauty-processed cricket bat represents professional-grade craftsmanship straight from Sialkot's heritage bat-making workshops. Built from top-tier clefts, this bat delivers an imposing profile with thick power edges and a full-bodied spine that maximizes rebound energy across the entire hitting zone. The balanced weight distribution ensures optimal pickup and fluid stroke control during aggressive front-foot drives or commanding back-foot cuts. Each cleft is precision-pressed and hand-finished with an immaculate aesthetic polish. We offer worldwide shipping with knocking-in options available upon request. Request a live video inspection on WhatsApp to verify grain structure, balance, and ping performance.",
  "beauty-processed-bats-bounce-edition": "Engineered specifically for high-rebound energy and responsive stroke play, the Bounce Edition beauty-processed bat is sculpted from seasoned clefts in Sialkot. Featuring an enhanced mid-blade sweet spot, extended power zone, and robust edge thickness, it offers immense punch for modern boundary hitters. The profile is tapered to maintain a feather-light pickup without sacrificing blade mass or structural integrity. The authentic multi-angle gallery highlights the bat's clean face, reverse camber, and reinforced toe. Shipped worldwide with secure packaging. Message our Sialkot team on WhatsApp to receive a live ping test video and personalized balance consultation.",
  "beauty-processed-bats-apex-pro": "The Apex Pro beauty-processed cricket bat is our flagship performance model, crafted in Sialkot for discerning cricketers who demand supreme power and precision balance. Hand-shaped with commanding 40mm+ edge contours, an elevated spine, and an expansive sweet spot, this bat provides explosive rebound on drives, pulls, and aerial strokes. The premium cane handle absorbs impact shock effortlessly, providing unmatched feel and feedback at the crease. Accompanied by its matching protective cover, the complete gallery reflects the exact blade profile, toe angles, and clean grain finish. Delivered worldwide. Connect on WhatsApp for live video reviews, ping trials, and custom knocking-in services.",
  "beauty-processed-bats-monster-series": "The Monster Series beauty-processed cricket bat is crafted for heavy-hitting power batsmen who demand maximum willow mass and destructive hitting power. Hand-sculpted in Sialkot with an ultra-thick edge profile, high spine, and deep power belly, this bat delivers immense momentum through the contact zone. Despite its imposing dimensions, meticulous pressing and balance distribution ensure a comfortable pickup and controlled bat flow. The gallery includes comprehensive weight-proof verification, face angles, and edge measurements. Dispatched internationally to cricket clubs and players worldwide. Contact our Sialkot workshop via WhatsApp for live bat trials and weight specifications.",
  "beauty-processed-bats-special-edition": "The Special Edition beauty-processed bat showcases precision craftsmanship and refined blade finishing from our Sialkot workshop. Selected for structural density and straight grain alignment, this cleft features a full, traditional profile with substantial edges and an elongated hitting zone suitable for all-format cricket. The semi-oval cane handle provides superior grip stability and shock dampening during long innings. The exclusive product gallery illustrates the bat from multiple perspectives, including edge depth, back profile, and toe geometry. We provide reliable worldwide shipping. Contact us on WhatsApp to inspect ping performance and current workshop availability.",
  "beauty-processed-bats-vvip-bat": "The VVIP beauty-processed cricket bat is an elite custom profile featuring massive 45mm edges and a towering spine engineered for boundary-clearing performance. Handcrafted by master artisans in Sialkot, this bat packs immense willow behind the sweet spot while maintaining exceptional balance and swing velocity. The cleft undergoes specialized pressing to ensure solid blade compression, longevity, and explosive acoustic ping. The gallery includes exact edge measurement views, face profiles, and back contours of this specific model. Delivered internationally with complete transit protection. Request a live WhatsApp video consultation for bat-ping verification and customized preparation.",
  "bonafide-bats-vvip-bonafide-original-grade-a": "The VVIP Bonafide Original Grade A+ is our most prestigious cricket bat, crafted from unbleached, natural Grade A+ English willow in Sialkot. Presented in its raw, unprocessed state, this cleft displays tight, straight, and evenly spaced grains across a pristine face. Built with massive power edges, a commanding mid-blade swell, and a balanced duckbill toe taper, it delivers instantaneous ping and unmatched driving power. Every photograph in this exclusive gallery depicts the authentic blade, unvarnished willow texture, and natural grain structure. Available for immediate worldwide dispatch. Contact us on WhatsApp for a live high-definition video inspection, ping test, and knocking-in service.",
  "bonafide-bats-special-edition-grade-a": "The Bonafide Special Edition Grade A cricket bat is crafted from unbleached Grade A English willow, showcasing natural wood grains and authentic Sialkot craftsmanship. Designed with a full-bodied profile, generous edges, and a pronounced sweet spot, it offers outstanding rebound resilience and balanced pickup for stroke-makers. The natural wood finish emphasizes the structural integrity and density of the cleft. The gallery captures the actual bat from every angle, including face details, reverse contour, and toe construction. Shipped worldwide with premium protective packaging. Reach out on WhatsApp to view live ping demonstrations and confirm exact bat weights.",
  "bonafide-bats-player-edition": "The Bonafide Player Edition cricket bat is constructed from hand-selected natural English willow in Sialkot, preserving the organic beauty and grain alignment of the cleft. Featuring a traditional profile with thick edges and a well-positioned middle, it provides substantial power for front-foot drives and back-foot defence. The multi-piece cane handle delivers excellent vibration absorption and tactile feedback. Accompanied by its custom black bat cover, the gallery displays only the authentic Player Edition model. Delivered worldwide to international cricketers and leagues. Contact our Sialkot team on WhatsApp for live ping videos and custom weight selection.",
  "junior-and-harrow-bats-size-4": "The Size 4 junior cricket bat is specially designed in Sialkot for young aspiring cricketers developing their stroke technique. Scaled to proportionate junior dimensions, it offers a lightweight pickup, narrow handle diameter, and a balanced sweet spot that enables young batters to play full attacking shots with confidence. Hand-finished with clean edges and smooth blade contouring, it provides authentic willow response. The gallery presents the exact original product photograph. Dispatched worldwide to junior academies and clubs. Message our Sialkot team on WhatsApp to confirm size suitability and junior equipment bundles.",
  "junior-and-harrow-bats-size-5": "Crafted for growing junior players, the Size 5 cricket bat from Sialkot delivers the ideal combination of lightweight manoeuvrability and solid striking power. Shaped with proportionate edges, a balanced spine, and an ergonomic handle, it allows young cricketers to build correct batting fundamentals and timing without straining their wrists. The gallery features verified batch photographs, including weight-scale verification (approx. 700g–740g) and profile views. Available with worldwide international shipping. Connect with us on WhatsApp for weight selection and junior equipment advice.",
  "junior-and-harrow-bats-size-6": "The Size 6 junior cricket bat bridges intermediate youth cricket and senior equipment, handcrafted in Sialkot from quality willow clefts. It features extended blade dimensions, substantial edge thickness, and a responsive sweet spot engineered to help youth batsmen generate boundary power effortlessly. The multi-piece cane handle dampens ball impact vibrations for maximum comfort. Original product photographs illustrate the genuine handle geometry, face profile, and clean finish. Shipped worldwide to clubs and academies. Inquire on WhatsApp for current stock availability, knocking-in, and dispatch details.",
  "junior-and-harrow-bats-harrow-size": "Tailored for teenagers and senior youth players transitioning to full-size bats, the Harrow Size cricket bat offers near-senior blade dimensions with a slightly shorter handle and reduced weight. Handcrafted in Sialkot, it boasts thick power edges, a responsive mid-blade swell, and feather-light pickup for aggressive shot execution. The gallery showcases unedited product photographs detailing blade geometry and authentic craftsmanship. Dispatched internationally with secure delivery. Contact our Sialkot bat-makers on WhatsApp to request a live ping demonstration and custom balance consultation.",
  "batting-pads-dsc-krunch-300": "The DSC Krunch 300 batting pads offer robust front-line protection and agile movement for competitive batsmen. Constructed with lightweight high-density foam rods reinforced with a traditional cane front, these pads effectively dissipate high-speed ball impacts. The ergonomically sculpted knee bolster cradles the joint snugly, while wide padded calf and ankle straps ensure a secure, non-slip fit during fast running between the wickets. Finished in durable PU facing with abrasion-resistant instep piping. Shipped worldwide with verified stock. Contact Sialkot Cricket Kits on WhatsApp for sizing confirmations and kit combinations.",
  "batting-pads-gm-b555-diamond": "Designed in collaboration with modern match requirements, the GM B555 Diamond batting pads feature an advanced seven-cane vertical construction backed by dual-density impact foam. The pre-curved knee roll provides anatomical alignment and superior protection against direct deliveries. Breathable air-mesh vertical bolsters enhance ventilation during lengthy innings under the sun. Reinforced knee locator cups and durable instep bindings prevent premature ground wear. Available for international dispatch directly from Sialkot. Reach out on WhatsApp for real-time stock verification and club order inquiries.",
  "batting-pads-gray-nicolls-legend": "The Gray-Nicolls Legend batting pads represent the pinnacle of traditional elegance and contemporary impact defense. Engineered with premium multi-section cane uprights and high-density foam wing wraps, they deliver comprehensive protection across the shins, knees, and lower leg. The luxury leather-look PU skin offers easy wipe-clean durability, while the cushioned knee cup incorporates soft-feel moisture-wicking lining for exceptional match comfort. Available in both right-handed and left-handed configurations. Shipped worldwide from Sialkot with full transit security. Message our WhatsApp desk for stock confirmation.",
  "batting-pads-kookaburra-ghost": "The Kookaburra Ghost batting pads feature a clean, all-white minimalist aesthetic matched with elite lightweight impact absorption. Built with micro-weight HDF cane ribs and a three-piece external knee roll, these pads minimize drag and facilitate quick singles. The internal vertical bolster utilizes breathable foam padding with moisture-management fabric to keep the batter cool and focused. Features durable synthetic toe piping for enhanced longevity on turf and synthetic wickets. Shipped internationally from our Sialkot hub. Contact us on WhatsApp for live product visuals and availability.",
  "batting-pads-new-balance-tc-1260": "The New Balance TC 1260 batting pads combine cutting-edge styling with tour-level impact resistance. Featuring a robust combination of traditional cane shielding and advanced cross-linked foam panels, they cushion severe bowling impacts effortlessly. The deep three-section knee cup provides flexible articulation, preventing the pad from riding up during deep stances or dynamic sweeps. Wide cushioned straps with heavy-duty touch fasteners provide a tailored, distraction-free fit. Available with worldwide delivery. Inquire via WhatsApp for current stock and cricket equipment bundles.",
  "batting-pads-sf-maximum-players": "Engineered for serious league and club cricketers, the SF Maximum Players batting pads provide high-level protection across the front and side of the leg. Constructed with shock-absorbing cane rods encased in high-density foam padding, they ensure maximum energy absorption against pace bowling. The pre-moulded knee bolster offers firm stabilization and smooth flex during running. Extra-wide calf straps distribute pressure evenly for long-lasting comfort. Supplied directly from Sialkot with international delivery. Contact us on WhatsApp to verify sizing and stock.",
  "batting-pads-sg-white-edition": "The SG White Edition batting pads deliver classic protection and clean aesthetics for opening and middle-order batsmen. Featuring a traditional flat-front design with reinforced cane pillars and high-resilience foam, these pads absorb heavy ball impacts reliably. The cushioned side wing provides extended wraparound protection for the calf, while the soft foam ankle cup eliminates chafing. Fitted with premium PU facing and reinforced instep fabric for prolonged service life. Shipped worldwide from Sialkot. Reach out on WhatsApp for fast stock confirmations.",
  "batting-pads-gm-maxi-606-white": "The GM Maxi 606 White batting pads provide an excellent blend of lightweight mobility and dependable defensive shielding. Built with a modern vertical cane framework layered over high-density foam, they offer solid protection against medium-fast and spin bowling. The breathable vertical bolster promotes active airflow, reducing sweat buildup during prolonged spells at the crease. Padded nylon straps with quick-release velcro tabs ensure easy adjustment and reliable security. Dispatched worldwide from Sialkot. WhatsApp us to check current stock and delivery schedules.",
  "batting-pads-ss-players-edition": "The SS Players Edition batting pads are crafted to meet the stringent demands of top-tier cricket competition. Utilizing high-grade lightweight cane ribs and multi-layer shock foam, they offer maximum protection without imposing unnecessary leg weight. The contoured knee socket features cushioned side wings that shield the sensitive knee ligaments from angled deflections. Covered in premium polyurethane with reinforced piping along the bottom rim for turf resistance. Available with worldwide dispatch. Inquire on WhatsApp for current right and left-hand stock.",
  "batting-pads-gray-nicolls-stratos": "Featuring modern angular styling and lightweight protective architecture, the Gray-Nicolls Stratos batting pads are built for dynamic run-scorers. The hybrid construction incorporates high-density cane ribs and sculpted foam side wings for all-round coverage. A multi-layered knee locator ensures the pad moves naturally with the batsman's stride, avoiding bulky interference during running. The durable PU outer shell resists scuffing and cleans effortlessly. Delivered worldwide from our Sialkot warehouse. Contact us on WhatsApp for sizing guidance.",
  "batting-pads-gm-maxi-606": "The GM Maxi 606 batting pads deliver dependable protection, balanced weight distribution, and functional comfort for club and league cricketers. Engineered with traditional cane reinforcement over shock-absorbing foam cores, they provide dependable defense against pace bowling. The soft padded knee cup and moisture-resistant internal lining keep the legs comfortable throughout demanding match situations. Strong velcro straps provide a secure, tailored hold on both right and left-handed batsmen. Shipped internationally from Sialkot. Connect on WhatsApp to confirm availability.",
  "batting-pads-moulded-pads-white": "The Moulded Batting Pads in classic white utilize modern thermo-formed foam technology to deliver ultra-lightweight, ergonomic protection. The single-piece moulded shell wraps snugly around the shin and knee, providing zero-bulk aerodynamic efficiency for quick singles and sharp running. Dual-density internal padding absorbs high-impact energy while the sweat-wicking lining prevents moisture buildup. Durable outer skin resists dirt and turf stains. Shipped internationally from Sialkot. Contact us on WhatsApp to discuss bulk club orders or individual stock.",
  "batting-pads-moulded-pads-black": "Designed for modern T20 leagues, coloured-clothing matches, and training sessions, these Black Moulded Batting Pads combine modern aesthetics with high-performance impact defense. The pre-curved lightweight moulded shell eliminates traditional cane bulk, providing complete freedom of movement at the crease. Soft internal foam dampens impact vibrations, while the quick-adjust strap system ensures a snug, non-slip fit on the leg. Shipped worldwide directly from Sialkot. Message our WhatsApp team to verify stock and shipping rates.",
  "batting-pads-moulded-pads-navy": "Finished in deep navy blue for club and tournament teamwear matches, these Navy Moulded Batting Pads offer superior lightweight mobility and modern leg defense. The seamless moulded construction provides an anatomical wrap around the knee and shin, reducing air resistance during running between wickets. High-resilience interior foam cushions ball impacts, while durable strap anchors ensure long-lasting match performance. Available for worldwide delivery from Sialkot. Inquire via WhatsApp for stock and teamwear matchings.",
  "batting-pads-new-balance-batting-pad-priority-offer": "This New Balance Priority Offer batting pad provides premium protection at special limited-stock availability. Built with traditional cane uprights, shock-absorbing foam inserts, and a contoured knee cup, it delivers dependable front-line shielding for opening batsmen. Ergonomic padding ensures comfort throughout long sessions, while durable PU facing resists wear on turf pitches. Available in limited single-item stock. Dispatched worldwide from Sialkot. Contact our WhatsApp support team immediately to secure this priority item.",
  "batting-pads-dsc-batting-pad-priority-offer": "Offered as an exclusive priority opportunity from our Sialkot inventory, these DSC Batting Pads deliver lightweight cane protection and dependable knee joint coverage. Featuring high-density foam padding and breathable interior bolsters, they offer a comfortable, secure fit for club and academy batsmen. Wide elasticated straps with durable velcro tabs ensure easy tightening and a stable hold. Limited stock available with worldwide shipping. Message our WhatsApp team to confirm immediate dispatch.",
  "batting-pads-sg-batting-pad-priority-offer": "Available under our Sialkot warehouse priority listing, these SG Batting Pads feature classic white styling and dependable multi-cane protective construction. Designed with a pre-curved knee socket and padded side wings, they cushion direct ball impacts reliably. Soft internal fabric bolsters wick away sweat during hot match conditions. Strictly limited inventory available for international dispatch. Contact us on WhatsApp to verify left/right orientation and arrange prompt worldwide delivery.",
  "batting-pads-kookaburra-ghost-priority-offer": "This Kookaburra Ghost Priority Offer batting pad features signature clean aesthetics and tour-grade lightweight protective foam. The high-density cane ribs and three-piece knee roll provide exceptional agility and impact dissipation at the crease. Fitted with durable instep piping and strong velcro closures for long-lasting match durability. Limited single-unit stock ready for immediate worldwide dispatch from Sialkot. Reach out on WhatsApp to secure this exclusive catalogue item.",
  "batting-gloves-gm-original-le": "The GM Original LE batting gloves represent championship-level hand protection, combining multi-segment finger flexibility with high-density impact shielding. The premium soft leather palm delivers exceptional bat grip, moisture management, and natural tactile feedback. Reinforced composite fiber inserts on lead fingers provide crucial protection against lifting deliveries. Integrated air-mesh gussets ensure constant airflow across the hand during long innings. Shipped internationally from Sialkot with full stock tracking. Message our WhatsApp team for stock and sizing confirmation.",
  "batting-gloves-gray-nicolls-vapour-1500-black": "Featuring a stealth black aesthetic, the Gray-Nicolls Vapour 1500 batting gloves are engineered for high-performance impact dissipation and unrestricted finger articulation. Multi-section finger splits with high-density foam padding absorb ball strikes effortlessly, while the premium leather palm offers responsive bat feel and slip-free control. Perforated finger sidewalls promote active ventilation during intense matches. Fitted with an elasticated towelling wristband with secure velcro closure. Delivered worldwide from Sialkot. Reach out on WhatsApp to confirm your hand size.",
  "batting-gloves-gray-nicolls-classic": "The Gray-Nicolls Classic batting gloves embody timeless design and dependable defensive padding for league and club cricketers. Constructed with sausage-style and multi-split finger protection filled with shock-absorbing foam, they cushion fast-bowling impacts reliably. The supple leather palm ensures a soft, comfortable hold on the bat handle throughout demanding innings. Side-bar protection on the bottom hand shields the vulnerable thumb and index finger. Dispatched worldwide from Sialkot. Contact us on WhatsApp for fast order processing.",
  "batting-gloves-gray-nicolls-classic-green": "Finished with distinctive green brand accents, the Gray-Nicolls Classic Green batting gloves combine proven protective architecture with exceptional playing comfort. The ergonomic multi-flex finger layout allows natural hand movement for precise shot-making, while high-density foam padding guards the finger joints. A soft leather palm provides superior grip traction and sweat resistance. Breathable thumb and finger gussets maintain airflow. Available with worldwide dispatch from our Sialkot warehouse. Inquire on WhatsApp for immediate availability.",
  "batting-gloves-kookaburra-ghost-2-0": "The Kookaburra Ghost 2.0 batting gloves deliver a minimalist all-white design paired with advanced multi-segment finger flexibility. High-grade foam segments reinforced with fiber-shield tops protect against aggressive bowling. The ultra-supple leather palm provides a soft, secure connection to the bat handle with excellent durability. Mesh ventilation inserts keep hands dry and agile during extended sessions. Shipped worldwide from Sialkot. Reach out on WhatsApp to verify current stock and size availability.",
  "batting-gloves-gray-nicolls-legend": "The Gray-Nicolls Legend batting gloves represent the pinnacle of luxury craftsmanship and tour-grade hand security. Crafted with an ultra-soft premium leather palm, they provide unmatched sensitivity and bat control at the crease. Multi-layer high-density foam with fiber inserts shields every knuckle against fast pace bowling. The double-sided elasticated wristband absorbs perspiration while ensuring a tailored, non-slip fit. Shipped internationally from our Sialkot facility. Contact us on WhatsApp to confirm right or left-hand stock.",
  "batting-gloves-kookaburra-kahuna-pro": "Featuring iconic lime green detailing, the Kookaburra Kahuna Pro batting gloves are built for aggressive stroke-makers. Ergonomic multi-split finger construction offers outstanding mobility for power hitting, while shock-absorbing high-density foam cushions heavy impact forces. The durable leather palm delivers lasting grip and moisture resistance during long stints at the crease. Airflow mesh side panels ensure superior breathability. Dispatched worldwide from Sialkot. Connect on WhatsApp for live inventory checks.",
  "batting-gloves-mrf-players-edition": "The MRF Players Edition batting gloves are crafted for international-grade stroke play, offering a supple leather palm and high-density multi-flex finger protection. Fiber-reinforced casing on the lead fingers guards against rising short-pitched bowling, while split-thumb architecture provides unrestricted grip flexibility. Soft brushed internal lining wicks sweat away to keep hands cool and comfortable. Available for immediate worldwide delivery directly from Sialkot. Contact our WhatsApp desk for fast order processing.",
  "batting-gloves-new-balance-dc-580": "The New Balance DC 580 batting gloves deliver dynamic styling, reliable finger articulation, and robust shock absorption for competitive batsmen. Multi-section foam rolls distribute impact forces evenly across the hand, while the premium leather palm offers a natural feel and dependable grip traction. Integrated mesh ventilation channels reduce heat buildup during hot summer fixtures. Shipped worldwide from Sialkot. Reach out on WhatsApp to verify single-item stock availability.",
  "batting-gloves-new-balance-wc-1100": "Designed for elite-level match play, the New Balance WC 1100 batting gloves feature multi-split protective finger blocks reinforced with composite inserts. The high-grade leather palm ensures a soft, durable grip on the bat handle, while dual-sided sweatbands keep wrists dry and supported. Air-mesh finger gussets facilitate continuous cooling throughout your innings. Dispatched worldwide from Sialkot. Inquire via WhatsApp for stock updates and shipping options.",
  "batting-gloves-sg-camo-limited-edition": "The SG Camo Limited Edition batting gloves combine modern camouflage styling with robust defensive shielding. Built with high-density foam-filled finger segments and fiber inserts on leading fingers, they provide serious protection against pace bowling. The premium sheep leather palm delivers exceptional grip feel, comfort, and wear resistance. Double-sided towelling wristband ensures a secure, sweat-free fit. Shipped worldwide from Sialkot. Contact our WhatsApp team for stock and order assistance.",
  "batting-gloves-sg-camo-players-edition": "The SG Camo Players Edition batting gloves offer professional-grade hand defense with striking graphic detailing. Engineered with ergonomic multi-flex finger splits, they allow natural finger dexterity for delicate cuts and commanding drives. High-density shock-absorbing foam cushions sharp impact energy, while the soft leather palm provides lasting grip comfort. Perforated palm and side mesh enhance breathability. Delivered worldwide from Sialkot. Message on WhatsApp for availability.",
  "batting-gloves-sg-spider-rp-17": "The SG Spider RP 17 batting gloves feature custom-style spider graphics and lightweight multi-segment protection tailored for modern T20 batsmen. Pre-curved finger blocks with high-density foam absorb ball shock, while the flexible thumb section allows full range of motion. The durable leather palm ensures solid bat grip under pressure. Elasticated wristband with velcro fastening provides secure closure. Shipped internationally from Sialkot. Inquire on WhatsApp for immediate dispatch.",
  "batting-gloves-sg-test-white": "The SG Test White batting gloves deliver classic all-white elegance and tour-tested hand protection. Multi-piece finger articulation backed by high-density foam and fiber shields provides comprehensive defense against fast bowling. The ultra-soft leather palm offers superb tactile feedback and moisture management. Soft brushed interior lining prevents chafing during lengthy innings. Available for worldwide delivery from Sialkot. Contact us on WhatsApp for size and hand orientation checks.",
  "batting-gloves-ss-golden-limited-edition": "The SS Golden Limited Edition batting gloves feature prestigious gold detailing and elite multi-split protective architecture. Multi-flex finger segments filled with high-density foam cushion heavy impacts, while the reinforced lead finger fiber shields guard against erratic bounce. The premium leather palm delivers unmatched softness, durability, and grip control. Wide elasticated wristband provides snug support. Shipped worldwide from Sialkot. WhatsApp us to check current stock.",
  "batting-gloves-ss-millennium-pro": "The SS Millennium Pro batting gloves provide outstanding flexibility, lightweight comfort, and reliable protection for dedicated club and league cricketers. Multi-section foam blocks conform to the natural curvature of the fingers, ensuring effortless grip on the bat handle. The durable leather palm delivers lasting grip and moisture resistance during intense match play. Integrated air-mesh gussets promote continuous cooling. Dispatched worldwide from Sialkot. Contact on WhatsApp for stock confirmations.",
  "batting-gloves-ss-millennium-pro-white": "Finished in clean, all-white styling, the SS Millennium Pro White batting gloves offer sleek aesthetics and proven hand defense. Ergonomic finger splits with high-density shock foam absorb pace deliveries, while the supple leather palm provides a soft, responsive connection to the bat handle. Reinforced three-piece thumb construction enhances flexibility and comfort. Shipped worldwide from our Sialkot warehouse. Reach out on WhatsApp for fast stock confirmations.",
  "batting-gloves-ss-red-premium-super-test": "The SS Red Premium Super Test batting gloves feature striking red accents paired with professional-level impact defense. Multi-segment finger rolls with high-resilience foam and fiber-shield caps ensure comprehensive safety against hostile pace bowling. The soft leather palm provides excellent grip traction and sweat management. Wide wristband with velcro strap ensures a firm, non-slip fit. Delivered worldwide from Sialkot. Message us on WhatsApp to verify availability.",
  "batting-gloves-ss-super-test": "The SS Super Test batting gloves offer trusted protection, traditional styling, and lightweight comfort for opening and middle-order batsmen. Built with high-density foam-filled finger segments and side-bar thumb protection, they shield the hand against heavy impacts. The supple leather palm provides natural bat control and reliable durability across long playing seasons. Available with worldwide shipping from Sialkot. Contact our WhatsApp desk for stock inquiries.",
  "batting-gloves-ton-gold-player-edition": "The TON Gold Player Edition batting gloves represent top-tier craftsmanship, featuring refined gold branding and professional multi-flex protective segments. Multi-layer foam padding with fiber caps cushions severe impacts, while the ultra-soft leather palm delivers extraordinary feel and bat control. Airflow mesh side gussets prevent heat buildup during long match innings. Shipped internationally from our Sialkot hub. Reach out on WhatsApp for size and stock verification.",
  "batting-gloves-gray-nicolls-neo-core-2000": "The Gray-Nicolls Neo Core 2000 batting gloves feature contemporary multi-section finger styling and high-density foam padding engineered for active stroke-makers. Flexible finger splits facilitate rapid hand adjustments, while the durable leather palm ensures solid grip traction in all weather conditions. Soft towelling wristband with secure velcro tab keeps wrists dry and supported. Dispatched worldwide from Sialkot. Inquire via WhatsApp for stock updates.",
  "batting-gloves-gm-diamond-404": "The GM Diamond 404 batting gloves provide lightweight mobility, modern ergonomics, and dependable finger protection for club cricketers. Multi-split foam segments allow natural finger flex for controlled shot execution, while the supple leather palm provides positive bat grip and sweat resistance. Breathable thumb inserts maintain interior airflow throughout warm match sessions. Shipped worldwide from Sialkot. Contact our WhatsApp team for stock and ordering details.",
  "batting-gloves-gm-diamond-le": "The GM Diamond LE batting gloves offer elite protective engineering, combining multi-flex finger sections with fiber-topped impact shields. The top-grade leather palm ensures a luxury soft feel, excellent grip durability, and responsive handle feedback at the crease. Double-sided elasticated wristband with velcro closure provides secure, comfortable wrist support. Available for worldwide delivery directly from Sialkot. Reach out on WhatsApp to confirm stock.",
  "batting-gloves-ss-aerolite": "The SS Aerolite batting gloves are engineered for batsmen who prioritize ultra-lightweight agility and unhindered hand movement. Feather-light multi-density foam protects the finger joints without adding unnecessary bulk, while the soft leather palm ensures a direct, sensitive connection to the bat handle. Perforated palm and side mesh panels deliver superior ventilation. Shipped worldwide from Sialkot. Contact us on WhatsApp for fast stock confirmations.",
  "batting-gloves-new-balance-tc-1260": "The New Balance TC 1260 batting gloves feature tour-level protective construction with high-density cross-linked foam blocks and composite fiber inserts. The premium leather palm offers remarkable softness, durability, and moisture resistance during extended batting performances. Ergonomic three-piece thumb construction ensures full flexibility and defensive coverage. Dispatched worldwide from Sialkot. Message on WhatsApp for stock checks.",
  "batting-gloves-new-balance-dc-1280": "The New Balance DC 1280 batting gloves deliver bold modern styling, multi-segment finger flexibility, and heavy-duty impact defense. High-resilience foam padding cushions pace bowling, while the supple leather palm provides exceptional grip traction on the bat handle. Integrated air-mesh channels keep hands cool under pressure. Delivered internationally from our Sialkot warehouse. Reach out on WhatsApp for size confirmation.",
  "batting-gloves-new-balance-white-tc-1260": "The New Balance White TC 1260 batting gloves offer a clean, traditional white aesthetic with elite impact absorption. High-density multi-split foam segments provide flexible knuckle articulation, while the luxury leather palm ensures lasting comfort and precise bat control. Wide elasticated wristband absorbs perspiration effectively. Available with worldwide delivery from Sialkot. Contact our WhatsApp desk for stock availability.",
  "batting-gloves-new-balance-white": "The New Balance White batting gloves deliver classic minimalist styling and dependable defensive protection for club and league cricketers. Lightweight foam finger rolls absorb ball strikes, while the durable leather palm provides positive handle traction and sweat management. Breathable side mesh panels maintain interior ventilation. Shipped internationally from Sialkot. Inquire on WhatsApp for immediate dispatch.",
  "batting-gloves-puma-evo-1-blue": "The Puma Evo 1 Blue batting gloves combine dynamic blue branding with multi-flex finger protection and lightweight comfort. Multi-section foam padding cushions impact energy, while the soft leather palm provides secure, responsive grip control during stroke play. Padded wristband with velcro closure ensures a snug fit. Dispatched worldwide from Sialkot. Connect on WhatsApp to confirm stock availability.",
  "keeping-gloves-gm-original-le": "The GM Original LE wicket keeping gloves represent professional standard catching equipment, built with a deep catching pocket and high-traction pimpled rubber palm. Fully compliant with MCC and ICC regulations, the reinforced webbing provides maximum catch security while flexible leather finger backs allow natural finger closure. Padded square cuffs with interior foam lining protect wrists against fast deflections. Dispatched worldwide from Sialkot. Contact on WhatsApp for stock confirmations.",
  "keeping-gloves-gray-nicolls-heritage": "The Gray-Nicolls Heritage wicket keeping gloves combine traditional leather craftsmanship with modern catching geometry. Featuring a durable pimpled rubber grip palm, they offer outstanding ball adhesion and rebound dampening. The soft leather backing provides natural flexibility, while cushioned cuff bolsters protect the wrists against erratic bounces. Available for worldwide delivery from Sialkot. Inquire via WhatsApp for stock updates.",
  "keeping-gloves-gray-nicolls-players-edition": "The Gray-Nicolls Players Edition wicket keeping gloves are crafted for elite wicketkeepers demanding maximum catching area and finger protection. Built with ultra-grip rubber palm facing and reinforced regulation webbing, they ensure exceptional ball security on edge catches. Foam-lined square cuffs and breathable finger gussets provide match-long comfort. Shipped worldwide from Sialkot. Message our WhatsApp team to confirm availability.",
  "keeping-gloves-ss-golden-strip": "The SS Golden Strip wicket keeping gloves feature distinctive gold accenting and a high-performance pimpled rubber palm engineered for reliable ball grabbing. The pre-curved catching cup aids natural glove positioning, while padded finger tips cushion high-speed ball impacts. Durable leather backing and padded cuffs ensure longevity and protection. Dispatched worldwide from Sialkot. Contact us on WhatsApp for fast stock confirmations.",
  "keeping-gloves-ss-professional": "The SS Professional wicket keeping gloves deliver heavy-duty catching performance, high-grade rubber grip palms, and reinforced thumb webbing for league keepers. The ergonomic glove shape promotes clean takes, while internal foam padding protects the palms and finger joints against repeated impact stress. Shipped worldwide from Sialkot. Reach out on WhatsApp for size and stock verification.",
  "keeping-gloves-ss-white-youth": "The SS White Youth wicket keeping gloves are scaled specifically for youth and junior wicketkeepers developing their glovework. Featuring a grippy rubber palm, soft flexible leather backing, and padded wrist cuffs, they provide young keepers with confidence and comfort behind the stumps. Dispatched worldwide from Sialkot. Inquire via WhatsApp for youth sizing advice.",
  "keeping-gloves-ss-white-boys": "The SS White Boys wicket keeping gloves provide junior cricketers with a secure catching cup, durable rubber grip palm, and lightweight protective backing. Proportionate finger lengths and flexible cuff construction allow junior keepers to close the glove easily around the ball. Shipped internationally from Sialkot. Connect on WhatsApp to confirm junior sizes.",
  "keeping-gloves-ss-players-edition-blue": "Featuring vibrant blue styling, the SS Players Edition Blue wicket keeping gloves combine high-traction pimpled rubber palms with regulation-approved catching webbing. The deep ergonomic pocket ensures clean catches off spin and pace bowling, while foam-padded cuffs shield the wrists. Delivered worldwide from Sialkot. Contact our WhatsApp desk for stock availability.",
  "keeping-gloves-gray-nicolls-white-mens": "The Gray-Nicolls White Mens wicket keeping gloves deliver classic white styling, durable pimpled rubber grip palms, and soft leather finger backing for senior keepers. The wide square cuff allows easy entry and smooth hand articulation, while foam padding cushions stinging catches. Shipped worldwide from Sialkot. Message on WhatsApp for immediate dispatch.",
  "keeping-gloves-gray-nicolls-white-boys": "The Gray-Nicolls White Boys wicket keeping gloves are tailored for young wicketkeepers, offering an easy-closing rubber palm and soft leather backing. Padded cuffs protect junior wrists while the regulation webbing aids clean glove-work. Available for international delivery from Sialkot. Inquire on WhatsApp for junior equipment bundles.",
  "keeping-gloves-gray-nicolls-white-youth": "The Gray-Nicolls White Youth wicket keeping gloves bridge junior and senior glovework, offering a full-featured rubber grip palm and ergonomic catching pocket for teenage keepers. Padded finger caps and flexible cuff design ensure both protection and dexterity. Shipped worldwide from Sialkot. Contact us on WhatsApp for sizing advice.",
  "keeping-gloves-gray-nicolls-legend": "The Gray-Nicolls Legend wicket keeping gloves represent the pinnacle of wicketkeeping luxury and performance. Crafted from supple premium leather with an octopus-traction rubber palm, they offer unmatched ball feel, deep pocket retention, and maximum impact absorption. Foam-lined cuffs provide complete wrist safety. Dispatched worldwide from Sialkot. Reach out on WhatsApp for stock verification.",
  "keeping-gloves-gm-keeping-gloves": "The GM Wicket Keeping Gloves deliver dependable catching performance, high-friction pimpled palm grip, and durable leather backing for club wicketkeepers. The reinforced thumb webbing complies with official match standards, ensuring secure ball retention. Padded cuffs provide wrist protection. Shipped worldwide from Sialkot. Contact our WhatsApp team for stock checks.",
  "kit-and-duffle-bags-dsc-fearless-intense-pro": "The DSC Fearless Intense Pro duffle bag provides expansive storage and rugged durability for all your cricket gear. Constructed from heavy-duty water-resistant fabric, it features a spacious main compartment, internal padded bat sleeves, and dedicated footwear storage with ventilation eyelets. Padded ergonomic shoulder straps ensure comfortable transport. Dispatched worldwide from Sialkot. Contact on WhatsApp for stock confirmations.",
  "kit-and-duffle-bags-dsc-orange": "Featuring vibrant orange accents, the DSC Orange cricket bag offers robust storage capacity, heavy-duty zipper tracks, and reinforced stitching throughout. Designed with dedicated bat pockets and external accessory compartments, it keeps pads, gloves, helmets, and bats organized for match day. Shipped worldwide from Sialkot. Message on WhatsApp for availability.",
  "kit-and-duffle-bags-dxm-hitter": "The DXM Hitter cricket duffle bag is engineered for practical gear management, offering a tall main cavern, internal bat security sleeves, and dual side pockets for personal valuables. Padded back support panels and adjustable backpack straps provide ergonomic carrying comfort. Delivered worldwide from Sialkot. Contact us on WhatsApp for fast dispatch.",
  "kit-and-duffle-bags-gm-blue": "The GM Blue cricket kit bag delivers dependable storage with clean blue styling, heavy-duty polyester construction, and reinforced base panels. Generous internal capacity accommodates full batting equipment, while wide carry straps provide versatile transport options. Shipped internationally from Sialkot. Inquire via WhatsApp for stock updates.",
  "kit-and-duffle-bags-gm-diamond-duffle": "The GM Diamond Duffle bag features a modern stand-up architecture with internal padded sleeves for up to two bats. Separate base footwear pocket keeps dirty spikes away from clean clothing, while heavy-duty backpack straps make traveling to fixtures effortless. Available for worldwide delivery from Sialkot. Connect on WhatsApp to check stock.",
  "kit-and-duffle-bags-gm-original-duffle-black-classic": "The GM Original Duffle Black Classic offers a timeless black profile, durable ripstop fabric, and comprehensive equipment storage for senior cricketers. Internal bat sleeves and external side zip pockets ensure tidy gear organization. Dispatched worldwide from Sialkot. Contact our WhatsApp desk for stock confirmations.",
  "kit-and-duffle-bags-gm-original-wheelie-navy-standard": "The GM Original Wheelie Navy Standard combines generous packing volume with smooth-rolling tractor wheels for effortless transport across pavings and grass. Features durable side grab handles, reinforced wheel housing, and internal bat compartments. Shipped worldwide from Sialkot. Reach out on WhatsApp for delivery details.",
  "kit-and-duffle-bags-gray-nicolls-legend-duffle-standard": "The Gray-Nicolls Legend Duffle Standard bag embodies luxury travel and efficient equipment layout. Built with padded internal bat dividers, shoe tunnel, and breathable valuables pockets, it delivers first-class gear protection. Padded shoulder straps ensure comfortable carrying. Dispatched worldwide from Sialkot. Contact us on WhatsApp for stock checks.",
  "kit-and-duffle-bags-gm-kit-bag": "The GM Kit Bag is a heavy-duty classic gear carrier built with robust canvas-grade polyester, heavy-duty zips, and reinforced base webbing. Accommodates complete match kit including pads, helmet, gloves, and clothing with room to spare. Delivered worldwide from Sialkot. Message on WhatsApp for ordering assistance.",
  "kit-and-duffle-bags-gray-nicolls-red-duffle": "Featuring striking red detailing, the Gray-Nicolls Red Duffle bag offers modern stand-up storage, dedicated internal bat pockets, and a separate ventilated footwear compartment. Ergonomically shaped back straps ensure balanced weight distribution. Shipped internationally from Sialkot. Inquire on WhatsApp for immediate dispatch.",
  "kit-and-duffle-bags-kookaburra-black-duffle-standard": "The Kookaburra Black Duffle Standard bag delivers a sleek profile and rugged durability. Designed with an easy-access top opening, internal padded bat sleeves, and multiple zippered side pockets for gloves and accessories. Available with worldwide shipping from Sialkot. Connect on WhatsApp for stock verification.",
  "kit-and-duffle-bags-kookaburra-d-4-5-green": "The Kookaburra D 4.5 Green cricket bag features iconic green branding, expansive packing capacity, and heavy-duty water-repellent fabric. Ideal for club and touring cricketers requiring organized storage for multiple bats, pads, and protective gear. Dispatched worldwide from Sialkot. Contact on WhatsApp for stock details.",
  "kit-and-duffle-bags-kookaburra-d-4-5-red": "The Kookaburra D 4.5 Red cricket bag provides robust equipment housing with high-visibility red styling. Features reinforced carry handles, heavy-duty zip pullers, and dedicated bat storage sections for match-day convenience. Delivered worldwide from Sialkot. Inquire via WhatsApp for stock updates.",
  "kit-and-duffle-bags-kookaburra-d-4-5-sky-blue": "The Kookaburra D 4.5 Sky Blue cricket bag offers generous equipment volume, durable construction, and vibrant sky-blue accents. Designed with internal dividers to keep protective equipment and personal items organized. Shipped worldwide from Sialkot. Message our WhatsApp team for stock confirmations.",
  "kit-and-duffle-bags-kookaburra-green-duffle": "The Kookaburra Green Duffle bag provides a lightweight stand-up design with internal bat pockets and breathable mesh side pockets. Padded backpack straps ensure effortless carrying to training and matches. Dispatched worldwide from Sialkot. Contact us on WhatsApp for immediate dispatch.",
  "kit-and-duffle-bags-kookaburra-grey-duffle": "The Kookaburra Grey Duffle bag combines contemporary grey styling with practical gear organization. Features a spacious main compartment, padded bat storage, and an external footwear pocket for spike storage. Shipped internationally from Sialkot. Reach out on WhatsApp for stock availability.",
  "kit-and-duffle-bags-kookaburra-red-duffle": "The Kookaburra Red Duffle bag offers dynamic styling, high-capacity equipment storage, and padded backpack straps for mobile cricketers. Internal bat sleeves protect blade edges during transit. Available for worldwide delivery from Sialkot. Contact our WhatsApp desk for stock checks.",
  "kit-and-duffle-bags-mrf-black-duffle": "The MRF Black Duffle bag provides a professional, compact stand-up layout with heavy-duty fabric and reinforced base panels. Features internal bat slots, front accessory pouch, and padded shoulder straps for easy transport. Shipped worldwide from Sialkot. Inquire on WhatsApp for immediate availability.",
  "kit-and-duffle-bags-mrf-game-changer": "The MRF Game Changer cricket bag is a premium, high-capacity carrier engineered for touring players. Features multi-bat internal sleeves, dedicated helmet pocket, separate footwear compartment, and rugged heavy-duty zips. Dispatched worldwide from Sialkot. Contact us on WhatsApp for stock verification.",
  "kit-and-duffle-bags-new-balance-green-duffle": "The New Balance Green Duffle bag features modern stand-up architecture, reinforced base protection, and internal padded bat sleeves. Padded backpack harness distributes gear weight evenly across the shoulders. Shipped worldwide from Sialkot. Message on WhatsApp for ordering information.",
  "kit-and-duffle-bags-new-balance-red-duffle": "The New Balance Red Duffle bag offers bold red branding, high-volume internal storage, and separate ventilated compartments for dirty match footwear. Heavy-duty construction withstands intensive season-long use. Delivered internationally from Sialkot. Contact our WhatsApp desk for stock updates.",
  "kit-and-duffle-bags-shrey-blue-new-duffle": "The Shrey Blue New Duffle bag provides ergonomic stand-up storage with dedicated bat slots and multiple accessory compartments. Padded air-mesh back panels and straps ensure cool, comfortable carrying. Available with worldwide dispatch from Sialkot. Inquire on WhatsApp for stock checks.",
  "kit-and-duffle-bags-shrey-navy-duffle": "The Shrey Navy Duffle bag delivers smart navy styling, heavy-duty ripstop polyester, and organized internal bat storage. Built-in shoe tunnel keeps spikes separated from batting gear. Shipped worldwide from Sialkot. Reach out on WhatsApp for fast order processing.",
  "kit-and-duffle-bags-ss-blue-duffle": "The SS Blue Duffle bag offers a lightweight stand-up profile, durable fabric construction, and internal padded bat sleeves for club cricketers. Adjustable shoulder straps provide easy transport. Dispatched worldwide from Sialkot. Contact on WhatsApp for stock confirmations.",
  "kit-and-duffle-bags-ss-grey-duffle": "The SS Grey Duffle bag combines modern grey aesthetics with spacious gear capacity and external zippered pockets for gloves and accessories. Reinforced base protects against damp ground. Delivered worldwide from Sialkot. Message on WhatsApp for availability.",
  "kit-and-duffle-bags-shrey-kit-bag": "The Shrey Kit Bag is a premier, large-capacity gear bag built for serious cricketers with full kit requirements. Features heavy-duty fabric, robust wheels, internal bat compartments, and multi-pocket organization for complete match preparedness. Shipped worldwide from Sialkot. Inquire on WhatsApp for stock updates.",
  "kit-and-duffle-bags-gm-original-duffle-black-premium": "The GM Original Duffle Black Premium bag is crafted from heavy-duty technical fabric with premium zippers, reinforced internal bat pockets, and ergonomic padded harness straps for maximum travel comfort. Available for worldwide delivery from Sialkot. Contact our WhatsApp team for stock checks.",
  "kit-and-duffle-bags-gm-original-wheelie-navy-premium": "The GM Original Wheelie Navy Premium bag features high-volume storage, heavy-duty tractor wheels, and a reinforced bottom chassis for seamless transport. Internal bat sleeves and external shoe pockets ensure pristine organization. Dispatched worldwide from Sialkot. Message on WhatsApp for stock updates.",
  "kit-and-duffle-bags-gray-nicolls-legend-duffle-premium": "The Gray-Nicolls Legend Duffle Premium bag represents the highest tier of duffle craftsmanship. Engineered with luxury materials, padded multi-bat compartment, footwear tunnel, and contoured back padding for elite players. Shipped worldwide from Sialkot. Inquire on WhatsApp for availability.",
  "kit-and-duffle-bags-gray-nicolls-legend-wheelie": "The Gray-Nicolls Legend Wheelie bag combines executive styling with expansive packing volume and smooth-glide all-terrain wheels. Features separate bat compartment, structured helmet zone, and durable pull handle. Dispatched internationally from Sialkot. Contact us on WhatsApp for stock checks.",
  "kit-and-duffle-bags-gray-nicolls-kit-bag-trolley": "The Gray-Nicolls Kit Bag Trolley is a heavy-duty wheeled equipment holdall designed for touring clubs and senior cricketers. Heavy-duty wheels, reinforced base skid rails, and deep internal capacity easily store full kit sets. Delivered worldwide from Sialkot. Reach out on WhatsApp for order details.",
  "kit-and-duffle-bags-kookaburra-blue-duffle": "The Kookaburra Blue Duffle bag offers vibrant blue styling, high-capacity equipment storage, and padded backpack straps for mobile cricketers. Internal bat sleeves protect blade edges during transit. Available for worldwide delivery from Sialkot. Contact our WhatsApp desk for stock checks.",
  "kit-and-duffle-bags-shrey-red-new-wheelie": "The Shrey Red New Wheelie bag provides high-capacity wheeled gear transport with bold red styling, heavy-duty wheels, reinforced corner guards, and dedicated internal bat sections. Dispatched worldwide from Sialkot. Inquire via WhatsApp for stock updates.",
  "thigh-pads-aero-p1": "The Aero P1 thigh pad system delivers advanced dual-thigh protection in an integrated, pre-shaped unit. Engineered with multi-layered shock-absorbing foam, it shields both the inner and outer thigh without restricting stride length or running speed. Wide elasticated waist and thigh straps ensure a rock-solid, comfortable fit throughout long innings. Shipped worldwide from Sialkot. Contact on WhatsApp for sizing guidance.",
  "thigh-pads-dxm-hitter": "The DXM Hitter thigh pad provides dependable impact defense against pace bowling, utilizing high-density foam padding encased in soft, sweat-wicking fabric. The contoured design wraps comfortably around the thigh, while adjustable elastic straps prevent slipping during rapid sprints. Delivered worldwide from Sialkot. Message on WhatsApp for stock confirmations.",
  "thigh-pads-gray-nicolls-legend": "The Gray-Nicolls Legend thigh pad offers premium dual-density impact protection with ergonomic anatomical contouring. Premium PU facing resists wear, while soft towel-lined backing absorbs perspiration for all-day match comfort. Adjustable elasticated straps provide a personalized, secure fit. Shipped internationally from Sialkot. Reach out on WhatsApp for sizing checks.",
  "thigh-pads-moonwalkr-black": "The Moonwalkr Black thigh guard features a futuristic, ultra-slim aerodynamic composite shell that deflects ball impacts effortlessly. Lightweight construction eliminates bulk and maximizes running speed between the wickets, while soft inner padding cushions the leg. Available for worldwide delivery from Sialkot. Inquire via WhatsApp for stock updates.",
  "thigh-pads-moonwalkr-blue": "Finished in dynamic blue, the Moonwalkr Blue thigh guard provides state-of-the-art ballistic protection with minimal weight. The pre-curved ergonomic shell provides comprehensive thigh coverage without impeding high-speed running. Integrated towelling straps ensure a snug, non-slip fit. Dispatched worldwide from Sialkot. Contact on WhatsApp for stock checks.",
  "thigh-pads-moonwalkr-white": "The Moonwalkr White thigh guard delivers professional-grade, ultra-lightweight impact defense in a clean white profile. Engineered from advanced composite materials, it disperses high-speed ball energy while maintaining complete freedom of movement at the crease. Shipped worldwide from Sialkot. Message our WhatsApp team to confirm availability.",
  "thigh-pads-newbery-white": "The Newbery White thigh pad combines traditional protective comfort with modern high-density foam padding. Designed to cushion heavy impacts from lifting deliveries, it features soft moisture-wicking backing and durable elasticated straps for a secure hold. Delivered worldwide from Sialkot. Reach out on WhatsApp for stock confirmations.",
  "thigh-pads-remfry-white": "The Remfry White thigh pad offers custom-level protective molding and heavy-duty impact dispersion trusted by international players. The dual-density foam core shields against hostile pace bowling while the soft fabric lining prevents chafing during long innings. Dispatched worldwide from Sialkot. Inquire on WhatsApp for stock details.",
  "keeping-inners-gray-nicolls-red": "The Gray-Nicolls Red wicket keeping inners feature high-grade padded cotton palms that absorb ball shock and prevent chafing inside keeping gloves. Soft, breathable cotton back allows heat to escape, while elasticated wristbands ensure a snug, supportive fit. Shipped worldwide from Sialkot. Contact on WhatsApp for stock confirmations.",
  "keeping-inners-ss-keeping-inners": "The SS Wicket Keeping Inners provide essential moisture management and palm cushioning during demanding wicketkeeping sessions. Crafted from premium soft cotton with reinforced stitching, they prolong the life of your main keeping gloves and reduce hand fatigue. Dispatched worldwide from Sialkot. Inquire via WhatsApp for availability.",
  "keeping-inners-puma-pink": "Featuring vibrant pink accents, the Puma Pink wicket keeping inners deliver lightweight palm padding, sweat absorption, and comfortable finger articulation under wicketkeeping gloves. Soft elasticated cuffs provide a secure fit. Delivered internationally from Sialkot. Message on WhatsApp for stock checks.",
  "keeping-inners-puma-grey": "The Puma Grey wicket keeping inners offer understated styling, soft padded cotton palms, and breathable fabric construction to keep hands dry and blister-free behind the stumps. Elasticated wristbands ensure a non-slip fit. Shipped worldwide from Sialkot. Reach out on WhatsApp for stock updates.",
  "helmets-gray-nicolls-helmet-green": "The Gray-Nicolls Green cricket helmet provides advanced head and facial protection for batsmen and close fielders. Built with a high-impact ABS outer shell, shock-absorbing EPS foam liner, and a reinforced steel face grille, it offers robust defense against fast bowling. Internal dial-adjust fitting system ensures a snug, custom fit, while ventilation vents promote airflow. Shipped worldwide from Sialkot. Contact on WhatsApp for sizing confirmation.",
  "helmets-gray-nicolls-helmet-navy": "The Gray-Nicolls Navy cricket helmet combines classic navy cloth styling with certified impact defense. Featuring a durable composite shell, protective steel grille, and moisture-wicking internal padding, it keeps the player safe and focused at the crease. Rear dial adjustment provides tailored head security. Dispatched worldwide from Sialkot. Inquire via WhatsApp for stock updates.",
  "helmets-masuri-helmet-black": "The Masuri Black cricket helmet represents industry-standard head protection, featuring Masuri's signature steel grille and high-impact outer shell. The dual-density inner foam cushions severe impacts while integrated ventilation channels prevent overheating during long batting spells. Shipped worldwide from Sialkot. Message our WhatsApp team for size and stock verification.",
  "waterproof-caps-nike-waterproof-cap": "The Nike Waterproof Cap is crafted from high-performance water-repellent micro-poly fabric, designed to shield cricketers from light rain and intense sun during outdoor training and matches. Features breathable side eyelets, an internal moisture-wicking sweatband, and an adjustable rear strap with a metal buckle for a secure, custom fit. The structured pre-curved visor provides crisp glare protection in bright conditions. Dispatched worldwide directly from Sialkot. Contact our WhatsApp desk for stock checks and club orders.",
  "waterproof-caps-under-armour-waterproof-cap": "The Under Armour Waterproof Cap delivers lightweight weather protection with a moisture-resistant outer finish and quick-drying internal sweatband. Engineered with breathable woven fabric and embroidered ventilation eyelets, it keeps the head cool during demanding outdoor cricket drills. The adjustable back closure ensures a stable hold in windy weather. Delivered internationally from Sialkot. Inquire on WhatsApp for availability.",
  "waterproof-caps-north-face-waterproof-cap": "The North Face Waterproof Cap combines outdoor-grade water repellency with breathable athletic fabric for reliable weather shielding during cricket sessions and coaching duties. The lightweight, packable construction features a pre-curved bill to block harsh sunlight, while the adjustable rear strap accommodates all head sizes. Dispatched worldwide from Sialkot. Message on WhatsApp for stock confirmations.",
  "waterproof-caps-icon-waterproof-cap": "The Icon Waterproof Cap offers sleek weather-resistant construction, durable stitching, and a comfortable moisture-wicking headband for outdoor cricket activities. Pre-curved bill blocks sun glare effectively while the water-repellent outer layer prevents rain soaking. Features an adjustable back tab for personalized sizing. Shipped worldwide from Sialkot. Reach out on WhatsApp for fast stock updates.",
  "waterproof-caps-adidas-waterproof-cap": "The Adidas Waterproof Cap features water-repellent performance fabric, classic athletic styling, and an adjustable closure for all-day comfort during cricket training and coaching sessions. Integrated ventilation eyelets facilitate continuous heat dissipation, while the cushioned inner headband absorbs sweat. Delivered worldwide from Sialkot. Contact our WhatsApp desk for stock availability.",
  "keeping-guards-sg-keeping-guard": "The SG Keeping Guard provides essential groin protection for wicketkeepers and close fielders, engineered with high-impact moulded polymer and soft rubberized perimeter padding for comfortable anatomical positioning during deep crouching and sudden lateral movements. Fits securely into all standard supporter pouches and briefs. Dispatched worldwide from Sialkot. Inquire via WhatsApp for stock confirmations.",
  "keeping-guards-gm-keeping-guard": "The GM Keeping Guard delivers dependable impact shielding with an ergonomically contoured polymer cup and cushioned perimeter edges to prevent chafing during active wicketkeeping and close catching. Lightweight yet rigid construction disperses direct impacts away from sensitive areas. Shipped worldwide from Sialkot. Contact on WhatsApp for stock checks.",
  "keeping-guards-gray-nicolls-keeping-guard": "The Gray-Nicolls Keeping Guard combines high-strength moulded defense with a soft silicone outer rim for maximum comfort and security behind the stumps. Designed to allow complete flexibility during standing up to spinners and diving takes without pinching. Delivered worldwide from Sialkot. Message on WhatsApp for availability.",
  "other-accessories-sf-batting-inner-gloves": "The SF Batting Inner Gloves are crafted from soft, 100% breathable cotton to absorb hand perspiration, enhance bat grip traction, and prevent blisters inside batting gloves. Elasticated cuffs provide a snug, non-slip fit around the wrists while extending the lifespan of your primary leather batting gloves. Shipped worldwide from Sialkot. Contact on WhatsApp for stock checks.",
  "other-accessories-guard-underwear": "The Guard Underwear supporter features comfortable, breathable stretch cotton construction with an integrated secure front pouch designed to hold protective abdo guards firmly in place during active running and bowling. The wide elasticated waistband prevents rolling or slipping during intense match play. Dispatched worldwide from Sialkot. Inquire on WhatsApp for sizing advice.",
  "teamwear-gray-nicolls-playing-kit-small": "The Gray-Nicolls Playing Kit in Size Small is crafted from lightweight, high-performance moisture-wicking polyester engineered to keep club cricketers cool and dry during intense match conditions. Featuring ergonomic raglan sleeves, breathable underarm micro-mesh panels, and a traditional cricket shirt collar, it delivers unrestricted freedom of movement for fast bowling, diving in the field, and running between wickets. The matching trousers incorporate an elasticated drawstring waistband and reinforced knee panels for durability on all pitch surfaces. Dispatched worldwide directly from our Sialkot facility. Contact our WhatsApp desk for team crest printing, custom numbering, and club order assistance.",
  "teamwear-gray-nicolls-playing-kit-medium": "The Gray-Nicolls Playing Kit in Size Medium delivers professional-standard cricket teamwear performance, utilizing advanced technical polyester fabric for rapid perspiration evaporation. Tailored with a comfortable athletic cut, the shirt allows complete shoulder articulation during bowling and throwing, while the breathable trousers provide optimal comfort through long fielding sessions. Heavy-duty flat-lock stitching prevents chafing and ensures lasting durability across full playing seasons. Supplied directly from Sialkot with international delivery. Reach out on WhatsApp for size confirmations and club kit customization.",
  "teamwear-gray-nicolls-playing-kit-large": "The Gray-Nicolls Playing Kit in Size Large combines high-grade breathable polyester with comfortable athletic tailoring for senior club cricketers. The moisture-management fabric actively pulls sweat away from the skin, maintaining core comfort under demanding match conditions. Reinforced collar construction and tear-resistant fabric withstand diving in the outfield and aggressive sliding. Dispatched worldwide from Sialkot with secure packaging. Message our WhatsApp team for bulk academy orders, custom club embroidery, and fast dispatch schedules.",
  "teamwear-gray-nicolls-playing-kit-x-large": "The Gray-Nicolls Playing Kit in Size X-Large provides generous athletic sizing, moisture-management fabric, and breathable underarm panels for optimal airflow during hot match days. Built with quick-drying synthetic fibers that resist creasing and maintain crisp team presentation throughout multi-day tournaments. Features comfortable elasticated trouser waist with drawstring adjustability. Available for international delivery directly from our Sialkot warehouse. Inquire on WhatsApp for teamwear bundle discounts and worldwide shipping rates.",
  "teamwear-gray-nicolls-playing-kit-xxl": "The Gray-Nicolls Playing Kit in Size XXL offers comfortable, non-restrictive sizing with technical moisture-wicking fabric engineered for demanding match conditions. Designed with reinforced stress points, ventilated side gussets, and soft-touch neck tape for maximum comfort throughout long overs in the field. Dispatched worldwide from Sialkot. Reach out on WhatsApp to verify measurements and discuss club requirements.",
  "teamwear-gray-nicolls-shorts-small": "The Gray-Nicolls Shorts in Size Small are made from lightweight, quick-drying performance fabric with an elasticated drawstring waistband for a secure, custom fit during cricket training, gym sessions, and warm-ups. Features deep side pockets to hold practice cricket balls and training accessories. Breathable side panels maximize airflow and mobility. Dispatched worldwide from Sialkot. Contact us on WhatsApp for fast stock confirmations.",
  "teamwear-gray-nicolls-shorts-medium": "The Gray-Nicolls Shorts in Size Medium feature breathable athletic fabric, deep side pockets, and flexible side split seams for unrestricted agility during warm-ups and fielding drills. Designed with a wide elasticated waistband and internal drawcord to ensure non-slip positioning during sprints. Shipped worldwide from Sialkot. Inquire on WhatsApp for teamwear orders.",
  "teamwear-gray-nicolls-shorts-large": "The Gray-Nicolls Shorts in Size Large deliver lightweight comfort, durable polyester construction, and an adjustable waistband for training sessions, coaching, and casual club wear. Reinforced pocket stitching securely holds accessories, while the moisture-wicking fabric keeps you dry during high-intensity workouts. Delivered internationally from Sialkot. Message on WhatsApp for stock updates.",
  "teamwear-gray-nicolls-shorts-x-large": "The Gray-Nicolls Shorts in Size X-Large provide a comfortable, relaxed fit with sweat-wicking fabric and secure pocket storage for coaching and training activities. Breathable lightweight material prevents overheating during long sessions under the sun. Available for worldwide delivery from Sialkot. Contact our WhatsApp desk for stock checks.",
  "teamwear-supreme-shorts-small": "The Supreme Shorts in Size Small offer lightweight athletic comfort, breathable polyester fabric, and an elasticated waistband with drawstring for training and practice. Built with deep side storage pockets and reinforced seam construction for long-lasting durability on and off the field. Dispatched worldwide from Sialkot. Inquire on WhatsApp for availability.",
  "teamwear-supreme-shorts-medium": "The Supreme Shorts in Size Medium are designed for active cricket training, featuring durable, moisture-wicking fabric and deep side pockets for balls and accessories. Ergonomic athletic cut facilitates deep lunges, sprints, and fielding drills without binding. Shipped worldwide from Sialkot. Contact on WhatsApp for stock confirmations.",
  "teamwear-supreme-shorts-large": "The Supreme Shorts in Size Large provide a flexible, comfortable fit with durable stitching and quick-drying athletic fabric for all sporting sessions. The wide waistband distributes pressure evenly, while the lightweight fabric ensures effortless mobility. Delivered worldwide from Sialkot. Message on WhatsApp for stock updates.",
  "teamwear-supreme-shorts-x-large": "The Supreme Shorts in Size X-Large offer generous sizing, breathable lightweight material, and an adjustable drawstring waist for post-match and training comfort. Reinforced pocket seams provide practical everyday utility for players and coaches alike. Shipped worldwide from Sialkot. Inquire via WhatsApp for teamwear orders."
};

const product = (
  category: Category,
  name: string,
  price: number,
  stock: Product["stock"],
  image: string,
  extras: Partial<Omit<Product, "id" | "category" | "name" | "price" | "stock" | "image">> = {},
): Product => {
  const id = `${slugify(category)}-${slugify(name)}`;
  const content = PRODUCT_CONTENT_MAP[id];
  const defaultDesc = content?.description || productDescriptions[id] || `Handcrafted ${name} from Sialkot Cricket Kits.`;
  return {
    id,
    category,
    name,
    price,
    stock,
    image,
    description: extras.description || defaultDesc,
    shortDescription: extras.shortDescription || content?.shortDescription || `${name} — match-ready cricket equipment handcrafted in Sialkot with worldwide tracked delivery.`,
    openingStatement: extras.openingStatement || content?.openingStatement || `Experience authentic Sialkot craftsmanship with the ${name}.`,
    highlights: extras.highlights || content?.highlights || [
      `Official ${name} from Sialkot Cricket Kits`,
      `Handcrafted in Sialkot, Pakistan`,
      `Worldwide tracked courier delivery available`,
    ],
    bestFor: extras.bestFor || content?.bestFor || "Competitive cricket matchplay and training sessions",
    specifications: extras.specifications || content?.specifications || [
      { label: "Product Name", value: name },
      { label: "Category", value: category },
      { label: "Origin", value: "Sialkot, Pakistan" },
      { label: "Delivery", value: "Worldwide Tracked Courier" },
    ],
    seoTitle: extras.seoTitle || content?.seoTitle || `${name} | Sialkot Cricket Kits`,
    seoDescription: extras.seoDescription || content?.seoDescription || `Buy ${name} at Sialkot Cricket Kits. Match-ready cricket equipment with worldwide delivery.`,
    imageAlt: extras.imageAlt || content?.imageAlt || `${name} - ${category} from Sialkot Cricket Kits`,
    disclosureType: extras.disclosureType || content?.disclosureType || "none",
    ...extras,
  };
};

const beautyBats: Product[] = [
  product("Beauty Processed Bats", "Silver Edition", 125, "Confirm on WhatsApp", silverEditionGallery[0], {
    images: silverEditionGallery,
    description: productDescriptions["beauty-processed-bats-silver-edition"],
  }),
  product("Beauty Processed Bats", "Player Edition", 165, "Confirm on WhatsApp", batImage, {
    description: productDescriptions["beauty-processed-bats-player-edition"],
  }),
  product("Beauty Processed Bats", "Bounce Edition", 180, "Confirm on WhatsApp", bounceEditionGallery[0], {
    images: bounceEditionGallery,
    description: productDescriptions["beauty-processed-bats-bounce-edition"],
  }),
  product("Beauty Processed Bats", "Apex Pro", 185, "Confirm on WhatsApp", apexProGallery[0], {
    images: apexProGallery,
    featured: true,
    description: productDescriptions["beauty-processed-bats-apex-pro"],
  }),
  product("Beauty Processed Bats", "Monster Series", 195, "Confirm on WhatsApp", monsterSeriesGallery[0], {
    images: monsterSeriesGallery,
    description: productDescriptions["beauty-processed-bats-monster-series"],
  }),
  product("Beauty Processed Bats", "Special Edition", 215, "Confirm on WhatsApp", specialBeautyGallery[0], {
    images: specialBeautyGallery,
    description: productDescriptions["beauty-processed-bats-special-edition"],
  }),
  product("Beauty Processed Bats", "VVIP Bat", 245, "Confirm on WhatsApp", vvipBeautyGallery[0], {
    images: vvipBeautyGallery,
    description: productDescriptions["beauty-processed-bats-vvip-bat"],
  }),
];

const bonafideBats: Product[] = [
  product("Bonafide Bats", "VVIP Bonafide Original - Grade A+", 499, "Confirm on WhatsApp", vvipBonafideGallery[0], {
    images: vvipBonafideGallery,
    featured: true,
    description: productDescriptions["bonafide-bats-vvip-bonafide-original-grade-a"],
  }),
  product("Bonafide Bats", "Special Edition - Grade A", 330, "Confirm on WhatsApp", specialGradeAGallery[0], {
    images: specialGradeAGallery,
    description: productDescriptions["bonafide-bats-special-edition-grade-a"],
  }),
  product("Bonafide Bats", "Player Edition", 215, "Confirm on WhatsApp", playerBonafideGallery[0], {
    images: playerBonafideGallery,
    description: productDescriptions["bonafide-bats-player-edition"],
  }),
];

const juniorBats: Product[] = [
  product("Junior & Harrow Bats", "Size 4", 70, "Confirm on WhatsApp", size4Gallery[0], {
    images: size4Gallery,
    description: productDescriptions["junior-and-harrow-bats-size-4"],
  }),
  product("Junior & Harrow Bats", "Size 5", 85, "Confirm on WhatsApp", size5Gallery[0], {
    images: size5Gallery,
    description: productDescriptions["junior-and-harrow-bats-size-5"],
  }),
  product("Junior & Harrow Bats", "Size 6", 105, "Confirm on WhatsApp", harrowOriginalGallery[0], {
    images: harrowOriginalGallery,
    description: productDescriptions["junior-and-harrow-bats-size-6"],
  }),
  product("Junior & Harrow Bats", "Harrow Size", 110, "Confirm on WhatsApp", harrowOriginalGallery[0], {
    images: harrowOriginalGallery,
    description: productDescriptions["junior-and-harrow-bats-harrow-size"],
  }),
];

const padRows: Array<[string, number, number | string, number | string, number, number]> = [
  ["DSC Krunch 300", 28, 5, 1, 6, 0],
  ["GM B555 Diamond", 29, 6, 0, 6, 1],
  ["Gray-Nicolls Legend", 32, 4, 3, 7, 7],
  ["Kookaburra Ghost", 29, 0, 1, 1, 8],
  ["New Balance TC 1260", 29, 6, 0, 6, 10],
  ["SF Maximum Players", 28, 4, 1, 5, 11],
  ["SG White Edition", 28, 2, 1, 3, 12],
  ["GM Maxi 606 White", 28, 2, 0, 2, 6],
  ["SS Players Edition", 32, 0, 2, 2, 2],
  ["Gray-Nicolls Stratos", 30, 5, 2, 7, 3],
  ["GM Maxi 606", 28, 3, 1, 4, 4],
  ["Moulded Pads - White", 26, "-", "-", 2, 123],
  ["Moulded Pads - Black", 26, "-", "-", 2, 124],
  ["Moulded Pads - Navy", 26, "-", "-", 2, 126],
];

const battingPads = padRows.map(([name, price, rightStock, leftStock, stock, image]) =>
  product("Batting Pads", name, price, stock, item(image), { rightStock, leftStock })
).concat([
  product("Batting Pads", "New Balance Batting Pad - Priority Offer", 24, 1, item(10), { rightStock: 1, leftStock: 0 }),
  product("Batting Pads", "DSC Batting Pad - Priority Offer", 25, 2, item(0), { rightStock: 2, leftStock: 0 }),
  product("Batting Pads", "SG Batting Pad - Priority Offer", 24, 2, item(12), { rightStock: 0, leftStock: 2 }),
  product("Batting Pads", "Kookaburra Ghost - Priority Offer", 26, 1, item(8), { rightStock: 0, leftStock: 1 }),
]);

const battingGloveRows: Array<[string, number, number, number, number, number]> = [
  ["GM Original LE", 28, 14, 3, 17, 13],
  ["Gray-Nicolls Vapour 1500 Black", 27, 14, 5, 19, 14],
  ["Gray-Nicolls Classic", 25, 17, 3, 20, 15],
  ["Gray-Nicolls Classic Green", 26, 12, 4, 16, 16],
  ["Kookaburra Ghost 2.0", 25, 3, 1, 4, 17],
  ["Gray-Nicolls Legend", 28, 11, 5, 16, 18],
  ["Kookaburra Kahuna Pro", 27, 6, 4, 10, 19],
  ["MRF Players Edition", 26, 5, 5, 10, 20],
  ["New Balance DC 580", 24, 0, 1, 1, 21],
  ["New Balance WC 1100", 25, 0, 1, 1, 22],
  ["SG Camo Limited Edition", 28, 16, 3, 19, 24],
  ["SG Camo Players Edition", 26, 15, 3, 18, 25],
  ["SG Spider RP 17", 24, 4, 0, 4, 26],
  ["SG Test White", 25, 24, 6, 30, 27],
  ["SS Golden Limited Edition", 28, 7, 6, 13, 28],
  ["SS Millennium Pro", 27, 10, 3, 13, 29],
  ["SS Millennium Pro White", 26, 11, 4, 15, 30],
  ["SS Red Premium Super Test", 27, 17, 0, 17, 31],
  ["SS Super Test", 25, 1, 1, 2, 32],
  ["TON Gold Player Edition", 27, 17, 6, 23, 33],
  ["Gray-Nicolls Neo Core 2000", 26, 9, 5, 14, 39],
  ["GM Diamond 404", 25, 16, 11, 27, 35],
  ["GM Diamond LE", 28, 19, 4, 23, 36],
  ["SS Aerolite", 24, 11, 0, 11, 37],
  ["New Balance TC 1260", 26, 13, 2, 15, 38],
  ["New Balance DC 1280", 27, 16, 2, 18, 41],
  ["New Balance White TC 1260", 26, 9, 1, 10, 42],
  ["New Balance White", 25, 5, 2, 7, 43],
  ["Puma Evo 1 Blue", 26, 10, 1, 11, 40],
];

const battingGloves = battingGloveRows.map(([name, price, rightStock, leftStock, stock, image]) =>
  product("Batting Gloves", name, price, stock, item(image), { rightStock, leftStock })
);

const keepingGloveRows: Array<[string, number, number, number]> = [
  ["GM Original LE", 32, 7, 47], ["Gray-Nicolls Heritage", 29, 3, 48],
  ["Gray-Nicolls Players Edition", 32, 1, 49], ["SS Golden Strip", 28, 2, 55],
  ["SS Professional", 30, 9, 53], ["SS White Youth", 27, 4, 51],
  ["SS White Boys", 26, 6, 52], ["SS Players Edition Blue", 32, 1, 58],
  ["Gray-Nicolls White Mens", 29, 2, 44], ["Gray-Nicolls White Boys", 26, 2, 45],
  ["Gray-Nicolls White Youth", 26, 2, 46], ["Gray-Nicolls Legend", 32, 4, 49],
  ["GM Keeping Gloves", 29, 3, 47],
];

const keepingGloves = keepingGloveRows.map(([name, price, stock, image]) =>
  product("Keeping Gloves", name, price, stock, item(image))
);

const bagRows: Array<[string, number, number, number]> = [
  ["DSC Fearless Intense Pro", 40, 1, 68], ["DSC Orange", 38, 10, 69],
  ["DXM Hitter", 35, 6, 70], ["GM Blue", 34, 10, 71],
  ["GM Diamond Duffle", 42, 11, 72], ["GM Original Duffle Black - Classic", 30, 10, 73],
  ["GM Original Wheelie Navy - Standard", 42, 13, 74], ["Gray-Nicolls Legend Duffle - Standard", 45, 10, 75],
  ["GM Kit Bag", 48, 9, 76], ["Gray-Nicolls Red Duffle", 45, 1, 59],
  ["Kookaburra Black Duffle - Standard", 40, 8, 60], ["Kookaburra D 4.5 Green", 45, 3, 61],
  ["Kookaburra D 4.5 Red", 40, 4, 62], ["Kookaburra D 4.5 Sky Blue", 45, 12, 63],
  ["Kookaburra Green Duffle", 36, 2, 64], ["Kookaburra Grey Duffle", 40, 10, 65],
  ["Kookaburra Red Duffle", 42, 4, 66], ["MRF Black Duffle", 40, 4, 67],
  ["MRF Game Changer", 52, 6, 78], ["New Balance Green Duffle", 45, 7, 79],
  ["New Balance Red Duffle", 48, 15, 80], ["Shrey Blue New Duffle", 40, 9, 77],
  ["Shrey Navy Duffle", 40, 9, 81], ["SS Blue Duffle", 36, 7, 82],
  ["SS Grey Duffle", 42, 11, 83], ["Shrey Kit Bag", 62, 4, 85],
  ["GM Original Duffle Black - Premium", 36, 11, 84], ["GM Original Wheelie Navy - Premium", 55, 6, 87],
  ["Gray-Nicolls Legend Duffle - Premium", 55, 12, 88], ["Gray-Nicolls Legend Wheelie", 52, 9, 89],
  ["Gray-Nicolls Kit Bag Trolley", 62, 9, 90], ["Kookaburra Blue Duffle", 48, 4, 91],
  ["Shrey Red New Wheelie", 62, 8, 86],
];

const kitBags = bagRows.map(([name, price, stock, image]) => product("Kit & Duffle Bags", name, price, stock, item(image)));

const thighPadRows: Array<[string, number, number, number, number, number]> = [
  ["Aero P1", 16, 0, 2, 2, 92], ["DXM Hitter", 17, 8, 1, 9, 93],
  ["Gray-Nicolls Legend", 20, 15, 7, 22, 94], ["Moonwalkr Black", 18, 22, 6, 28, 95],
  ["Moonwalkr Blue", 16, 4, 0, 4, 96], ["Moonwalkr White", 18, 16, 16, 32, 98],
  ["Newbery White", 17, 2, 1, 3, 99], ["Remfry White", 16, 1, 5, 6, 100],
];

const thighPads = thighPadRows.map(([name, price, rightStock, leftStock, stock, image]) =>
  product("Thigh Pads", name, price, stock, item(image), { rightStock, leftStock })
);

const keepingInners = [
  product("Keeping Inners", "Gray-Nicolls Red", 8, 11, item(112)),
  product("Keeping Inners", "SS Keeping Inners", 8, 15, item(116)),
  product("Keeping Inners", "Puma Pink", 8, 25, item(115)),
  product("Keeping Inners", "Puma Grey", 9, 24, item(114)),
];

const helmets = [
  product("Helmets", "Gray-Nicolls Helmet - Green", 30, 1, "/assets/products/helmet-gn-green.webp"),
  product("Helmets", "Gray-Nicolls Helmet - Navy", 30, 2, "/assets/products/helmet-gn-navy.webp"),
  product("Helmets", "Masuri Helmet - Black", 35, 1, "/assets/products/helmet-masuri-black.webp"),
];

const caps = [
  product("Waterproof Caps", "Nike Waterproof Cap", 10, 8, item(103)),
  product("Waterproof Caps", "Under Armour Waterproof Cap", 10, 7, item(105)),
  product("Waterproof Caps", "North Face Waterproof Cap", 10, 5, item(104)),
  product("Waterproof Caps", "Icon Waterproof Cap", 10, 7, item(102)),
  product("Waterproof Caps", "Adidas Waterproof Cap", 10, 8, item(101)),
];

const guards = [
  product("Keeping Guards", "SG Keeping Guard", 4, 30, item(106)),
  product("Keeping Guards", "GM Keeping Guard", 4, 23, item(107)),
  product("Keeping Guards", "Gray-Nicolls Keeping Guard", 5, 19, item(108)),
];

const otherAccessories = [
  product("Other Accessories", "SF Batting Inner Gloves", 7, 25, item(111)),
  product("Other Accessories", "Guard Underwear", 7, "Available", brandImage),
];

const teamwear: Product[] = [
  ...[["Small", 25, 33], ["Medium", 25, 22], ["Large", 26, 17], ["X-Large", 26, 12], ["XXL", 28, 21]].map(([size, price, stock]) => product("Teamwear", `Gray-Nicolls Playing Kit - ${size}`, Number(price), Number(stock), brandImage)),
  ...[["Small", 10, 25], ["Medium", 10, 24], ["Large", 10, 25], ["X-Large", 10, 25]].map(([size, price, stock]) => product("Teamwear", `Gray-Nicolls Shorts - ${size}`, Number(price), Number(stock), brandImage)),
  ...[["Small", 8, 50], ["Medium", 8, 29], ["Large", 8, 13], ["X-Large", 8, 35]].map(([size, price, stock]) => product("Teamwear", `Supreme Shorts - ${size}`, Number(price), Number(stock), brandImage)),
];

const customBatProducts: Product[] = [
  // Beauty Processed Custom Bats
  product("Beauty Processed Bats", "Custom Bat - Beauty Processed (£140 Essential)", 140, "Available", batImage, {
    description: "Custom manufactured Beauty Processed English Willow cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Beauty Processed cricket bat.",
  }),
  product("Beauty Processed Bats", "Custom Bat - Beauty Processed (£190 Performance)", 190, "Available", batImage, {
    description: "Custom manufactured Beauty Processed English Willow cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Beauty Processed cricket bat.",
  }),
  product("Beauty Processed Bats", "Custom Bat - Beauty Processed (£220 Advanced)", 220, "Available", batImage, {
    description: "Custom manufactured Beauty Processed English Willow cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Beauty Processed cricket bat.",
  }),
  product("Beauty Processed Bats", "Custom Bat - Beauty Processed (£230 Premium)", 230, "Available", batImage, {
    description: "Custom manufactured Beauty Processed English Willow cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Beauty Processed cricket bat.",
  }),
  product("Beauty Processed Bats", "Custom Bat - Beauty Processed (£250 Top)", 250, "Available", batImage, {
    description: "Custom manufactured Beauty Processed English Willow cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Beauty Processed cricket bat.",
  }),

  // Bonafide Custom Bats
  product("Bonafide Bats", "Custom Bat - Bonafide (£220 Entry)", 220, "Available", batImage, {
    description: "Custom manufactured natural unbleached English Willow Bonafide cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Bonafide natural willow cricket bat.",
  }),
  product("Bonafide Bats", "Custom Bat - Bonafide (£250 Performance)", 250, "Available", batImage, {
    description: "Custom manufactured natural unbleached English Willow Bonafide cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Bonafide natural willow cricket bat.",
  }),
  product("Bonafide Bats", "Custom Bat - Bonafide (£300 Professional)", 300, "Available", batImage, {
    description: "Custom manufactured tournament grade natural English Willow Bonafide cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Bonafide professional cricket bat.",
  }),
  product("Bonafide Bats", "Custom Bat - Bonafide (£400 Elite)", 400, "Available", batImage, {
    description: "Custom manufactured player-spec natural English Willow Bonafide cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Bonafide elite cricket bat.",
  }),
  product("Bonafide Bats", "Custom Bat - Bonafide (£500 Top Spec)", 500, "Available", batImage, {
    description: "Custom manufactured Master Reserve private selection natural English Willow Bonafide cricket bat tailored to your exact size, handle, profile, and weight.",
    shortDescription: "Custom made Bonafide masterclass cricket bat.",
  }),

  // General Custom Bat Builds
  product("Beauty Processed Bats", "Custom Bat - Recommended Build (£150)", 150, "Available", batImage, {
    description: "Custom manufactured cricket bat built to your target budget and playing specifications.",
  }),
  product("Beauty Processed Bats", "Custom Bat - Recommended Build (£200)", 200, "Available", batImage, {
    description: "Custom manufactured cricket bat built to your target budget and playing specifications.",
  }),
  product("Bonafide Bats", "Custom Bat - Recommended Build (£300)", 300, "Available", batImage, {
    description: "Custom manufactured cricket bat built to your target budget and playing specifications.",
  }),
  product("Bonafide Bats", "Custom Bat - Recommended Build (£400)", 400, "Available", batImage, {
    description: "Custom manufactured cricket bat built to your target budget and playing specifications.",
  }),
  product("Bonafide Bats", "Custom Bat - Recommended Build (£500)", 500, "Available", batImage, {
    description: "Custom manufactured cricket bat built to your target budget and playing specifications.",
  }),
];

export const products: Product[] = [
  ...beautyBats,
  ...bonafideBats,
  ...juniorBats,
  ...customBatProducts,
  ...battingPads,
  ...battingGloves,
  ...keepingGloves,
  ...kitBags,
  ...thighPads,
  ...keepingInners,
  ...helmets,
  ...caps,
  ...guards,
  ...otherAccessories,
  ...teamwear,
];

export const categories = categoryOrder.map((name) => ({
  name,
  count: products.filter((product) => product.category === name).length,
  image: products.find((product) => product.category === name)?.image ?? brandImage,
}));

import { formatCurrencyPrice } from "../lib/currency.ts";

export const formatPrice = (price: number, currencyCode: string = "GBP") =>
  formatCurrencyPrice(price, currencyCode);

export const getProduct = (id: string) => products.find((product) => product.id === id);

export const BEST_SELLING_PRODUCT_IDS = [
  "beauty-processed-bats-apex-pro",
  "beauty-processed-bats-silver-edition",
  "bonafide-bats-vvip-bonafide-original-grade-a",
  "batting-pads-gray-nicolls-legend",
  "batting-gloves-gm-original-le",
  "batting-gloves-kookaburra-kahuna-pro",
  "kit-and-duffle-bags-gray-nicolls-legend-wheelie",
  "helmets-masuri-helmet-black",
  "other-accessories-sf-batting-inner-gloves",
  "batting-pads-moulded-pads-white",
];

export const getBestSellingProducts = () =>
  products.filter((product) => product.isBestSeller || product.featured || BEST_SELLING_PRODUCT_IDS.includes(product.id));

