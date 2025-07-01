"use client";
import { fetchMatches, revalidateUserMatches } from "@/api/matchFunctions";
import { fetchMessages } from "@/api/messageFunctions";
import { useUserStore } from "@/store/user";
import { MatchProfile } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChatArea } from "./ChatArea";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function MessageComponent() {
  const { publicKey, disconnecting } = useWallet();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const { userData, clearUserData } = useUserStore();
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const { verifyAuthentication, logout, authenticateWithWallet } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [matchMessages, setMatchMessages] = useState<Record<string, any[]>>({});

  // Authentication effect remains the same
  useEffect(() => {
    const checkAuth = async () => {
      if (!publicKey) {
        setIsAuthenticated(false);
        clearUserData();
        return;
      }

      try {
        const authResult = await verifyAuthentication();

        if (authResult && authResult.wallet_address === publicKey.toString()) {
          console.log("User is authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("User not authenticated, attempting authentication...");
          const authResponse = await authenticateWithWallet();

          if (authResponse && authResponse.success) {
            console.log("Authentication successful");
            setIsAuthenticated(true);
          } else {
            console.log("Authentication failed");
            setIsAuthenticated(false);
            clearUserData();
          }
        }
      } catch (error) {
        console.error("Authentication verification failed:", error);
        setIsAuthenticated(false);
        clearUserData();
      } finally {
        setAuthAttempted(true);
      }
    };

    if (disconnecting) {
      logout();
      setIsAuthenticated(false);
      setAuthAttempted(false);
      clearUserData();
    } else if (publicKey) {
      checkAuth();
    }
  }, [publicKey, disconnecting]);

  // Fetch matches
  useEffect(() => {
    (async () => {
      if (!publicKey || !userData) return;

      if (isAuthenticated && publicKey) {
        await revalidateUserMatches(userData.id);
        const matchesResponse = await fetchMatches(userData);
        if (matchesResponse) {
          setMatches(matchesResponse);

          // Fetch messages for each match
          const messagesObj: Record<string, any[]> = {};
          for (const match of matchesResponse) {
            const messages = await fetchMessages(match);
            messagesObj[match.id] = messages || [];
          }
          setMatchMessages(messagesObj);
        }
      }
    })();
  }, [publicKey, userData, isAuthenticated]);

  if (!userData) {
    return <>Loading...</>;
  }

  // Helper function to get message preview
  const getMessagePreview = (match: MatchProfile) => {
    const messages = matchMessages[match.id] || [];

    if (messages.length === 0) {
      return "Click to start chatting";
    }

    // Get the last message
    const lastMessage = messages[messages.length - 1];

    // Truncate to first 3-4 words
    const words = lastMessage.content.split(" ");
    const preview = words.slice(0, 4).join(" ");

    return words.length > 4 ? `${preview}...` : preview;
  };
  // console.log(matches);
  console.log(matches);

  return (
    <div className="flex h-[75dvh] w-[95dvw] md:w-3/4 bg-[#18181B] rounded-lg">
      {/* Matches List Sidebar - Hidden on mobile when chat is open */}
      <div className={`${selectedMatch ? "hidden md:w-80 md:block" : "w-full md:w-80"} border-r border-gray-800`}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-3xl  font-[chicle] tracking-wide">Links</h1>
        </div>

        <div className="overflow-y-auto h-[65dvh]">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`flex items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors ${
                selectedMatch?.id === match.id ? "bg-gray-800" : ""
              }`}
              onClick={() => setSelectedMatch(match)}>
              <div className="relative w-12 h-12">
                {match.profileImage && (
                  <Image
                    src={match.profileImage || "/default-avatar.png"}
                    alt={match.username || "User"}
                    fill
                    className="rounded-full object-cover"
                  />
                )}
                {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#18181B]" /> */}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-violet-200 font-medium">
                  {match.hasADDomainChecked
                    ? match.allDomainName
                    : match.hasSNSDomainChecked
                      ? match.snsName
                      : match.username}
                </h3>
                <p className="text-gray-400 text-sm truncate line-clamp-1">{getMessagePreview(match)}</p>
              </div>
              <span className="text-xs text-gray-500">
                {matchMessages[match.id]?.length > 0
                  ? new Date(matchMessages[match.id][matchMessages[match.id].length - 1].created_at).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )
                  : "now"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${
          selectedMatch ? "w-full md:w-[calc(100%-20rem)]" : "hidden md:flex md:w-[calc(100%-20rem)]"
        } flex-col relative`}>
        {selectedMatch ? (
          <>
            <Button
              onClick={() => setSelectedMatch(null)}
              variant="ghost"
              className="md:hidden absolute left-2 top-2.5 text-gray-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <ChatArea match={selectedMatch} currentUser={userData} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a match to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
