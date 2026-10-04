"use client";

import { useState, useEffect, useCallback } from "react";

export interface SessionHistoryItem {
  id: string;
  value: string;
  label?: string;
  timestamp: number;
}

const MAX_HISTORY_ITEMS = 10;

/**
 * Client-Side In-Memory / Session History Hook
 * Zero cloud egress: items reside in browser sessionStorage and automatically purge on tab close.
 */
export function useSessionHistory(toolSlug: string) {
  const storageKey = `ct_history_${toolSlug}`;
  const [items, setItems] = useState<SessionHistoryItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed.slice(0, MAX_HISTORY_ITEMS));
        }
      }
    } catch {
      // sessionStorage unavailable or restricted
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Add an item to history
  const addItem = useCallback(
    (value: string, label?: string) => {
      if (!value || !value.trim()) return;

      setItems((prev) => {
        // Prevent immediate duplicates
        if (prev.length > 0 && prev[0]?.value === value.trim()) {
          return prev;
        }

        const newItem: SessionHistoryItem = {
          id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          value: value.trim(),
          label,
          timestamp: Date.now(),
        };

        const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify(updated));
          }
        } catch {
          // ignore storage quota
        }
        return updated;
      });
    },
    [storageKey]
  );

  // Remove a single item
  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify(updated));
          }
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  // Clear all history for this tool
  const clearHistory = useCallback(() => {
    setItems([]);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(storageKey);
      }
    } catch {}
  }, [storageKey]);

  return {
    items,
    addItem,
    removeItem,
    clearHistory,
    isHydrated,
  };
}
