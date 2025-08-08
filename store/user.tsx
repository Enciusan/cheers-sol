"use client";
import { useEffect } from "react";
import { Profile, UserLocation } from "../utils/types";
import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";
import { cleanupExpiredNonces } from "../api/serverAuth";
import { getAppUserForMatch, getUser, getUsersLocation } from "@/api/userFunctions";

type UserStore = {
  userData: Profile | null;
  isDataLoaded: boolean;
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
  isDataLoaded: false,
  updateUserData: (userData) => set({ userData }),
  fetchUserProfile: async (walletAddress: string) => {
    set({ isDataLoaded: false });
    try {
      const data = await getUser(walletAddress);
      console.log(data);

      if (data) {
        set({
          userData: {
            id: data.user?.id,
            username: data.user?.username,
            walletAddress: walletAddress,
            bio: data.user?.bio,
            age: data.user?.age,
            drinks: data.user?.drinks || [],
            communities: data.user?.communities || [],
            profileImage: data.user?.profileImage,
            myReferral: data.user?.myReferral,
            referralUsed: data.user?.referralUsed,
            gainedXP: data.user?.gainedXP,
            hasADDomainChecked: data.user?.hasADDomainChecked,
            hasSNSDomainChecked: data.user?.hasSNSDomainChecked,
            allDomainName: data.user?.allDomainName,
            snsName: data.user?.snsName,
            connectedAt: data.user?.connected_at,
            createdAt: data.user?.created_at,
          },
        });
        set({ isDataLoaded: true });
      } else {
        set({ userData: null });
        set({ isDataLoaded: true });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      set({ isDataLoaded: true });
    }
  },
  clearUserData: () => {
    cleanupExpiredNonces();
    set({ userData: null, isDataLoaded: false });
  },
}));

export const useUsersStore = create<UsersStore>((set) => ({
  profiles: [],
  usersLocations: [],
  updateProfiles: (profiles) => set({ profiles }),
  fetchProfiles: async (walletAddress: string) => {
    try {
      // console.log("Fetching profiles for", walletAddress);
      const data = await getAppUserForMatch(walletAddress);
      // console.log("Profiles data received:", data);

      if (data?.matches) {
        const mappedProfiles = data?.matches?.map((profile: any) => ({
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
          hasADDomainChecked: profile.hasADDomainChecked,
          hasSNSDomainChecked: profile.hasSNSDomainChecked,
          allDomainName: profile.allDomainName,
          snsName: profile.snsName,
          connectedAt: profile.connected_at,
          createdAt: profile.created_at,
        }));
        // console.log("Mapped profiles:", mappedProfiles);
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
