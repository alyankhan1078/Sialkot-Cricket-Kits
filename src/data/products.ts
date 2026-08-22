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
  product("Beauty Processed Bats", "Silver Edition", 43499, "Confirm on WhatsApp", silverEditionGallery[0], {
    images: silverEditionGallery,
    description: "Silver Edition beauty-processed bat. Every image in this gallery belongs only to the uploaded Silver Edition bat, including its face, toe and edge profiles.",
  }),
  product("Beauty Processed Bats", "Player Edition", 58499, "Confirm on WhatsApp", batImage, {
    description: "Player Edition beauty-processed bat from the 2026 catalogue. Ask for the current original product gallery before ordering.",
  }),
  product("Beauty Processed Bats", "Bounce Edition", 63499, "Confirm on WhatsApp", bounceEditionGallery[0], {
    images: bounceEditionGallery,
    description: "Bounce Edition beauty-processed bat. The gallery is restricted to the uploaded Bounce Edition product only.",
  }),
  product("Beauty Processed Bats", "Apex Pro", 65499, "Confirm on WhatsApp", apexProGallery[0], {
    images: apexProGallery,
    featured: true,
    description: "Apex Pro beauty-processed bat. The complete gallery shows only the uploaded Apex Pro bat and its matching cover from the face, reverse, profile, edge and toe angles.",
  }),
  product("Beauty Processed Bats", "Monster Series", 67499, "Confirm on WhatsApp", monsterSeriesGallery[0], {
    images: monsterSeriesGallery,
    description: "Monster Series beauty-processed bat. The gallery contains only the uploaded Monster Series face, back, profile, edge and weight-proof views.",
  }),
  product("Beauty Processed Bats", "Special Edition", 75499, "Confirm on WhatsApp", specialBeautyGallery[0], {
    images: specialBeautyGallery,
    description: "Special Edition beauty-processed bat. These images are mapped only to the uploaded #7 Special Edition bat and are not shared with Apex Pro or VVIP.",
  }),
  product("Beauty Processed Bats", "VVIP Bat", 85499, "Confirm on WhatsApp", vvipBeautyGallery[0], {
    images: vvipBeautyGallery,
    description: "VVIP beauty-processed bat with the uploaded 45 mm edge reference. Its gallery is exclusive to the #3 VVIP product and includes face, reverse, profile, edge and measurement views.",
  }),
];

const bonafideBats: Product[] = [
  product("Bonafide Bats", "VVIP Bonafide Original - Grade A+", 159999, "Confirm on WhatsApp", vvipBonafideGallery[0], {
    images: vvipBonafideGallery,
    featured: true,
    description: "Original VVIP bonafide bat presented in its natural, unprocessed condition. The gallery shows the same bat from multiple angles, including its face, grains and edge profile. Contact us for a live ping video and current availability before ordering.",
  }),
  product("Bonafide Bats", "Special Edition - Grade A", 114999, "Confirm on WhatsApp", specialGradeAGallery[0], {
    images: specialGradeAGallery,
    description: "Bonafide Special Edition Grade A bat. This gallery uses only the uploaded Grade A product images.",
  }),
  product("Bonafide Bats", "Player Edition", 74999, "Confirm on WhatsApp", playerBonafideGallery[0], {
    images: playerBonafideGallery,
    description: "Bonafide Player Edition bat. The gallery is restricted to the uploaded Player Edition bat and its matching black cover.",
  }),
];

const juniorBats: Product[] = [
  product("Junior & Harrow Bats", "Size 4", 24499, "Confirm on WhatsApp", size4Gallery[0], {
    images: size4Gallery,
    description: "Size 4 junior bat shown with the original uploaded product photograph.",
  }),
  product("Junior & Harrow Bats", "Size 5", 29499, "Confirm on WhatsApp", size5Gallery[0], {
    images: size5Gallery,
    description: "Size 5 junior bat gallery from the uploaded product batch, including the original weight and profile views.",
  }),
  product("Junior & Harrow Bats", "Size 6", 37499, "Confirm on WhatsApp", harrowOriginalGallery[0], {
    images: harrowOriginalGallery,
    description: "Size 6 listing using the same original Harrow-size product photographs requested by the customer. Only the background was cleaned; the photographed handle and bat geometry remain unchanged.",
  }),
  product("Junior & Harrow Bats", "Harrow Size", 38499, "Confirm on WhatsApp", harrowOriginalGallery[0], {
    images: harrowOriginalGallery,
    description: "Harrow-size bat shown from the original uploaded photographs. Only the background was cleaned; no handle or bat shape was generated or altered.",
  }),
];

