"use client";

import ProfileHeader from "@/components/ui/display/ProfileHeader";
import Image from "next/image";
import { useUserProfile } from "@/hooks/useUserProfile";

const Profile = () => {
  const { data: user, isLoading, isError, error } = useUserProfile();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? parts[0][0] + parts[parts.length - 1][0] 
      : parts[0]?.[0] || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">
          Error loading profile: {error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>No user data available</div>
      </div>
    );
  }

  const initials = user.name ? getInitials(user.name) : '';

  return (
    <div>
      {/* Use ProfileHeader with Edit Button */}
      <ProfileHeader 
        title="My Profile"
        showEditButton={true}
      />
      
      <div className="w-full border-b-[1px] border-border flex flex-col translate-y-[-40px] items-center justify-center gap-2 pb-4 px-4">
        <div className="relative w-[75px] h-[75px] rounded-full border-4 border-gray-300 overflow-hidden">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt="User Avatar"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="bg-primaryColor w-full h-full flex items-center justify-center text-white font-semibold text-xl">
              {initials}
            </div>
          )}
        </div>
        <h6 className="text-primary font-medium">{user.name || "User Name"}</h6>
        <p className="text-xs text-secondary text-center">
          {user.bio || "No bio available."}
        </p>
      </div>
    </div>
  );
};

export default Profile;