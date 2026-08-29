import type { Metadata } from "next";
import { CustomBatConfigurator } from "@/src/components/CustomBatConfigurator";

export const metadata: Metadata = {
  title: "Custom Cricket Bat Configurator | Sialkot Cricket Kits",
  description:
    "Build your bespoke cricket bat online. Select size, Beauty Processed or Bonafide English Willow, price tier, handle, profile, knocking-in, and 30% advance deposit.",
  openGraph: {
    title: "Custom Cricket Bat Configurator | Sialkot Cricket Kits",
    description:
      "Handcrafted English Willow cricket bats tailored to your exact specifications. Select willow grade, profile, handle, and 30% advance payment.",
    images: ["/assets/products/bat-collection.webp"],
  },
};

export default function CustomBatPage() {
  return (
    <main className="custom-bat-page-main">
      <CustomBatConfigurator />
    </main>
  );
}