const padRows: Array<[string, number, number | string, number | string, number, number]> = [
  ["DSC Krunch 300", 8999, 5, 1, 6, 0],
  ["GM B555 Diamond", 9499, 6, 0, 6, 1],
  ["Gray-Nicolls Legend", 9999, 4, 3, 7, 7],
  ["Kookaburra Ghost", 9499, 0, 1, 1, 8],
  ["New Balance TC 1260", 9499, 6, 0, 6, 10],
  ["SF Maximum Players", 9299, 4, 1, 5, 11],
  ["SG White Edition", 8999, 2, 1, 3, 12],
  ["GM Maxi 606 White", 9299, 2, 0, 2, 6],
  ["SS Players Edition", 9999, 0, 2, 2, 2],
  ["Gray-Nicolls Stratos", 9699, 5, 2, 7, 3],
  ["GM Maxi 606", 8999, 3, 1, 4, 4],
  ["Moulded Pads - White", 8499, "-", "-", 2, 123],
  ["Moulded Pads - Black", 8699, "-", "-", 2, 124],
  ["Moulded Pads - Navy", 8799, "-", "-", 2, 126],
];

const battingPads = padRows.map(([name, price, rightStock, leftStock, stock, image]) =>
  product("Batting Pads", name, price, stock, item(image), { rightStock, leftStock })
).concat([
  product("Batting Pads", "New Balance Batting Pad - Priority Offer", 7999, 1, item(10), { rightStock: 1, leftStock: 0 }),
  product("Batting Pads", "DSC Batting Pad - Priority Offer", 8299, 2, item(0), { rightStock: 2, leftStock: 0 }),
  product("Batting Pads", "SG Batting Pad - Priority Offer", 7999, 2, item(12), { rightStock: 0, leftStock: 2 }),
  product("Batting Pads", "Kookaburra Ghost - Priority Offer", 8499, 1, item(8), { rightStock: 0, leftStock: 1 }),
]);

const battingGloveRows: Array<[string, number, number, number, number, number]> = [
  ["GM Original LE", 8999, 14, 3, 17, 13],
  ["Gray-Nicolls Vapour 1500 Black", 8799, 14, 5, 19, 14],
  ["Gray-Nicolls Classic", 8299, 17, 3, 20, 15],
  ["Gray-Nicolls Classic Green", 8499, 12, 4, 16, 16],
  ["Kookaburra Ghost 2.0", 8199, 3, 1, 4, 17],
  ["Gray-Nicolls Legend", 8999, 11, 5, 16, 18],
  ["Kookaburra Kahuna Pro", 8799, 6, 4, 10, 19],
  ["MRF Players Edition", 8499, 5, 5, 10, 20],
  ["New Balance DC 580", 7999, 0, 1, 1, 21],
  ["New Balance WC 1100", 8299, 0, 1, 1, 22],
  ["SG Camo Limited Edition", 8999, 16, 3, 19, 24],
  ["SG Camo Players Edition", 8499, 15, 3, 18, 25],
  ["SG Spider RP 17", 7999, 4, 0, 4, 26],
  ["SG Test White", 8299, 24, 6, 30, 27],
  ["SS Golden Limited Edition", 8999, 7, 6, 13, 28],
  ["SS Millennium Pro", 8699, 10, 3, 13, 29],
  ["SS Millennium Pro White", 8499, 11, 4, 15, 30],
  ["SS Red Premium Super Test", 8899, 17, 0, 17, 31],
  ["SS Super Test", 8199, 1, 1, 2, 32],
  ["TON Gold Player Edition", 8899, 17, 6, 23, 33],
  ["Gray-Nicolls Neo Core 2000", 8499, 9, 5, 14, 39],
  ["GM Diamond 404", 8299, 16, 11, 27, 35],
  ["GM Diamond LE", 8999, 19, 4, 23, 36],
  ["SS Aerolite", 7999, 11, 0, 11, 37],
  ["New Balance TC 1260", 8499, 13, 2, 15, 38],
  ["New Balance DC 1280", 8699, 16, 2, 18, 41],
  ["New Balance White TC 1260", 8599, 9, 1, 10, 42],
  ["New Balance White", 8299, 5, 2, 7, 43],
  ["Puma Evo 1 Blue", 8499, 10, 1, 11, 40],
];

