import { clusterApiUrl, Connection } from "@solana/web3.js";
import { GeolocationPoint } from "./types";

export const connection = new Connection(clusterApiUrl("mainnet-beta"));

export const convertToStringFromHex = (item: string) => {
  return Buffer.from(item, "hex");
};

export const calculateDistance = (point1: GeolocationPoint, point2: GeolocationPoint): number | undefined => {
  if (!point1.latitude || !point1.longitude || !point2.latitude || !point2.longitude) return;
  const Radius = 6371000; // Earth's radius in meters
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = Radius * c; // Distance in meters

  return distance;
};
