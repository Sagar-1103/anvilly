"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CredentialProvider } from "@/contexts/credential-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionProvider refetchOnWindowFocus={false}>
        <CredentialProvider>
          {children}
        </CredentialProvider>
      </SessionProvider>
      <Toaster theme="dark" richColors duration={4000} />
    </>
  );
}
