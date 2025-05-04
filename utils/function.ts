import { Connection } from "@solana/web3.js";
import { COMMUNITIES } from "./communities";

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
  console.log(ownedCommunities);

  return ownedCommunities;
};
