"use client";

import { useAuth } from "@/lib/auth-context";
import SupplyChain from "@/components/SupplyChain";

export default function SupplyChainPage() {
  const { user } = useAuth();
  return <SupplyChain user={user} />;
}
