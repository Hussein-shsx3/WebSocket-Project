// client/src/components/ui/display/DateSeparator.tsx

interface DateSeparatorProps {
  label: string;
}

/**
 * Date Separator for Messages
 * Modern sticky header design
 */
export const DateSeparator = ({ label }: DateSeparatorProps) => {
  return (
    <div className="flex items-center justify-center sticky top-0 z-10 py-3">
      <div className="px-4 py-1.5 bg-panel/90 dark:bg-header/90 backdrop-blur-sm rounded-full shadow-sm border border-border">
        <span className="text-xs font-semibold text-secondary">
          {label}
        </span>
      </div>
    </div>
  );
};
