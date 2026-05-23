"use client";

import { useAuth } from "@/lib/auth-context";
import DynamicPricing from "@/components/DynamicPricing";

export default function PricingPage() {
  const { user } = useAuth();
  return <DynamicPricing user={user} />;
}
