"use client";
import { createOrUpdateProfile } from "@/api/userFunctions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/store/user";
import { DrinkType } from "@/utils/enums";
import type { Profile, ProfileFormProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const validationSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, "Name is required"),
  walletAddress: z.string().min(1, "Wallet is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  age: z.number().min(18, "Must be at least 18 years old").max(100, "Must be under 100 years old"),
  drinks: z.array(z.string()).min(1, "Select at least one drink preference").max(6, "Select at most 6 drinks"),
  communities: z.array(z.string()).optional(),
});

export const ProfileForm = ({ data, onSubmit, onCancel }: ProfileFormProps) => {
  const { publicKey, signMessage } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const { verifyAuthentication } = useAuth();
  const { updateUserData, fetchUserProfile } = useUserStore();

  const drinkOptions = Object.values(DrinkType).map((drink) => ({
    label: drink,
    value: drink,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Profile>({
    defaultValues: {
      id: data?.id || "",
      walletAddress: publicKey?.toBase58() || "",
      username: data?.username || "",
      bio: data?.bio || "",
      age: data?.age || 0,
      drinks: data?.drinks || [],
      communities: data?.communities || [],
      profileImage: data?.profileImage,
    },
    resolver: zodResolver(validationSchema),
  });

  const submitProfile = async (formData: Profile) => {
    if (!publicKey || !signMessage) {
      console.error("Wallet not connected");
      return;
    }

    setIsLoading(true);
    try {
      // Verify authentication before proceeding
      const authResult = await verifyAuthentication();

      if (!authResult || authResult.wallet_address !== publicKey.toString()) {
        throw new Error("Authentication required. Please connect your wallet first.");
      }

      // Call the server function to create or update profile
      const result = await createOrUpdateProfile({
        walletAddress: publicKey.toBase58(),
        username: formData.username,
        bio: formData.bio,
        age: formData.age,
        drinks: formData.drinks,
        communities: formData.communities,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save profile");
      }

      // Update the local store with the new profile data

      // Update the local state immediately
      updateUserData({
        ...formData,
        id: result.id || formData.id || "",
        profileImage: data?.profileImage ?? "",
      });

      // Refresh the profile data from the server
      await fetchUserProfile(publicKey.toBase58());

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit({ ...formData, profileImage: data?.profileImage ?? "" });
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitProfile)} className="flex flex-col gap-3 w-full">
      <div className="w-full">
        <Label htmlFor="wallet" className="pl-1.5">
          Address
        </Label>
        <Input
          type="text"
          className="mt-1"
          disabled={true}
          value={publicKey?.toBase58() || ""}
          {...register("walletAddress")}
        />
        {errors.walletAddress && <p className="text-sm text-red-500 mt-1">{errors.walletAddress.message}</p>}
      </div>

      <div className="w-full">
        <Label htmlFor="name" className="pl-1.5">
          Name
        </Label>
        <Input type="text" className="mt-1" {...register("username")} placeholder="ex: Jonathan" />
        {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
      </div>

      <div className="w-full">
        <Label htmlFor="age" className="pl-1.5">
          Age
        </Label>
        <Input type="number" className="mt-1" min={18} max={100} {...register("age", { valueAsNumber: true })} />
        {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age.message}</p>}
      </div>

      <div className="w-full">
        <Label htmlFor="bio" className="pl-1.5">
          Bio
        </Label>
        <Textarea className="mt-1" placeholder="Tell us about yourself..." {...register("bio")} />
        {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>}
      </div>

      <div className="w-full">
        <Label htmlFor="drinks" className="pl-1.5">
          Preferred Drinks
        </Label>
        <MultiSelect
          options={drinkOptions}
          placeholder={"Select your preferred drinks"}
          onValueChange={(values) => setValue("drinks", values)}
          defaultValue={data?.drinks ?? []}
          className="mt-1"
        />
        {errors.drinks && <p className="text-sm text-red-500 mt-1">{errors.drinks.message}</p>}
      </div>

      <Button className="w-full mt-2" type="submit">
        {isLoading ? "Creating Profile..." : "Complete Profile"}
      </Button>
    </form>
  );
};
