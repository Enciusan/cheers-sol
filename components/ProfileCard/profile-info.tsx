import { useUserStore } from "@/store/user";
import { COMMUNITIES } from "@/utils/communities";
import { DrinkIcon } from "@/utils/drinks";
import { Profile } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { LocationButton } from "../LocationButton";
import { Progress } from "../ui/progress";
import { useMemo, useState, useEffect } from "react";
import { getLevels } from "@/api/userFunctions";

interface ProfileInfoProps {
  data: Profile | null;
}

export const ProfileInfo = ({ data }: ProfileInfoProps) => {
  const { publicKey, wallet } = useWallet();
  const { userData } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<any>(null);
  const [nextLevel, setNextLevel] = useState<any>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Memoized function to fetch levels
  const fetchLevelsData = useMemo(
    () => async () => {
      if (!data?.walletAddress) return;

      setLoading(true);
      try {
        const response = await getLevels(data.walletAddress);
        if (response.success && response.levels) {
          const levels = response.levels;
          // Find current level based on user's XP
          const userXP = userData?.gainedXP || 0;
          const current = levels.find((level) => userXP >= level.startingFrom && userXP <= level.endingAt);

          // Find next level
          const next = levels.sort((a, b) => a.id - b.id).find((level) => level.startingFrom > (userXP || 0));

          setCurrentLevel(current);
          setNextLevel(next);

          // Calculate progress percentage
          if (current && next) {
            const xpInCurrentLevel = userXP - current.startingFrom;
            const xpRequiredForNextLevel = next.startingFrom - current.startingFrom;
            const progress = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;
            setProgressPercentage(Math.min(progress, 100));
          }
        }
      } catch (error) {
        console.error("Error fetching levels:", error);
      } finally {
        setLoading(false);
      }
    },
    [data?.walletAddress, userData?.gainedXP]
  );

  useEffect(() => {
    fetchLevelsData();
  }, [fetchLevelsData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-2xl font-semibold">{data?.username}</h3>
        <p className="text-sm text-gray-400 font-mono">
          {window.innerWidth >= 768
            ? data?.walletAddress
            : data?.walletAddress.substring(0, 10) +
              "..." +
              data?.walletAddress.substring(data?.walletAddress.length - 10, data?.walletAddress.length)}
        </p>
      </div>
      {wallet?.adapter.name === "Phantom" && <LocationButton publicKey={publicKey} />}
      <div className="bg-[#18181B] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <h3 className="text-xl font-bold text-violet-500">Level {currentLevel?.id || "?"}</h3>
                <span className={"font-semibold"}>{currentLevel?.name || ""}</span>
              </div>
              <p className="text-sm text-gray-400 font-semibold">
                {userData?.gainedXP || 0} XP / {currentLevel?.endingAt} XP
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress to Level {nextLevel?.id || "?"}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>
      <div className="bg-[#18181B] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-200">Profile Details</h4>
          {data?.age && (
            <span className="bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full text-sm">{data.age} years</span>
          )}
        </div>
        {data?.bio ? (
          <p className="text-sm text-gray-400">{data.bio}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">No bio provided</p>
        )}
      </div>
      {data?.drinks && data.drinks.length > 0 && (
        <div className="bg-[#18181B] rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-gray-200">Preferred Drinks</h4>
          <div className="flex gap-2 flex-wrap">
            {data.drinks.map((drink, index) => (
              <span
                key={index}
                className="bg-[#7C3AED] bg-opacity-10 text-[#7C3AED] px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                <DrinkIcon drink={drink} route="profile" />
                {drink}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* COMMUNITY BADGES */}
      {data?.communities !== undefined && data?.communities.length > 0 ? (
        <div className="bg-[#18181B] rounded-lg p-4 max-h-40 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-3 text-gray-200">Communities</h4>
          <div className="flex gap-2 flex-wrap">
            {userData?.communities.map((community, index) => {
              // console.log(community, COMMUNITIES);

              const meta = COMMUNITIES.find((c) => c.mint === community);
              return (
                <div
                  key={index}
                  style={{ backgroundColor: meta?.badgeColor, color: meta?.textColor }}
                  className={`${meta?.badgeColor} px-3 py-1.5 rounded-full text-sm flex font-medium font-mono items-center gap-2 text-white`}>
                  {meta?.name}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#18181B] rounded-lg p-4 max-h-40 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-3 text-gray-200">Communities</h4>
          <div className="flex gap-2 flex-wrap">
            <p className="text-sm text-gray-500 italic">No communities available</p>
          </div>
        </div>
      )}
    </div>
  );
};
