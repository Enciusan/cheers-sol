"use client";
import { updateUserDistances } from "@/api/userFunctions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUsersStore } from "@/store/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function Settings() {
  const { publicKey } = useWallet();
  const { usersLocations, fetchUsersLocation } = useUsersStore();
  const [userDistance, setUserDistance] = useState<number>(0);
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
              <Label htmlFor="name" className="pl-1.5 text-base">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
