"use client";
import { updateUserDistances } from "@/api/userFunctions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUsersStore } from "@/store/user";
import { getAllDomains } from "@/utils/allDomainsGetDomains";
import { AddressAndDomain, NameAccountAndDomain } from "@onsol/tldparser";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function Settings() {
  const { publicKey } = useWallet();
  const { usersLocations, fetchUsersLocation } = useUsersStore();
  const [userDistance, setUserDistance] = useState<number>(0);
  const [adDomains, setADDomains] = useState<NameAccountAndDomain[] | AddressAndDomain[]>([]);
  const getUserDistance = () => {
    if (usersLocations && publicKey) {
      const userLocation = usersLocations.find((location) => location.walletAddress === publicKey.toBase58());
      if (userLocation) {
        setUserDistance(userLocation.radius);
      }
    }
  };

  useEffect(() => {
    getUserDistance();
    if (publicKey) {
      (async () => {
        const domains = await getAllDomains(publicKey.toBase58());
        console.log(domains);

        // setADDomains(domains);
      })();
    }
  }, [usersLocations, publicKey]);

  return (
    <div className="flex justify-center items-center min-h-screen px-2 sm:px-4 sm:pb-0 pb-20">
      <Card className="w-full max-w-[450px] min-h-[20rem] mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-lg sm:text-xl">Settings</span>
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
            <div className="w-full text-start py-4">
              <h3>Choose your domain</h3>
              <p className="text-sm text-gray-400">You can opt to use your domain name</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
