import React, { useState, useEffect } from "react";
import { DownloadCloud, RefreshCw, X, WifiOff, CheckCircle2 } from "lucide-react";

/**
 * PwaUpdatePrompt
 * Displays a toast / banner when:
 * 1. A new service worker version is detected (needRefresh = true) -> offers one-tap reload.
 * 2. The app shell and level chunks are fully precached (offlineReady = true) -> confirms offline readiness.
 *
 * Gracefully detects virtual:pwa-register/react when available.
 */
export function PwaUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFunction, setUpdateFunction] = useState(null);

  useEffect(() => {
    let unmounted = false;

    // Dynamically load virtual:pwa-register/react in browser
    if (typeof window !== "undefined") {
      import("virtual:pwa-register")
        .then(({ registerSW }) => {
          if (unmounted) return;
          const updateSW = registerSW({
            onNeedRefresh() {
              setNeedRefresh(true);
            },
            onOfflineReady() {
              setOfflineReady(true);
            }
          });
          setUpdateFunction(() => updateSW);
        })
        .catch((err) => {
          // Virtual module not available in non-PWA dev or test environments
          // Silently proceed
        });
    }

    return () => {
      unmounted = true;
    };
  }, []);

  const handleUpdate = () => {
    if (updateFunction) {
      updateFunction(true);
    } else {
      window.location.reload();
    }
  };

  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Application Update Notice"
      className="fixed bottom-16 md:bottom-6 end-4 sm:end-6 z-50 max-w-sm w-full p-4 rounded-2xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 bg-slate-900/95 text-white border-amber-500/30"
    >
      {needRefresh ? (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white">App Update Available</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                A new version of LanguagePath is ready with updated lessons, exercises, and fixes.
              </p>
            </div>
            <button
              onClick={() => setNeedRefresh(false)}
              aria-label="Dismiss update notification"
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleUpdate}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Now</span>
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Offline Practice Ready</h4>
              <p className="text-[11px] text-slate-300">
                App shell & curriculum precached for offline use.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOfflineReady(false)}
            aria-label="Dismiss offline ready notice"
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PwaUpdatePrompt;
