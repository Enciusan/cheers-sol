"use client";
import { setInactiveDomain, setUserDomain, updateUserDistances } from "../../api/userFunctions";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { useUsersStore, useUserStore } from "../../store/user";
import { getMainDomain } from "../../utils/allDomainsGetDomains";
import { getSNSMainDomain } from "../../utils/snsGetDomain";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { userData, fetchUserProfile } = useUserStore();
  const { usersLocations, fetchUsersLocation } = useUsersStore();
  const [userDistance, setUserDistance] = useState<number>(0);
  const [adDomains, setADDomains] = useState<string>("");
  const [snsDomain, setSNSDomain] = useState<string>("");

  const getUserDistance = () => {
    if (usersLocations && publicKey) {
      const userLocation = usersLocations.find((location) => location.walletAddress === publicKey.toBase58());
      if (userLocation) {
        setUserDistance(userLocation.radius);
      }
    }
  };

  const handleChooseADDomain = async (isChecked: boolean) => {
    console.log(isChecked);

    if (publicKey) {
      if (isChecked) {
        const { success, error } = await setUserDomain(publicKey.toBase58(), adDomains);
        const { success: inactiveSuccess, error: inactiveError } = await setInactiveDomain(
          publicKey.toBase58(),
          snsDomain + ".sol"
        );
        if (error || inactiveError) return;
        if (success && inactiveSuccess) {
          toast.success("Domain set");
          fetchUserProfile(publicKey.toBase58());
          return true;
        } else {
          return false;
        }
      } else {
        const { success: inactiveSuccess, error: inactiveError } = await setInactiveDomain(
          publicKey.toBase58(),
          adDomains
        );
        if (inactiveError) return;
        if (inactiveSuccess) {
          toast.success("Domain unset");
          fetchUserProfile(publicKey.toBase58());
          return false;
        }
      }
    }
  };

  const handleChooseSNSDomain = async (isChecked: boolean) => {
    if (publicKey) {
      if (isChecked) {
        const { success, error } = await setUserDomain(publicKey.toBase58(), snsDomain + ".sol");
        const { success: inactiveSuccess, error: inactiveError } = await setInactiveDomain(
          publicKey.toBase58(),
          adDomains
        );
        if (error || inactiveError) return;
        if (success && inactiveSuccess) {
          toast.success("Domain set");
          fetchUserProfile(publicKey.toBase58());
          return true;
        } else {
          return false;
        }
      } else {
        const { success: inactiveSuccess, error: inactiveError } = await setInactiveDomain(
          publicKey.toBase58(),
          adDomains
        );
        if (inactiveError) return;
        if (inactiveSuccess) {
          toast.success("Domain unset");
          fetchUserProfile(publicKey.toBase58());
          return false;
        }
      }
    }
  };

  useEffect(() => {
    let fetched = false;
    if (fetched) return;
    getUserDistance();
    if (publicKey) {
      (async () => {
        // AllDomain DOMAIN
        const mainDomainResult = await getMainDomain(publicKey.toBase58());
        if (mainDomainResult) {
          setADDomains(mainDomainResult.domain + mainDomainResult.tld);
        } else {
          setADDomains("");
        }

        try {
          const snsDomain = await getSNSMainDomain(publicKey.toBase58());
          if (snsDomain) {
            setSNSDomain(snsDomain?.domain);
          } else {
            setSNSDomain("");
          }
        } catch (err) {
          console.log(err);
        }
      })();
    }
    return () => {
      fetched = true;
    };
  }, [usersLocations, publicKey]);
  // console.log(userData);

  return (
    <div className="flex justify-center items-center min-h-screen px-2 sm:px-4 sm:pb-0 pb-20">
      <Card className="w-full max-w-[450px] min-h-[20rem] mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <h1 className="text-3xl font-[chicle] tracking-wide">Settings</h1>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <div className="w-full">
              <Label htmlFor="name" className="text-base">
                Choose your distance
              </Label>
              <div className="flex justify-between pt-3 w-3/4">
                <Button
                  size="sm"
                  variant={"outline"}
                  className={`${userDistance == 3000 ? "bg-white/80 text-black" : ""}`}
                  onClick={() => {
                    if (userDistance !== 3000) {
                      updateUserDistances(publicKey ? publicKey.toBase58() : "", 3000);
                      fetchUsersLocation(publicKey ? publicKey.toBase58() : "");
                    } else {
                      return;
                    }
                  }}>
                  3km
                </Button>
                <Button
                  size="sm"
                  variant={"outline"}
                  className={`${userDistance == 5000 ? "bg-white/90 text-black" : ""}`}
                  onClick={() => {
                    if (userDistance !== 5000) {
                      updateUserDistances(publicKey ? publicKey.toBase58() : "", 5000);
                      fetchUsersLocation(publicKey ? publicKey.toBase58() : "");
                    } else {
                      return;
                    }
                  }}>
                  5km
                </Button>
                <Button
                  size="sm"
                  variant={"outline"}
                  className={`${userDistance == 0 ? "bg-white/90 text-black" : ""}`}
                  onClick={() => {
                    if (userDistance !== 0) {
                      updateUserDistances(publicKey ? publicKey.toBase58() : "", 0);
                      fetchUsersLocation(publicKey ? publicKey.toBase58() : "");
                    } else {
                      return;
                    }
                  }}>
                  No limit
                </Button>
              </div>
            </div>
            <div className="flex flex-col w-full text-start py-4 gap-2">
              <div>
                <h3>Choose your domain</h3>
                <p className="text-sm text-gray-400">You can opt to use your domain name</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="all-domains"
                    disabled={adDomains === ""}
                    checked={userData?.hasADDomainChecked}
                    onCheckedChange={(e) => handleChooseADDomain(e)}
                  />
                  <Label htmlFor="all-domains">All Domains</Label>
                  {adDomains === undefined && <p className="text-sm text-amber-300">*You don't have a domain</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sns"
                    disabled={snsDomain === ""}
                    checked={userData?.hasSNSDomainChecked}
                    onCheckedChange={(e) => handleChooseSNSDomain(e)}
                  />
                  <Label htmlFor="sns">SNS</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
