"use server";

import "server-only";
import { createClient } from "@/lib/initSupabaseServerClient";
import { verifyAuth } from "./serverAuth";
import { PublicKey } from "@solana/web3.js";

export const getMissions = async (walletAddress: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const { data: missions, error: fetchError } = await supabase
      .from("missions")
      .select("id, title, mission, walletsSolvedMission, XPGainedPerMission, target");
    if (fetchError) {
      console.error("Error fetching missions:", fetchError);
      return { success: false, error: "Failed to fetch missions" };
    }
    return { success: true, missions: missions };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return { success: false, error: "Failed to fetch missions" };
  }
};

export const profileMissionDone = async (walletAddress: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    const { data: missions, error: fetchError } = await supabase.from("mission_progress_per_user").insert({
      wallet_address: bufferKey,
      mission_id: 1,
    });
    if (fetchError) {
      console.error("Error fetching missions:", fetchError);
      return { success: false, error: "Failed to fetch missions" };
    }
    return { success: true, missions: missions };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return { success: false, error: "Failed to fetch missions" };
  }
};
