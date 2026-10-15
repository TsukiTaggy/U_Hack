"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale";
  delay?: number;
}

export function AnimatedSection({ 
  children, 
  className = "", 
  animation = "fade-up",
  delay = 0 
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      element.style.opacity = "1";
      element.style.transform = "none";
      return;
    }

    // Set initial state based on animation type
    element.style.opacity = "0";
    switch (animation) {
      case "fade-up":
        element.style.transform = "translateY(24px)";
        break;
      case "fade-in":
        element.style.transform = "none";
        break;
      case "slide-left":
        element.style.transform = "translateX(-32px)";
        break;
      case "slide-right":
        element.style.transform = "translateX(32px)";
        break;
      case "scale":
        element.style.transform = "scale(0.95)";
        break;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              element.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
              element.style.opacity = "1";
              element.style.transform = "translateY(0) translateX(0) scale(1)";
            }, delay);
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [animation, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
