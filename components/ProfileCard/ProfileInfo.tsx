"use client";

import { Calendar, Edit, Globe, Wallet2 } from "lucide-react";
import { Profile } from "../../utils/types";
import UUIDAvatar from "../AvatarGenerator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface ProfileInfoProps {
  userData: Profile | null;
  currentLevel: any;
  loading: boolean;
  isInEditMode: boolean;
  setIsInEditMode: (isInEditMode: boolean) => void;
}

export default function ProfileInfo({ userData, currentLevel, loading, setIsInEditMode }: ProfileInfoProps) {
  const createdAt = new Date(userData?.createdAt ?? "");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const transformedDate = months[createdAt.getMonth()] + " " + createdAt.getFullYear();

  if (loading) {
    return (
      <Card className="mb-4 sm:mb-8 border-gray-800 w-full" style={{ backgroundColor: "#18181a" }}>
        <CardContent className="p-4 sm:p-6 md:p-8 md:h-[15.25rem]">
          <div className="flex flex-col h-full md:flex-row md:items-center gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col items-center md:items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-auto">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-9 rounded-md px-3 w-32" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-24 h-8 rounded-md" />
                <Skeleton className="w-52 h-5 rounded-full" />
              </div>
              <div className="flex md:flex-row flex-col gap-5">
                <div className="flex md:flex-row flex-col md:items-center items-start mb-3 gap-3">
                  <Skeleton className="w-24 h-5 rounded-md" />
                  <Skeleton className="w-80 h-5 rounded-md" />
                </div>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="w-3/4 h-12 rounded-md" />
              </div>
              <div className="flex md:flex-row flex-col md:items-center items-start gap-4">
                <div className="flex items-center gap-1">
                  <Skeleton className="w-60 h-5 rounded-md" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="w-40 h-5 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 sm:mb-8 border-gray-800 w-full" style={{ backgroundColor: "#18181a" }}>
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6 md:gap-8">
          <div className="flex flex-col items-center md:items-start gap-3 sm:gap-4 md:gap-6 w-full md:w-auto">
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
            <Button
              variant="outline"
              size="sm"
              className="mb-2 border-gray-700 text-gray-300 hover:text-white"
              style={{ backgroundColor: "transparent" }}
              onClick={() => setIsInEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{userData?.username}</h1>
              <Badge
                variant="secondary"
                className="border text-gray-200"
                style={{ backgroundColor: "#241c35", borderColor: "#7c39ed" }}>
                Level {currentLevel?.id} • {currentLevel?.name}
              </Badge>
            </div>
            <div className="flex md:flex-row flex-col gap-5">
              <div className="flex items-center mb-3 gap-2">
                <Globe className="h-5 w-5" />
                <h3 className="text-violet-200 font-medium text-sm">
                  {userData?.hasADDomainChecked
                    ? userData.allDomainName
                    : userData?.hasSNSDomainChecked
                      ? userData.snsName
                      : "No domain assigned"}
                </h3>
              </div>

              <div className="text-gray-400 mb-3 flex items-center gap-2">
                <Wallet2 className="w-5 h-5 text-white" />
                {window.innerWidth >= 768
                  ? userData?.walletAddress
                  : userData?.walletAddress.substring(0, 10) +
                    "..." +
                    userData?.walletAddress.substring(
                      userData?.walletAddress.length - 10,
                      userData?.walletAddress.length
                    )}
              </div>
            </div>

            <p className="text-gray-300 mb-4 max-w-2xl">{userData?.bio}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                CheersMate since {transformedDate}
              </div>
              {/* <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last active 2 hours ago
              </div> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
