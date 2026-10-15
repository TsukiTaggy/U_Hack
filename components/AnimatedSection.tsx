import type { CSSProperties, ReactNode } from "react";

type Animation = "fade-in" | "fade-up" | "scale" | "slide-left" | "slide-right";

const animationClasses: Record<Animation, string> = {
  "fade-in": "animate-stagger-fade",
  "fade-up": "animate-fade-in-up",
  scale: "animate-scale-in",
  "slide-left": "animate-slide-in-left",
  "slide-right": "animate-slide-in-right",
};

export function AnimatedSection({
  animation,
  children,
  className = "",
  delay = 0,
}: {
  animation: Animation;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const style: CSSProperties = { animationDelay: `${delay}ms` };

  return (
    <div className={`${animationClasses[animation]} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
