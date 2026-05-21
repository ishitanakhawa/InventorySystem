"use client";

import { useAuth } from "@/lib/auth-context";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  return <Dashboard user={user} />;
}
