"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function BrandLogo({ className = "w-10 h-10" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="E-Commerce Inventory logo"
    >
      <circle cx="20" cy="20" r="18" fill="#2C3B4D" />

      {/* simple white bag outline icon centered */}
      <rect
        x="12"
        y="15"
        width="16"
        height="10"
        rx="2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
      />
      <path
        d="M15 15c0-2 1.5-4 5-4s5 2 5 4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/inventory", label: "Inventory" },
  { href: "/cart", label: "Cart" },
  { href: "/customers", label: "Customers" },
  { href: "/pricing", label: "Pricing" },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  E-Commerce Inventory
                </h1>
                <p className="text-sm text-slate-500">
                  Manage dashboard, products, inventory and pricing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-slate-600">
                    Signed in as {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <nav className="mt-3 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-gray-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
