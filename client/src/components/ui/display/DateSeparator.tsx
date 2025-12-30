// client/src/components/ui/display/DateSeparator.tsx

interface DateSeparatorProps {
  label: string;
}

/**
 * Date Separator for Messages
 * Displays date label between message groups
 * Similar to WhatsApp/Messenger style
 */
export const DateSeparator = ({ label }: DateSeparatorProps) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="px-3 py-1 bg-muted/50 dark:bg-muted/30 rounded-full">
        <span className="text-xs font-medium text-secondary uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
};
