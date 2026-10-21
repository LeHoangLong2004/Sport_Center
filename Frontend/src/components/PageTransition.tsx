import React, { useEffect, useRef } from "react";

interface PageTransitionProps {
  pageKey: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Universal PageTransition component.
 * Provides a buttery-smooth fade-in and subtle slide-up effect
 * whenever pageKey changes, and automatically resets container scroll to top.
 */
export function PageTransition({ pageKey, children, className = "" }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically reset scroll on page change
    if (containerRef.current) {
      const scrollParent = findScrollableParent(containerRef.current);
      if (scrollParent) {
        scrollParent.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [pageKey]);

  return (
    <div
      key={pageKey}
      ref={containerRef}
      className={`page-transition-container portal-page-enter w-full ${className}`}
    >
      {children}
    </div>
  );
}

function findScrollableParent(node: HTMLElement | null): HTMLElement | null {
  if (!node) return null;
  let parent = node.parentElement;
  while (parent && parent !== document.body) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

export default PageTransition;
