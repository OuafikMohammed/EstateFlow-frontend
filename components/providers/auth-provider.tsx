"use client";

import React from "react";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session is managed via Supabase auth cookies and middleware
  // No need for NextAuth SessionProvider
  return <>{children}</>;
}
