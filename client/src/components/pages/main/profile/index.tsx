"use client";

import { useState, useRef } from "react";
import { 
  Camera, 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Bell,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserAvatar } from "@/components/ui/display/UserAvatar";
import { useThemeStore } from "@/store/themeStore";

/**
 * Profile Page Component
 * Modern design with settings and user info
 */
const Profile = () => {
  const currentUser = useCurrentUser();
  const { data: userProfile, isLoading } = useUserProfile();
  const { theme, toggleTheme } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditName = () => {
    setEditedName(userProfile?.name || "");
    setIsEditing(true);
  };

  const handleSaveName = () => {
    // TODO: Implement save name API call
    console.log("Saving name:", editedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement avatar upload
      console.log("Uploading avatar:", file.name);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log("Logging out...");
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor mx-auto mb-2"></div>
          <p className="text-sm text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-secondary">Failed to load profile</p>
        </div>
      </div>
    );
  }

  // Create a user object for UserAvatar
  const userForAvatar = {
    id: userProfile.id,
    name: userProfile.name || "Unknown User",
    email: userProfile.email,
    avatar: userProfile.avatar,
    status: "online" as const,
  };

  return (
    <div className="h-full flex flex-col bg-main overflow-y-auto">
      {/* Profile Header with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-br from-primaryColor via-primaryColor/80 to-primaryColor/60" />
        
        {/* Avatar Section */}
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-panel shadow-lg overflow-hidden bg-panel">
              <UserAvatar user={userForAvatar} size="lg" showStatus={false} />
            </div>
            {/* Camera overlay */}
            <button
              onClick={handleAvatarClick}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
              title="Change profile picture"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {/* Online status */}
            <span className="absolute bottom-2 right-2 w-5 h-5 bg-success-500 rounded-full border-3 border-panel" />
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="mt-20 px-6 text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="px-4 py-2 bg-input-bg border border-border rounded-xl text-primary text-center focus:outline-none focus:ring-2 focus:ring-primaryColor/50"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="p-2 bg-success-500 hover:bg-success-600 rounded-full transition-colors"
              title="Save name"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-2 bg-error-500 hover:bg-error-600 rounded-full transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-primary">
              {userProfile.name || "User"}
            </h1>
            <button
              onClick={handleEditName}
              className="p-1.5 hover:bg-hover rounded-lg transition-colors"
              title="Edit name"
            >
              <Edit3 className="w-4 h-4 text-secondary" />
            </button>
          </div>
        )}
        <p className="text-sm text-secondary mt-1">{userProfile.email}</p>
        <p className="text-xs text-success-500 mt-2 font-medium">● Online</p>
      </div>

      {/* Info Cards */}
      <div className="px-4 mt-8 space-y-3">
        <div className="bg-panel rounded-2xl p-4 space-y-4">
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider px-2">
            Account Info
          </h3>
          
          <div className="flex items-center gap-4 px-2 py-2">
            <div className="w-10 h-10 rounded-xl bg-primaryColor/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primaryColor" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-secondary">Email</p>
              <p className="text-sm font-medium text-primary">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-2 py-2">
            <div className="w-10 h-10 rounded-xl bg-primaryColor/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primaryColor" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-secondary">Member Since</p>
              <p className="text-sm font-medium text-primary">January 2024</p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-panel rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider px-2 mb-3">
            Settings
          </h3>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-2 py-3 hover:bg-hover rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primaryColor/10 flex items-center justify-center">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-primaryColor" />
              ) : (
                <Sun className="w-5 h-5 text-primaryColor" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-primary">Dark Mode</p>
              <p className="text-xs text-secondary">
                {theme === "dark" ? "Currently on" : "Currently off"}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${
              theme === "dark" ? "bg-primaryColor" : "bg-secondary/30"
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform mt-0.5 ${
                theme === "dark" ? "translate-x-6.5 ml-0.5" : "translate-x-0.5"
              }`} />
            </div>
          </button>

          {/* Notifications */}
          <button className="w-full flex items-center gap-4 px-2 py-3 hover:bg-hover rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primaryColor/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primaryColor" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-primary">Notifications</p>
              <p className="text-xs text-secondary">Manage notification preferences</p>
            </div>
            <ChevronRight className="w-5 h-5 text-secondary" />
          </button>

          {/* Privacy */}
          <button className="w-full flex items-center gap-4 px-2 py-3 hover:bg-hover rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primaryColor/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primaryColor" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-primary">Privacy & Security</p>
              <p className="text-xs text-secondary">Manage your privacy settings</p>
            </div>
            <ChevronRight className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 bg-error-500/10 hover:bg-error-500/20 rounded-2xl px-4 py-4 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-error-500/20 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-error-500" />
          </div>
          <p className="text-sm font-medium text-error-500">Sign Out</p>
        </button>
      </div>

      {/* Bottom Spacing */}
      <div className="h-20" />
    </div>
  );
};

export default Profile;