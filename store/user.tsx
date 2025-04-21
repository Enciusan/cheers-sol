"use client";
import { useEffect } from "react";
import { Profile } from "@/utils/types";
import { create } from "zustand";
import { getAppUserForMatch, getUser } from "@/api/userFunctions";
import { PublicKey } from "@solana/web3.js";

type UserStore = {
  userData: Profile | null;
  updateUserData: (userData: Profile) => void;
  fetchUserProfile: (walletAddress: string) => Promise<void>;
  clearUserData: () => void;
};

type UsersStore = {
  profiles: Profile[] | null;
  updateProfiles: (profiles: Profile[]) => void;
  fetchProfiles: (walletAddress: string) => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  userData: null,
  updateUserData: (userData) => set({ userData }),
  fetchUserProfile: async (walletAddress: string) => {
    try {
      const data = await getUser(walletAddress);
      console.log(data);

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
  updateProfiles: (profiles) => set({ profiles }),
  fetchProfiles: async (walletAddress: string) => {
    try {
      const data = await getAppUserForMatch(walletAddress);
      // console.log(data);

      if (data) {
        set({ profiles: data as Profile[] });
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
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

export const useInitializeUsers = (walletAddress: PublicKey | null) => {
  const fetchProfiles = useUsersStore((state) => state.fetchProfiles);

  useEffect(() => {
    if (walletAddress) {
      fetchProfiles(walletAddress.toBase58());
    }
  }, [walletAddress, fetchProfiles]);
};
