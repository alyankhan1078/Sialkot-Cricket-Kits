import type { Metadata } from "next";
import { CustomBatConfigurator } from "@/src/components/CustomBatConfigurator";

export const metadata: Metadata = {
  alternates: { canonical: "/custom-bat" },
  title: "Custom Cricket Bats, Made to Order in Sialkot",
  description:
    "Design a custom cricket bat online: size, beauty processed or bonafide willow, weight, handle, profile, knocking-in and your name on the blade. Made in Sialkot, shipped worldwide.",
  openGraph: {
    title: "Custom Cricket Bats, Made to Order in Sialkot | Sialkot Cricket Kits",
    description:
      "Handcrafted English Willow cricket bats tailored to your exact specifications. Select willow grade, profile, handle, and 30% advance payment.",
    images: ["/assets/products/bats/special-edition/special-edition-front-a.webp"],
  },
};

export default function CustomBatPage() {
  return (
    <main className="custom-bat-page-main">
      <CustomBatConfigurator />
    </main>
  );
}
