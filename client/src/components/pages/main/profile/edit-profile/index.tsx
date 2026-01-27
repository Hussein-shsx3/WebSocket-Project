"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProfileHeader from "@/components/ui/display/ProfileHeader";
import { useUserProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useUserProfile";

type ProfileFormData = {
  name: string;
  bio: string;
  status: "online" | "offline" | "away";
};

const EditProfile = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: user, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const initialFormData = useMemo(() => ({
    name: user?.name || "",
    bio: user?.bio || "",
    status: (user?.status as "online" | "offline" | "away") || "offline",
  }), [user?.name, user?.bio, user?.status]);

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? parts[0][0] + parts[parts.length - 1][0] 
      : parts[0]?.[0] || '';
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedFile) {
        await uploadAvatarMutation.mutateAsync(selectedFile);
      }
      await updateProfileMutation.mutateAsync(formData);
      router.push("/profile");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
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

  const initials = getInitials(user.name || "");
  const currentAvatar = avatarPreview || user.avatar;

  return (
    <div className="min-h-screen bg-background">
      {/* Use ProfileHeader with Close Button */}
      <ProfileHeader 
        title="Edit Profile"
        showCloseButton={true}
        onClose={handleCancel}
      />

      {/* Avatar Section */}
      <div className="w-full border-b-[1px] border-border flex flex-col translate-y-[-40px] items-center justify-center gap-2 pb-4 px-4">
        <div 
          className="relative w-[75px] h-[75px] rounded-full border-4 border-gray-300 overflow-hidden cursor-pointer group"
          onClick={handleAvatarClick}
        >
          {currentAvatar ? (
            <Image
              src={currentAvatar}
              alt="User Avatar"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="bg-primaryColor w-full h-full flex items-center justify-center text-white font-semibold text-xl">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-secondary">Click to change avatar</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Form Fields */}
      <div className="px-4 py-6 space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor text-primary"
            placeholder="Enter your name"
          />
        </div>

        {/* Bio Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-2 py-2 text-xs bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor text-primary resize-none"
            placeholder="Tell us about yourself"
            rows={4}
            maxLength={200}
          />
          <p className="text-xs text-secondary">
            {formData.bio.length} / 200 characters
          </p>
        </div>

        {/* Status Field */}
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-primary">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "online" | "offline" | "away" })}
            className="w-full px-1 py-2 text-xs bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor text-primary"
          >
            <option value="online">Online</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Email
          </label>
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="w-full px-2 py-2 text-xs bg-surface/50 border border-border rounded-lg text-secondary cursor-not-allowed"
          />
          <p className="text-xs text-secondary">
            Email cannot be changed
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-2 py-2 text-xs bg-surface border border-border rounded-lg text-primary font-medium hover:bg-surface/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending}
            className="flex-1 px-2 py-2 text-xs bg-primaryColor rounded-lg text-white font-medium hover:bg-primaryColor/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending || uploadAvatarMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>

        {/* Error Messages */}
        {(updateProfileMutation.isError || uploadAvatarMutation.isError) && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">
              Failed to update profile. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;