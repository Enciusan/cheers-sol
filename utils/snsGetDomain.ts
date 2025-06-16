"use server";
import { PublicKey, Connection } from "@solana/web3.js";
import { getFavoriteDomain } from "@bonfida/spl-name-service";

type FavoriteDomainResult = { pubkey: PublicKey; domain: string; stale: boolean } | undefined;

export const getSNSMainDomain = async (pubkey: string): Promise<FavoriteDomainResult> => {
  const RPC_URL = process.env.HELIUS_RPC_KEY!;

  // initialize a Solana Connection
  const connection = new Connection(RPC_URL);
  const newPk = new PublicKey(pubkey);
  if (!pubkey) return;
  try {
    const res = await getFavoriteDomain(connection, newPk);
    return { pubkey: res.domain, domain: res.reverse, stale: res.stale };
  } catch (err) {
    console.log(err);
    return undefined;
  }
};
