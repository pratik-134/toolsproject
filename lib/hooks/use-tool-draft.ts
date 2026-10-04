"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface ToolDraftPayload<T> {
  data: T;
  savedAt: number;
  toolSlug: string;
}

export interface UseToolDraftOptions<T> {
  toolSlug: string;
  initialValue: T;
  debounceMs?: number;
  ttlMs?: number; // Time-to-live in milliseconds (default: 7 days)
  storagePrefix?: string;
  enabled?: boolean;
}

export interface UseToolDraftReturn<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  isDraftRestored: boolean;
  savedAt: number | null;
  clearDraft: (resetToInitial?: boolean) => void;
  saveNow: (overrideValue?: T) => void;
  formattedSavedAt: string;
  dismissRestoredBanner: () => void;
}

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_DEBOUNCE_MS = 500;
const DEFAULT_PREFIX = "ct_draft_";

/**
 * Format timestamp into human-readable relative time (e.g. "5 minutes ago", "yesterday")
 */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  if (diffMs < 0 || diffMs < 10000) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} seconds ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Universal Tool Draft Hook
 * 100% In-Browser, client-side debounced state persistence with safe SSR hydration and TTL expiry.
 */
export function useToolDraft<T>({
  toolSlug,
  initialValue,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  ttlMs = DEFAULT_TTL_MS,
  storagePrefix = DEFAULT_PREFIX,
  enabled = true,
}: UseToolDraftOptions<T>): UseToolDraftReturn<T> {
  const storageKey = `${storagePrefix}${toolSlug}`;

  const [value, setValue] = useState<T>(initialValue);
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const initialRenderRef = useRef(true);
  const isHydratedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Client-Side Hydration & Draft Restoration
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed: ToolDraftPayload<T> = JSON.parse(raw);
        const age = Date.now() - parsed.savedAt;

        // Check if draft has expired
        if (age < ttlMs && parsed.data !== undefined) {
          setValue(parsed.data);
          setIsDraftRestored(true);
          setSavedAt(parsed.savedAt);
        } else {
          // Stale draft expired, clean it up
          window.localStorage.removeItem(storageKey);
        }
      }
    } catch {
      // LocalStorage unavailable or parse error; keep initialValue
    } finally {
      isHydratedRef.current = true;
    }
  }, [storageKey, enabled, ttlMs]);

  // 2. Debounced Auto-Save
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !isHydratedRef.current) return;

    // Skip the very first execution before hydration
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        const now = Date.now();
        const payload: ToolDraftPayload<T> = {
          data: value,
          savedAt: now,
          toolSlug,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
        setSavedAt(now);
      } catch {
        // Quota exceeded or private mode restriction
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, storageKey, toolSlug, debounceMs, enabled]);

  // 3. Clear Draft Action
  const clearDraft = useCallback(
    (resetToInitial = true) => {
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          // Ignore
        }
      }
      setIsDraftRestored(false);
      setSavedAt(null);
      if (resetToInitial) {
        setValue(initialValue);
      }
    },
    [storageKey, initialValue]
  );

  // 4. Save Immediately Action
  const saveNow = useCallback(
    (overrideValue?: T) => {
      if (typeof window === "undefined") return;
      const dataToSave = overrideValue !== undefined ? overrideValue : value;
      try {
        const now = Date.now();
        const payload: ToolDraftPayload<T> = {
          data: dataToSave,
          savedAt: now,
          toolSlug,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
        setSavedAt(now);
      } catch {
        // Ignore
      }
    },
    [storageKey, toolSlug, value]
  );

  // 5. Dismiss Banner Action
  const dismissRestoredBanner = useCallback(() => {
    setIsDraftRestored(false);
  }, []);

  const formattedSavedAt = savedAt ? formatRelativeTime(savedAt) : "";

  return {
    value,
    setValue,
    isDraftRestored,
    savedAt,
    clearDraft,
    saveNow,
    formattedSavedAt,
    dismissRestoredBanner,
  };
}
