"use client";

import MatchStack from "@/components/MatchCard/match-stack";
import { Button } from "@/components/ui/button";
import { useUsersStore, useUserStore } from "@/store/user";
import { calculateDistance } from "@/utils/clientFunctions";
import { Profile } from "@/utils/types";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MatchesPage() {
  const { userData } = useUserStore();
  const { profiles, usersLocations } = useUsersStore();
  const [filteredByDistanceProfiles, setFilteredByDistanceProfiles] = useState<Profile[]>([]);
  // const { isAuthenticated } = useAuth();
  const router = useRouter();

  const filteredProfilesBasedOnDistance = () => {
    // console.log(userData, profiles, usersLocations);
    if (!userData || !profiles || !usersLocations) {
      setFilteredByDistanceProfiles([]);
      return;
    }

    const myLocation = usersLocations.find((location) => location.walletAddress === userData.walletAddress);

    if (!myLocation) {
      setFilteredByDistanceProfiles([]);
      return;
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
      // console.log(distance);

      if (distance === undefined) {
        return;
      }
      return myLocation.radius === 0 ? true : distance <= myLocation.radius;
    });

    setFilteredByDistanceProfiles(filteredProfiles);
  };

  useEffect(() => {
    // console.log("userData", userData, profiles, usersLocations);

    if (userData && profiles && usersLocations) {
      filteredProfilesBasedOnDistance();
    }
  }, [userData, profiles, usersLocations]);

  const isLoading = !userData || !profiles || profiles.length === 0 || !usersLocations || usersLocations.length === 0;
  // console.log(filteredByDistanceProfiles);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#09090B] to-[#1c1c24]">
      <h1 className="mb-5 text-center">Find Your Match</h1>
      <div className="w-full max-w-sm">
        {userData !== null ? (
          isLoading ? (
            // Show loading state while data is being fetched
            <div className="relative h-[550px] w-full max-w-sm mx-auto flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7C3AED]"></div>
            </div>
          ) : (
            <MatchStack profiles={filteredByDistanceProfiles || []} currentUserId={userData.id} />
          )
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
