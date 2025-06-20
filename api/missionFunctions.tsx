"use server";

import { createClient } from "@/lib/initSupabaseServerClient";
import { PublicKey } from "@solana/web3.js";
import "server-only";
import { verifyAuth } from "./serverAuth";

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

export const profileMissionDone = async (walletAddress: string, missionId: number) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    const { data: missions, error: insertError } = await supabase.from("mission_progress_per_user").insert({
      wallet_address: bufferKey,
      mission_id: missionId,
    });
    if (insertError) {
      console.error("Error inserting missions:", insertError);
      return { success: false, error: "Failed to fetch missions" };
    }
    return { success: true, missions: missions };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return { success: false, error: "Failed to fetch missions" };
  }
};

export const addWalletToMissionDone = async (walletAddress: string, missionId: number) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    const { data: missionWallets, error: fetchError } = await supabase
      .from("missions")
      .select("walletsSolvedMission")
      .eq("id", missionId)
      .single();

    if (fetchError) {
      console.error("Error fetching missions:", fetchError);
      return { success: false, error: "Failed to fetch missions" };
    }
    const currentWallets = missionWallets?.walletsSolvedMission || [];

    if (currentWallets.includes(bufferKey)) {
      return { success: false, error: "Wallet already added" };
    }

    const { data: missions, error: insertError } = await supabase
      .from("missions")
      .update({
        walletsSolvedMission: [...currentWallets, bufferKey],
      })
      .eq("id", missionId);

    if (insertError) {
      console.error("Error inserting missions:", insertError);
      return { success: false, error: "Failed to fetch missions" };
    }
    return { success: true, missions: missions };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return { success: false, error: "Failed to fetch missions" };
  }
};

