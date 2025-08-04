import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { createClient } from "./lib/initSupabaseServerClient";
import { PublicKey } from "@solana/web3.js";
import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";

const PUBLIC_ROUTES = ["/", "/civicAuth"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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

export default authMiddleware();

export const config = {
  matcher: [
    "/links",
    "/profile",
    "/missions",
    "/chat",
    "/settings",
    "/referral",
    "/civicAuth",
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\.jpg|.*\.png|.*\.svg|.*\.gif).*)",
  ],
};
