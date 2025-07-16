"use client";

import { getLinksAmount, getReferralsAmount } from "@/api/userFunctions";
import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/store/user";
import { Profile } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { Link as LinkIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface StatItem {
  label: string;
  icon: string;
  description: string;
  trend: string;
  color: string;
}

interface StatsSectionProps {
  stats: StatItem[];
  userData: Profile | null;
}

export default function StatsSection({ stats, userData }: StatsSectionProps) {
  const { publicKey } = useWallet();
  const { isDataLoaded } = useUserStore();
  const [referralCount, setReferralCount] = useState<number>(0);
  const [linksCount, setLinksCount] = useState<number>(0);
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "LinkIcon":
        return LinkIcon;
      case "Users":
        return Users;
      default:
        return LinkIcon;
    }
  };

  useEffect(() => {
    if (!publicKey || !userData) return;
    const getReferralCount = async () => {
      const { referrals } = await getReferralsAmount(publicKey?.toBase58());
      setReferralCount(referrals?.length || 0);
    };
    const getLinksCount = async () => {
      const { links } = await getLinksAmount(publicKey?.toBase58(), userData?.id);
      setLinksCount(links?.length || 0);
    };
    getReferralCount();
    getLinksCount();
  }, [publicKey, isDataLoaded]);

  const getAmountOf = (label: string) => {
    if (label === "Active Links") return linksCount;
    if (label === "Referrals") return referralCount;
    return 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
      {stats.map((stat) => {
        const IconComponent = getIconComponent(stat.icon);
        return (
          <Card
            key={stat.label}
            className="border-gray-800 hover:border-gray-700 transition-all duration-200"
            style={{ backgroundColor: "#18181a" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <IconComponent className={`h-5 w-5 ${stat.color}`} />
                <span className={`text-2xl font-bold ${stat.color}`}>{getAmountOf(stat.label)}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{stat.label}</h3>
              <p className="text-sm text-gray-400 mb-2">{stat.description}</p>
              <p className="text-xs text-gray-500">{stat.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
