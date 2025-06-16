import { Beer, CupSoda, Martini, Wine, Coffee as Tea, Coffee, GlassWater, Milk } from "lucide-react";
import ginTonicPurple from "@/assets/drinks/ginPurple.png";
import ginTonicWhite from "@/assets/drinks/ginWhite.png";
import whiskyPurple from "@/assets/drinks/whiskyPurple.png";
import whiskyWhite from "@/assets/drinks/whiskyWhite.png";
import Image from "next/image";

export const DrinkIcon = ({ drink, route }: { drink: string; route: string }) => {
  switch (drink.toLowerCase()) {
    case "beer":
      return <Beer className="w-4 h-4" />;
    case "wine":
      return <Wine className="w-4 h-4" />;
    case "cocktails":
      return <CupSoda className="w-4 h-4" />;
    case "martini":
      return <Martini className="w-4 h-4" />;
    case "tea":
      return <Tea className="w-4 h-4 rotate-90" />;
    case "coffee":
      return <Coffee className="w-4 h-4" />;
    case "gin":
      return <Image src={route === "match" ? ginTonicWhite : ginTonicPurple} alt="Gin Tonic" className="w-4 h-5" />;
    case "whisky":
      return <Image src={route === "match" ? whiskyWhite : whiskyPurple} alt="Whisky" className="w-4 h-4" />;
    case "vodka":
      return <GlassWater className="w-4 h-4" />;
    case "rum":
      return <GlassWater className="w-4 h-4" />;
    case "matcha":
      return <Milk className="w-4 h-4" />;
    default:
      return null;
  }
};
