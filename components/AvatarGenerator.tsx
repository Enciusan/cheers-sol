import React, { useMemo } from "react";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const generateColorFromUUID = (uuid: string): string => {
  // Use first 8 characters of UUID for hue
  const hueSection = uuid.split("-")[0];
  const hue = parseInt(hueSection, 16) % 360;

  // Use second section for saturation (60-80%)
  const satSection = uuid.split("-")[1];
  const saturation = 60 + (parseInt(satSection, 16) % 20);

  // Use third section for lightness (45-65%)
  const lightSection = uuid.split("-")[2];
  const lightness = 45 + (parseInt(lightSection, 16) % 20);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const generatePatternFromUUID = (uuid: string) => {
  // Remove dashes and convert to binary representation
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
      // Use different parts of UUID for different positions
      const idx = (y * gridSize + x) % binaryStr.length;
      const shouldFill = binaryStr[idx] === "1";

      if (x < Math.floor(gridSize / 2)) {
        // Add cell and its mirror
        pattern.push({ x, y, fill: shouldFill });
        pattern.push({ x: gridSize - 1 - x, y, fill: shouldFill });
      } else if (x === Math.floor(gridSize / 2)) {
        // Middle column, no mirroring
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
}

const UUIDAvatar: React.FC<AvatarProps> = ({ uuid, size = "md", fallback = null }) => {
  // Validate UUID
  const isValidUUID = useMemo(() => UUID_REGEX.test(uuid), [uuid]);

  // Size classes mapping
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Generate color and pattern based on UUID
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

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden`}>
      <svg viewBox="0 0 5 5" className="w-full h-full" style={{ background: "#f1f1f1" }}>
        {pattern.map(
          ({ x, y, fill }, index) =>
            fill && <rect key={`${x}-${y}-${index}`} x={x} y={y} width="1" height="1" fill={color} />
        )}
      </svg>
    </div>
  );
};

export default UUIDAvatar;
