"use client";
import { addOrChangeProfileImage } from "@/api/userFunctions";
import { useUserStore } from "@/store/user";
import { UploadButton } from "@/utils/uploadthing";
import { Edit } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const generateColorFromUUID = (uuid: string): string => {
  const hueSection = uuid.split("-")[0];
  const hue = parseInt(hueSection, 16) % 360;

  const satSection = uuid.split("-")[1];
  const saturation = 60 + (parseInt(satSection, 16) % 20);

  const lightSection = uuid.split("-")[2];
  const lightness = 45 + (parseInt(lightSection, 16) % 20);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const generatePatternFromUUID = (uuid: string) => {
  const binaryStr = uuid
    .replace(/-/g, "")
    .split("")
    .map((char) => parseInt(char, 16).toString(2).padStart(4, "0"))
    .join("");

  const pattern = [];
  const gridSize = 5;

  // Generate 5x5 grid with symmetry
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < Math.ceil(gridSize / 2); x++) {
      const idx = (y * gridSize + x) % binaryStr.length;
      const shouldFill = binaryStr[idx] === "1";

      if (x < Math.floor(gridSize / 2)) {
        pattern.push({ x, y, fill: shouldFill });
        pattern.push({ x: gridSize - 1 - x, y, fill: shouldFill });
      } else if (x === Math.floor(gridSize / 2)) {
        pattern.push({ x, y, fill: shouldFill });
      }
    }
  }

  return pattern;
};

interface AvatarProps {
  uuid: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: React.ReactNode;
  editable?: boolean;
  profileImage?: string | null;
  editButtonClassName?: string; // Keep the prop definition
  alwaysShowEditButton?: boolean;
}

const UUIDAvatar: React.FC<AvatarProps> = ({
  uuid,
  size = "md",
  fallback = null,
  editable = false,
  profileImage = null,
  editButtonClassName = "",
  alwaysShowEditButton = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { fetchUserProfile } = useUserStore();

  const isValidUUID = useMemo(() => UUID_REGEX.test(uuid), [uuid]);

  // Size classes mapping
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Edit button size classes
  const editButtonSizeClasses = {
    sm: "w-4 h-4 text-[8px]",
    md: "w-6 h-6 text-xs",
    lg: "w-8 h-8 text-sm",
    xl: "w-10 h-10 text-base",
  };

  const color = useMemo(() => {
    if (!isValidUUID) return "#e2e8f0"; // Default color
    return generateColorFromUUID(uuid);
  }, [uuid, isValidUUID]);

  const pattern = useMemo(() => {
    if (!isValidUUID) return [];
    return generatePatternFromUUID(uuid);
  }, [uuid, isValidUUID]);

  if (!isValidUUID && fallback) {
    return <>{fallback}</>;
  }
  console.log(profileImage);

  return (
    <div
      className="relative"
      onMouseEnter={() => editable && setIsHovered(true)}
      onMouseLeave={() => editable && setIsHovered(false)}>
      <div className="border-8 border-[#2b2b2b] rounded-full">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
          {(() => {
            // Add this log
            console.log("Rendering check, profileImage:", profileImage);
            if (profileImage === null) {
              return (
                <svg viewBox="-0.5 0 6 6" className="w-full h-full" style={{ background: "#f1f1f1" }}>
                  {pattern.map(
                    ({ x, y, fill }, index) =>
                      fill && <rect key={`${x}-${y}-${index}`} x={x} y={y} width="1" height="1" fill={color} />
                  )}
                </svg>
              );
            } else {
              return <Image src={profileImage} alt="Profile" width={300} height={300} className="w-full h-full" />;
            }
          })()}
        </div>
      </div>

      {editable && (alwaysShowEditButton || isHovered || size === "xl") && (
        <UploadButton
          endpoint="imageUploader"
          className={`absolute top-0 left-[4.8rem] p-0 rounded-full flex items-center justify-center ${editButtonSizeClasses[size]} ${editButtonClassName}`}
          onClientUploadComplete={async (res) => {
            console.log("Upload successful:", res[0], res[0].serverData.uploadedBy);
            await addOrChangeProfileImage(res[0].ufsUrl, res[0].serverData.uploadedBy);
            await fetchUserProfile(res[0].serverData.uploadedBy);
          }}
          onUploadError={(error: Error) => {
            // Handle upload error
            console.error("Upload failed:", error);
            alert(`Upload failed: ${error.message}`);
          }}
          appearance={{
            button:
              "data-[state=readying]:!bg-transparent data-[state=ready]:!bg-transparent data-[state=uploading]:!bg-transparent h-20 !w-10 !rounded-full focus-within:ring-offset-0 focus-within:ring-0 focus:!bg-transparent pt-0.5 pl-0.5",
            allowedContent: "invisible !h-0",
          }}
          content={{
            button: <Edit />,
            allowedContent: () => null,
          }}
          aria-label="Edit avatar"></UploadButton>
      )}
    </div>
  );
};

export default UUIDAvatar;
