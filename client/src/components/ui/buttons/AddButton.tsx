import { Plus } from "lucide-react";

interface AddButtonProps {
  onClick?: () => void;
  size?: "sm" | "md";
  className?: string;
  title?: string;
}

/**
 * Reusable Add/Plus button component
 * Used for adding new items (chats, groups, etc)
 */
export function AddButton({
  onClick,
  size = "md",
  className = "",
  title = "Add",
}: AddButtonProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${sizeClasses[size]} rounded-md bg-primaryColor/10 flex items-center justify-center hover:bg-primaryColor/20 transition-colors text-primaryColor ${className}`}
    >
      <Plus className={`${iconSizes[size]} text-primaryColor`} strokeWidth={2} />
    </button>
  );
}
