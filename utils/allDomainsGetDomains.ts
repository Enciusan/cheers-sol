"use server";
import { findMainDomain, MainDomain, TldParser } from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = process.env.HELIUS_RPC_KEY!;

// initialize a Solana Connection
const connection = new Connection(RPC_URL);

const parser = new TldParser(connection);

export const getAllDomains = async (publicKey: string) => {
  const domains = parser.getAllUserDomains(publicKey);
  return domains;
};

export const getMainDomain = async (pubkey: string | PublicKey) => {
  if (typeof pubkey === "string") {
    pubkey = new PublicKey(pubkey);
  }
  const [mainDomainPubkey] = findMainDomain(pubkey);
  let mainDomain = undefined;
  try {
    mainDomain = await MainDomain.fromAccountAddress(connection, mainDomainPubkey);
    return { domain: mainDomain.domain, tld: mainDomain.tld };
  } catch (e) {
    console.log("No main domain found");
  }
};
