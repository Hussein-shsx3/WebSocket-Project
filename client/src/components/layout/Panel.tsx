import React from "react";

interface PanelProps {
  children: React.ReactNode;
}

export function Panel({ children }: PanelProps) {
  return (
    <section className="relative w-full md:w-[300px] bg-panel flex flex-col overflow-hidden">
      {children}
    </section>
  );
}
