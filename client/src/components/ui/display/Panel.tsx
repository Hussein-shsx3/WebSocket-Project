import React from "react";

interface PanelProps {
  children: React.ReactNode;
}

export function Panel({ children }: PanelProps) {
  return (
    <section className="w-full md:w-[320px] bg-panel flex flex-col overflow-hidden border-r border-border">
      {children}
    </section>
  );
}
