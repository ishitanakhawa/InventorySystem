"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AuthModule from "@/components/AuthModule";

export default function LoginPage() {
  const { user, login, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) router.replace("/");
  }, [user, hydrated, router]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blueFantastic rounded-16 flex items-center justify-center shadow-md">
            <Package className="w-6 h-6 text-palladian" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-abyssal leading-none">
              E-Commerce Inventory
            </h1>
            <p className="text-xs text-gray-600 mt-1">Role-Based Control System</p>
          </div>
        </div>
        <AuthModule user={user} onLogin={login} onLogout={() => {}} />
      </div>
    </div>
  );
}
