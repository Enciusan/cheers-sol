"use client";
import { checkDailyLogin } from "@/api/missionFunctions";
import { isAuthorized } from "@/api/serverAuth";
import { addOrUpdateUserCommunities, addOrUpdateUserLocationServer } from "@/api/userFunctions";
import { useAuth } from "@/hooks/useAuth";
import { useUsersStore, useUserStore } from "@/store/user";
import { connection } from "@/utils/clientFunctions";
import { getAssetsByOwner } from "@/utils/serverFunctions";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState, useCallback } from "react";

const PUBLIC_ROUTES = ["/"];

export const ProtectedRoutesWrapper = ({ children }: { children: ReactNode }) => {
  const { publicKey, disconnecting, disconnect, connected } = useWallet();
  const { logout, authenticateWithWallet } = useAuth();
  const { clearUserData, fetchUserProfile, userData } = useUserStore();
  const { fetchProfiles, fetchUsersLocation } = useUsersStore();
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Memoized authentication function
  const performAuthentication = useCallback(async () => {
    if (!publicKey) {
      setIsAuthenticated(false);
      clearUserData();
      return false;
    }

    try {
      const authResult = await isAuthorized(publicKey.toString());
      console.log("Auth result:", authResult);

      if (authResult) {
        console.log("User is authenticated");
        setIsAuthenticated(true);
        return true;
      } else {
        console.log("User not authenticated, attempting authentication...");
        const authResponse = await authenticateWithWallet();
        console.log(authResponse);

        if (authResponse && authResponse.success) {
          console.log("Authentication successful");
          setIsAuthenticated(true);
          return true;
        } else {
          console.log("Authentication failed");
          setIsAuthenticated(false);
          clearUserData();
          return false;
        }
      }
    } catch (error) {
      console.error("Authentication verification failed:", error);
      setIsAuthenticated(false);
      clearUserData();
      return false;
    }
  }, [publicKey, authenticateWithWallet, clearUserData]);

  useEffect(() => {
    console.log("UserInitializer useEffect disconnecting value:", disconnecting);

    const handleWalletState = async () => {
      if (disconnecting) {
        disconnect();
        logout();
        setIsAuthenticated(false);
        setAuthAttempted(false);
        setIsInitializing(false);
        clearUserData();
        return;
      }

      if (connected && publicKey) {
        setIsInitializing(true);
        const authSuccess = await performAuthentication();
        setAuthAttempted(true);
        setIsInitializing(false);
      } else if (!connected) {
        setIsAuthenticated(false);
        setAuthAttempted(true);
        setIsInitializing(false);
        clearUserData();
      }
    };

    handleWalletState();
  }, [publicKey, disconnecting, connected, performAuthentication, disconnect, logout, clearUserData]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && publicKey && !userData) {
        try {
          console.log("Fetching user profile...");
          await fetchUserProfile(publicKey.toBase58());
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    if (authAttempted && isAuthenticated) {
      loadUserProfile();
    }
  }, [isAuthenticated, publicKey, authAttempted, userData, fetchUserProfile]);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (isAuthenticated && publicKey && connection) {
        try {
          console.log("Fetching communities...");
          const com2 = await getAssetsByOwner(publicKey.toBase58());
          await addOrUpdateUserCommunities(com2, publicKey.toBase58());
        } catch (error) {
          console.error("Error fetching communities:", error);
        }
      }
    };

    if (isAuthenticated && publicKey) {
      fetchCommunities();
    }
  }, [isAuthenticated, publicKey, connection]);

  useEffect(() => {
    const loadAdditionalData = async () => {
      if (isAuthenticated && userData && publicKey) {
        try {
          console.log("Fetching additional user data...");

          // Fetch profiles first
          console.log("Fetching profiles...");
          await fetchProfiles(publicKey.toBase58());

          // Then fetch user locations
          console.log("Fetching user locations...");
          await fetchUsersLocation(publicKey.toBase58());

          // Finally check daily login
          console.log("Checking daily login...");
          await checkDailyLogin(publicKey.toBase58());

          console.log("All additional data fetched successfully");
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      }
    };

    if (isAuthenticated && userData) {
      loadAdditionalData();
    }
  }, [isAuthenticated, userData, publicKey, fetchProfiles, fetchUsersLocation]);

  useEffect(() => {
    const addOrUpdateUserLocation = () => {
      if (isAuthenticated && userData && publicKey) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude, accuracy } = position.coords;
              const radius = 0;
              await addOrUpdateUserLocationServer({ latitude, longitude, accuracy, radius }, publicKey.toBase58());
            } catch (error) {
              console.error("Error updating user location:", error);
            }
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

  useEffect(() => {
    if (isInitializing || !authAttempted) {
      return;
    }

    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      console.log("Redirecting to landing page - not authenticated");
      router.replace("/");
      return;
    }

    if (isAuthenticated && userData === null && pathname !== "/profile") {
      console.log("Redirecting to profile - no user data");
      router.replace("/profile");
      return;
    }

    if (isAuthenticated && userData !== null && pathname === "/") {
      console.log("Redirecting to matches - authenticated with user data");
      router.replace("/matches");
      return;
    }
  }, [isAuthenticated, authAttempted, userData, pathname, router, isInitializing]);


  // WIP loading page
  // if (isInitializing) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7C3AED]"></div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
};
