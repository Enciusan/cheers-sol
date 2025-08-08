"use server";
import { COMMUNITIES } from "./communities";
import "server-only";

export const getAssetsByOwner = async (walletAddress: string) => {
  const heliusKey = process.env.HELIUS_RPC_KEY!;
  //   console.log(heliusKey);

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
  const metadataList = result?.items?.map((item: any) => item.grouping[0]?.group_value);
  for (const community of COMMUNITIES) {
    if (metadataList.includes(community.mint)) {
      ownedCommunities.push(community.mint);
    }
  }
  // console.log(ownedCommunities);

  return ownedCommunities;
};
