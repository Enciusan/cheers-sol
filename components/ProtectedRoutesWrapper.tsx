"use client";
import { checkDailyLogin } from "@/api/missionFunctions";
import { isAuthorized } from "@/api/serverAuth";
import { addOrUpdateUserCommunities, addOrUpdateUserLocationServer } from "@/api/userFunctions";
import { useAuth } from "@/hooks/useAuth";
import { useUsersStore, useUserStore } from "@/store/user";
import { getAssetsByOwner } from "@/utils/serverFunctions";
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/"];

export const ProtectedRoutesWrapper = ({ children }: { children: ReactNode }) => {
  const { publicKey, disconnecting, disconnect, connected, wallet } = useWallet();
  const { user } = useUser();
  const { logout, authenticateWithWallet } = useAuth();
  const { clearUserData, fetchUserProfile, userData, isDataLoaded } = useUserStore();
  const { fetchProfiles, fetchUsersLocation } = useUsersStore();
  const pathname = usePathname();
  const router = useRouter();
  const userContext = useUser();

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

  const afterLogin = async () => {
    console.log("sunt in createWallet");

    if (userContext.user && !userHasWallet(userContext)) {
      await userContext.createWallet();
    }
  };

  useEffect(() => {
    if (userContext.user) {
      afterLogin();
    }
  }, [userContext.user, performAuthentication, connected, disconnect]);

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
        if (authSuccess) {
          setIsAuthenticated(true);
        }
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
    const fetchCommunities = async () => {
      if (isAuthenticated && publicKey && !userData) {
        console.log("Aici");
        (async () => {
          console.log("Acolo");
          await Promise.all([
            fetchUserProfile(publicKey.toBase58()),
            getAssetsByOwner(publicKey.toBase58()).then((coms) =>
              addOrUpdateUserCommunities(coms, publicKey.toBase58())
            ),
          ]);
          console.log("Dincolo");
        })();
      }
    };

    fetchCommunities();
  }, [isAuthenticated, publicKey, isDataLoaded, authAttempted, fetchUserProfile]);

  useEffect(() => {
    let cancelled = false;
    const loadAdditionalData = async () => {
      if (publicKey === null) return;
      console.log("Sunt in loadProfile", isAuthenticated, userData, publicKey);
      if (isAuthenticated && userData && connected) {
        console.log("Sunt in if loadProfile");
        try {
          console.log("Fetching additional user data...");
          await fetchProfiles(publicKey.toBase58());
          if (cancelled) return;
          console.log("Fetched profiles");

          await fetchUsersLocation(publicKey.toBase58());
          if (cancelled) return;
          console.log("Fetched user locations");

          await checkDailyLogin(publicKey.toBase58());
          if (cancelled) return;
          console.log("Checked daily login");

          console.log("All additional data fetched successfully");
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      }
    };

    if (isAuthenticated && userData) {
      console.log("Triggering loadAdditionalData");
      loadAdditionalData();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isDataLoaded, publicKey, userData]);

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
  }, [isAuthenticated, isDataLoaded, publicKey]);

  useEffect(() => {
    if (isInitializing || !authAttempted) {
      return;
    }
    if (isDataLoaded) {
      if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace("/");
        return;
      }

      if (isAuthenticated && userData !== null && pathname === "/") {
        router.replace("/links");
        return;
      }

      if (isAuthenticated && userData === null && pathname !== "/profile") {
        router.replace("/profile");
        return;
      }
    }
  }, [isAuthenticated, userData, pathname, router, authAttempted, wallet]);

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
