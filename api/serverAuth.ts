"use server";

import { sessionCreate, verifyToken } from "../lib/jwt";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import nacl from "tweetnacl";
import "server-only";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const NONCE_EXPIRY_MS = 120000; // 2 minutes
const NONCE_PREFIX = "AUTH.nonce.";

// Helper function to clean expired nonces
async function cleanExpiredNonces() {
  try {
    const pattern = `${NONCE_PREFIX}*`;
    const keys = await redis.keys(pattern);

    if (keys.length === 0) return;

    const now = Date.now();
    const pipeline = redis.pipeline();

    for (const key of keys) {
      const data = await redis.get(key);
      if (data && typeof data === "object" && "expiry" in data) {
        if ((data as any).expiry < now) {
          pipeline.del(key);
        }
      }
    }

    await pipeline.exec();
  } catch (error) {
    console.error("Error cleaning expired nonces:", error);
  }
}

export async function isAuthorized(publicKey: string): Promise<boolean> {
  const encryptedSession = cookies().get("session_token");
  if (typeof encryptedSession !== "undefined") {
    const session = await verifyToken(encryptedSession.value);
    if (typeof session !== "undefined" && session?.wallet === publicKey) {
      return true;
    }
  }
  return false;
}

export async function createAuthMessage(publicKey: string): Promise<string> {
  try {
    const nonce = randomUUID();
    const expiry = Date.now() + NONCE_EXPIRY_MS;
    const key = `${NONCE_PREFIX}${publicKey}`;

    // Store nonce in Redis with TTL (Time To Live)
    await redis.setex(
      key,
      Math.ceil(NONCE_EXPIRY_MS / 1000),
      JSON.stringify({
        value: nonce,
        expiry,
      })
    );

    // Clean expired nonces periodically
    cleanExpiredNonces();

    return `Please sign to confirm wallet ownership.\n${nonce}`;
  } catch (error) {
    console.error("Error creating auth message:", error);
    throw new Error("Failed to create authentication message");
  }
}

export async function authenticate(message: string, signature: string, publicKey: string) {
  try {
    if (!message || !signature || !publicKey) {
      throw new Error("Missing required fields");
    }

    const walletPublicKey = new PublicKey(publicKey);
    const key = `${NONCE_PREFIX}${publicKey}`;

    // Get nonce from Redis
    const cachedData = await redis.get(key);

    if (!cachedData) {
      throw new Error("Authentication session expired. Please try connecting your wallet again.");
    }

    let cachedNonce;
    try {
      cachedNonce = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
    } catch (parseError) {
      console.error("Error parsing cached nonce:", parseError);
      throw new Error("Invalid authentication session. Please try connecting your wallet again.");
    }

    // Check if nonce is expired
    if (!cachedNonce || !cachedNonce.expiry || cachedNonce.expiry < Date.now()) {
      // Clean up expired nonce
      await redis.del(key);
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

    // Clean up the used nonce from Redis
    await redis.del(key);

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

export async function cleanupExpiredNonces(): Promise<number> {
  try {
    const pattern = `${NONCE_PREFIX}*`;
    const keys = await redis.keys(pattern);

    if (keys.length === 0) return 0;

    const now = Date.now();
    let cleanedCount = 0;

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        let parsedData;
        try {
          parsedData = typeof data === "string" ? JSON.parse(data) : data;
        } catch {
          // Invalid data format, delete it
          await redis.del(key);
          cleanedCount++;
          continue;
        }

        if (!parsedData.expiry || parsedData.expiry < now) {
          await redis.del(key);
          cleanedCount++;
        }
      }
    }

    console.log(`Cleaned up ${cleanedCount} expired nonces`);
    return cleanedCount;
  } catch (error) {
    console.error("Error during nonce cleanup:", error);
    return 0;
  }
}
