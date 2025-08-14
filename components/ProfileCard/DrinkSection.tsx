"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DrinkIcon } from "../../utils/drinks";
import { Profile } from "../../utils/types";
import { Wine } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface DrinksSectionProps {
  userData: Profile | null;
  loading: boolean;
}

export default function DrinksSection({ userData, loading }: DrinksSectionProps) {
  if (loading) {
    return (
      <Card className="border-gray-800" style={{ backgroundColor: "#18181a" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wine className="h-5 w-5 text-purple-400" />
            Drink Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[11rem]">
          <div className="flex flex-col space-y-3">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-gray-800 max-h-[16rem] overflow-y-scroll" style={{ backgroundColor: "#18181a" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wine className="h-5 w-5 text-purple-400" />
          Drink Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userData?.drinks?.map((drink: string) => (
            <div
              key={drink}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-700/50 transition-colors"
              style={{ backgroundColor: "rgba(24, 24, 26, 0.3)" }}>
              <div className="flex items-center gap-3">
                <DrinkIcon drink={drink} route="profile" />
                <div className="font-medium text-white">{drink}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
