"use client";
import logo from "@/assets/logoNoPadding.png";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useUserStore } from "@/store/user";
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Award, ChevronDown, Link, MessageSquare, Settings, User, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Navbar = () => {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const { userData, clearUserData } = useUserStore();

  useEffect(() => {
    if (!connected) {
      clearUserData();
      router.push("/");
      return;
    }
  }, [connected, userData, publicKey]);
  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="fixed md:top-0 bottom-0 md:bottom-auto w-full border-t md:border-t-0 md:border-b border-violet-900/20 bg-[#09090B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#09090B]/60 z-50 md:pb-0 safe-area-pb">
      <div className="flex h-16 items-center md:justify-between justify-center px-4 w-full">
        {/* Logo - hidden on mobile */}
        <div
          className="hidden md:flex items-center space-x-2 text-violet-500 cursor-pointer"
          onClick={() => router.push("/")}>
          <Image src={logo} alt="logo" width={20} height={20} />
          <span className="text-xl font-bold pt-1">CheersUp</span>
        </div>

        {/* Navigation Menu */}
        <NavigationMenu className="w-full md:w-auto">
          <NavigationMenuList className="w-full md:w-auto gap-2 flex justify-around md:justify-start">
            {publicKey && (
              <>
                <NavigationMenuItem onClick={() => router.push("/profile")}>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} flex flex-col items-center md:flex-row p-0 md:p-2 bg-transparent hover:bg-transparent hover:text-violet-400 ${
                      pathname === "/profile" ? "text-violet-500" : "text-violet-100"
                    }`}
                    asChild>
                    <div className="flex flex-col md:flex-row items-center">
                      <User className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
                      <span className="text-xs mt-1 md:mt-0 md:text-sm">Profile</span>
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem onClick={() => router.push("/missions")}>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} flex flex-col items-center md:flex-row p-0 md:p-2 bg-transparent hover:bg-transparent hover:text-violet-400 ${
                      pathname === "/missions" ? "text-violet-500" : "text-violet-100"
                    }`}
                    asChild>
                    <div className="flex flex-col md:flex-row items-center">
                      <Award className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
                      <span className="text-xs mt-1 md:mt-0 md:text-sm">Missions</span>
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem onClick={() => router.push("/matches")}>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} flex flex-col items-center md:flex-row p-0 md:p-2 bg-transparent hover:bg-transparent hover:text-violet-400 ${
                      pathname === "/matches" ? "text-violet-500" : "text-violet-100"
                    }`}
                    asChild>
                    <div className="flex flex-col md:flex-row items-center">
                      <Users className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
                      <span className="text-xs mt-1 md:mt-0 md:text-sm">Matches</span>
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem onClick={() => router.push("/chat")}>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} flex flex-col items-center md:flex-row p-0 md:p-2 bg-transparent hover:bg-transparent hover:text-violet-400 ${
                      pathname === "/chat" ? "text-violet-500" : "text-violet-100"
                    }`}
                    asChild>
                    <div className="flex flex-col md:flex-row items-center">
                      <MessageSquare className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
                      <span className="text-xs mt-1 md:mt-0 md:text-sm">Chat</span>
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem onClick={() => router.push("/settings")}>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} flex flex-col items-center md:flex-row p-0 md:p-2 bg-transparent hover:bg-transparent hover:text-violet-400 ${
                      pathname === "/settings" ? "text-violet-500" : "text-violet-100"
                    }`}
                    asChild>
                    <div className="flex flex-col md:flex-row items-center">
                      <Settings className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
                      <span className="text-xs mt-1 md:mt-0 md:text-sm">Settings</span>
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="px-1 py-1.5 h-5 justify-center" size={"lg"}>
                  <ChevronDown
                    className={`h-10 w-10 md:h-4 ${pathname === "/referral" ? "text-violet-500" : "text-violet-100"}`}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1 mt-2">
                <NavigationMenuLink
                  onClick={() => router.push("/referral")}
                  className={`${navigationMenuTriggerStyle()} flex flex-col items-center md:flex-row p-0 md:p-2 bg-transparent hover:bg-transparent hover:text-violet-400 ${
                    pathname === "/referral" ? "text-violet-500" : "text-violet-100"
                  }`}
                  asChild>
                  <div className="flex flex-col md:flex-row items-center">
                    <Link className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
                    <span className="text-xs mt-1 md:mt-0 md:text-sm">Referral</span>
                  </div>
                </NavigationMenuLink>
              </PopoverContent>
            </Popover>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Wallet Button - hidden on mobile */}
        {publicKey && (
          <div className="hidden md:block">
            <WalletMultiButtonDynamic />
          </div>
        )}
      </div>
    </nav>
  );
};
