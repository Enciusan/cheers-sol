import { Connection } from "@solana/web3.js";
import { COMMUNITIES } from "./communities";
import { GeolocationPoint, LocationType } from "./types";

const heliusKey = process.env.NEXT_PUBLIC_HELIUS_RPC_KEY!;

export const convertToStringFromHex = (item: string) => {
  return Buffer.from(item, "hex");
};

console.log(heliusKey);

export const connection = new Connection(heliusKey);

export const getAssetsByOwner = async (walletAddress: string) => {
  const ownedCommunities: string[] = [];
  const response = await fetch(heliusKey, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: walletAddress,
        page: 1, // Starts at 1
        limit: 1000,
      },
    }),
  });
  const { result } = await response.json();
  const metadataList = result.items.map((item: any) => item.grouping[0]?.group_value);
  //   console.log("Metadata by Owner: ", metadataList);
  for (const community of COMMUNITIES) {
    if (metadataList.includes(community.mint)) {
      ownedCommunities.push(community.mint);
    }
  }
  // console.log(ownedCommunities);

  return ownedCommunities;
};

export const calculateDistance = (point1: GeolocationPoint, point2: GeolocationPoint): number | undefined => {
  if (!point1.latitude || !point1.longitude || !point2.latitude || !point2.longitude) return;
  const R = 6371000; // Earth's radius in meters
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters

  return distance;
};
