import { Navbar } from "@/components/Layout/Navbar";
import { ProtectedRoutesWrapper } from "@/components/ProtectedRoutesWrapper";
import { Toaster } from "@/components/ui/sonner";
import { ContextProvider } from "@/contexts/ContextProvider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import ogImage from "@/assets/cheersUpOG.png";
import "./globals.css";
import { CivicAuthModal } from "@/components/CivicAuthModal/CivicAuthModal";
// import { ReactScan } from "@/components/ReactScan";

export const metadata: Metadata = {
  title: "CheersUp",
  description: "Redefine human interaction based on on-chain activity.",
  keywords: ["Solana", "on-chain", "blockchain", "CheersUp", "Web3", "social app"],
  authors: [{ name: "CheersUp" }],
  openGraph: {
    title: "CheersUp",
    description: "Redefine human interaction based on on-chain activity.",
    url: "https://cheersup.fun",
    siteName: "CheersUp",
    images: [
      {
        url: ogImage.src,
        width: 1200,
        height: 630,
        alt: "CheersUp OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cheersupSOL",
    title: "CheersUp",
    description: "Redefine human interaction based on on-chain activity. Powered by @solana. Driven by vibes.",
    images: [ogImage.src],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
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
