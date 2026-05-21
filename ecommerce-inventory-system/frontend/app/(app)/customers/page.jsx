"use client";

import { useAuth } from "@/lib/auth-context";
import CustomerModule from "@/components/CustomerModule";

export default function CustomersPage() {
  const { user } = useAuth();
  return <CustomerModule user={user} />;
}
