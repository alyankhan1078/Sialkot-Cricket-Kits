export const categoryOrder = [
  "Beauty Processed Bats",
  "Bonafide Bats",
  "Junior & Harrow Bats",
  "Batting Pads",
  "Batting Gloves",
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
  featured?: boolean;
};

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

const product = (
  category: Category,
  name: string,
  price: number,
  stock: Product["stock"],
  image: string,
  extras: Partial<Omit<Product, "id" | "category" | "name" | "price" | "stock" | "image">> = {},
): Product => ({
  id: `${slugify(category)}-${slugify(name)}`,
  category,
  name,
  price,
  stock,
  image,
  description: `Current ${name} listing from the approved Sialkot Cricket Kits 2026 catalogue. Contact us to confirm availability and delivery.`,
  ...extras,
});

const beautyBats: Product[] = [
  product("Beauty Processed Bats", "Silver Edition", 125, "Confirm on WhatsApp", silverEditionGallery[0], {
    images: silverEditionGallery,
    description: "Silver Edition beauty-processed bat. Every image in this gallery belongs only to the uploaded Silver Edition bat, including its face, toe and edge profiles.",
  }),
  product("Beauty Processed Bats", "Player Edition", 165, "Confirm on WhatsApp", batImage, {
    description: "Player Edition beauty-processed bat from the 2026 catalogue. Ask for the current original product gallery before ordering.",
  }),
  product("Beauty Processed Bats", "Bounce Edition", 180, "Confirm on WhatsApp", bounceEditionGallery[0], {
    images: bounceEditionGallery,
    description: "Bounce Edition beauty-processed bat. The gallery is restricted to the uploaded Bounce Edition product only.",
  }),
  product("Beauty Processed Bats", "Apex Pro", 185, "Confirm on WhatsApp", apexProGallery[0], {
    images: apexProGallery,
    featured: true,
    description: "Apex Pro beauty-processed bat. The complete gallery shows only the uploaded Apex Pro bat and its matching cover from the face, reverse, profile, edge and toe angles.",
  }),
  product("Beauty Processed Bats", "Monster Series", 195, "Confirm on WhatsApp", monsterSeriesGallery[0], {
    images: monsterSeriesGallery,
    description: "Monster Series beauty-processed bat. The gallery contains only the uploaded Monster Series face, back, profile, edge and weight-proof views.",
  }),
  product("Beauty Processed Bats", "Special Edition", 215, "Confirm on WhatsApp", specialBeautyGallery[0], {
    images: specialBeautyGallery,
    description: "Special Edition beauty-processed bat. These images are mapped only to the uploaded #7 Special Edition bat and are not shared with Apex Pro or VVIP.",
  }),
  product("Beauty Processed Bats", "VVIP Bat", 245, "Confirm on WhatsApp", vvipBeautyGallery[0], {
    images: vvipBeautyGallery,
    description: "VVIP beauty-processed bat with the uploaded 45 mm edge reference. Its gallery is exclusive to the #3 VVIP product and includes face, reverse, profile, edge and measurement views.",
  }),
];

const bonafideBats: Product[] = [
  product("Bonafide Bats", "VVIP Bonafide Original - Grade A+", 499, "Confirm on WhatsApp", vvipBonafideGallery[0], {
    images: vvipBonafideGallery,
    featured: true,
    description: "Original VVIP bonafide bat presented in its natural, unprocessed condition. The gallery shows the same bat from multiple angles, including its face, grains and edge profile. Contact us for a live ping video and current availability before ordering.",
  }),
  product("Bonafide Bats", "Special Edition - Grade A", 330, "Confirm on WhatsApp", specialGradeAGallery[0], {
    images: specialGradeAGallery,
    description: "Bonafide Special Edition Grade A bat. This gallery uses only the uploaded Grade A product images.",
  }),
  product("Bonafide Bats", "Player Edition", 215, "Confirm on WhatsApp", playerBonafideGallery[0], {
    images: playerBonafideGallery,
    description: "Bonafide Player Edition bat. The gallery is restricted to the uploaded Player Edition bat and its matching black cover.",
  }),
];

const juniorBats: Product[] = [
  product("Junior & Harrow Bats", "Size 4", 70, "Confirm on WhatsApp", size4Gallery[0], {
    images: size4Gallery,
    description: "Size 4 junior bat shown with the original uploaded product photograph.",
  }),
  product("Junior & Harrow Bats", "Size 5", 85, "Confirm on WhatsApp", size5Gallery[0], {
    images: size5Gallery,
    description: "Size 5 junior bat gallery from the uploaded product batch, including the original weight and profile views.",
  }),
  product("Junior & Harrow Bats", "Size 6", 105, "Confirm on WhatsApp", harrowOriginalGallery[0], {
    images: harrowOriginalGallery,
    description: "Size 6 listing using the same original Harrow-size product photographs requested by the customer. Only the background was cleaned; the photographed handle and bat geometry remain unchanged.",
  }),
  product("Junior & Harrow Bats", "Harrow Size", 110, "Confirm on WhatsApp", harrowOriginalGallery[0], {
    images: harrowOriginalGallery,
    description: "Harrow-size bat shown from the original uploaded photographs. Only the background was cleaned; no handle or bat shape was generated or altered.",
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

export const products: Product[] = [
  ...beautyBats,
  ...bonafideBats,
  ...juniorBats,
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

export const formatPrice = (price: number) => `£${price.toLocaleString("en-GB")}`;

export const getProduct = (id: string) => products.find((product) => product.id === id);
