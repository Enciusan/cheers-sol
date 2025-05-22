import { cookies } from "next/headers";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as jose from "jose";

// JWT secret should be stored in environment variables
const sessionKey = new TextEncoder().encode(process.env.JWT_SECRET) || "";

export type JWTPayload = {
  wallet: string;
};

/*** Verify a Solana message signature*/
export function verifySignature(message: string, signature: Uint8Array, publicKey: PublicKey): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageBytes, signature, publicKey.toBytes());
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * Generate a JWT token for an authenticated user
 */
export async function generateToken(payload: JWTPayload, expires: string | number | Date = "7d"): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(sessionKey);
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, sessionKey, { algorithms: ["HS256"] });
    return payload as JWTPayload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function sessionCreate(wallet: string, expires: number = 7 * 24 * 60 * 60): Promise<void> {
  const expiresAt = new Date(Date.now() + expires * 1000);
  const session = await generateToken({ wallet: wallet }, expiresAt);

  cookies().set("session_token", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Get the JWT token from cookies
 */
export function getTokenFromCookies(): string | undefined {
  return cookies().get("session_token")?.value;
}
/**
 * Get the current authenticated user from the JWT token
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = getTokenFromCookies();
  if (!token) return null;

  return await verifyToken(token);
}
