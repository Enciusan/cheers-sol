// List of communities and their NFT mint addresses
export const COMMUNITIES = [
  {
    name: "SMB",
    mint: "8Rt3Ayqth4DAiPnW9MDFi63TiQJHmohfTWLMQFHi4KZH",
    badgeColor: "#184622",
  },
  {
    name: "SMB",
    mint: "SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W",
    badgeColor: "#184622",
  },
  {
    name: "Mad Lads",
    mint: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w",
    badgeColor: "#f62037",
  },
  {
    name: "FFF",
    mint: "BUjZjAS2vbbb65g7Z1Ca9ZRVYoJscURG5L3AkVvHP9ac",
    badgeColor: "#fe9034",
  },
  {
    name: "y00ts",
    mint: "4mKSoDDqApmF1DqXvVTSL6tu2zixrSSNjqMxUnwvVzy2",
    badgeColor: "#f0eee4",
  },
  {
    name: "Claynosaurz",
    mint: "6mszaj17KSfVqADrQj3o4W3zoLMTykgmV37W4QadCczK",
    badgeColor: "#40bc72",
  },
  {
    name: "Frogana",
    mint: "C7on9fL8YFp5W6M7a6SvehMKBppauZXu2eYDTZG4BN2i",
    badgeColor: "#faf4b3",
  },
  {
    name: "DeGods",
    mint: "6XxjKYFbcndh2gDcsUrmZgVEsoDxXMnfsaGY6fpTJzNr",
    badgeColor: "#3f3f3f",
  },
  // Add more communities as needed
];

// import { Connection, PublicKey } from "@solana/web3.js";

// export async function getUserCommunities(walletAddress: string, connection: Connection) {
//   const ownedCommunities: string[] = [];
//   const owner = new PublicKey(walletAddress);

//   // Fetch all token accounts for the user
//   const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
//     programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//   });

//   // Create a set of all mint addresses the user owns (with balance > 0)
//   const userMints = new Set<string>();
//   tokenAccounts.value.forEach(({ account }) => {
//     const parsed = account.data.parsed;
//     const mint = parsed;
//     const amount = parsed.info.tokenAmount.uiAmount;
//     if (amount && amount == 1) {
//       userMints.add(mint);
//     }
//   });
//   console.log(userMints);

//   // Check each community mint
//   for (const community of COMMUNITIES) {
//     if (userMints.has(community.mint)) {
//       ownedCommunities.push(community.name);
//     }
//   }

//   return ownedCommunities;
// }
