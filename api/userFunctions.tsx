"use server";

import { createClient } from "@/lib/initSupabaseServerClient";
import { LocationType } from "@/utils/types";
import { PublicKey } from "@solana/web3.js";
import "server-only";
import { verifyAuth } from "./serverAuth";

const getWeekStart = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};
const getWeekEnd = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? 0 : 7);
  const sunday = new Date(now.setDate(diff));
  sunday.setHours(23, 59, 59, 999);
  return sunday.toISOString();
};

const get30DaysAgo = (): string => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return thirtyDaysAgo.toISOString();
};

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

    // const cachedQuery = unstable_cache(
    //   async (key: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, wallet_address, bio, age, drinks, communities, profileImage, myReferral, referralUsed, gainedXP, hasADDomainChecked, hasSNSDomainChecked, allDomainName, snsName, connected_at, created_at"
      )
      .eq("wallet_address", bufferKey)
      .single();

    if (error) {
      console.error("Error fetching profile in userFunc:", error);
      return null;
    }
    return data;
    //   },
    //   [`user-profile-${bufferKey}`],
    //   {
    //     revalidate: 300,
    //     tags: [`user-${bufferKey}`, "profiles"],
    //   }
    // );

    // return data;
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
    // console.log(swipes);
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

    return { success: true, matches: data };
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
            profileImage: null,
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
    let referralExist = false;
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("wallet_address", bufferKey)
      .single();
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking profile existence:", fetchError);
      return { success: false, error: "Failed to check if profile exists" };
    }
    const { data: allReferrals, error: referralsError } = await supabase.from("profiles").select("myReferral");

    if (referralsError && referralsError.code !== "PGRST116") {
      console.error("Error checking referral existence:", referralsError);
      return { success: false, error: "Failed to check if referral exists" };
    }
    if (allReferrals) {
      const referral = allReferrals.find((referral) => referral.myReferral === referralCode);
      if (referral) {
        referralExist = true;
      }
    }
    if (existingProfile && referralExist) {
      const { data: existingReferral, error: fetchErrorReferral } = await supabase
        .from("profiles")
        .update({
          referralUsed: referralCode,
          referral_claimed_at: new Date().toISOString(),
        })
        .eq("wallet_address", bufferKey);
      if (fetchErrorReferral && fetchErrorReferral.code !== "PGRST116") {
        console.error("Error redeem referral:", fetchErrorReferral);
        return { success: false, error: "Failed to redeem referral" };
      } else {
        return { success: true, referralCode: existingReferral };
      }
    } else {
      return { success: false, error: "Failed to insert referral. Referral don't exist." };
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

export const setUserDomain = async (walletAddress: string, domain: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");
    if (domain.split(".")[1] !== "sol") {
      const { error: errorUpdatingUserDomain } = await supabase
        .from("profiles")
        .update({
          hasADDomainChecked: true,
          allDomainName: domain,
        })
        .eq("wallet_address", bufferKey);
      if (errorUpdatingUserDomain) {
        console.error("Error updating user domain:", errorUpdatingUserDomain);
        return { success: false, error: "Failed to update active domain" };
      } else {
        return { success: true };
      }
    } else {
      const { error: errorUpdatingUserDomain } = await supabase
        .from("profiles")
        .update({
          hasSNSDomainChecked: true,
          snsName: domain,
        })
        .eq("wallet_address", bufferKey);
      if (errorUpdatingUserDomain) {
        console.error("Error updating user domain:", errorUpdatingUserDomain);
        return { success: false, error: "Failed to update active domain" };
      } else {
        return { success: true };
      }
    }
  } catch (error) {
    return { success: false, error: "Failed to update active domain" };
  }
};

