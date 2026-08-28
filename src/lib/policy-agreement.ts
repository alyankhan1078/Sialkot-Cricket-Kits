/**
 * SIALKOT CRICKET KITS — INTERNATIONAL SHIPPING, RETURNS, PRODUCT DISCLOSURE,
 * CUSTOMISATION AND PAYMENT AGREEMENT
 * Version: 1.0
 */

import { BUSINESS_CONFIG } from "./business-config.ts";

export const POLICY_METADATA = {
  title: "International Shipping, Returns, Product Disclosure, Customisation and Payment Agreement",
  shortTitle: "International Shipping, Returns & Product Agreement",
  version: "1.0",
  effectiveDate: "2026-08-29",
  sellerName: BUSINESS_CONFIG.businessName,
  factoryName: BUSINESS_CONFIG.factoryName,
  address: BUSINESS_CONFIG.fullAddress,
  email: BUSINESS_CONFIG.primaryEmail,
  whatsapp: BUSINESS_CONFIG.displayPhone,
};

export interface PolicySection {
  id: number;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  additionalParagraphs?: string[];
}

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: 1,
    title: "1. Scope of Agreement",
    paragraphs: [
      "This Agreement applies to orders placed with Sialkot Cricket Kits through this website, including cricket bats, protective equipment, kit bags, accessories, customised products, engraved products, made-to-order products, Bonafide bats and Beauty Processed bats.",
      "By submitting an order, the customer confirms that they have reviewed the product description, specifications, selected options, delivery information, payment instructions and applicable policies.",
      "Nothing in this Agreement excludes or restricts any consumer right that cannot legally be excluded under the law applicable to the transaction.",
    ],
  },
  {
    id: 2,
    title: "2. Customer Responsibility for Order Information",
    paragraphs: [
      "The customer is responsible for reviewing and accurately submitting:",
    ],
    bulletPoints: [
      "Customer name",
      "Email address",
      "Telephone number",
      "Delivery address",
      "Product model",
      "Bat size",
      "Bat weight preference",
      "Handle preference",
      "Grade or category",
      "Engraving or custom text",
      "Stickers and branding",
      "Quantity",
      "Other requested specifications",
    ],
    additionalParagraphs: [
      "The customer must immediately report an obvious mistake before production, processing, engraving, branding, packing or dispatch begins.",
      "Sialkot Cricket Kits is not responsible for problems caused solely by incorrect information supplied or approved by the customer, except where applicable law requires otherwise.",
    ],
  },
  {
    id: 3,
    title: "3. Natural Willow Disclosure",
    paragraphs: [
      "Cricket bats are manufactured using natural willow. Natural willow is not a synthetic or perfectly uniform material.",
      "Natural variations may include:",
    ],
    bulletPoints: [
      "Different grain numbers",
      "Different grain widths",
      "Colour or shade variation",
      "Small natural marks",
      "Specks",
      "Streaks",
      "Knots or pin marks",
      "Minor cosmetic blemishes",
      "Variation in weight, balance and pickup",
      "Variation in handle feel",
      "Slight handcrafted dimensional variation",
    ],
    additionalParagraphs: [
      "These disclosed natural and handcrafted characteristics are not automatically manufacturing defects.",
      "Product photographs are intended to accurately represent the model and design, but the exact grain pattern, colour and natural markings of the delivered bat may differ from the photographed example unless the customer purchases a specifically photographed individual bat.",
    ],
  },
  {
    id: 4,
    title: "4. Bonafide Bat Disclosure",
    paragraphs: [
      "A product described as a “Bonafide” bat is supplied according to the category, grade, specifications and natural presentation stated on its product page.",
      "Because willow is natural, Bonafide bats may display visible natural grains, colour differences, marks or other naturally occurring characteristics.",
      "The number of grains alone does not guarantee performance, durability, grade or playing quality.",
      "The customer confirms that natural visual variation is expected and is not, by itself, a reason to claim that the item is defective or materially different from its description.",
    ],
  },
  {
    id: 5,
    title: "5. Beauty Processed Bat Disclosure",
    paragraphs: [
      "A “Beauty Processed” bat has undergone cosmetic finishing or processing intended to provide a cleaner, more attractive or more uniform visual presentation.",
      "Depending on the particular product and process:",
    ],
    bulletPoints: [
      "Surface marks may become less visible",
      "Cosmetic blemishes may be reduced or concealed",
      "The grain presentation may appear cleaner or more prominent",
      "The surface colour or finish may appear more uniform",
    ],
    additionalParagraphs: [
      "Beauty processing is primarily an appearance-related treatment. It does not, by itself, guarantee a higher natural willow grade, improved performance, additional durability or a specific grain count.",
      "The website must clearly identify every bat as Bonafide, Beauty Processed or another applicable category before checkout.",
      "By intentionally selecting a Beauty Processed bat, the customer acknowledges that they requested or accepted a cosmetically processed product because of its appearance.",
      "This disclosure does not excuse a product that is defective, materially misdescribed, counterfeit or different from the confirmed order.",
    ],
  },
  {
    id: 6,
    title: "6. Product Specifications and Customer Requests",
    paragraphs: [
      "Weight, balance, pickup, grain preference and handle feel can involve subjective judgment and natural manufacturing variation.",
      "Sialkot Cricket Kits will make reasonable efforts to meet confirmed specifications. A preference or request is not an absolute guarantee unless the website or written order confirmation expressly describes it as guaranteed and states an applicable tolerance.",
      "A customer-requested cosmetic feature or manufacturing instruction that was accurately completed is not considered a defect merely because the customer later changes their preference.",
    ],
  },
  {
    id: 7,
    title: "7. Customised and Made-to-Order Products",
    paragraphs: [
      "Products manufactured, altered or prepared according to an individual customer’s requirements may include:",
    ],
    bulletPoints: [
      "Personal engraving",
      "Player name",
      "Custom stickers or branding",
      "Custom weight or balance",
      "Custom handle",
      "Custom size",
      "Special pressing or profile",
      "Private-label products",
      "OEM orders",
      "Beauty processing requested by the customer",
      "Other personalised specifications",
    ],
    additionalParagraphs: [
      "Once production, customisation, engraving, processing or branding has started, the customer may not cancel or return the product merely because they changed their mind, subject to rights that cannot legally be excluded.",
      "Customised or clearly personalised goods are generally final sale except where the product is: defective, damaged before or during delivery, the wrong item, materially different from its confirmed description, or made incorrectly compared with the customer’s written and accepted specifications.",
    ],
  },
  {
    id: 8,
    title: "8. International Shipping",
    paragraphs: [
      "International orders are shipped to the delivery address confirmed by the customer.",
      "Delivery dates are estimates unless expressly guaranteed in writing.",
      "International deliveries may be affected by customs inspection, import restrictions, border procedures, courier delays, weather, flight availability, security checks, public holidays, incorrect customer information, or events outside reasonable control.",
      "Sialkot Cricket Kits will provide available shipment and tracking information, but it cannot guarantee customs-clearance speed or courier performance outside its reasonable control.",
    ],
  },
  {
    id: 9,
    title: "9. Customs, Duties and Taxes",
    paragraphs: [
      "Unless the order expressly states otherwise, the customer is responsible for checking and paying import duties, customs charges, local taxes, brokerage charges or other destination-country fees.",
      "Refusing delivery because of customs charges does not automatically create a right to a full refund. Any resolution will depend on whether the order was customised, recoverability of the shipment, courier charges, customs charges, product condition, and applicable mandatory law.",
    ],
  },
  {
    id: 10,
    title: "10. Change-of-Mind Returns",
    paragraphs: [
      "Customised, engraved, branded, altered, Beauty Processed on request or made-to-order products cannot normally be returned because of change of mind, preference change, finding another product at a lower price, disliking a properly disclosed natural grain pattern or willow mark, no longer needing the item, or customer-supplied incorrect specifications.",
      "For non-customised stock products, any change-of-mind return will be governed by the product-page policy and mandatory consumer law applicable to the transaction.",
    ],
  },
  {
    id: 11,
    title: "11. Defective, Damaged, Wrong or Misdescribed Products",
    paragraphs: [
      "Nothing in this Agreement removes any mandatory right relating to goods that are defective, damaged, wrong, unsafe or materially misdescribed.",
      "The customer should contact Sialkot Cricket Kits as soon as reasonably possible after discovering a problem and provide order number, clear photographs, packaging photographs, shipping-label photograph, description of the problem, and unboxing video where reasonably available.",
      "Customers are encouraged to report visible shipping damage within 48 hours. However, this preferred reporting period does not remove any legal right that cannot be excluded.",
      "After reviewing the evidence, available remedies may include repair, replacement, partial refund or refund, depending on the circumstances and applicable law.",
    ],
  },
  {
    id: 12,
    title: "12. Return Authorisation",
    paragraphs: [
      "The customer should contact Sialkot Cricket Kits before returning an item. Unauthorised returns may create customs, delivery or identification problems.",
      "Return instructions, address, courier requirements and responsibility for reasonable return costs will depend on reason for return, product condition, whether the product was customised, whether the item is defective or incorrect, and applicable mandatory law.",
    ],
  },
  {
    id: 13,
    title: "13. Payment Evidence and Verification",
    paragraphs: [
      "Uploading a receipt does not automatically confirm payment. All bank-transfer payments remain under verification until Sialkot Cricket Kits confirms that the correct amount has been received in the designated UBL account.",
      "The customer must upload genuine and accurate payment evidence through the website.",
      "Submitting altered, false, duplicated or misleading payment evidence may result in order rejection, order cancellation, suspension of processing, preservation of relevant records, or other lawful action where appropriate.",
      "No production or dispatch is guaranteed until payment verification is complete.",
    ],
  },
  {
    id: 14,
    title: "14. Delivery Inspection",
    paragraphs: [
      "Customers should inspect the parcel and product promptly after delivery.",
      "Where possible, the customer should record the unopened package and unboxing process, especially when visible damage is present.",
      "Packaging should be retained until any delivery-damage claim has been reviewed.",
    ],
  },
  {
    id: 15,
    title: "15. Reasonable Limitation of Responsibility",
    paragraphs: [
      "Sialkot Cricket Kits is not responsible for losses caused solely by: incorrect information supplied by the customer, customer misuse, failure to follow reasonable care instructions, normal wear and tear, natural characteristics already disclosed, unauthorised repair or alteration, customs delays outside reasonable control, or events outside reasonable control.",
      "Nothing in this Agreement excludes liability that cannot legally be excluded, including liability arising from fraud, deliberate misconduct, unsafe products or other non-excludable legal obligations.",
    ],
  },
  {
    id: 16,
    title: "16. Complaints and Dispute Resolution",
    paragraphs: [
      `Customers should first contact Sialkot Cricket Kits at: ${BUSINESS_CONFIG.primaryEmail}`,
      "Both parties should attempt to resolve any disagreement honestly and in good faith using the order confirmation, product description, written specifications, payment record and delivery evidence.",
      "This Agreement does not prevent either party from exercising lawful rights, contacting a competent consumer authority or using a legally available dispute-resolution process.",
    ],
  },
  {
    id: 17,
    title: "17. Customer Declaration",
    paragraphs: [
      "By selecting the agreement checkbox and submitting the order, the customer confirms that:",
    ],
    bulletPoints: [
      "They have reviewed the order",
      "Their submitted details are accurate",
      "They understand the selected product category",
      "They understand natural willow variation",
      "They understand the Beauty Processed disclosure where applicable",
      "They approved any customisation instructions",
      "They understand international-delivery risks",
      "They understand that customs charges may apply",
      "They understand the applicable return limitations",
      "They uploaded genuine payment evidence",
      "They agree to this policy subject to mandatory consumer law",
    ],
  },
];

export const POLICY_LEGAL_NOTE =
  "This policy is intended to provide clear commercial terms and must be reviewed by qualified legal counsel for the countries in which the business actively markets or sells products.";
