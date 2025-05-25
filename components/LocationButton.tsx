import { addOrUpdateUserLocationServer } from "@/api/userFunctions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ExternalLink, Loader2, MapPin } from "lucide-react";
import { LocationType } from "@/utils/types";

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get("lat");
    const lng = urlParams.get("lng");
    const accuracy = urlParams.get("accuracy");

    if (lat && lng && publicKey) {
      const locationData = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        accuracy: accuracy ? parseFloat(accuracy) : 100,
        radius: 5000,
      };

      addOrUpdateUserLocationServer(locationData, publicKey.toBase58());
      toast("Location updated successfully from external browser!");

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [publicKey]);

  // Deep linking to external browser
  const openInExternalBrowser = () => {
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split("?")[0];

    const externalUrl = `${baseUrl}?open_for_location=true&wallet=${publicKey?.toBase58() || ""}`;

    if (/iPhone|iPad/i.test(navigator.userAgent)) {
      const safariUrl = `x-safari-https://?${externalUrl}`;
      window.open(safariUrl, "_system");

      setTimeout(() => {
        window.open(externalUrl, "_blank");
      }, 1000);

      setTimeout(() => {
        // Create a temporary link and click it
        const link = document.createElement("a");
        link.href = externalUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 2000);
    } else if (/Android/i.test(navigator.userAgent)) {
      const intentUrl = `intent://${externalUrl.replace(/https?:\/\//, "")}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(externalUrl)};end`;
      window.open(intentUrl, "_system");

      setTimeout(() => {
        window.open(externalUrl, "_blank");
      }, 1000);
    } else {
      window.open(externalUrl, "_blank");
    }

    toast("Opening in external browser for location access...");
  };

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

    if (showDeepLinkOption) {
      openInExternalBrowser();
    } else {
      getNativeLocation();
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenLocation = urlParams.get("open_for_location");
    getLocationByIP();

    if (shouldOpenLocation === "true" && publicKey && !isWebView) {
      setTimeout(() => {
        getNativeLocation();
      }, 1000);
    }
  }, [publicKey, isWebView]);

  if (showDeepLinkOption && isWebView) {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-[#18181B] rounded-lg">
          <p className="text-sm text-amber-300">
            📱 Location access is limited in the wallet browser. Open in your phone's browser for precise location.
          </p>
        </div>

        <Button
          className="w-full bg-[#18181B] text-white hover:bg-[#27272A]"
          onClick={getLocationByIP}
          disabled={isLoading}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Set Location
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="w-full bg-[#18181B] text-white hover:bg-[#27272A]"
      onClick={handleLocationClick}
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
  );
};
