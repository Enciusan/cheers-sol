"use client";
import { addOrUpdateUserCommunities, addOrUpdateUserLocationServer } from "@/api/userFunctions";
import { useAuth } from "@/hooks/useAuth";
import { useUsersStore, useUserStore } from "@/store/user";
import { connection } from "@/utils/clientFunctions";
import { getAssetsByOwner } from "@/utils/serverFunctions";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/"];

export const ProtectedRoutesWrapper = ({ children }: { children: ReactNode }) => {
  const { publicKey, disconnecting, disconnect } = useWallet();
  const { verifyAuthentication, logout, authenticateWithWallet } = useAuth();
  const { clearUserData, fetchUserProfile, userData } = useUserStore();
  const { fetchProfiles, fetchUsersLocation } = useUsersStore();
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);

  // Handle authentication
  useEffect(() => {
    console.log("UserInitializer useEffect disconecting value:", disconnecting);

    const checkAuth = async () => {
      if (!publicKey) {
        setIsAuthenticated(false);
        clearUserData();
        return;
      }

      try {
        const authResult = await verifyAuthentication();
        console.log("Auth result:", authResult);

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
      disconnect();
      logout();
      setIsAuthenticated(false);
      setAuthAttempted(false);
      clearUserData();
    } else if (publicKey) {
      checkAuth();
    }
  }, [publicKey, disconnecting]);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (publicKey && connection) {
        const com2 = await getAssetsByOwner(publicKey.toBase58());

        await addOrUpdateUserCommunities(com2, publicKey?.toBase58());
        await fetchUserProfile(publicKey?.toBase58());
      }
    };
    fetchCommunities();
  }, [publicKey, connection]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && publicKey) {
        await fetchUserProfile(publicKey.toBase58());
        await fetchProfiles(publicKey.toBase58());
        await fetchUsersLocation(publicKey.toBase58());
      }
    };

    if (authAttempted) {
      loadUserProfile();
    }
  }, [isAuthenticated, publicKey, authAttempted]);

  useEffect(() => {
    if (authAttempted) {
      // If not authenticated and not on a public route, redirect to landing page
      if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace("/");
        return;
      }

      // If authenticated but no user data and not on the profile page, redirect to profile
      if (isAuthenticated && userData === null && pathname !== "/profile") {
        router.replace("/profile");
        return;
      }

      // If authenticated, has user data, and is on the landing page, redirect to matches
      if (isAuthenticated && userData !== null && pathname === "/") {
        router.replace("/matches");
        return;
      }
    }
  }, [isAuthenticated, authAttempted, userData, pathname, router]);

  useEffect(() => {
    const addOrUpdateUserLocation = () => {
      if (publicKey && userData) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const radius = 5000;
            await addOrUpdateUserLocationServer({ latitude, longitude, accuracy, radius }, publicKey.toBase58());
          },
          (error) => {
            console.error("Error getting user location:", error);
          }
        );
      }
    };

    if (isAuthenticated && userData) {
      addOrUpdateUserLocation();
    }
  }, [isAuthenticated, userData, publicKey]);

  return <>{children}</>;
};
