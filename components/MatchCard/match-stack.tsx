import { supabase } from "@/lib/initSupabaseClient";
import { Profile } from "@/utils/types";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Users, X } from "lucide-react";
import { useState } from "react";
import MatchCard from "./match-card";

interface MatchStackProps {
  profiles: Profile[];
  currentUserId: string;
}

export default function MatchStack({ profiles, currentUserId }: MatchStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  console.log("profiles", profiles);

  const handleSwipe = async (profileId: string, direction: "left" | "right") => {
    const action = direction === "right" ? "like" : "dislike";

    // Insert the swipe action into the swipes table
    const { error: swipeError } = await supabase.from("swipes").insert({
      swiper_id: currentUserId,
      swiped_id: profileId,
      action: action,
    });

    if (swipeError) {
      console.error("Error saving swipe:", swipeError);
      return;
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
        }
      }
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const hasMoreProfiles = currentIndex < profiles.length;

  return (
    <div className="relative h-[550px] w-full max-w-sm mx-auto">
      <div className="relative h-[550px] w-full max-w-sm mx-auto mb-4">
        <AnimatePresence>
          {hasMoreProfiles ? (
            profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
              <div
                key={profile.id}
                className="absolute w-full"
                style={{
                  zIndex: profiles.length - index,
                }}>
                <MatchCard matchingProfiles={profile} onSwipe={(direction) => handleSwipe(profile.id, direction)} />
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181B] bg-opacity-100 rounded-xl backdrop-blur-sm p-6 text-center">
              <Users className="w-16 h-16 text-[#7C3AED] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No More Matches</h3>
              <p className="text-gray-400">
                Looks like you've seen everyone! Check back later for new potential matches.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {hasMoreProfiles && (
        <div className="md:flex hidden justify-center space-x-4 mt-4">
          <button
            onClick={() => profiles[currentIndex] && handleSwipe(profiles[currentIndex].id, "left")}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors duration-200 shadow-lg">
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={() => profiles[currentIndex] && handleSwipe(profiles[currentIndex].id, "right")}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors duration-200 shadow-lg">
            <Heart className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}