export const setInactiveDomain = async (walletAddress: string, domain: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");
    if (domain.split(".")[1] !== "sol") {
      const { error: errorUpdatingUserDomain } = await supabase
        .from("profiles")
        .update({
          hasADDomainChecked: false,
          allDomainName: null,
        })
        .eq("wallet_address", bufferKey);
      if (errorUpdatingUserDomain) {
        console.error("Error inactivate user domain:", errorUpdatingUserDomain);
        return { success: false, error: "Failed to inactivate domain" };
      } else {
        return { success: true };
      }
    } else {
      const { error: errorUpdatingUserDomain } = await supabase
        .from("profiles")
        .update({
          hasSNSDomainChecked: false,
          snsName: null,
        })
        .eq("wallet_address", bufferKey);
      if (errorUpdatingUserDomain) {
        console.error("Error inactivate user domain:", errorUpdatingUserDomain);
        return { success: false, error: "Failed to inactivate domain" };
      } else {
        return { success: true };
      }
    }
  } catch (error) {
    return { success: false, error: "Failed to inactivate domain" };
  }
};

export const getReferralsAmount = async (walletAddress: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");
    const { data: referral, error: fetchError } = await supabase
      .from("profiles")
      .select("myReferral")
      .eq("wallet_address", bufferKey);
    if (fetchError) {
      console.error("Error personal referral code:", fetchError);
      return { success: false, error: "Failed to fetch personal referral code" };
    }
    const userReferral = referral[0]?.myReferral;
    console.log(userReferral);
    const { data: referrals, error: fetchTotalRefError } = await supabase
      .from("profiles")
      .select("referralUsed", {
        count: "exact",
      })
      .eq("referralUsed", userReferral);
    console.log(referrals);

    if (fetchTotalRefError) {
      console.error("Error fetching referrals:", fetchTotalRefError);
      return { success: false, error: "Failed to fetch referrals" };
    }
    return { success: true, referrals: referrals };
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return { success: false, error: "Failed to fetch referrals" };
  }
};

export const getLinksAmount = async (walletAddress: string, userId: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    const { data: links, error: fetchError } = await supabase
      .from("matches")
      .select("id", {
        count: "exact",
      })
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    if (fetchError) {
      console.error("Error fetching links:", fetchError);
      return { success: false, error: "Failed to fetch links" };
    }
    return { success: true, links: links };
  } catch (error) {
    console.error("Error fetching links amount:", error);
    return { success: false, error: "Failed to fetch links" };
  }
};
export const getWeeklyReferralsAmount = async (walletAddress: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    const { data: referral, error: fetchError } = await supabase
      .from("profiles")
      .select("myReferral")
      .eq("wallet_address", bufferKey);

    if (fetchError) {
      console.error("Error personal referral code:", fetchError);
      return { success: false, error: "Failed to fetch personal referral code" };
    }

    const userReferral = referral[0]?.myReferral;
    if (!userReferral) {
      return { success: true, referrals: [] };
    }

    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    const { data: referrals, error: fetchWeeklyRefError } = await supabase
      .from("profiles")
      .select("referralUsed, created_at", {
        count: "exact",
      })
      .eq("referralUsed", userReferral)
      .gte("referral_claimed_at", weekStart)
      .lte("referral_claimed_at", weekEnd);

    if (fetchWeeklyRefError) {
      console.error("Error fetching weekly referrals:", fetchWeeklyRefError);
      return { success: false, error: "Failed to fetch weekly referrals" };
    }

    return { success: true, referrals: referrals };
  } catch (error) {
    console.error("Error fetching weekly referrals:", error);
    return { success: false, error: "Failed to fetch weekly referrals" };
  }
};

export const getMonthlyLinksAmount = async (walletAddress: string, userId: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const thirtyDaysAgo = get30DaysAgo();

    const { data: links, error: fetchError } = await supabase
      .from("matches")
      .select("id, created_at", {
        count: "exact",
      })
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .gte("created_at", thirtyDaysAgo);

    if (fetchError) {
      console.error("Error fetching monthly links:", fetchError);
      return { success: false, error: "Failed to fetch monthly links" };
    }

    return { success: true, links: links };
  } catch (error) {
    console.error("Error fetching monthly links amount:", error);
    return { success: false, error: "Failed to fetch monthly links" };
  }
};
