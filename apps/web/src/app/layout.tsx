import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { isClerkEnabled } from "@/lib/clerk-config";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corgi Chat",
  description: "Free and secure video hangouts for everyone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = <Providers>{children}</Providers>;

  return (
    <html lang="en">
      <body>
        {isClerkEnabled() ? (
          <ClerkProvider>{content}</ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
