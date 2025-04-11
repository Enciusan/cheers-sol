"use client";

import UUIDAvatar from "@/components/AvatarGenerator";
import { ProfileForm } from "@/components/ProfileCard/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/user";
import { Profile } from "@/utils/types";
import { ChevronLeft, Pencil, UserCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { ProfileInfo } from "./profile-info";

export const ProfileCard = () => {
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

  const { userData, updateUserData } = useUserStore();

  const handleSubmit = (updatedProfile: Profile) => {
    updateUserData(updatedProfile);
    setIsInEditMode(false);
  };

  const handleCancel = () => {
    setIsInEditMode(false);
  };
  // console.log(isInEditMode);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="md:w-[450px] w-[90dvw] min-h-[20rem]">
        <CardHeader>
          <CardTitle className="flex justify-between">
            Profile
            {userData && (
              <Button
                className="px-3 py-1.5 h-6 text-xs font-semibold bg-[#18181B] text-slate-200 hover:transition-transform hover:scale-105 hover:bg-[#202020]"
                onClick={() => setIsInEditMode(!isInEditMode)}>
                {isInEditMode ? (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            )}
          </CardTitle>
          <CardDescription>Profile information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!userData && !isInEditMode && (
            <div className="w-full flex justify-center items-center min-h-[200px]">
              <Button
                className="px-3 py-2 h-9 text-xs font-semibold bg-indigo-500/90 shadow-inner shadow-indigo-400 text-slate-200 hover:shadow-none hover:transition-transform hover:duration-300 hover:ease-in-out hover:scale-105 hover:bg-indigo-600/90"
                onClick={() => setIsInEditMode(!isInEditMode)}>
                <UserCheck className="h-4 w-4" />
                Complete Profile
              </Button>
            </div>
          )}

          <div className="flex w-full justify-center">
            {userData?.id && <UUIDAvatar uuid={userData.id} size={"md"} />}
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