export const getMatchCount = async (walletAddress: string, id: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const { data: totalMatches, error: fetchError } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${id},user2_id.eq.${id}`);
    if (fetchError) {
      console.error("Error fetching matches count:", fetchError);
      return { success: false, error: "Failed to fetch matches count" };
    }
    return { success: true, totalMatches: totalMatches };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return { success: false, error: "Failed to fetch matches count" };
  }
};

export const getReferralCount = async (walletAddress: string, refCode: string) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const { data: totalReferrals, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .or(`referralUsed.eq.${refCode}`);
    if (fetchError) {
      console.error("Error fetching referral count:", fetchError);
      return { success: false, error: "Failed to fetch referral count" };
    }
    return { success: true, totalReferrals: totalReferrals };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return { success: false, error: "Failed to fetch referral count" };
  }
};

export const checkDailyLogin = async (walletAddress: string) => {
  const supabase = await createClient();
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const publicKey = new PublicKey(walletAddress);
    const bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");

    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }

    const { data: lastLogin, error: fetchError } = await supabase
      .from("profiles")
      .select("connected_at")
      .eq("wallet_address", bufferKey)
      .single();

    if (fetchError) {
      console.error("Error fetching last login:", fetchError);
      return { success: false, error: "Failed to fetch last login" };
    }

    if (!lastLogin || !lastLogin.connected_at) {
      return { success: false, error: "No last login found" };
    }

    const lastLoginDate = new Date(lastLogin.connected_at);
    console.log(lastLoginDate.toString(), twentyFourHoursAgo.toString());

    if (lastLoginDate > twentyFourHoursAgo) {
      return { success: true, message: "Logged in within last 24h" };
    }

    // Update connected_at to now
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ connected_at: now.toISOString() })
      .eq("wallet_address", bufferKey);

    if (updateError) {
      console.error("Error updating connected_at:", updateError);
      return { success: false, error: "Failed to update login time" };
    }

    return { success: true, message: "Login refreshed after 24h" };
  } catch (error) {
    console.error("Error checking daily login:", error);
    return { success: false, error: "Internal server error" };
  }
};

export const checkConversationStarter = async (
  walletAddress: string,
  userId: string
): Promise<{
  success: boolean;
  initiatedConversation: boolean;
  multipleTexts: boolean;
  initiatedCount: number;
  mutualConversationCount: number;
}> => {
  const supabase = await createClient();

  try {
    // Get current time and 24 hours ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return {
        success: false,
        initiatedConversation: false,
        multipleTexts: false,
        initiatedCount: 0,
        mutualConversationCount: 0,
      };
    }

    // First, get all messages from the user in the last 24 hours
    const { data: userMessages, error: userMessagesError } = await supabase
      .from("messages")
      .select("match_id, created_at")
      .eq("sender_id", userId)
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .order("created_at", { ascending: true });

    if (userMessagesError) {
      console.error("Error fetching user messages:", userMessagesError);
      return {
        success: false,
        initiatedConversation: false,
        multipleTexts: false,
        initiatedCount: 0,
        mutualConversationCount: 0,
      };
    }

    if (!userMessages || userMessages.length === 0) {
      return {
        success: true,
        initiatedConversation: false,
        multipleTexts: false,
        initiatedCount: 0,
        mutualConversationCount: 0,
      };
    }

    // Group messages by matchId to get unique conversations
    const uniqueMatches = [...new Set(userMessages.map((msg) => msg.match_id))];
    let initiatedConversations = 0;
    let mutualConversations = 0;

    // For each match, check if the user's message was the first message in that match
    for (const matchId of uniqueMatches) {
      const { data: firstMessage, error: firstMessageError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (firstMessageError) {
        console.error(`Error fetching first message for match ${matchId}:`, firstMessageError);
        continue;
      }

      // If the first message in this match was sent by our user, they initiated it
      const userInitiated = firstMessage && firstMessage.sender_id === userId;
      if (userInitiated) {
        initiatedConversations++;
      }
      // Check if there's mutual conversation (both users sent messages)
      const { data: allMessagesInMatch, error: allMessagesError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("match_id", matchId);

      if (allMessagesError) {
        console.error(`Error fetching all messages for match ${matchId}:`, allMessagesError);
        continue;
      }

      if (allMessagesInMatch && allMessagesInMatch.length > 0) {
        const uniqueSenders = [...new Set(allMessagesInMatch.map((msg) => msg.sender_id))];

        // If there are messages from at least 2 different users (mutual conversation)
        if (uniqueSenders.length >= 2 && uniqueSenders.includes(userId)) {
          mutualConversations++;
        }
      }
    }

    return {
      success: true,
      initiatedConversation: initiatedConversations > 0,
      multipleTexts: mutualConversations > 0,
      initiatedCount: initiatedConversations,
      mutualConversationCount: mutualConversations,
    };
  } catch (error) {
    console.error("Error in checkConversationStarter:", error);
    return {
      success: false,
      initiatedConversation: false,
      multipleTexts: false,
      initiatedCount: 0,
      mutualConversationCount: 0,
    };
  }
};

export const userIncreaseXp = async (walletAddress: string, xp: number) => {
  const supabase = await createClient();
  try {
    const authorizedWallet = await verifyAuth();
    if (!authorizedWallet || authorizedWallet.wallet_address !== walletAddress) {
      return { success: false, error: "Authentication required" };
    }
    let publicKey = new PublicKey(walletAddress);
    let bufferKey = Buffer.from(publicKey.toBytes()).toString("hex");
    const { data: userXp, error: userXpGetError } = await supabase
      .from("profiles")
      .select("gainedXP")
      .eq("wallet_address", bufferKey)
      .single();
    if (userXpGetError) {
      console.error("Error fetching user XP:", userXpGetError);
      return { success: false, error: "Failed to fetch user XP" };
    }
    const newXP = userXp.gainedXP + xp;
    const { data, error } = await supabase.from("profiles").update({ gainedXP: newXP }).eq("wallet_address", bufferKey);
    if (error) {
      console.error("Error increasing XP:", error);
      return { success: false, error: "Failed to increase XP" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error increasing XP:", error);
    return { success: false, error: "Failed to increase XP" };
  }
};
