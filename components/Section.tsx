import { type ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  wide?: boolean;
  noPadding?: boolean;
}

export function Section({ children, className = "", id, wide = false, noPadding = false }: SectionProps) {
  const maxWidth = wide ? "max-w-7xl" : "max-w-6xl";
  const padding = noPadding ? "" : "px-6 py-12 sm:px-8 sm:py-16 lg:py-20";

  return (
    <section id={id} className={`w-full ${className}`}>
      <div className={`mx-auto ${maxWidth} ${padding}`}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeader({ title, subtitle, align = "left" }: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  
  return (
    <div className={`mb-8 max-w-5xl space-y-4 sm:mb-12 ${alignClass}`}>
      <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap sm:text-4xl lg:text-5xl title-gradient">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
