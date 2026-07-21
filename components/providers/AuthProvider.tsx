"use client";

import React, { createContext, useContext } from "react";
import { SessionProvider, useSession } from "next-auth/react";

interface AuthUser {
  id: string
  name?: string | null
  image?: string | null
  role?: string
}

type AuthContextType = {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  return (
    <AuthContext.Provider
      value={{
        user: session?.user as AuthUser ?? null,
        loading: status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthUserProvider>{children}</AuthUserProvider>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);