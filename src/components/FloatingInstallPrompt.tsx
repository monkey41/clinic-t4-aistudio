import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const FloatingInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        localStorage.getItem('lifecare_pwa_installed') === 'true'
    );
  });
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lifecare_install_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        localStorage.getItem('lifecare_pwa_installed') === 'true';
      setIsInstalled(Boolean(standalone));
    };

    checkStandalone();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('lifecare_pwa_installed', 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (isInstalled || dismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem('lifecare_pwa_installed', 'true');
        } catch {
          // ignore
        }
        setDeferredPrompt(null);
      }
    } else {
      setShowTip((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowTip(false);
    try {
      sessionStorage.setItem('lifecare_install_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-20 left-3 sm:left-5 z-35 max-w-[232px]">
      {showTip && (
        <div className="mb-2 p-3 rounded-2xl bg-[#FCFBF7] border border-[#EAE4D3] shadow-xl text-[11px] text-[#122B22] space-y-1 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-black text-[#065F46]">Install on Your Phone</p>
            <button
              type="button"
              onClick={() => setShowTip(false)}
              className="p-0.5 text-[#7C8F86] hover:text-[#122B22] cursor-pointer"
              aria-label="Close install instructions"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[#4B6358] leading-snug">
            <strong>iPhone:</strong> Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.
          </p>
          <p className="text-[#4B6358] leading-snug">
            <strong>Android / PC:</strong> Tap browser menu (⋮) → <strong>Install app</strong>.
          </p>
        </div>
      )}

      <div className="flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-full bg-[#FCFBF7]/95 backdrop-blur-md border border-[#A7F3D0] shadow-lg shadow-emerald-950/12">
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-2 text-left cursor-pointer group"
        >
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#059669] to-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Download className="w-3.5 h-3.5" />
          </span>
          <span className="leading-tight pr-1">
            <span className="block text-[11px] font-black text-[#122B22] group-hover:text-[#059669]">
              Download App
            </span>
            <span className="block text-[9px] font-semibold text-[#D97706]">
              Quick Home Access
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss download prompt"
          className="w-6 h-6 rounded-full hover:bg-[#F7F4EC] text-[#7C8F86] hover:text-[#122B22] flex items-center justify-center shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
