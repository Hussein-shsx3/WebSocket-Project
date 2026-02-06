"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PathHeader from "@/components/ui/display/PathHeader";
import { Avatar } from "@/components/ui/display/Avatar";
import { useThemeStore } from "@/store/themeStore";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLogout } from "@/hooks/useAuth";
import {
  Sun,
  Moon,
  Bell,
  BellOff,
  Shield,
  Eye,
  EyeOff,
  User,
  LogOut,
  ChevronRight,
  Volume2,
  VolumeX,
  MessageSquareText,
} from "lucide-react";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  onClick,
  trailing,
  danger,
}: SettingItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 ${
      danger
        ? "hover:bg-red-500/10 text-red-500"
        : "hover:bg-hover text-primary"
    }`}
  >
    <div
      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
        danger ? "bg-red-500/10" : "bg-primaryColor/10"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1 text-left">
      <p className="text-xs font-medium">{title}</p>
      {subtitle && <p className="text-[10px] text-secondary mt-0.5">{subtitle}</p>}
    </div>
    {trailing || (
      <ChevronRight
        className={`w-3.5 h-3.5 ${danger ? "text-red-500" : "text-secondary"}`}
      />
    )}
  </button>
);

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch = ({ enabled, onChange }: ToggleSwitchProps) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
      enabled ? "bg-primaryColor" : "bg-border"
    }`}
  >
    <div
      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        enabled ? "translate-x-[18px]" : "translate-x-0.5"
      }`}
    />
  </button>
);

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection = ({ title, children }: SettingSectionProps) => (
  <div className="mb-6">
    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 mb-2">
      {title}
    </h3>
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      {children}
    </div>
  </div>
);

const Settings = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { data: user } = useUserProfile();
  const logoutMutation = useLogout();

  // Local settings state (these could be connected to a settings service later)
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  return (
    <div className="flex flex-col h-full">
      <PathHeader PageName="Settings" />

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* User Profile Card */}
        <button
          onClick={handleEditProfile}
          className="w-full bg-surface rounded-2xl border border-border p-3 mb-4 hover:bg-hover transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="lg"
            />
            <div className="flex-1 text-left">
              <h3 className="text-xs font-semibold text-primary">
                {user?.name || "User"}
              </h3>
              <p className="text-[10px] text-secondary">{user?.email || ""}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-secondary" />
          </div>
        </button>

        {/* Account Section */}
        <SettingSection title="Account">
          <SettingItem
            icon={<User className="w-3.5 h-3.5 text-primaryColor" />}
            title="Edit Profile"
            subtitle="Update your name, bio, and avatar"
            onClick={handleEditProfile}
          />
        </SettingSection>

        {/* Appearance Section */}
        <SettingSection title="Appearance">
          <SettingItem
            icon={
              theme === "dark" ? (
                <Moon className="w-3.5 h-3.5 text-primaryColor" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-primaryColor" />
              )
            }
            title="Dark Mode"
            subtitle={theme === "dark" ? "Currently enabled" : "Currently disabled"}
            onClick={toggleTheme}
            trailing={
              <ToggleSwitch
                enabled={theme === "dark"}
                onChange={toggleTheme}
              />
            }
          />
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title="Notifications">
          <SettingItem
            icon={
              notifications ? (
                <Bell className="w-3.5 h-3.5 text-primaryColor" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-primaryColor" />
              )
            }
            title="Push Notifications"
            subtitle="Receive notifications for new messages"
            trailing={
              <ToggleSwitch
                enabled={notifications}
                onChange={setNotifications}
              />
            }
          />
          <div className="h-px bg-border mx-2.5" />
          <SettingItem
            icon={
              soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-primaryColor" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-primaryColor" />
              )
            }
            title="Message Sounds"
            subtitle="Play sound for new messages"
            trailing={
              <ToggleSwitch enabled={soundEnabled} onChange={setSoundEnabled} />
            }
          />
        </SettingSection>

        {/* Privacy Section */}
        <SettingSection title="Privacy">
          <SettingItem
            icon={
              showOnlineStatus ? (
                <Eye className="w-3.5 h-3.5 text-primaryColor" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-primaryColor" />
              )
            }
            title="Online Status"
            subtitle="Show when you're online"
            trailing={
              <ToggleSwitch
                enabled={showOnlineStatus}
                onChange={setShowOnlineStatus}
              />
            }
          />
          <div className="h-px bg-border mx-2.5" />
          <SettingItem
            icon={<Shield className="w-3.5 h-3.5 text-primaryColor" />}
            title="Read Receipts"
            subtitle="Show when you've read messages"
            trailing={
              <ToggleSwitch
                enabled={showReadReceipts}
                onChange={setShowReadReceipts}
              />
            }
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title="About">
          <SettingItem
            icon={<MessageSquareText className="w-3.5 h-3.5 text-primaryColor" />}
            title="App Version"
            subtitle="1.0.0"
            trailing={
              <span className="text-[10px] text-secondary bg-primaryColor/10 px-1.5 py-0.5 rounded-full">
                Latest
              </span>
            }
          />
        </SettingSection>

        {/* Logout Section */}
        <SettingSection title="Session">
          <SettingItem
            icon={<LogOut className="w-3.5 h-3.5 text-red-500" />}
            title="Log Out"
            subtitle="Sign out of your account"
            onClick={handleLogout}
            danger
          />
        </SettingSection>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-secondary">
            Made with ❤️ by WebSocket Team
          </p>
          <p className="text-[10px] text-secondary/60 mt-1">
            © 2024 WebSocket Chat. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
