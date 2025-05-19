import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Layout/Navbar";
import { ContextProvider } from "@/contexts/ContextProvider";
import { ProtectedRoutesWrapper } from "@/components/ProtectedRoutesWrapper";

export const metadata: Metadata = {
  title: "CheersUp",
  description: "Match. Drink. Belong.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ContextProvider>
          <ProtectedRoutesWrapper>
            <Navbar />
            {children}
          </ProtectedRoutesWrapper>
        </ContextProvider>
      </body>
    </html>
  );
}
