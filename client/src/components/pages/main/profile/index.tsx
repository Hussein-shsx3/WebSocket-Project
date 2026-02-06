"use client";

import ProfileHeader from "@/components/ui/display/ProfileHeader";
import { Avatar } from "@/components/ui/display/Avatar";
import { useUserProfile } from "@/hooks/useUserProfile";

const Profile = () => {
  const { data: user, isLoading, isError, error } = useUserProfile();

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

  return (
    <div>
      {/* Use ProfileHeader with Edit Button */}
      <ProfileHeader 
        title="My Profile"
        showEditButton={true}
      />
      
      <div className="w-full border-b-[1px] border-border flex flex-col translate-y-[-40px] items-center justify-center gap-2 pb-4 px-4">
        <Avatar
          src={user.avatar}
          name={user.name}
          size="xl"
        />
        <h6 className="text-primary font-medium">{user.name || "User Name"}</h6>
        <p className="text-xs text-secondary text-center">
          {user.bio || "No bio available."}
        </p>
      </div>
    </div>
  );
};

export default Profile;