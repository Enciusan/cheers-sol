import { Copy, Gift, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/store/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { generateReferralCode, linkReferralCode } from "@/api/userFunctions";
import { userIncreaseXp } from "@/api/missionFunctions";

export const ReferralCard = () => {
  const [referralCode, setReferralCode] = useState("");
  const { userData, fetchUserProfile } = useUserStore();
  const { publicKey } = useWallet();

  const generateRefCode = async () => {
    if (!publicKey) return toast("Please connect your wallet.");
    const code = userData?.username + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    await generateReferralCode(publicKey.toBase58(), code);
    await fetchUserProfile(publicKey.toBase58());
    toast.success("Your unique referral code has been created.");
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    if (!publicKey) return toast("Please connect your wallet.");
    e.preventDefault();
    await linkReferralCode(publicKey.toBase58(), referralCode);
    await userIncreaseXp(publicKey.toBase58(), 20);
    await fetchUserProfile(publicKey.toBase58());
    toast.success("Refferal code added, you received extra 20XP!🥂");
  };

  const copyToClipboard = async () => {
    // console.log(userData?.myReferral);

    if (userData?.myReferral === null) return toast("No referral code to copy.");
    await navigator.clipboard.writeText(userData?.myReferral ?? "");
    toast.info("Referral code copied to clipboard.");
  };
  return (
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
                <Input value={userData?.myReferral ?? ""} readOnly className="bg-gray-800 border-gray-700" />
                <Button onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={generateRefCode}
              disabled={userData?.myReferral !== null}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold">
              <Gift className="mr-2 h-4 w-4" />
              Generate Referral Code
            </Button>
          </TabsContent>

          <TabsContent value="redeem" className="space-y-4 mt-4">
            <div className="text-gray-400 mb-4">Enter a referral code to receive your rewards</div>

            <form onSubmit={handleReferralSubmit} className="space-y-4">
              <Input
                placeholder="Enter referral code"
                value={userData?.referralUsed !== null ? userData?.referralUsed : referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={userData?.referralUsed !== null}
                className="bg-gray-800 border-gray-700"
              />
              <Button
                type="submit"
                className="w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold"
                disabled={userData?.referralUsed !== null}>
                Redeem Code
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
