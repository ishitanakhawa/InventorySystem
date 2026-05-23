"use client";

import { useAuth } from "@/lib/auth-context";
import InventoryManagement from "@/components/InventoryManagement";

export default function InventoryPage() {
  const { user } = useAuth();
  return <InventoryManagement user={user} />;
}
