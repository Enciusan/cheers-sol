"use client";
import { userHasWallet } from "@civic/auth-web3";
import { UserButton, useUser } from "@civic/auth-web3/react";

import { useEffect } from "react";

export const CivicAuthModal = () => {
  const { user } = useUser();
  const afterLogin = async () => {
    const userContext = await useUser();
    if (userContext.user && !userHasWallet(userContext)) {
      await userContext.createWallet();
    }
  };
  useEffect(() => {}, [user]);

  // if (!user) return null;
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      {!user ? (
        <>
          <h1>My App</h1>
          <UserButton />
        </>
      ) : (
        <h1>Userul: {user.email}</h1>
      )}
    </div>
  );
};