const battingGloves = battingGloveRows.map(([name, price, rightStock, leftStock, stock, image]) =>
  product("Batting Gloves", name, price, stock, item(image), { rightStock, leftStock })
);

const keepingGloveRows: Array<[string, number, number, number]> = [
  ["GM Original LE", 9999, 7, 47], ["Gray-Nicolls Heritage", 9499, 3, 48],
  ["Gray-Nicolls Players Edition", 9999, 1, 49], ["SS Golden Strip", 9299, 2, 55],
  ["SS Professional", 9699, 9, 53], ["SS White Youth", 8999, 4, 51],
  ["SS White Boys", 8799, 6, 52], ["SS Players Edition Blue", 9999, 1, 58],
  ["Gray-Nicolls White Mens", 9499, 2, 44], ["Gray-Nicolls White Boys", 8999, 2, 45],
  ["Gray-Nicolls White Youth", 8899, 2, 46], ["Gray-Nicolls Legend", 9999, 4, 49],
  ["GM Keeping Gloves", 9499, 3, 47],
];

const keepingGloves = keepingGloveRows.map(([name, price, stock, image]) =>
  product("Keeping Gloves", name, price, stock, item(image))
);

const bagRows: Array<[string, number, number, number]> = [
  ["DSC Fearless Intense Pro", 12499, 1, 68], ["DSC Orange", 11999, 10, 69],
  ["DXM Hitter", 10999, 6, 70], ["GM Blue", 10499, 10, 71],
  ["GM Diamond Duffle", 13499, 11, 72], ["GM Original Duffle Black - Classic", 9499, 10, 73],
  ["GM Original Wheelie Navy - Standard", 13499, 13, 74], ["Gray-Nicolls Legend Duffle - Standard", 14499, 10, 75],
  ["GM Kit Bag", 14999, 9, 76], ["Gray-Nicolls Red Duffle", 14499, 1, 59],
  ["Kookaburra Black Duffle - Standard", 12499, 8, 60], ["Kookaburra D 4.5 Green", 14499, 3, 61],
  ["Kookaburra D 4.5 Red", 12499, 4, 62], ["Kookaburra D 4.5 Sky Blue", 14499, 12, 63],
  ["Kookaburra Green Duffle", 11499, 2, 64], ["Kookaburra Grey Duffle", 12499, 10, 65],
  ["Kookaburra Red Duffle", 13499, 4, 66], ["MRF Black Duffle", 12499, 4, 67],
  ["MRF Game Changer", 16499, 6, 78], ["New Balance Green Duffle", 14499, 7, 79],
  ["New Balance Red Duffle", 15499, 15, 80], ["Shrey Blue New Duffle", 12499, 9, 77],
  ["Shrey Navy Duffle", 12499, 9, 81], ["SS Blue Duffle", 11499, 7, 82],
  ["SS Grey Duffle", 13499, 11, 83], ["Shrey Kit Bag", 19499, 4, 85],
  ["GM Original Duffle Black - Premium", 11499, 11, 84], ["GM Original Wheelie Navy - Premium", 17499, 6, 87],
  ["Gray-Nicolls Legend Duffle - Premium", 17499, 12, 88], ["Gray-Nicolls Legend Wheelie", 16499, 9, 89],
  ["Gray-Nicolls Kit Bag Trolley", 19499, 9, 90], ["Kookaburra Blue Duffle", 15499, 4, 91],
  ["Shrey Red New Wheelie", 19499, 8, 86],
];

