import { addOrUpdateUserLocationServer } from "@/api/userFunctions";
import { LocationType } from "@/utils/types";
import { Loader2, MapPin, Pin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export const LocationButton = ({ publicKey }: { publicKey: any }) => {
  const [isWebView, setIsWebView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeepLinkOption, setShowDeepLinkOption] = useState(false);

  // Detect if running in WebView (Phantom browser)
  useEffect(() => {
    const detectWebView = () => {
      const userAgent = navigator.userAgent;
      const isPhantom = userAgent.includes("PhantomWallet") || userAgent.includes("phantom");
      const isWebViewUA = /wv|WebView|Android.*Version\/\d+\.\d+/i.test(userAgent);
      const isMobileWebView =
        /Mobile|Android|iPhone|iPad/i.test(userAgent) &&
        (isWebViewUA || (userAgent.includes("Version/") && !userAgent.includes("Chrome")));

      return isPhantom || isMobileWebView;
    };

    const webViewDetected = detectWebView();
    setIsWebView(webViewDetected);

    if (webViewDetected) {
      setShowDeepLinkOption(true);
    }
  }, []);

  const getLocationByIP = async () => {
    if (!publicKey) {
      toast("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      // Using ipinfo.io to get location based on IP
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;
      console.log(ipAddress);

      const response = await fetch(`https://ipinfo.io/${ipAddress}?token=1fce65177febf1`);

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();
      console.log(data);

      // Parse location data from ipinfo.io
      // The loc field contains latitude and longitude separated by a comma
      const [latitude, longitude] = data.loc.split(",").map(Number);

      const locationData: LocationType = {
        latitude,
        longitude,
        accuracy: 3000, // IP geolocation is less accurate, typically city-level
        radius: 5000,
      };

      await addOrUpdateUserLocationServer(locationData, publicKey.toBase58());
      console.log(locationData);

      toast("Location determined based on your IP address");
    } catch (error) {
      console.error("Error getting location by IP:", error);
      toast("Could not determine your location. Trying native geolocation...");
      // Fall back to native geolocation if IP-based fails
      getNativeLocation();
    } finally {
      setIsLoading(false);
    }
  };

  const getNativeLocation = () => {
    if (!navigator.geolocation) {
      toast("Geolocation not supported on this device");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const radius = 5000;
          await addOrUpdateUserLocationServer({ latitude, longitude, accuracy, radius }, publicKey.toBase58());
          toast("Location updated successfully!");
        } catch (error) {
          console.error("Error updating location:", error);
          toast("Failed to update location on server");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        setIsLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          toast("Location access denied. Please enable location permissions.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast("Location information unavailable.");
        } else if (error.code === error.TIMEOUT) {
          toast("Location request timed out.");
        } else {
          toast("Error getting location. Try the external browser option.");
        }

        setShowDeepLinkOption(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  const handleLocationClick = () => {
    if (!publicKey) {
      toast("Please connect your wallet first");
      return;
    }
    getNativeLocation();
  };

  if (isWebView || innerWidth < 550) {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-[#18181B] rounded-lg">
          <p className="text-sm text-amber-300">
            📱 Location access is limited in the wallet browser. Please set location by pressing the button. For better
            accuracy use a PC or laptop.
          </p>
        </div>

        <Button
          className="w-full bg-[#18181B] text-white hover:bg-[#27272A]"
          onClick={getLocationByIP}
          disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Set Location
            </>
          )}
        </Button>
      </div>
    );
  }
};
