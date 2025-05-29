import { useUserStore } from "@/store/user";
import { COMMUNITIES } from "@/utils/communities";
import { DrinkIcon } from "@/utils/drinks";
import { Profile } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { LocationButton } from "../LocationButton";
import { Award, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

interface ProfileInfoProps {
  data: Profile | null;
}

export const ProfileInfo = ({ data }: ProfileInfoProps) => {
  const { publicKey } = useWallet();
  const { userData } = useUserStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold">{data?.username}</h2>
        <p className="text-sm text-gray-400 font-mono">
          {window.innerWidth >= 768
            ? data?.walletAddress
            : data?.walletAddress.substring(0, 10) +
              "..." +
              data?.walletAddress.substring(data?.walletAddress.length - 10, data?.walletAddress.length)}
        </p>
      </div>
      <LocationButton publicKey={publicKey} />
      <div className="bg-[#18181B] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={"flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 shadow-lg"}>
              <Award className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                Level 4 <span className={"ml-1 font-semibold"}>aaa</span>
              </h3>
              <p className="text-sm text-gray-400">100 XP</p>
            </div>
          </div>
          <button
            className="rounded-full bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            // onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronUp />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress to Level 2</span>
            {/* <span>{Math.round(progressPercentage)}%</span> */}
          </div>
          <Progress value={10} className="h-2" />
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
                <DrinkIcon drink={drink} />
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
