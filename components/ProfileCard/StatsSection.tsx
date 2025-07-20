"use client";

import {
  getLinksAmount,
  getMonthlyLinksAmount,
  getReferralsAmount,
  getWeeklyReferralsAmount,
} from "@/api/userFunctions";
import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/store/user";
import { Profile } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { Link as LinkIcon, Users } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Skeleton } from "../ui/skeleton";

interface StatItem {
  label: string;
  icon: string;
  description: string;
  color: string;
}

interface StatsSectionProps {
  stats: StatItem[];
  userData: Profile | null;
  loading: boolean;
}

export default function StatsSection({ stats, userData, loading }: StatsSectionProps) {
  const { publicKey } = useWallet();
  const { isDataLoaded } = useUserStore();
  const [_, startTransition] = useTransition();
  const [referralCount, setReferralCount] = useState<number>(0);
  const [lastWeekReferralCount, setLastWeekReferralCount] = useState<number>(0);
  const [linksCount, setLinksCount] = useState<number>(0);
  const [lastMonthLinksCount, setLastMonthLinksCount] = useState<number>(0);

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

  const getAmountOf = (label: string) => {
    if (label === "Active Links") return linksCount;
    if (label === "Referrals") return referralCount;
    return 0;
  };

  const getAmountOfLastMonth = (label: string) => {
    if (label === "Active Links")
      return (
        <div className={lastMonthLinksCount > 0 ? "text-green-500" : lastMonthLinksCount < 0 ? "text-rose-400" : ""}>
          +{lastMonthLinksCount} from last month
        </div>
      );
    if (label === "Referrals")
      return (
        <div
          className={lastWeekReferralCount > 0 ? "text-green-500" : lastWeekReferralCount < 0 ? "text-rose-400" : ""}>
          +{lastWeekReferralCount} from last week
        </div>
      );
    return 0;
  };

  const fetchAllData = useCallback(() => {
    if (!publicKey || !userData) return;

    startTransition(async () => {
      try {
        const [referralsResult, weeklyReferralsResult, linksResult, monthlyLinksResult] = await Promise.all([
          getReferralsAmount(publicKey.toBase58()),
          getWeeklyReferralsAmount(publicKey.toBase58()),
          getLinksAmount(publicKey.toBase58(), userData.id),
          getMonthlyLinksAmount(publicKey.toBase58(), userData.id),
        ]);

        // Update all states after all requests complete
        setReferralCount(referralsResult.referrals?.length || 0);
        setLastWeekReferralCount(weeklyReferralsResult.referrals?.length || 0);
        setLinksCount(linksResult.links?.length || 0);
        setLastMonthLinksCount(monthlyLinksResult.links?.length || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error state if needed
      }
    });
  }, [publicKey, userData, isDataLoaded]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
        <Card
          className=" border-gray-800 hover:border-gray-700 transition-all duration-200"
          style={{ backgroundColor: "#18181a" }}>
          <CardContent className="p-6 h-[10rem]">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-12 h-7 rounded-md" />
            </div>
            <Skeleton className="w-32 h-7 rounded-md mb-2" />
            <Skeleton className="w-32 h-5 rounded-md mb-2" />
            <Skeleton className="w-24 h-4 rounded-md" />
          </CardContent>
        </Card>
        <Card
          className=" border-gray-800 hover:border-gray-700 transition-all duration-200"
          style={{ backgroundColor: "#18181a" }}>
          <CardContent className="p-6 h-[10rem]">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-12 h-7 rounded-md" />
            </div>
            <Skeleton className="w-32 h-7 rounded-md mb-2" />
            <Skeleton className="w-32 h-5 rounded-md mb-2" />
            <Skeleton className="w-24 h-4 rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <div className="text-xs text-gray-500">{getAmountOfLastMonth(stat.label)}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
