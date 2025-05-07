export type Profile = {
  id: string;
  username: string;
  walletAddress: string;
  bio: string;
  age: number;
  drinks: string[];
  communities: string[];
  profileImage: string;
};

export interface ProfileFormProps {
  data: Profile | null;
  onSubmit?: (profile: Profile) => void;
  onCancel?: () => void;
}

export interface MatchProfile extends Profile {
  matchId: string;
  otherUserId: string;
}

export type UserLocation = {
  walletAddress: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  radius: number;
  updatedAt: string;
};

export type LocationType = {
  latitude: number;
  longitude: number;
  accuracy: number;
  radius: number;
};

export type GeolocationPoint = {
  latitude: number;
  longitude: number;
};
