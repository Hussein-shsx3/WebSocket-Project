// client/src/components/ui/display/MessageStatus.tsx

import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";

export type MessageStatusType =
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "SENDING";

interface MessageStatusProps {
  status: MessageStatusType;
  className?: string;
}

/**
 * Message Status Indicator
 * Shows message delivery status with appropriate icon
 *
 * - SENDING: Clock (grey)
 * - SENT: Single check (grey)
 * - DELIVERED: Double check (grey)
 * - READ: Double check (blue/green)
 * - FAILED: Alert circle (red)
 */
export const MessageStatus = ({
  status,
  className = "",
}: MessageStatusProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "SENDING":
        return <Clock className="w-4 h-4 text-gray-400" />;

      case "SENT":
        return <Check className="w-4 h-4 text-gray-400" />;

      case "DELIVERED":
        return <CheckCheck className="w-4 h-4 text-gray-400" />;

      case "READ":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;

      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;

      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "SENDING":
        return "Sending...";
      case "SENT":
        return "Sent";
      case "DELIVERED":
        return "Delivered";
      case "READ":
        return "Read";
      case "FAILED":
        return "Failed to send";
      default:
        return "";
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      title={getStatusText()}
    >
      {getStatusIcon()}
    </div>
  );
};
