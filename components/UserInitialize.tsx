"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUsersStore, useUserStore } from "@/store/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export const UserInitializer = () => {
  const { publicKey, disconnecting } = useWallet();
  const { verifyAuthentication, logout, authenticateWithWallet } = useAuth();
  const { clearUserData, fetchUserProfile, userData } = useUserStore();
  const { profiles, fetchProfiles } = useUsersStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);

  // Handle authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!publicKey) {
        setIsAuthenticated(false);
        clearUserData();
        return;
      }

      try {
        const authResult = await verifyAuthentication();

        if (authResult && authResult.wallet_address === publicKey.toString()) {
          console.log("User is authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("User not authenticated, attempting authentication...");
          const authResponse = await authenticateWithWallet();

          if (authResponse && authResponse.success) {
            console.log("Authentication successful");
            setIsAuthenticated(true);
          } else {
            console.log("Authentication failed");
            setIsAuthenticated(false);
            clearUserData();
          }
        }
      } catch (error) {
        console.error("Authentication verification failed:", error);
        setIsAuthenticated(false);
        clearUserData();
      } finally {
        setAuthAttempted(true);
      }
    };

    if (disconnecting) {
      logout();
      setIsAuthenticated(false);
      setAuthAttempted(false);
      clearUserData();
    } else if (publicKey) {
      checkAuth();
    }
  }, [publicKey, disconnecting]);

  // Fetch user profile when authenticated
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && publicKey) {
        // console.log("Fetching user profile for:", publicKey.toBase58());
        await fetchUserProfile(publicKey.toBase58());
        await fetchProfiles(publicKey.toBase58());
        // console.log("Profile fetch completed, userData:", userData ? "exists" : "null");
        // console.log("Profile fetch completed, userData:", profiles ? "exists" : "null");
        console.log(isAuthenticated);
      }
    };

    if (authAttempted) {
      loadUserProfile();
    }
  }, [isAuthenticated, publicKey, authAttempted]);

  return null;
};
