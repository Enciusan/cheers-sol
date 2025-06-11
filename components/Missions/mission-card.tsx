"use client";

import { Progress } from "@/components/ui/progress";
import { UserCircle, Calendar, MessageCircle, MessagesSquare, Users as UsersIcon } from "lucide-react";
import { Card, CardTitle } from "../ui/card";
import { Missions } from "@/utils/types";
import { Fragment, useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import {
  addWalletToMissionDone,
  checkConversationStarter,
  getMatchCount,
  getMissions,
  getReferralCount,
  profileMissionDone,
} from "@/api/missionFunctions";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "../ui/button";

export const MissionsCard = () => {
  const { publicKey } = useWallet();
  const { userData } = useUserStore();
  const [missions, setMissions] = useState<Missions[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [hasInitiatedConversation, setHasInitiatedConversation] = useState(false);
  const [hasMultipleTexts, setHasMultipleTexts] = useState(false);
  const [initiatedCount, setInitiatedCount] = useState(0);
  const [mutualConversationCount, setMutualConversationCount] = useState(0);

  // Add this function to check conversation initiation
  const checkConversationInitiation = async () => {
    if (!userData?.id || !publicKey) return;

    const result = await checkConversationStarter(publicKey.toBase58(), userData.id);
    if (result.success) {
      setHasInitiatedConversation(result.initiatedConversation);
      setHasMultipleTexts(result.multipleTexts);
      setInitiatedCount(result.initiatedCount);
      setMutualConversationCount(result.mutualConversationCount);
    }
  };

  const passedOneDay = (): boolean => {
    if (!userData?.connectedAt) return false;
    const now = new Date();
    const lastConnected = new Date(userData.connectedAt);
    const diffMs = now.getTime() - lastConnected.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 24;
  };

  const countMatches = async () => {
    if (!userData) return;
    const { totalMatches } = await getMatchCount(userData.walletAddress, userData.id);
    if (!totalMatches) return;
    setMatchCount(totalMatches.length);
  };

  const countReferral = async () => {
    if (!userData) return;
    const { totalReferrals } = await getReferralCount(userData.walletAddress, userData.myReferral);
    if (!totalReferrals) return;
    setReferralCount(totalReferrals.length);
  };

  const getIconForMission = (mission: string): React.ReactNode => {
    const missionLower = mission.toLowerCase();

    if (missionLower.includes("profile")) return <UserCircle className="h-5 w-5" />;
    if (missionLower.includes("login") || missionLower.includes("daily")) return <Calendar className="h-5 w-5" />;
    if (missionLower.includes("match") && missionLower.includes("25")) return <UsersIcon className="h-5 w-5" />;
    if (missionLower.includes("conversation") || missionLower.includes("initiate"))
      return <MessageCircle className="h-5 w-5" />;
    if (missionLower.includes("message") || missionLower.includes("10 messages"))
      return <MessagesSquare className="h-5 w-5" />;
    if (missionLower.includes("referral")) return <UsersIcon className="h-5 w-5" />;

    // Default icon
    return <UserCircle className="h-5 w-5" />;
  };

  const getProgress = (mission: string) => {
    switch (mission) {
      case "Complete Profile":
        return userData?.walletAddress && userData?.profileImage ? 1 : 0;
      case "Daily Login":
        return passedOneDay() ? 1 : 0;
      case "Match Master":
        return matchCount < 25 ? matchCount : matchCount >= 25 ? 1 : 0;
      case "Conversation Starter":
        return hasInitiatedConversation ? 1 : 0;
      case "Deep Connection":
        return mutualConversationCount < 10 ? mutualConversationCount : mutualConversationCount >= 10 ? 1 : 0;
      case "Community Builder":
        return referralCount < 10 ? referralCount : referralCount >= 10 ? 1 : 0;
      default:
        return 0;
    }
  };

  const completeProfileMission = () => {
    if (userData?.walletAddress && userData?.profileImage) {
      profileMissionDone(userData.walletAddress, 1);
      addWalletToMissionDone(userData.walletAddress, 1);
    }
  };

  const completeLoginDailyMission = () => {
    if (passedOneDay() && userData?.walletAddress) {
      profileMissionDone(userData.walletAddress, 2);
      addWalletToMissionDone(userData.walletAddress, 2);
    }
  };

  const completePeopleMatchMission = () => {
    if (matchCount >= 25 && userData?.walletAddress) {
      profileMissionDone(userData.walletAddress, 3);
      addWalletToMissionDone(userData.walletAddress, 3);
    }
  };

  const completeConversationStarterMission = () => {
    if (hasInitiatedConversation && userData?.walletAddress) {
      profileMissionDone(userData.walletAddress, 4);
      addWalletToMissionDone(userData.walletAddress, 4);
    }
  };

  const completeDeepConnectionMission = () => {
    if (mutualConversationCount >= 10 && userData?.walletAddress) {
      profileMissionDone(userData.walletAddress, 5);
      addWalletToMissionDone(userData.walletAddress, 5);
    }
  };

  const completeReferralMission = () => {
    if (referralCount >= 10 && userData?.walletAddress) {
      profileMissionDone(userData.walletAddress, 6);
      addWalletToMissionDone(userData.walletAddress, 6);
    }
  };

  useEffect(() => {
    let fetched = false;
    if (!publicKey) return;
    const fetchMissions = async () => {
      if (fetched || !userData?.walletAddress) return;
      try {
        const data = await getMissions(userData.walletAddress);
        if (data.success && data.missions) {
          setMissions(data.missions);
        }
      } catch (error) {
        console.log("Error fetch missions", error);
      }
    };
    fetchMissions();
    countMatches();
    countReferral();
    checkConversationInitiation();

    return () => {
      fetched = true;
    };
  }, []);

  return (
    <Card className="w-full max-w-[30rem] mx-auto shadow-lg rounded-xl">
      <div className="rounded-lg p-6 backdrop-blur-sm ">
        <CardTitle className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Missions</h2>
          <div className="text-sm text-gray-400">
            Total XP Available: {missions.reduce((acc, mission) => acc + mission.XPGainedPerMission, 0)} XP
          </div>
        </CardTitle>

        <div className="space-y-4 h-[60dvh] md:h-[40dvh] overflow-y-scroll">
          {missions
            .sort((a, b) => a.id - b.id)
            .map((mission) => (
              <Fragment key={mission.id}>
                <div className="group relative rounded-lg bg-[#18181B] p-4 transition-transform duration-300 hover:transform hover:scale-[1.02] m-1">
                  {getProgress(mission.title) === mission.target && (
                    <div className="absolute w-full h-full z-20 backdrop-blur-lg bg-violet-800/10 inset-0 rounded-lg">
                      <div className="flex flex-col justify-center h-full items-center w-full font-semibold gap-2">
                        <span className="text-emerald-200 text-sm font-medium px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-sm">
                          Complete
                        </span>
                        <Button
                          variant="outline"
                          className="bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-100 backdrop-blur-sm">
                          Claim XP
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 bg-opacity-20">
                      {getIconForMission(mission.mission)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-base font-medium text-white truncate">{mission.title}</h3>
                          <p className="text-sm text-gray-300">{mission.mission}</p>
                        </div>
                        <span className="text-xs text-purple-400">+{mission.XPGainedPerMission} XP</span>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={(getProgress(mission.title) / mission.target) * 100}
                          className="h-1.5 bg-gray-700"
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            {getProgress(mission.title)} / {mission.target}
                          </span>
                          <span className="text-gray-500">
                            {Math.round((getProgress(mission.title) / mission.target) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
        </div>
      </div>
    </Card>
  );
};
