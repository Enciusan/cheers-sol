export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handler } from "@civic/auth-web3/nextjs";

const civic = handler();

export async function GET(req: NextRequest) {
  try {
    return await civic(req);
  } catch (e) {
    console.error("Civic GET error:", e);
    return NextResponse.json({ error: "Civic GET failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await civic(req);
  } catch (e) {
    console.error("Civic POST error:", e);
    return NextResponse.json({ error: "Civic POST failed" }, { status: 500 });
  }
}
