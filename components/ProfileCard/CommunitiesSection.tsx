"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITIES } from "@/utils/communities";
import { Profile } from "@/utils/types";
import { Target } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface CommunitiesSectionProps {
  userData: Profile | null;
  loading: boolean;
}

export default function CommunitiesSection({ userData, loading }: CommunitiesSectionProps) {
  if (loading) {
    return (
      <Card className="border-gray-800 w-full" style={{ backgroundColor: "#18181a" }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-green-400" />
            Communities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      className="border-gray-800 col-span-2 hover:border-gray-700 transition-all duration-200"
      style={{ backgroundColor: "#18181a" }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="h-5 w-5 text-green-400" />
          Communities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userData?.communities !== undefined && userData?.communities.length > 0 ? (
            <div className="bg-[#18181B] rounded-lg px-2 pt-4 w-full overflow-x-auto">
              <div className="flex gap-2 flex-wrap">
                {userData?.communities.map((community: string, index: number) => {
                  const meta = COMMUNITIES.find((c) => c.mint === community);
                  return (
                    <div
                      key={index}
                      style={{ backgroundColor: meta?.badgeColor, color: meta?.textColor }}
                      className={`${meta?.badgeColor} px-3 py-1.5 rounded-full text-sm flex font-medium font-mono items-center gap-2 text-white`}>
                      {meta?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#18181B] rounded-lg p-4 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-semibold mb-3 text-gray-200">Communities</h4>
              <div className="flex gap-2 flex-wrap">
                <p className="text-sm text-gray-500 italic">No communities available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
