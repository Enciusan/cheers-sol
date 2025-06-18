"use client";

import UUIDAvatar from "@/components/AvatarGenerator";
import { ProfileForm } from "@/components/ProfileCard/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/user";
import { Profile } from "@/utils/types";
import { ChevronLeft, Pencil, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ProfileInfo } from "./profile-info";
import { useWallet } from "@solana/wallet-adapter-react";

export const ProfileCard = () => {
  const { publicKey } = useWallet();
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

  const { userData, updateUserData, fetchUserProfile } = useUserStore();

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
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen px-2 sm:px-4 sm:pb-0 pb-20">
      <Card className="w-full max-w-[450px] min-h-[20rem] mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-3xl font-[chicle] tracking-wide">Profile</span>
            {userData && (
              <Button
                className="px-3 py-1.5 h-8 text-xs sm:text-sm font-semibold bg-[#18181B] text-slate-200 hover:transition-transform hover:scale-105 hover:bg-[#202020]"
                onClick={() => setIsInEditMode(!isInEditMode)}>
                {isInEditMode ? (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </>
                )}
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Profile information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!userData && !isInEditMode && (
            <div className="w-full flex justify-center items-center min-h-[200px]">
              <Button
                className="px-3 py-2 h-9 text-xs font-semibold bg-indigo-500/90 shadow-inner shadow-indigo-400 text-slate-200 hover:shadow-none hover:transition-transform hover:duration-300 hover:ease-in-out hover:scale-105 hover:bg-indigo-600/90"
                onClick={() => setIsInEditMode(!isInEditMode)}>
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Complete Profile</span>
              </Button>
            </div>
          )}

          <div className="flex w-full justify-center">
            {userData?.id && (
              <UUIDAvatar
                uuid={userData.id}
                size={"xl"}
                editable={true}
                profileImage={userData.profileImage ?? null}
                editButtonClassName="bg-[#2b2b2b] text-[#7C3AED] hover:bg-[#202020] hover:text-[#7C3AED] gap-0"
                alwaysShowEditButton={true}
              />
            )}
          </div>
          {isInEditMode ? (
            <ProfileForm data={userData} onSubmit={handleSubmit} onCancel={handleCancel} />
          ) : (
            userData && <ProfileInfo data={userData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
