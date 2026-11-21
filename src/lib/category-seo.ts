// Search titles, descriptions and on-page intros for each shop category.
// Written for buyers first; keywords follow from saying plainly what the page sells.

export type CategorySeo = {
  title: string; // used in <title>, the brand is appended by the layout template
  heading: string; // visible heading on the category page
  description: string; // meta description (keep under ~155 characters)
  intro: string; // short paragraph shown above the products
  productNoun: string; // what one item is called, used in product page titles
};

export const CATEGORY_SEO: Record<string, CategorySeo> = {
  "Beauty Processed Bats": {
    title: "Beauty Processed Cricket Bats",
    heading: "Beauty processed cricket bats",
    description:
      "Beauty processed cricket bats shaped in Sialkot. Weight written on every blade, ping video on request, prices in GBP, tracked worldwide delivery.",
    intro:
      "Our main match range. Each blade gets extra cosmetic finishing for a clean, even face, then it's weighed and the weight is written on the bat. Ask for a ping video of the exact bat before you pay.",
    productNoun: "Cricket Bat",
  },
  "Bonafide Bats": {
    title: "Bonafide Cricket Bats (Natural Willow)",
    heading: "Bonafide cricket bats",
    description:
      "Bonafide cricket bats in natural, unbleached willow, shaped in Sialkot. See the real grain before you buy. Tracked delivery worldwide.",
    intro:
      "Bonafide bats are left in their natural, unbleached state, so what you see is the willow as it grew: real grain count, spacing and the odd natural mark. Players who like to judge a bat by its grain usually start here.",
    productNoun: "Cricket Bat",
  },
  "Junior & Harrow Bats": {
    title: "Junior Cricket Bats: Size 4, 5, 6 & Harrow",
    heading: "Junior and Harrow bats",
    description:
      "Junior cricket bats in sizes 4, 5, 6 and Harrow from Sialkot. Light pick-up for young players, tracked worldwide delivery.",
    intro:
      "Sized for growing players, from size 4 up to Harrow. A bat that's too big or too heavy is the most common mistake with juniors, so message us your child's height and we'll tell you which size fits.",
    productNoun: "Junior Cricket Bat",
  },
  "Batting Pads": {
    title: "Cricket Batting Pads",
    heading: "Batting pads",
    description:
      "Cricket batting pads for club and school players, right- and left-handed stock. Shipped from Sialkot with tracked worldwide delivery.",
    intro:
      "Pads for every level of club cricket. Stock is listed separately for right- and left-handed batters, so check the RH and LH numbers on each pair before you order.",
    productNoun: "Batting Pads",
  },
  "Batting Gloves": {
    title: "Cricket Batting Gloves",
    heading: "Batting gloves",
    description:
      "Cricket batting gloves in right- and left-hand fits, shipped from Sialkot with tracked worldwide delivery and prices in GBP.",
    intro:
      "Batting gloves in right- and left-hand fits. If you're between sizes, message us your hand measurement and we'll check the pair before it ships.",
    productNoun: "Batting Gloves",
  },
  "Keeping Gloves": {
    title: "Wicketkeeping Gloves",
    heading: "Wicketkeeping gloves",
    description: "Wicketkeeping gloves for club and junior keepers, shipped worldwide from Sialkot with tracking.",
    intro: "Gloves for keepers standing up and standing back. Pair them with keeping inners for extra protection and a better fit.",
    productNoun: "Wicketkeeping Gloves",
  },
  "Keeping Inners": {
    title: "Wicketkeeping Inner Gloves",
    heading: "Keeping inners",
    description: "Wicketkeeping inner gloves to wear under your keeping gloves. Shipped worldwide from Sialkot.",
    intro: "Inner gloves add padding and soak up sweat under your keeping gloves.",
    productNoun: "Keeping Inners",
  },
  "Keeping Guards": {
    title: "Wicketkeeping Leg Guards",
    heading: "Keeping guards",
    description: "Wicketkeeping leg guards from Sialkot, built light so you can move. Tracked worldwide delivery.",
    intro: "Lighter than batting pads so you can get down and move quickly behind the stumps.",
    productNoun: "Keeping Pads",
  },
  "Thigh Pads": {
    title: "Cricket Thigh Pads & Guards",
    heading: "Thigh pads",
    description: "Cricket thigh pads and inner thigh guards, shipped from Sialkot with tracked worldwide delivery.",
    intro: "Thigh and inner-thigh protection for batters facing pace.",
    productNoun: "Thigh Pad",
  },
  Helmets: {
    title: "Cricket Helmets",
    heading: "Helmets",
    description: "Cricket helmets for batters and keepers, shipped from Sialkot with tracked worldwide delivery.",
    intro: "Message us your head measurement before ordering and we'll confirm the right size.",
    productNoun: "Cricket Helmet",
  },
  "Kit & Duffle Bags": {
    title: "Cricket Kit Bags: Wheelies & Duffles",
    heading: "Kit and duffle bags",
    description: "Cricket kit bags, wheelie bags and duffles from Sialkot. Room for bats, pads and helmet. Tracked worldwide delivery.",
    intro: "Wheelies for the full kit, duffles for the essentials. Most have a separate bat compartment so your blades travel safely.",
    productNoun: "Cricket Kit Bag",
  },
  Teamwear: {
    title: "Cricket Teamwear & Clothing",
    heading: "Teamwear",
    description: "Cricket teamwear and clothing from Sialkot. Club orders welcome. Tracked worldwide delivery.",
    intro: "Kitting out a whole club? Message us on WhatsApp for team quantities.",
    productNoun: "Cricket Clothing",
  },
  "Waterproof Caps": {
    title: "Cricket Caps",
    heading: "Caps",
    description: "Cricket caps from Sialkot with tracked worldwide delivery.",
    intro: "Caps for training and match days.",
    productNoun: "Cricket Cap",
  },
  "Other Accessories": {
    title: "Cricket Accessories",
    heading: "Accessories",
    description: "Cricket accessories from Sialkot with tracked worldwide delivery.",
    intro: "The bits and pieces every kit bag needs.",
    productNoun: "",
  },
};

/** Product page title, e.g. "Apex Pro Beauty Processed Cricket Bat". Avoids repeating words already in the name. */
export function productSeoName(name: string, category: string): string {
  const noun = CATEGORY_SEO[category]?.productNoun;
  if (!noun) return name;
  const lower = name.toLowerCase();
  const nounWords = noun.toLowerCase().split(" ");
  if (nounWords.every((w) => lower.includes(w.replace(/s$/, "")))) return name;
  const prefix = category === "Beauty Processed Bats" ? " Beauty Processed" : category === "Bonafide Bats" && !lower.includes("bonafide") ? " Bonafide" : "";
  return `${name}${prefix} ${noun}`;
}
