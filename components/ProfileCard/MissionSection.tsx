"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Award } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface MissionsSectionProps {
  loading: boolean;
  currentLevel: any;
  nextLevel: any;
  progressPercentage: number;
  userData: any;
}

export default function MissionsSection({
  loading,
  currentLevel,
  nextLevel,
  progressPercentage,
  userData,
}: MissionsSectionProps) {
  if (loading) {
    return (
      <Card className="border-gray-800" style={{ backgroundColor: "#18181a" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Award className="h-5 w-5 text-orange-400" />
            Vibe Score Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[11rem]">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-20 h-5" />
            </div>
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <div className="flex justify-between items-center gap-4 pt-1">
              <Skeleton className="w-2/4 h-12" />
              <Skeleton className="w-2/4 h-12" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800" style={{ backgroundColor: "#18181a" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Award className="h-5 w-5 text-orange-400" />
          Vibe Score Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white">
              Level {currentLevel?.id || "?"}: {currentLevel?.name || ""}
            </span>
            <span className="text-sm text-gray-400">
              {userData?.gainedXP || 0} / {currentLevel?.endingAt} XP
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" style={{ backgroundColor: "#0a0b0b" }} />
          <div className="text-sm text-gray-300">
            {userData && currentLevel?.endingAt - userData?.gainedXP} XP needed to reach{" "}
            <strong style={{ color: "#7c39ed" }}>
              Level {nextLevel?.id || "?"}: {nextLevel?.name || ""}
            </strong>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div
              className="text-center py-1.5 border rounded-lg"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
              <div className="text-lg font-bold text-blue-400">+28 XP</div>
              <div className="text-xs text-gray-400">Per 25 links</div>
            </div>
            <div
              className="text-center py-1.5 border rounded-lg"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              <div className="text-lg font-bold text-green-400">+40 XP</div>
              <div className="text-xs text-gray-400">Per 10 referral</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
