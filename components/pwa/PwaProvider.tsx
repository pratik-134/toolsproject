"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { WifiOff, Wifi, Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType>({
  isOnline: true,
  isInstallable: false,
  isInstalled: false,
  installApp: async () => {},
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showStatusToast, setShowStatusToast] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  // 1. Service Worker Registration
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("New Qwertygen version available. Ready to update.");
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.error("Service worker registration failed:", err);
          });
      });
    }

    // Check if running in standalone PWA mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }
  }, []);

  // 2. Online / Offline Event Listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatusToast(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 3. BeforeInstallPrompt Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed prompt recently
      const dismissed = localStorage.getItem("ct_pwa_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 4. Install App Trigger
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem("ct_pwa_dismissed", String(Date.now()));
    } catch {}
  };

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        isInstallable: !!deferredPrompt && !isInstalled,
        isInstalled,
        installApp,
      }}
    >
      {children}

      {/* Online / Offline Status Toast */}
      {showStatusToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
          style={{
            backgroundColor: isOnline ? "#059669" : "#D97706",
            borderColor: isOnline ? "#047857" : "#B45309",
            color: "#FFFFFF",
          }}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 shrink-0" />
              <span>Back online. All features synchronized.</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>You are offline. Cached tools remain fully functional in-memory.</span>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowStatusToast(false)}
            className="p-1 hover:bg-black/20 rounded-md transition-colors"
            aria-label="Dismiss status notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Subtle PWA Install Banner */}
      {showInstallBanner && deferredPrompt && !isInstalled && (
        <aside
          aria-label="Install Qwertygen Application"
          className="fixed bottom-4 left-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Install Qwertygen App
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Run 169+ private tools offline with standalone window mode.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissInstallBanner}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Close install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={installApp}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors text-center"
            >
              Install Application
            </button>
            <button
              type="button"
              onClick={dismissInstallBanner}
              className="py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            >
              Not Now
            </button>
          </div>
        </aside>
      )}
    </PwaContext.Provider>
  );
}
