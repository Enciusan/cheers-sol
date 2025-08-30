import { auth } from "@civic/auth-web3/nextjs/middleware";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { createClient } from "./lib/initSupabaseServerClient";

const PUBLIC_ROUTES = [
  "/",
  // Exclude Civic auth endpoints
  "/api/auth/challenge",
  "/api/auth/callback",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/logoutcallback",
];

const withCivicAuth = auth();

async function middleware2(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("Middleware path:", pathname);

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const payload = await verifyToken(sessionToken);

    if (!payload || !payload.wallet) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const hasUserData = await checkUserHasProfile(payload.wallet);
    if (!hasUserData && pathname !== "/profile") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Authentication error in middleware:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

function testMiddleware(request: NextRequest) {
  console.log("Test middleware executed for path:", request.nextUrl.pathname);
  return NextResponse.next();
}

async function checkUserHasProfile(walletAddress: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const bufferKey = Buffer.from(new PublicKey(walletAddress).toBytes()).toString("hex");

    const { data, error } = await supabase.from("profiles").select("id").eq("wallet_address", bufferKey).single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
}

// Civic auth middleware runs first, for now all app paths are excluded from Civic authentication in next.config.mjs
export default withCivicAuth(testMiddleware);

// Not sure if this has any effect
export const config = {
  matcher: [
    "/", 
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\.jpg|.*\.png|.*\.svg|.*\.gif).*)",
    // Exclude Civic auth endpoints
    "/api/auth/(.*)"
  ]
};