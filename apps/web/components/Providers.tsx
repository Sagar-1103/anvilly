"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionProvider refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
      <Toaster theme="dark" richColors duration={4000}  />
    </>
  );
}
