"use client";

import { getLevels } from "../../api/userFunctions";
import { useUserStore } from "../../store/user";
import { Profile } from "../../utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import CommunitiesSection from "./CommunitiesSection";
import DrinksSection from "./DrinkSection";
import MissionsSection from "./MissionSection";
import { ProfileForm } from "./profile-form";
import ProfileInfo from "./ProfileInfo";
import StatsSection from "./StatsSection";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";

export default function ProfileCard2() {
  const { publicKey } = useWallet();
  const { userData, updateUserData, fetchUserProfile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<any>(null);
  const [nextLevel, setNextLevel] = useState<any>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

  const handleSubmit = (updatedProfile: Profile) => {
    updateUserData(updatedProfile);
    setIsInEditMode(false);
  };

  const handleCancel = () => {
    setIsInEditMode(false);
  };

  useEffect(() => {
    if (!publicKey) return;
    fetchUserProfile(publicKey.toBase58());
  }, [isInEditMode]);

  // Memoized function to fetch levels
  const fetchLevelsData = useMemo(
    () => async () => {
      if (!userData?.walletAddress) return;

      setLoading(true);
      try {
        const response = await getLevels(userData.walletAddress);
        if (response.success && response.levels) {
          const levels = response.levels;
          // Find current level based on user's XP
          const userXP = userData?.gainedXP || 0;
          const current = levels.find((level) => userXP >= level.startingFrom && userXP <= level.endingAt);

          // Find next level
          const next = levels.sort((a, b) => a.id - b.id).find((level) => level.startingFrom > (userXP || 0));

          setCurrentLevel(current);
          setNextLevel(next);

          // Calculate progress percentage
          if (current && next) {
            const xpInCurrentLevel = userXP - current.startingFrom;
            const xpRequiredForNextLevel = next.startingFrom - current.startingFrom;
            const progress = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;
            setProgressPercentage(Math.min(progress, 100));
          }
        }
      } catch (error) {
        console.error("Error fetching levels:", error);
      } finally {
        setLoading(false);
      }
    },
    [userData?.walletAddress, userData?.gainedXP]
  );

  useEffect(() => {
    fetchLevelsData();
  }, [userData]);

  const missionProps = {
    loading,
    currentLevel,
    nextLevel,
    progressPercentage,
    userData,
  };

  const stats = [
    {
      label: "Active Links",
      icon: "LinkIcon",
      description: "Links this month",
      color: "text-blue-400",
    },
    {
      label: "Referrals",
      icon: "Users",
      description: "Friends joined",
      color: "text-green-400",
    },
  ];
  console.log(userData);

  return (
    <div
      className="flex justify-center w-full items-center text-white min-h-screen"
      style={{ backgroundColor: "#0a0b0b" }}>
      <div className="w-full md:max-w-full lg:max-w-4xl px-2 sm:px-4 md:px-8 py-4 sm:py-8">
        {!isInEditMode && userData?.id ? (
          <>
            <ProfileInfo
              userData={userData}
              currentLevel={missionProps.currentLevel}
              isInEditMode={isInEditMode}
              setIsInEditMode={setIsInEditMode}
              loading={loading}
            />
            <StatsSection stats={stats} userData={userData} loading={loading} />
            <CommunitiesSection userData={userData} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 pt-4 md:pt-8">
              <div className="col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
                <MissionsSection {...missionProps} />
              </div>
              <div className="col-span-2 space-y-6">
                <DrinksSection userData={userData} loading={loading} />
              </div>
            </div>
          </>
        ) : !isInEditMode && (!userData || userData.id === undefined) ? (
          <Card className="w-full h-[40dvh]">
            <CardHeader>
              <CardTitle className="font-[chicle] text-2xl font-bold text-white tracking-wide">
                Create an account
              </CardTitle>
            </CardHeader>
            <CardDescription className="flex flex-col justify-center items-center w-full h-[30svh]">
              <Button onClick={() => setIsInEditMode(true)}>
                <UserPlus />
              </Button>
            </CardDescription>
          </Card>
        ) : (
          <ProfileForm
            data={userData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            setIsInEditMode={setIsInEditMode}
          />
        )}
      </div>
    </div>
  );
}
