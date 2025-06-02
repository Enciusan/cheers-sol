"use client";

import { Progress } from "@/components/ui/progress";
import { UserCircle, Calendar, MessageCircle, MessagesSquare, Users as UsersIcon } from "lucide-react";
import { Card, CardTitle } from "../ui/card";

interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  icon: React.ReactNode;
  reward: number;
}

const missions: Mission[] = [
  {
    id: "profile",
    title: "Complete Profile",
    description: "Fill out all profile information",
    progress: 4,
    target: 5,
    icon: <UserCircle className="h-5 w-5" />,
    reward: 100,
  },
  {
    id: "daily",
    title: "Daily Login",
    description: "Enter once a day in app",
    progress: 1,
    target: 1,
    icon: <Calendar className="h-5 w-5" />,
    reward: 50,
  },
  {
    id: "matches",
    title: "Match Master",
    description: "Match with 25 persons",
    progress: 10,
    target: 25,
    icon: <UsersIcon className="h-5 w-5" />,
    reward: 250,
  },
  {
    id: "conversation",
    title: "Conversation Starter",
    description: "Initiate conversation with a match",
    progress: 0,
    target: 1,
    icon: <MessageCircle className="h-5 w-5" />,
    reward: 75,
  },
  {
    id: "messages",
    title: "Deep Connection",
    description: "Exchange 10 messages with a match",
    progress: 3,
    target: 10,
    icon: <MessagesSquare className="h-5 w-5" />,
    reward: 150,
  },
  {
    id: "referrals",
    title: "Community Builder",
    description: "10 persons used your referral",
    progress: 2,
    target: 10,
    icon: <UsersIcon className="h-5 w-5" />,
    reward: 500,
  },
];

export const MissionsCard = () => {
  return (
    <Card className="w-full max-w-[450px] mx-auto shadow-lg rounded-xl">
      <div className="rounded-lg p-6 backdrop-blur-sm ">
        <CardTitle className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Daily Missions</h2>
          <div className="text-sm text-gray-400">
            Total XP Available: {missions.reduce((acc, mission) => acc + mission.reward, 0)} XP
          </div>
        </CardTitle>

        <div className="space-y-4 h-[40dvh] overflow-y-scroll">
          {missions.map((mission) => (
            <>
              <div className="group relative rounded-lg bg-[#18181B] bg-opacity-50 backdrop-blur p-4 hover:bg-opacity-70 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 bg-opacity-20">
                    {mission.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-medium text-white truncate">{mission.title}</h3>
                        <p className="text-sm text-gray-300">{mission.description}</p>
                      </div>
                      <span className="text-xs text-purple-400">+{mission.reward} XP</span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={(mission.progress / mission.target) * 100} className="h-1.5 bg-gray-700" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {mission.progress} / {mission.target}
                        </span>
                        <span className="text-gray-500">{Math.round((mission.progress / mission.target) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </Card>
  );
};
