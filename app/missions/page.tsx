import { MissionsCard } from "@/components/Missions/mission-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Missions() {
  return (
    <div className="flex justify-center items-center min-h-screen px-2 sm:px-4 sm:pb-0 pb-20">
      <MissionsCard />
    </div>
  );
}
