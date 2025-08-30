import { NextRequest, NextResponse } from "next/server";
import { handler } from "@civic/auth-web3/nextjs";

// const civic = handler();

// export const GET = civic;

export async function GET(req: NextRequest) {
  try {
    console.log("Civic GET request received");
    return await handler()(req);
  } catch (e) {
    console.error("Civic GET error:", e);
    return NextResponse.json({ error: "Civic GET failed" }, { status: 500 });
  }
}
