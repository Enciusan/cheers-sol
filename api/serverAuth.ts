"use server";

import { sessionCreate, verifyToken } from "@/lib/jwt";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import nacl from "tweetnacl";
import "server-only";

// Simple in-memory cache for nonces
const nonceCache = new Map<string, { value: string; expiry: number }>();

// Helper function to clean expired nonces
function cleanExpiredNonces() {
  const now = Date.now();
  for (const [key, data] of nonceCache.entries()) {
    if (data.expiry < now) {
      nonceCache.delete(key);
    }
  }
}

export async function isAuthorized(publicKey: string): Promise<boolean> {
  const encryptedSession = cookies().get("session");
  if (typeof encryptedSession !== "undefined") {
    const session = await verifyToken(encryptedSession.value);
    if (typeof session !== "undefined" && session?.wallet === publicKey) {
      return true;
    }
  }
  return false;
}

export async function createAuthMessage(publicKey: string): Promise<string> {
  const nonce = randomUUID();
  // Store nonce in memory cache for 2 minutes (120000 ms)
  const expiry = Date.now() + 120000;
  nonceCache.set(`AUTH.nonce.${publicKey}`, { value: nonce, expiry });

  // Clean expired nonces
  cleanExpiredNonces();

  return `Please sign to confirm wallet ownership.\n${nonce}`;
}

export async function authenticate(message: string, signature: string, publicKey: string) {
  try {
    if (!message || !signature || !publicKey) {
      throw new Error("Missing required fields");
    }

    const walletPublicKey = new PublicKey(publicKey);
    const cachedNonce = nonceCache.get(`AUTH.nonce.${publicKey}`);

    if (!cachedNonce || cachedNonce.expiry < Date.now()) {
      nonceCache.delete(`AUTH.nonce.${publicKey}`);
      // More descriptive error message
      throw new Error("Authentication session expired. Please try connecting your wallet again.");
    }

    const nonce = cachedNonce.value;
    const expectedMessage = `Please sign to confirm wallet ownership.\n${nonce}`;
    if (message !== expectedMessage) {
      throw new Error("Invalid message");
    }

    const signatureBytes = bs58.decode(signature);
    const verified = nacl.sign.detached.verify(Buffer.from(message), signatureBytes, walletPublicKey.toBuffer());

    if (!verified) {
      throw new Error("Invalid signature");
    }

    // Create session
    await sessionCreate(publicKey);

    // Clean up the used nonce
    nonceCache.delete(`AUTH.nonce.${publicKey}`);

    return { success: true };
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    cookies().delete("session_token");
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export async function verifyAuth() {
  try {
    const token = cookies().get("session_token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.wallet) return null;

    return {
      wallet_address: payload.wallet,
    };
  } catch (error) {
    console.error("Error verifying auth:", error);
    return null;
  }
}
