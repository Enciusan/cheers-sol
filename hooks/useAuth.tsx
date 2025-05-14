"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import bs58 from "bs58";
import { authenticate, createAuthMessage, isAuthorized, signOut, verifyAuth } from "@/api/serverAuth";

export const useAuth = () => {
  const { publicKey, signMessage } = useWallet();

  const authenticateWithWallet = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error("Wallet not connected");
    }

    try {
      // First check if already authorized
      const authorized = await isAuthorized(publicKey.toString());

      if (authorized) {
        return { success: true };
      }

      // If not authorized, perform the authorization flow
      return await performAuthorization();
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }, [publicKey, signMessage]);

  const performAuthorization = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error("Wallet not connected");
    }

    try {
      // Get the auth message with nonce from server
      const message = await createAuthMessage(publicKey.toString());

      // Request signature from wallet
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      // Convert signature to base58 for transmission
      const signatureBase58 = bs58.encode(signature);

      // Call authenticate with the message, signature, and public key
      return await authenticate(message, signatureBase58, publicKey.toString());
    } catch (error) {
      console.error("Authorization error:", error);
      throw error;
    }
  }, [publicKey, signMessage]);

  const verifyAuthentication = useCallback(async () => {
    try {
      return await verifyAuth();
    } catch (error) {
      console.error("Verification error:", error);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log("Signing out...");
      return await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, []);

  return { authenticateWithWallet, verifyAuthentication, logout };
};
