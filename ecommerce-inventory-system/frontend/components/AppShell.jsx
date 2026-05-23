"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const tabs = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/products", label: "Products", icon: Package },
  { path: "/inventory", label: "Inventory", icon: Warehouse },
  { path: "/cart", label: "Cart", icon: ShoppingCart },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/pricing", label: "Pricing", icon: Zap },
];

export default function AppShell({ children }) {
  const { user, logout, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [user, hydrated, router]);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-palladian shadow-2 border-b border-oatmeal sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="lg:hidden p-2 hover:bg-oatmeal/50 rounded-8"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-abyssal" />
                ) : (
                  <Menu className="w-6 h-6 text-abyssal" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blueFantastic rounded-16 flex items-center justify-center">
                  <Package className="w-6 h-6 text-palladian" />
                </div>
                <h1 className="text-xl font-bold text-abyssal hidden sm:block">
                  E-Commerce Inventory
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 hover:bg-oatmeal/50 rounded-8 relative"
              >
                <Bell className="w-5 h-5 text-blueFantastic" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-oatmeal/50 rounded-8"
              >
                <Settings className="w-5 h-5 text-blueFantastic" />
              </button>
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-oatmeal">
                <div className="w-8 h-8 bg-blueFantastic/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blueFantastic" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-abyssal">
                    {user.username}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">
                    {user.role} Account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="p-2 hover:bg-error/10 rounded-8 text-gray-600"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-palladian border-b border-oatmeal sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="hidden lg:flex gap-1 py-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`px-5 py-3 rounded-8 flex items-center gap-2 font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-blueFantastic text-palladian shadow-1"
                      : "text-gray-600 hover:bg-oatmeal/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-8 flex items-center gap-3 ${
                      active
                        ? "bg-blueFantastic text-palladian"
                        : "text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 min-h-[calc(100vh-140px)]">
        <div className="animate-fadeIn">{children}</div>
      </main>
    </div>
  );
}
