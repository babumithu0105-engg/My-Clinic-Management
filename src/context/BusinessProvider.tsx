"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface BusinessContextType {
  business_id: string | null;
  role: "admin" | "doctor" | "receptionist" | null;
  selectBusiness: (businessId: string, role: string) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business_id, setBusiness_id] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "doctor" | "receptionist" | null>(
    null
  );

  // Load business from cookie or localStorage on mount
  useEffect(() => {
    const storedBusinessId = localStorage.getItem("business_id");
    const storedRole = localStorage.getItem("business_role");

    if (storedBusinessId && storedRole) {
      setBusiness_id(storedBusinessId);
      setRole(storedRole as "admin" | "doctor" | "receptionist");
    }
  }, []);

  async function selectBusiness(businessId: string, businessRole: string) {
    // Store in localStorage for persistence
    localStorage.setItem("business_id", businessId);
    localStorage.setItem("business_role", businessRole);

    // Store in cookie for server-side access
    await fetch("/api/auth/select-business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: businessId, role: businessRole }),
    }).catch(() => {
      // Ignore cookie error, already in localStorage
    });

    setBusiness_id(businessId);
    setRole(businessRole as "admin" | "doctor" | "receptionist");
  }

  const value: BusinessContextType = {
    business_id,
    role,
    selectBusiness,
  };

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

/**
 * Hook to use business context
 * Must be called from client component within BusinessProvider
 */
export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within BusinessProvider");
  }
  return context;
}
