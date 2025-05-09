"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Beer, GlassWater, Martini, MessageSquare, Users, Wine } from "lucide-react";
import dynamic from "next/dynamic";

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
              size="sm"
              variant="outline"
              className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 min-w-[200px]">
              Learn More
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
                  Find your perfect match based on drink preferences, from craft beer enthusiasts to wine connoisseurs.
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
                  Chat instantly with your matches and plan your next social gathering at your favorite spots.
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
                  Discover drinking buddies nearby and explore the best local bars and pubs together.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
