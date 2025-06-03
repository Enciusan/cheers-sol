"use server";

import { createClient } from "@/lib/initSupabaseServerClient";
import { PublicKey } from "@solana/web3.js";
import "server-only";
import { verifyAuth } from "./serverAuth";
import { LocationType } from "@/utils/types";

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
      .select(
        "id, username, wallet_address, bio, age, drinks, communities, profileImage, myReferral, referralUsed, gainedXP"
      )
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
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

export const getUsersLocation = async (walletAddress: PublicKey | string) => {
  const supabase = await createClient();

  let result;
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const { data, error } = await supabase.from("user_location").select("*");
    if (error) {
      console.error("Error fetching users location:", error);
      return { success: false, error: "Failed to fetch users location" };
    }
    result = { success: true, usersLocation: data };
  } catch (error: any) {
    console.error("Error in getUsersLocation:", error);
    return {
      success: false,
      error: error.message || "An error occurred while fetching users location",
    };
  }
  return result;
};

export const createOrUpdateProfile = async (profileData: {
  walletAddress: string;
  username: string;
  bio: string;
  age: number;
  drinks: string[];
  communities: string[];
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
          communities: profileData.communities,
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

export const addOrChangeProfileImage = async (imageUrl: string, walletAddress: string) => {
  const supabase = await createClient();
  try {
    console.log("addOrChangeProfileImage: Called with imageUrl:", imageUrl, "and walletAddress arg:", walletAddress); // Log entry and args
    const authorizedWallet = await verifyAuth();

    // Log the values being compared
    console.log("addOrChangeProfileImage: Result from verifyAuth():", authorizedWallet);
    console.log(
      "addOrChangeProfileImage: Comparing authorizedWallet.wallet_address:",
      authorizedWallet?.wallet_address,
      "with walletAddress arg:",
      walletAddress
    );

    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      // Log before returning the error
      console.error("addOrChangeProfileImage: Authentication check failed.");
      return { success: false, error: "Authentication required" };
    }

    // If auth passes, log success
    console.log("addOrChangeProfileImage: Authentication check passed.");

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    console.log("Checking profile existence for hex key:", bufferKey);

    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("wallet_address", bufferKey)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking profile existence:", fetchError);
      return { success: false, error: "Failed to check if profile exists" };
    }
    console.log("Existing profile", existingProfile);

    if (existingProfile) {
      // Update existing profile
      console.log(`Attempting to update profile ID: ${existingProfile.id} with image URL: ${imageUrl}`); // Add log
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          profileImage: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProfile.id)
        .select(); // Add .select() to get the updated data back (optional but helpful)

      // Log the result of the update attempt
      console.log("Update result data:", data);
      console.error("Update result error:", updateError); // Log any error explicitly

      if (updateError) {
        console.error("Error updating profile Image:", updateError);
        return { success: false, error: "Failed to update profile image" };
      }
      console.log("Profile image update successful for ID:", existingProfile.id); // Add success log
    } else {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase.from("profiles").insert({
        wallet_address: bufferKey,
        profileImage: imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(newProfile);

      if (insertError) {
        console.error("Error add profile image:", insertError);
        return { success: false, error: "Failed to add profile image" };
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

export const addOrUpdateUserCommunities = async (communities: string[], walletAddress: string) => {
  const supabase = await createClient();

  try {
    // Verify authentication
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, communities")
      .eq("wallet_address", bufferKey)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching profile:", fetchError);
      return { success: false, error: "Failed to fetch profile" };
    }

    let updatedCommunities: string[] = [];

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    if (!profile.communities || profile.communities.length === 0) {
      updatedCommunities = communities;
    } else {
      const currentCommunities = Array.isArray(profile.communities) ? profile.communities : [];
      updatedCommunities = Array.from(new Set([...currentCommunities, ...communities]));
    }

    // Only update if there are changes
    if (
      !profile.communities ||
      profile.communities.length !== updatedCommunities.length ||
      !profile.communities.every((c: string) => updatedCommunities.includes(c))
    ) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          communities: updatedCommunities,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Error updating communities:", updateError);
        return { success: false, error: "Failed to update communities" };
      }
    }

    return { success: true, communities: updatedCommunities };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

export const addOrUpdateUserLocationServer = async (location: LocationType, walletAddress: string) => {
  const supabase = await createClient();

  try {
    // Verify authentication
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, communities")
      .eq("wallet_address", bufferKey)
      .single();

    const { data: userLocation, error: fetchErrorUserLocation } = await supabase
      .from("user_location")
      .select("id, latitude, longitude, accuracy, radius")
      .eq("wallet_address", bufferKey)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching profile:", fetchError);
      return { success: false, error: "Failed to fetch profile" };
    }
    if (fetchErrorUserLocation && fetchErrorUserLocation.code !== "PGRST116") {
      console.error("Error fetching location:", fetchError);
      return { success: false, error: "Failed to fetch location" };
    }

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    const updatedLocation: LocationType = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      radius: location.radius,
    };
    if (profile && userLocation?.latitude) {
      const { error: updateError } = await supabase
        .from("user_location")
        .update({
          latitude: updatedLocation.latitude.toString(),
          longitude: updatedLocation.longitude.toString(),
          radius: updatedLocation.radius.toString(),
          accuracy: updatedLocation.accuracy.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("wallet_address", bufferKey);
    } else if (profile && !userLocation?.latitude) {
      const { data: insertLocationData, error: insertError } = await supabase.from("user_location").insert({
        wallet_address: bufferKey,
        latitude: updatedLocation.latitude.toString(),
        longitude: updatedLocation.longitude.toString(),
        radius: updatedLocation.radius.toString(),
        accuracy: updatedLocation.accuracy.toString(),
        updated_at: new Date().toISOString(),
      });
    }

    return { success: true, location: updatedLocation };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

export const updateUserDistances = async (walletAddress: string, radius: number) => {
  const supabase = await createClient();
  try {
    // Verify authentication
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");
    const { error: errorUpdatingUserDinstance } = await supabase
      .from("user_location")
      .update({
        radius: radius,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", bufferKey);
    if (errorUpdatingUserDinstance) {
      console.error("Error updating user distance:", errorUpdatingUserDinstance);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
  }
};

export const generateReferralCode = async (walletAddress: string, referralCode: string) => {
  const supabase = await createClient();
  try {
    // Verify authentication
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("wallet_address", bufferKey)
      .single();
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking profile existence:", fetchError);
      return { success: false, error: "Failed to check if profile exists" };
    }
    if (existingProfile) {
      const { data: existingReferral, error: fetchErrorReferral } = await supabase
        .from("profiles")
        .update({
          myReferral: referralCode,
        })
        .eq("wallet_address", bufferKey);
      if (fetchErrorReferral && fetchErrorReferral.code !== "PGRST116") {
        console.error("Error checking referral existence:", fetchErrorReferral);
        return { success: false, error: "Failed to check if referral exists" };
      } else {
        return { success: true, referralCode: existingReferral };
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to insert referral." };
  }
};

export const linkReferralCode = async (walletAddress: string, referralCode: string) => {
  const supabase = await createClient();
  try {
    // Verify authentication
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("wallet_address", bufferKey)
      .single();
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking profile existence:", fetchError);
      return { success: false, error: "Failed to check if profile exists" };
    }
    if (existingProfile) {
      const { data: existingReferral, error: fetchErrorReferral } = await supabase
        .from("profiles")
        .update({
          referralUsed: referralCode,
        })
        .eq("wallet_address", bufferKey);
      if (fetchErrorReferral && fetchErrorReferral.code !== "PGRST116") {
        console.error("Error redeem referral:", fetchErrorReferral);
        return { success: false, error: "Failed to redeem referral" };
      } else {
        return { success: true, referralCode: existingReferral };
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to insert referral." };
  }
};

export const getLevels = async (walletAddress: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const { data: levels, error: fetchError } = await supabase
      .from("levels")
      .select("id, name, startingFrom, endingAt, necessaryXP");
    if (fetchError) {
      console.error("Error fetching levels:", fetchError);
      return { success: false, error: "Failed to fetch levels" };
    }
    return { success: true, levels: levels };
  } catch (error) {
    console.error("Error fetching levels:", error);
    return { success: false, error: "Failed to fetch levels" };
  }
};

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
