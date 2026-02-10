"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Hook that safely handles useReducedMotion to avoid hydration mismatches.
 * Returns false on server, and the actual reduced motion preference on client.
 * Use this to conditionally render different animations without hydration errors.
 */
export function useSafeReduceMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return false during SSR to match server state
  return isClient ? prefersReducedMotion : false;
}
