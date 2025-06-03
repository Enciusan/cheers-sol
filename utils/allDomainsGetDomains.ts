"use server";
import { TldParser } from "@onsol/tldparser";
import { Connection } from "@solana/web3.js";

const RPC_URL = process.env.HELIUS_RPC_KEY!;

// initialize a Solana Connection
const connection = new Connection(RPC_URL);

const parser = new TldParser(connection);

export const getAllDomains = async (publicKey: string) => {
  const domains = parser.getAllUserDomains(publicKey);
  return domains;
};
