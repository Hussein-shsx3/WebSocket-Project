"use client";

import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
  className?: string;
  onClick?: () => void;
}

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "?";
};

// Generate a consistent color based on the name
const avatarColors = [
  "bg-rose-500",
  "bg-pink-500",
  "bg-fuchsia-500",
  "bg-purple-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-green-500",
  "bg-lime-600",
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-500",
];

const getAvatarColor = (name?: string | null) => {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

const sizeConfig = {
  xs: {
    container: "w-8 h-8",
    text: "text-xs",
    status: "w-2 h-2 border-[1.5px]",
    ring: "ring-1",
  },
  sm: {
    container: "w-9 h-9",
    text: "text-xs",
    status: "w-2.5 h-2.5 border-2",
    ring: "ring-1",
  },
  md: {
    container: "w-11 h-11",
    text: "text-sm",
    status: "w-3 h-3 border-2",
    ring: "ring-2",
  },
  lg: {
    container: "w-14 h-14",
    text: "text-base",
    status: "w-3.5 h-3.5 border-[2.5px]",
    ring: "ring-2",
  },
  xl: {
    container: "w-[75px] h-[75px]",
    text: "text-xl",
    status: "w-4 h-4 border-[3px]",
    ring: "ring-2",
  },
};

export function Avatar({
  src,
  name,
  size = "md",
  showStatus = false,
  status = "offline",
  className = "",
  onClick,
}: AvatarProps) {
  const config = sizeConfig[size];
  const initials = getInitials(name);
  const isOnline = status === "online";
  const bgColor = getAvatarColor(name);

  const Container = onClick ? "button" : "div";

  return (
    <Container
      onClick={onClick}
      className={`relative flex-shrink-0 ${className}`}
      {...(onClick && { type: "button" as const })}
    >
      <div
        className={`${config.container} rounded-full overflow-hidden`}
      >
        {src ? (
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={name || "User"}
              fill
              className="object-cover"
              sizes={config.container.split(" ")[0].replace("w-", "") + "px"}
            />
          </div>
        ) : (
          <div
            className={`w-full h-full ${bgColor} flex items-center justify-center text-white font-semibold ${config.text}`}
          >
            {initials}
          </div>
        )}
      </div>
      {showStatus && isOnline && (
        <span
          className={`absolute bottom-0 right-0 bg-green-500 border-panel rounded-full ${config.status}`}
        />
      )}
    </Container>
  );
}

export default Avatar;
