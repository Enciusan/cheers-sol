import { Beer, CupSoda, Martini, Wine, Coffee as Tea, Coffee, GlassWater, Milk } from "lucide-react";
import ginTonic from "@/assets/drinks/ginPurple.png";
import whisky from "@/assets/drinks/whisky.png";
import Image from "next/image";

export const DrinkIcon = ({ drink }: { drink: string }) => {
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
      return <Image src={ginTonic} alt="Gin Tonic" className="w-4 h-5" />;
    case "whisky":
      return <Image src={whisky} alt="Gin Tonic" className="w-4 h-4" />;
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
