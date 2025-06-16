"use server";

import { createClient } from "@/lib/initSupabaseServerClient";
import { MatchProfile, Profile } from "@/utils/types";
import { unstable_cache } from "next/cache";
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
  const cachedQuery = unstable_cache(
    async (key: string) => {
      const { data: matchesData } = await supabase
        .from("matches")
        .select(
          `
            *,
            user2:profiles!matches_user2_id_fkey(id, username, bio, age, drinks, profileImage, hasADDomainChecked, hasSNSDomainChecked, snsName, allDomainName, communities),
            user1:profiles!matches_user1_id_fkey(id, username, bio, age, drinks, profileImage, hasADDomainChecked, hasSNSDomainChecked, snsName, allDomainName, communities)
          `
        )
        .or(`user1_id.eq.${key},user2_id.eq.${key}`);
      if (matchesData) {
        // Transform data to get the opposite user's profile and include match id
        const transformedMatches: MatchProfile[] = matchesData.map((match: any) => ({
          ...(match.user1_id === key ? match.user2 : match.user1),
          matchId: match.id,
          otherUserId: match.user1_id === key ? match.user2_id : match.user1_id,
        }));
        return transformedMatches;
      }
    },
    [`user-matches-${userData.id}`],
    {
      revalidate: 180,
      tags: [`user-${userData.id}`, "matches"],
    }
  );

  return cachedQuery(userData.id);
};

export const handleSwipe = async (profileId: string, direction: "left" | "right", currentUserId: string) => {
  const action = direction === "right" ? "like" : "dislike";
  // Insert the swipe action into the swipes table
  const { error: swipeError } = await supabase.from("swipes").insert({
    swiper_id: currentUserId,
    swiped_id: profileId,
    action: action,
  });
  if (swipeError) {
    console.error("Error saving swipe:", swipeError);
    return { error: swipeError };
  }
  // If it's a like, check if there's a mutual match
  if (action === "like") {
    const { data: existingSwipe } = await supabase
      .from("swipes")
      .select("*")
      .eq("swiper_id", profileId)
      .eq("swiped_id", currentUserId)
      .eq("action", "like")
      .single();
    // If there's a mutual like, create a match
    if (existingSwipe) {
      const { error: matchError } = await supabase.from("matches").insert({
        user_id1: currentUserId,
        user_id2: profileId,
      });
      if (matchError) {
        console.error("Error creating match:", matchError);
        return { error: matchError };
      }
      return { isMatch: true };
    }
  }
  return { isMatch: false };
};
