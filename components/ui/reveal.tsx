"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  variant?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "zoom-in";
  delay?: number; // in ms
  duration?: number; // in ms
  threshold?: number;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionMediaQuery.matches) {
      setPrefersReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    const currentElem = domRef.current;
    if (currentElem) observer.observe(currentElem);

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [threshold]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Define initial and animated styles
  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1)";
    switch (variant) {
      case "fade-up":
        return "translate3d(0, 24px, 0)";
      case "slide-left":
        return "translate3d(-24px, 0, 0)";
      case "slide-right":
        return "translate3d(24px, 0, 0)";
      case "zoom-in":
        return "scale(0.96)";
      case "fade-in":
      default:
        return "none";
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Smooth easeOutCubic
      }}
      className={className}
    >
      {children}
    </div>
  );
};
