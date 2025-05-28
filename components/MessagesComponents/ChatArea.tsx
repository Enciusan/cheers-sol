"use client";
import { useState, useEffect } from "react";
import { MatchProfile, Profile } from "@/utils/types";
import { supabase } from "@/lib/initSupabaseClient";
import { fetchMessages, sendMessage } from "@/api/messageFunctions";
import { MatchInfo } from "../MatchCard/match-info";

interface ChatAreaProps {
  match: MatchProfile;
  currentUser: Profile;
}

export function ChatArea({ match, currentUser }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`match-${match.matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${match.matchId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();
    (async () =>
      await fetchMessages(match).then((data) => {
        if (data) {
          setMessages(data);
        }
      }))();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.matchId]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 p-3 border-b border-gray-800">
          <img src={match.profileImage} alt="Profile" className="w-9 h-9 rounded-full md:ml-1.5 ml-10" />
          <h2 className="pl-0 text-lg font-semibold text-white">{match.username}</h2>
        </div>
        <div className="pr-2">
          <MatchInfo data={match} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto md:p-4 p-3 space-y-3 md:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}>
            <div
              className={`break-words max-w-[75%] rounded-2xl p-2.5 md:p-3 text-sm md:text-base ${
                message.sender_id === currentUser.id ? "bg-violet-600 text-white" : "bg-gray-700 text-gray-100"
              }`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newMessage && match && currentUser)
            sendMessage(newMessage, match, currentUser).then(() => setNewMessage(""));
        }}
        className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#7C3AED]/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
