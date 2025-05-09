import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Layout/Navbar";
import { ContextProvider } from "@/contexts/ContextProvider";
import { UserInitializer } from "@/components/UserInitialize";

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
          <UserInitializer />
          <Navbar />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
