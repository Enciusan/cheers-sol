"use client";

import MatchStack from "../../components/MatchCard/match-stack";
import { Button } from "../../components/ui/button";
import { useUsersStore, useUserStore } from "../../store/user";
import { calculateDistance } from "../../utils/clientFunctions";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function MatchesPage() {
  const { userData, isDataLoaded } = useUserStore();
  const { profiles, usersLocations } = useUsersStore();

  const router = useRouter();

  const [isDataLoadedState, setIsDataLoadedState] = useState(false);

  const isLoading = !userData || !profiles || !usersLocations;

  const filteredProfilesBasedOnDistance = useMemo(() => {
    if (usersLocations === null || userData === null || profiles === null) {
      return [];
    }

    const myLocation = usersLocations.find((location) => location.walletAddress === userData.walletAddress);

    if (!myLocation) {
      return [];
    }

    const filteredProfiles = profiles.filter((profile) => {
      if (profile.walletAddress === userData.walletAddress) {
        return false;
      }

      const profileLocation = usersLocations.find((location) => location.walletAddress === profile.walletAddress);

      if (!profileLocation) return false;

      const distance = calculateDistance(
        { latitude: Number(myLocation.latitude), longitude: Number(myLocation.longitude) },
        { latitude: Number(profileLocation.latitude), longitude: Number(profileLocation.longitude) }
      );

      if (distance === undefined) {
        return false;
      }
      return myLocation.radius === 0 ? true : distance <= myLocation.radius;
    });

    return filteredProfiles;
  }, [userData, profiles, usersLocations, isDataLoaded, isLoading]);

  // useEffect(() => {
  //   const hasUserData = userData !== null;
  //   const hasProfiles = profiles && profiles.length > 0;

  //   // console.log("Data loading check:", {
  //   //   hasUserData,
  //   //   hasProfiles,
  //   //   profilesCount: profiles?.length || 0,
  //   //   locationsCount: usersLocations?.length || 0,
  //   // });

  //   if (hasUserData && hasProfiles) {
  //     // Add a small delay to ensure all data is properly loaded
  //     const timer = setTimeout(() => {
  //       console.log("Setting isDataLoaded to true");
  //       setIsDataLoadedState(true);
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   } else {
  //     console.log("Setting isDataLoaded to false");
  //     setIsDataLoadedState(false);
  //   }
  // }, [userData, profiles, usersLocations]);

  // useEffect(() => {
  //   console.log("MatchesPage state:", {
  //     userData: !!userData,
  //     profiles: profiles?.length || 0,
  //     usersLocations: usersLocations?.length || 0,
  //     isDataLoaded,
  //     isLoading,
  //   });
  // }, [userData, profiles, usersLocations, isDataLoaded, isLoading]);
  // console.log(isLoading, userData, profiles);
  console.group("MatchesPage");
  console.log("filteredProfilesBasedOnDistance", filteredProfilesBasedOnDistance);
  console.log("userData", userData);
  console.log("profiles", profiles);
  console.log("usersLocations", usersLocations);
  console.log("isDataLoadedState", isDataLoadedState);
  console.groupEnd();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#09090B] to-[#1c1c24]">
      <h1 className="mb-5 text-center">Find Your Link</h1>
      <div className="w-full max-w-sm">
        {userData?.id !== undefined ? (
          <div className="relative h-[550px] w-full max-w-sm mx-auto">
            {/* Show a small spinner in the corner if still loading, but always show MatchStack */}
            {isLoading && (
              <div className="absolute top-2 right-2 z-10">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#7C3AED]"></div>
              </div>
            )}
            <MatchStack profiles={filteredProfilesBasedOnDistance || []} currentUserId={userData.id} />
          </div>
        ) : (
          <div className="relative h-[550px] w-full max-w-sm mx-auto">
            <div className="relative h-[550px] w-full max-w-sm mx-auto mb-4">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181B] bg-opacity-100 rounded-xl backdrop-blur-sm p-6 text-center">
                  <UserCheck className="w-16 h-16 text-[#7C3AED] mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Complete Profile</h3>
                  <p className="text-gray-400 mb-2">
                    In order for being able to match you have to complete your profile first.
                  </p>
                  <Button
                    className="bg-transparent border-indigo-500"
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/profile")}>
                    <ArrowRight />
                    Profile
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
