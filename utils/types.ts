export type Profile = {
  id: string;
  username: string;
  walletAddress: string;
  bio: string;
  age: number;
  drinks: string[];
  communities: string[];
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
