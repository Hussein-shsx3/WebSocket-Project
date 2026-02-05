import React from "react";

interface PanelProps {
  children: React.ReactNode;
  hideOnMobile?: boolean;
}

export function Panel({ children, hideOnMobile = false }: PanelProps) {
  return (
    <section 
      className={`relative w-full md:w-[300px] bg-panel flex-col overflow-y-auto ${
        hideOnMobile ? "hidden md:flex" : "flex"
      }`}
    >
      {children}
    </section>
  );
}
