"use client";
import { useEffect } from "react";
import { Profile, UserLocation } from "@/utils/types";
import { create } from "zustand";
import { getAppUserForMatch, getUser, getUsersLocation } from "@/api/userFunctions";
import { PublicKey } from "@solana/web3.js";

type UserStore = {
  userData: Profile | null;
  updateUserData: (userData: Profile) => void;
  fetchUserProfile: (walletAddress: string) => Promise<void>;
  clearUserData: () => void;
};

type UsersStore = {
  profiles: Profile[] | null;
  usersLocations: UserLocation[] | null;
  updateProfiles: (profiles: Profile[]) => void;
  fetchProfiles: (walletAddress: string) => Promise<void>;
  fetchUsersLocation: (walletAddress: string) => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  userData: null,
  updateUserData: (userData) => set({ userData }),
  fetchUserProfile: async (walletAddress: string) => {
    try {
      const data = await getUser(walletAddress);
      // console.log(data);

      if (data) {
        set({
          userData: {
            id: data.id,
            username: data.username,
            walletAddress: walletAddress,
            bio: data.bio,
            age: data.age,
            drinks: data.drinks || [],
            communities: data.communities || [],
            profileImage: data.profileImage,
            myReferral: data.myReferral,
            referralUsed: data.referralUsed,
            gainedXP: data.gainedXP,
            hasDomainChecked: data.hasDomainChecked,
            allDomainName: data.allDomainName,
            snsName: data.snsName,
          },
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  },
  clearUserData: () => set({ userData: null }),
}));

export const useUsersStore = create<UsersStore>((set) => ({
  profiles: [],
  usersLocations: [],
  updateProfiles: (profiles) => set({ profiles }),
  fetchProfiles: async (walletAddress: string) => {
    try {
      console.log("Fetching profiles for", walletAddress);
      const data = await getAppUserForMatch(walletAddress);
      console.log("Profiles data received:", data);

      if (data) {
        const mappedProfiles = data?.map((profile: any) => ({
          id: profile.id,
          username: profile.username,
          walletAddress: new PublicKey(Buffer.from(profile.wallet_address, "hex")).toBase58(),
          bio: profile.bio,
          age: profile.age,
          drinks: profile.drinks,
          communities: profile.communities,
          profileImage: profile.profileImage,
          myReferral: profile.myReferral,
          referralUsed: profile.referralUsed,
          gainedXP: profile.gainedXP,
          hasDomainChecked: profile.hasDomainChecked,
          allDomainName: profile.allDomainName,
          snsName: profile.snsName,
        }));
        console.log("Mapped profiles:", mappedProfiles);
        set({ profiles: mappedProfiles });
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  },
  fetchUsersLocation: async (walletAddress: string) => {
    try {
      const data = await getUsersLocation(walletAddress);
      // console.log(data);

      if (data.usersLocation) {
        set({
          usersLocations: data?.usersLocation.map((loc: any) => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            radius: loc.radius,
            updatedAt: loc.updated_at,
            walletAddress:
              typeof loc.wallet_address === "string" && loc.wallet_address.length === 64
                ? new PublicKey(Buffer.from(loc.wallet_address, "hex")).toBase58()
                : loc.wallet_address,
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching users location:", error);
    }
  },
}));

export const useInitializeUser = (walletAddress: PublicKey | null) => {
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);

  useEffect(() => {
    if (walletAddress) {
      fetchUserProfile(walletAddress.toBase58());
    }
  }, [walletAddress, fetchUserProfile]);
};
