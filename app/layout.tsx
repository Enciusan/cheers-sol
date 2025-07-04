import { Navbar } from "@/components/Layout/Navbar";
import { ProtectedRoutesWrapper } from "@/components/ProtectedRoutesWrapper";
import { Toaster } from "@/components/ui/sonner";
import { ContextProvider } from "@/contexts/ContextProvider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "./globals.css";
// import { ReactScan } from "@/components/ReactScan";

export const metadata: Metadata = {
  title: "CheersUp",
  description: "Redefine human interaction based on on-chain activity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <ReactScan /> */}
      <body className={`antialiased`}>
        <ContextProvider>
          <ProtectedRoutesWrapper>
            <Toaster richColors />
            <Navbar />
            {children}
            <Analytics />
          </ProtectedRoutesWrapper>
        </ContextProvider>
      </body>
    </html>
  );
}
