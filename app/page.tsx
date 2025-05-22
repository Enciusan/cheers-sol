"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Beer, GlassWater, Martini, MessageSquare, Users, Wine } from "lucide-react";
import dynamic from "next/dynamic";
import xLogo from "@/assets/twitter.svg";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 md:pt-32 min-h-[80vh] relative overflow-hidden flex items-center">
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8 space-x-4">
            <Wine className="h-12 w-12 text-violet-500 animate-pulse" />
            <Beer className="h-12 w-12 text-violet-400" />
            <Martini className="h-12 w-12 text-violet-300" />
          </div>
          <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 text-transparent bg-clip-text">
            Find Your Drinking Buddy
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            Connect with like-minded people who share your taste in drinks and love for socializing. Join thousands of
            others looking for their perfect drinking companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WalletMultiButtonDynamic className="!text-black bg-violet-600 hover:bg-violet-700">
              Connect wallet
            </WalletMultiButtonDynamic>
            <Button
              className="font-semibold w-[11rem]"
              size={"sm"}
              onClick={() => window.open("https://x.com/cheersupSOL", "_blank")}>
              Follow us
              <img src={xLogo.src} alt="Twitter Logo" className="h-5 w-5 " />
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=1600')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-[#09090B]/80"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 text-transparent bg-clip-text">Cheers</span>
            ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-[#18181B] border-violet-900/20 hover:border-violet-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="mb-6 text-violet-500 group-hover:scale-110 transition-transform">
                  <GlassWater className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Smart Drink Matching</h3>
                <p className="text-gray-400">
                  Connect with your community through personalized drink recommendations based on your NFT collections,
                  token holdings, and beverage preferences. Find like-minded drinkers who share your digital assets and
                  taste profile.
                </p>
              </div>
            </Card>
            <Card className="p-8 bg-[#18181B] border-violet-900/20 hover:border-violet-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="mb-6 text-violet-500 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Instant Connections</h3>
                <p className="text-gray-400">
                  Seamlessly chat with your matches and coordinate meetups at your preferred venues. Skip the small talk
                  and dive straight into planning your next social experience.
                </p>
              </div>
            </Card>
            <Card className="p-8 bg-[#18181B] border-violet-900/20 hover:border-violet-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="mb-6 text-violet-500 group-hover:scale-110 transition-transform">
                  <Users className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Local Discovery</h3>
                <p className="text-gray-400">
                  Find nearby drinking companions and explore the best local bars and pubs in your area. Discover new
                  venues and connect with people who are just around the corner, ready to share a drink.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
