"use client";

import { useState } from "react";
import Image from "next/image";
import { Beer, Wine, Martini, Coffee } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Profile } from "@/utils/types";
import { COMMUNITIES } from "@/utils/communities";

interface MatchCardProps {
  matchingProfiles: Profile;
  onSwipe?: (direction: "left" | "right") => void;
}

const DrinkIcon = ({ drink }: { drink: string }) => {
  switch (drink.toLowerCase()) {
    case "beer":
      return <Beer className="w-4 h-4" />;
    case "wine":
      return <Wine className="w-4 h-4" />;
    case "cocktails":
      return <Martini className="w-4 h-4" />;
    case "coffee":
      return <Coffee className="w-4 h-4" />;
    case "tea":
      return <Coffee className="w-4 h-4 rotate-90" />;
    default:
      return null;
  }
};

export default function MatchCard({ matchingProfiles, onSwipe }: MatchCardProps) {
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  // Background colors for swipe indicators
  const bgColor = useTransform(
    x,
    [-200, 0, 200],
    ["rgba(239, 68, 68, 0.2)", "rgba(0, 0, 0, 0)", "rgba(34, 197, 94, 0.2)"]
  );

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? "right" : "left";
      setExitDirection(direction);
      onSwipe?.(direction);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          x,
          rotate,
          backgroundColor: bgColor,
          zIndex: 10,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{
          x: exitDirection === "left" ? -500 : 500,
          opacity: 0,
          scale: 0.8,
          transition: { duration: 0.3 },
        }}
        whileDrag={{ cursor: "grabbing" }}
        className="touch-none">
        <div className="bg-[#18181B] bg-opacity-90 rounded-xl overflow-hidden shadow-lg max-w-sm w-full backdrop-blur-xl">
          <div className="relative h-80">
            <Image
              src={
                matchingProfiles.profileImage !== null ? matchingProfiles.profileImage : "/assets/images/profile.png"
              }
              alt={matchingProfiles.username}
              layout="fill"
              className="object-cover"
            />

            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

            {/* swipe  animation */}
            <motion.div
              style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
              className="absolute left-4 top-4 bg-red-500 text-white px-6 py-2 rounded-lg transform -rotate-12">
              NOPE
            </motion.div>
            <motion.div
              style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
              className="absolute right-4 top-4 bg-green-500 text-white px-6 py-2 rounded-lg transform rotate-12">
              LIKE
            </motion.div>
          </div>
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-2">
              {matchingProfiles.username}, {matchingProfiles.age}
            </h2>
            <p className="text-gray-400 mb-4">{matchingProfiles.bio}</p>
            <div className="flex flex-col justify-between items-start h-[7rem] pb-4">
              <div className="flex flex-wrap gap-2 line-clamp-1">
                {matchingProfiles.drinks.map((drink, index) => (
                  <span
                    key={index}
                    className="bg-[#7C3AED] text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <DrinkIcon drink={drink} />
                    <span className="ml-1">{drink}</span>
                  </span>
                ))}
              </div>
              {/* Communities Card Overlay */}
              {matchingProfiles.communities && matchingProfiles.communities.length > 0 && (
                <div className="absolute bottom-4 left-0 w-full px-4 z-20 flex justify-start ">
                  <div
                    className="bg-[#18181B] rounded-lg p-2 max-w-full overflow-x-auto flex gap-2 scrollbar-thin scrollbar-thumb-violet-700 scrollbar-track-transparent"
                    style={{ WebkitOverflowScrolling: "touch" }}>
                    {matchingProfiles.communities.map((community, index) => {
                      const meta = COMMUNITIES.find((c) => c.mint === community);
                      return (
                        <div
                          key={index}
                          style={{ backgroundColor: meta?.badgeColor, color: meta?.textColor }}
                          className="px-3 py-1.5 rounded-full text-sm flex font-medium font-mono items-center gap-2 text-white whitespace-nowrap">
                          {meta?.name || community}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* End Communities Card Overlay */}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
