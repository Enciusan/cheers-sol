import { connection } from "@/utils/clientFunctions";
import { COMMUNITIES } from "@/utils/communities";
import { getAssetsByOwner } from "@/utils/serverFunctions";
import { Profile } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { Beer, Coffee, Martini, Coffee as Tea, Wine } from "lucide-react";
import { useEffect, useState } from "react";
import { LocationButton } from "../LocationButton";

interface ProfileInfoProps {
  data: Profile | null;
}

const DrinkIcon = ({ drink }: { drink: string }) => {
  switch (drink.toLowerCase()) {
    case "beer":
      return <Beer className="w-4 h-4" />;
    case "wine":
      return <Wine className="w-4 h-4" />;
    case "cocktails":
      return <Martini className="w-4 h-4" />;
    case "tea":
      return <Tea className="w-4 h-4 rotate-90" />;
    case "coffee":
      return <Coffee className="w-4 h-4" />;
    default:
      return null;
  }
};

export const ProfileInfo = ({ data }: ProfileInfoProps) => {
  const { publicKey } = useWallet();
  const [userCommunities, setUserCommunities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (data?.walletAddress && connection) {
        // const communities = await getUserCommunities(data.walletAddress, connection as Connection);
        const com2 = await getAssetsByOwner(data.walletAddress);
        // console.log(com2);

        setUserCommunities(com2);
      }
    };
    fetchCommunities();
  }, [data?.walletAddress, connection]);

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
            {userCommunities.map((community, index) => {
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
