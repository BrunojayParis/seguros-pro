"use client";

import { createContext, useContext } from "react";
import type { SessionData } from "@/lib/auth/types";

const SessionContext = createContext<SessionData | null>(null);

type SessionProviderProps = {
  value: SessionData;
  children: React.ReactNode;
};

export function SessionProvider({ value, children }: SessionProviderProps) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }

  return context;
}
