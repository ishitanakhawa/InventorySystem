"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("inventory_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const login = (u) => {
    setUser(u);
    sessionStorage.setItem("inventory_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("inventory_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function canEdit(user) {
  return user?.role === "Admin";
}

export function canPartialEdit(user) {
  return user?.role === "Admin" || user?.role === "Employee";
}

export function isReadOnly(user) {
  return user?.role === "Guest";
}
