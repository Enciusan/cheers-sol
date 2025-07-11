"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Calendar,
  Edit,
  Link as LinkIcon,
  Users,
  TrendingUp,
  Wine,
  Coffee,
  Beer,
  Cherry,
  Award,
  Target,
  BarChart3,
  Clock,
  User,
  Wallet2,
  Globe,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "ethers";
import { useUserStore } from "@/store/user";
import UUIDAvatar from "../AvatarGenerator";
import { DrinkIcon } from "@/utils/drinks";
import { COMMUNITIES } from "@/utils/communities";

export default function ProfileCard2() {
  const { publicKey } = useWallet();
  const { userData } = useUserStore();

  const stats = [
    {
      label: "Active Links",
      value: "10",
      icon: LinkIcon,
      description: "Shared this month",
      trend: "+3 from last month",
      color: "text-blue-400",
    },
    {
      label: "Referrals",
      value: "21",
      icon: Users,
      description: "Friends joined",
      trend: "+5 this week",
      color: "text-green-400",
    },
  ];

  const drinkPreferences = [
    { name: "Wine", icon: Wine, level: "Expert" },
    { name: "Cocktails", icon: Cherry, level: "Intermediate" },
    { name: "Craft Beer", icon: Beer, level: "Beginner" },
    { name: "Coffee", icon: Coffee, level: "Expert" },
  ];

  const communities = [
    {
      name: "Wine Enthusiasts SF",
      members: "1.2K",
      role: "Member",
      joinDate: "Mar 2024",
      activity: "Active",
      color: "bg-purple-500",
    },
    {
      name: "Local Breweries",
      members: "856",
      role: "Contributor",
      joinDate: "Feb 2024",
      activity: "Weekly",
      color: "bg-amber-500",
    },
    {
      name: "Cocktail Crafters",
      members: "2.1K",
      role: "Member",
      joinDate: "Jan 2024",
      activity: "Monthly",
      color: "bg-pink-500",
    },
  ];

  //   const recentLinks = [
  //     {
  //       title: "Best Wine Bars in SOMA",
  //       category: "Wine",
  //       clicks: 24,
  //       referrals: 3,
  //       date: "2 days ago",
  //     },
  //     {
  //       title: "Hidden Speakeasy Guide",
  //       category: "Cocktails",
  //       clicks: 18,
  //       referrals: 2,
  //       date: "5 days ago",
  //     },
  //     {
  //       title: "Craft Beer Festival 2024",
  //       category: "Beer",
  //       clicks: 31,
  //       referrals: 5,
  //       date: "1 week ago",
  //     },
  //   ];

  return (
    <div
      className="flex justify-center w-full items-center text-white min-h-screen"
      style={{ backgroundColor: "#0a0b0b" }}>
      <div className="w-full md:max-w-full lg:max-w-6xl px-2 sm:px-4 md:px-8 py-4 sm:py-8">
        {/* Profile Header */}
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
                  style={{ backgroundColor: "transparent" }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{userData?.username}</h1>
                  <Badge
                    variant="secondary"
                    className="border"
                    style={{ backgroundColor: "#241c35", color: "#7c39ed", borderColor: "#7c39ed" }}>
                    Level 2 • Sippin' Explorer
                  </Badge>
                </div>
                <div className="flex md:flex-row flex-col gap-5">
                  <div className="flex items-center mb-3 gap-2">
                    <Globe className="h-5 w-5" />
                    <h3 className="text-violet-200 font-medium">
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
                    CheersMate since March 2024
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last active 2 hours ago
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border-gray-800 hover:border-gray-700 transition-all duration-200"
              style={{ backgroundColor: "#18181a" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">{stat.label}</h3>
                <p className="text-sm text-gray-400 mb-2">{stat.description}</p>
                <p className="text-xs text-gray-500">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
          {/* Communities */}
          <Card
            className="border-gray-800 col-span-2 hover:border-gray-700 transition-all duration-200"
            style={{ backgroundColor: "#18181a" }}>
            <CardHeader>
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
                      {userData?.communities.map((community, index) => {
                        // console.log(community, COMMUNITIES);

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Level Progress */}
            <Card className="border-gray-800" style={{ backgroundColor: "#18181a" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="h-5 w-5 text-orange-400" />
                  Vibe Score Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Level 2: Sippin' Explorer</span>
                    <span className="text-sm text-gray-400">67 / 100 XP</span>
                  </div>
                  <Progress value={67} className="h-2" style={{ backgroundColor: "#0a0b0b" }} />
                  <div className="text-sm text-gray-300">
                    33 XP needed to reach <strong style={{ color: "#7c39ed" }}>Level 3: Community Connector</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div
                      className="text-center p-3 border rounded-lg"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                      <div className="text-lg font-bold text-blue-400">+5 XP</div>
                      <div className="text-xs text-gray-400">Per link shared</div>
                    </div>
                    <div
                      className="text-center p-3 border rounded-lg"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
                      <div className="text-lg font-bold text-green-400">+10 XP</div>
                      <div className="text-xs text-gray-400">Per referral</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-2 space-y-6">
            {/* Drink Preferences */}
            <Card className="border-gray-800 max-h-[17rem] overflow-y-scroll" style={{ backgroundColor: "#18181a" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Wine className="h-5 w-5 text-purple-400" />
                  Drink Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userData?.drinks.map((drink) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
