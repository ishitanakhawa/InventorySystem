"use client";

import { useAuth } from "@/lib/auth-context";
import ProductCatalog from "@/components/ProductCatalog";

export default function ProductsPage() {
  const { user } = useAuth();
  return <ProductCatalog user={user} />;
}
