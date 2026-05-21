"use client";

import { useAuth } from "@/lib/auth-context";
import CartManagement from "@/components/CartManagement";

export default function CartPage() {
  const { user } = useAuth();
  return <CartManagement user={user} />;
}