const kitBags = bagRows.map(([name, price, stock, image]) => product("Kit & Duffle Bags", name, price, stock, item(image)));

const thighPadRows: Array<[string, number, number, number, number, number]> = [
  ["Aero P1", 4999, 0, 2, 2, 92], ["DXM Hitter", 5299, 8, 1, 9, 93],
  ["Gray-Nicolls Legend", 5999, 15, 7, 22, 94], ["Moonwalkr Black", 5499, 22, 6, 28, 95],
  ["Moonwalkr Blue", 5199, 4, 0, 4, 96], ["Moonwalkr White", 5599, 16, 16, 32, 98],
  ["Newbery White", 5299, 2, 1, 3, 99], ["Remfry White", 4999, 1, 5, 6, 100],
];

const thighPads = thighPadRows.map(([name, price, rightStock, leftStock, stock, image]) =>
  product("Thigh Pads", name, price, stock, item(image), { rightStock, leftStock })
);

const keepingInners = [
  product("Keeping Inners", "Gray-Nicolls Red", 2499, 11, item(112)),
  product("Keeping Inners", "SS Keeping Inners", 2299, 15, item(116)),
  product("Keeping Inners", "Puma Pink", 2499, 25, item(115)),
  product("Keeping Inners", "Puma Grey", 2699, 24, item(114)),
];

const helmets = [
  product("Helmets", "Gray-Nicolls Helmet - Green", 9499, 1, "/assets/products/helmet-gn-green.webp"),
  product("Helmets", "Gray-Nicolls Helmet - Navy", 9299, 2, "/assets/products/helmet-gn-navy.webp"),
  product("Helmets", "Masuri Helmet - Black", 9999, 1, "/assets/products/helmet-masuri-black.webp"),
];

const caps = [
  product("Waterproof Caps", "Nike Waterproof Cap", 2999, 8, item(103)),
  product("Waterproof Caps", "Under Armour Waterproof Cap", 2899, 7, item(105)),
  product("Waterproof Caps", "North Face Waterproof Cap", 2850, 5, item(104)),
  product("Waterproof Caps", "Icon Waterproof Cap", 2799, 7, item(102)),
  product("Waterproof Caps", "Adidas Waterproof Cap", 2999, 8, item(101)),
];

const guards = [
  product("Keeping Guards", "SG Keeping Guard", 999, 30, item(106)),
  product("Keeping Guards", "GM Keeping Guard", 1099, 23, item(107)),
  product("Keeping Guards", "Gray-Nicolls Keeping Guard", 1199, 19, item(108)),
];

const otherAccessories = [
  product("Other Accessories", "SF Batting Inner Gloves", 1999, 25, item(111)),
  product("Other Accessories", "Guard Underwear", 1999, "Available", brandImage),
];

const teamwear: Product[] = [
  ...[["Small", 7499, 33], ["Medium", 7499, 22], ["Large", 7999, 17], ["X-Large", 7999, 12], ["XXL", 8499, 21]].map(([size, price, stock]) => product("Teamwear", `Gray-Nicolls Playing Kit - ${size}`, Number(price), Number(stock), brandImage)),
  ...[["Small", 2999, 25], ["Medium", 2999, 24], ["Large", 2999, 25], ["X-Large", 2999, 25]].map(([size, price, stock]) => product("Teamwear", `Gray-Nicolls Shorts - ${size}`, Number(price), Number(stock), brandImage)),
  ...[["Small", 2499, 50], ["Medium", 2499, 29], ["Large", 2499, 13], ["X-Large", 2499, 35]].map(([size, price, stock]) => product("Teamwear", `Supreme Shorts - ${size}`, Number(price), Number(stock), brandImage)),
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
