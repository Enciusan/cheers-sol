"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/store/user";
import { Copy, Gift, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Referral() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const { userData } = useUserStore();

  const generateReferralCode = () => {
    const code = userData?.username + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    toast("Your unique referral code has been created.");
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("The referral code has been successfully applied to your account.");
    setReferralCode("");
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCode);
    toast("Referral code copied to clipboard.");
  };
  return (
    <div className="flex justify-center items-center min-h-screen px-2 sm:px-4 sm:pb-0 pb-20">
      <Card className="w-full max-w-[450px] mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-lg sm:text-xl">Referral Program</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="generate" className="data-[state=active]:bg-violet-500 font-semibold">
                Generate Code
              </TabsTrigger>
              <TabsTrigger value="redeem" className="data-[state=active]:bg-violet-500 font-semibold">
                Redeem Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              <div className="text-gray-400 mb-4">Generate your unique referral code to share with friends</div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={generatedCode} readOnly className="bg-gray-800 border-gray-700" />
                  <Button onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {generatedCode ? (
                <Button
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold"
                  onClick={() => {}}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Code
                </Button>
              ) : (
                <Button
                  onClick={generateReferralCode}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold">
                  <Gift className="mr-2 h-4 w-4" />
                  Generate Referral Code
                </Button>
              )}
            </TabsContent>

            <TabsContent value="redeem" className="space-y-4 mt-4">
              <div className="text-gray-400 mb-4">Enter a referral code to receive your rewards</div>

              <form onSubmit={handleReferralSubmit} className="space-y-4">
                <Input
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
                <Button
                  type="submit"
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold"
                  disabled={!referralCode}>
                  Redeem Code
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
