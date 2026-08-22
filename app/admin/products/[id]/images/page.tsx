"use client";

import { use } from "react";
import { ProductImageManager } from "@/src/components/ProductImageManager";

export default function AdminProductImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div style={{ maxWidth: "1200px" }}>
      <ProductImageManager productId={id} showBackLink={true} />
    </div>
  );
}
