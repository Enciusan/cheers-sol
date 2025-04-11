"use server";

import { createClient } from "@/lib/initSupabaseServerClient";
import { MatchProfile, Profile } from "@/utils/types";
import "server-only";

const supabase = await createClient();

export const createSwipe = async (swiperId: string, swipedId: string, action: "like" | "nope") => {
  try {
    // First, create the swipe record
    const { data: swipeData, error: swipeError } = await supabase
      .from("swipes")
      .insert([{ swiper_id: swiperId, swiped_id: swipedId, action }])
      .select()
      .single();

    if (swipeError) throw swipeError;

    // If it's a like, check for a match
    if (action === "like") {
      const { data: matchData, error: matchError } = await supabase
        .from("swipes")
        .select()
        .eq("swiper_id", swipedId)
        .eq("swiped_id", swiperId)
        .eq("action", "like")
        .single();

      // If there's a mutual like, create a match
      if (matchData && !matchError) {
        const { error: createMatchError } = await supabase
          .from("matches")
          .insert([{ user_id1: swiperId, user_id2: swipedId }]);

        if (createMatchError) throw createMatchError;
        return { isMatch: true, matchData };
      }
    }

    return { isMatch: false, swipeData };
  } catch (error) {
    console.error("Error in createSwipe:", error);
    throw error;
  }
};

export const fetchMatches = async (userData: Profile) => {
  // Fetch matches from your Supabase database
  const { data: matchesData } = await supabase
    .from("matches")
    .select(
      `
          *,
          user2:profiles!matches_user2_id_fkey(id, username, bio, age, drinks),
          user1:profiles!matches_user1_id_fkey(id, username, bio, age, drinks)
        `
    )
    .or(`user1_id.eq.${userData.id},user2_id.eq.${userData.id}`);

  if (matchesData) {
    // Transform data to get the opposite user's profile and include match id
    const transformedMatches: MatchProfile[] = matchesData.map((match: any) => ({
      ...(match.user1_id === userData.id ? match.user2 : match.user1),
      matchId: match.id,
      otherUserId: match.user1_id === userData.id ? match.user2_id : match.user1_id,
    }));
    return transformedMatches;
  }
};
