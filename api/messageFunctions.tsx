"use server";

import "server-only";
import { createClient } from "../lib/initSupabaseServerClient";

const supabase = await createClient();

export const fetchMessages = async (match: any) => {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", match.matchId)
    .order("created_at", { ascending: true });
  return data;
};

export const sendMessage = async (newMessage: any, match: any, currentUser: any) => {
  if (!newMessage.trim()) return;

  const message = {
    match_id: match.matchId,
    sender_id: currentUser.id,
    receiver_id: match.otherUserId,
    content: newMessage.trim(),
  };

  await supabase.from("messages").insert([message]);
};
