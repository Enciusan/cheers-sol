"use server";

import { createClient } from "@/lib/initSupabaseServerClient";
import { PublicKey } from "@solana/web3.js";
import "server-only";
import { verifyAuth } from "./serverAuth";

export const getUser = async (walletAddress: PublicKey | string) => {
  const supabase = await createClient();
  try {
    console.log(walletAddress);

    let bufferKey;
    if (typeof walletAddress === "string") {
      bufferKey = walletAddress;
    } else {
      bufferKey = walletAddress.toBase58();
    }
    bufferKey = new PublicKey(bufferKey);
    bufferKey = Buffer.from(bufferKey.toBytes()).toString("hex");
    console.log(bufferKey);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, wallet_address, bio, age, drinks")
      .eq("wallet_address", bufferKey)
      .single();

    if (error) {
      console.error("Error fetching profile in userFunc:", error);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

export const getAppUserForMatch = async (walletAddress: PublicKey | string) => {
  const supabase = await createClient();

  let bufferKey;
  try {
    // Use the wallet address string directly instead of converting to PublicKey
    if (typeof walletAddress === "string") {
      bufferKey = walletAddress;
    } else {
      bufferKey = walletAddress.toBase58();
    }
    bufferKey = new PublicKey(bufferKey);
    bufferKey = Buffer.from(bufferKey.toBytes()).toString("hex");
    const { data: userData } = await supabase.from("profiles").select("id").eq("wallet_address", bufferKey).single();
    console.log(userData);

    if (!userData) return;

    const { data: swipes } = await supabase.from("swipes").select("swiped_id").eq("swiper_id", userData.id);
    console.log(swipes);
    const swipedIds = swipes?.map((swipe) => swipe.swiped_id) || [];

    const query = supabase.from("profiles").select("*").neq("id", userData.id);

    // Only add the not-in filter if there are swiped profiles
    if (swipedIds.length > 0) {
      query.not("id", "in", `(${swipedIds.join(",")})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

export const createOrUpdateProfile = async (profileData: {
  walletAddress: string;
  username: string;
  bio: string;
  age: number;
  drinks: string[];
}) => {
  const supabase = await createClient();

  try {
    // Verify authentication
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== profileData.walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    // Convert wallet address to the format used in the database
    const publicKey = new PublicKey(profileData.walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("wallet_address", bufferKey)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error checking profile existence:", fetchError);
      return { success: false, error: "Failed to check if profile exists" };
    }

    let result;

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: profileData.username,
          bio: profileData.bio,
          age: profileData.age,
          drinks: profileData.drinks,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProfile.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return { success: false, error: "Failed to update profile" };
      }

      result = { success: true, id: existingProfile.id };
    } else {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            wallet_address: bufferKey,
            username: profileData.username,
            bio: profileData.bio,
            age: profileData.age,
            drinks: profileData.drinks,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError);
        return { success: false, error: "Failed to create profile" };
      }

      result = { success: true, id: newProfile?.id };
    }

    return result;
  } catch (error: any) {
    console.error("Error in createOrUpdateProfile:", error);
    return {
      success: false,
      error: error.message || "An error occurred while saving the profile",
    };
  }
};
