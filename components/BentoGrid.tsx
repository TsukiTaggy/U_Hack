import { type ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: "1" | "2" | "full";
}

export function BentoCard({ children, className = "", span = "1" }: BentoCardProps) {
  const spanClass = {
    "1": "col-span-1",
    "2": "sm:col-span-2",
    "full": "col-span-full",
  }[span];

  return (
    <div className={`group animated-card ${spanClass} ${className}`}>
      <div className="animated-card-border"></div>
      {children}
    </div>
  );
}

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
}
