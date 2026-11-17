import React, { useState, useEffect } from 'react';
import { ClinicNotification } from '../types';
import {
  Phone,
  Menu,
  X,
  Bell,
  BellRing,
  ArrowRight,
  Download,
  Settings,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  getThemePalette,
} from '../data/clinicData';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestMobileNotificationPermission,
} from '../services/notifications';
import { CustomerSettingsModal } from './CustomerSettingsModal';

interface HeaderProps {
  brandName: string;
  onTabChange: (tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin') => void;
  activeTab: string;
  notifications?: ClinicNotification[];
  onNotificationPermissionChange?: (perm: NotificationPermission | 'unsupported') => void;
  onRefreshCloudData?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  brandName,
  onTabChange,
  activeTab,
  notifications = [],
  onNotificationPermissionChange,
  onRefreshCloudData,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );

  const notifRef = React.useRef<HTMLDivElement>(null);

  const theme = getThemePalette();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('lifecare_pwa_installed') === 'true'
    );
  });
  const [showIosTip, setShowIosTip] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkInstalled = () => {
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true ||
          localStorage.getItem('lifecare_pwa_installed') === 'true';
        setIsAppInstalled(Boolean(isStandalone));
      };

      checkInstalled();

      const handleBeforeInstallPrompt = (e: Event) => {
        if (localStorage.getItem('lifecare_pwa_installed') === 'true') {
          return;
        }
        e.preventDefault();
        setDeferredPrompt(e);
      };

      const handleAppInstalled = () => {
        setIsAppInstalled(true);
        try {
          localStorage.setItem('lifecare_pwa_installed', 'true');
        } catch {
          // ignore
        }
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsAppInstalled(true);
        try {
          localStorage.setItem('lifecare_pwa_installed', 'true');
        } catch {
          // ignore
        }
        setDeferredPrompt(null);
      }
    } else {
      setShowIosTip((prev) => !prev);
    }
  };

  const activeNotifications = React.useMemo(() => {
    return notifications.filter((n) => n.active !== false);
  }, [notifications]);

  const currentNotifKeys = React.useMemo(() => {
    return activeNotifications.map((n) => `notif-${n.id}-${n.createdAt || ''}`);
  }, [activeNotifications]);

  const handleEnablePhoneAlerts = async () => {
    const res = await requestMobileNotificationPermission();
    setNotifPerm(res);
    if (onNotificationPermissionChange) {
      onNotificationPermissionChange(res);
    }
  };

  // Read notifications from localStorage
  const [readNotifKeys, setReadNotifKeys] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lifecare_read_notif_keys');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Calculate unread count (only notifications user hasn't seen yet)
  const unreadCount = React.useMemo(() => {
    return currentNotifKeys.filter((k) => !readNotifKeys.includes(k)).length;
  }, [currentNotifKeys, readNotifKeys]);

  const handleOpenNotifications = () => {
    const nextState = !notifOpen;
    setNotifOpen(nextState);

    // If opening drawer, mark all currently active notifications as read
    if (nextState && unreadCount > 0) {
      try {
        const merged = Array.from(new Set([...readNotifKeys, ...currentNotifKeys]));
        localStorage.setItem('lifecare_read_notif_keys', JSON.stringify(merged));
        setReadNotifKeys(merged);
      } catch {
        // ignore
      }
    }
  };

  // Close menus on tap/click anywhere outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };

    if (notifOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [notifOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs transition-colors ${theme.headerBg}`}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Hamburger menu beside the + logo */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="p-1.5 -ml-1 rounded-xl transition-colors cursor-pointer text-slate-700 hover:text-teal-800 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-0.5 shadow-xs border border-slate-200/90 shrink-0 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Life Care"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span
                  className={`font-extrabold text-sm sm:text-base leading-tight tracking-tight block ${theme.headingText}`}
                >
                  {brandName}
                </span>
                <span className={`text-[10px] font-medium block ${theme.accentText}`}>
                  Open Now · Pharmacy & Clinic
                </span>
              </div>
            </button>
          </div>

          {/* Right actions: Notification Bell & Call */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Notification Bell: Clinic & Doctor Visit Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleOpenNotifications}
                aria-label="Notifications"
                className="relative p-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer border bg-white/90 text-[#3B3F7D] hover:text-[#6D4AFF] border-[#E5E0FA]"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs bg-[#EC4899] text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3 ${theme.cardBg}`}
                  >
                    <div className={`flex items-center justify-between pb-2.5 border-b ${theme.border}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔔</span>
                        <h4 className={`font-extrabold text-xs sm:text-sm ${theme.headingText}`}>
                          Notifications
                        </h4>
                      </div>

                      {isNotificationSupported() && (
                        notifPerm === 'granted' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <BellRing className="w-3 h-3" />
                            <span>Phone Alerts On</span>
                          </span>
                        ) : notifPerm === 'default' ? (
                          <button
                            type="button"
                            onClick={handleEnablePhoneAlerts}
                            className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <BellRing className="w-3 h-3" />
                            <span>Enable Phone Alerts</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Alerts blocked in browser
                          </span>
                        )
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                      {activeNotifications.length > 0 ? (
                        activeNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-2xl border text-left transition-colors relative overflow-hidden ${
                              notif.type === 'alert' || notif.type === 'urgent'
                                ? 'bg-rose-50/90 border-rose-200'
                                : notif.type === 'offer'
                                ? 'bg-amber-50/80 border-amber-200'
                                : 'bg-teal-50/70 border-teal-200/80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                  notif.type === 'alert' || notif.type === 'urgent'
                                    ? 'bg-rose-600 text-white'
                                    : notif.type === 'offer'
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-teal-700 text-white'
                                }`}
                              >
                                {notif.badge || notif.category || 'Notice'}
                              </span>
                              <span className="text-[9px] font-semibold text-slate-400">
                                {notif.sentByAdminAt || 'Recent'}
                              </span>
                            </div>

                            <h5 className="font-extrabold text-xs text-slate-900 leading-tight">
                              {notif.title}
                            </h5>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {notif.message}
                            </p>

                            {notif.actionLabel && (
                              <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotifOpen(false);
                                    if (notif.actionUrl && notif.actionUrl.startsWith('http')) {
                                      window.open(notif.actionUrl, '_blank', 'noopener,noreferrer');
                                    } else if (
                                      notif.actionUrl &&
                                      ['home', 'doctors', 'store', 'appointments', 'offers'].includes(notif.actionUrl)
                                    ) {
                                      onTabChange(notif.actionUrl as any);
                                    } else {
                                      const text = (notif.title + ' ' + notif.message).toLowerCase();
                                      if (text.includes('medicine') || text.includes('store') || text.includes('order')) {
                                        onTabChange('store');
                                      } else if (text.includes('doctor') || text.includes('opd') || text.includes('consult')) {
                                        onTabChange('doctors');
                                      } else if (text.includes('test') || text.includes('lab') || text.includes('pathology')) {
                                        onTabChange('appointments');
                                      } else if (text.includes('offer') || text.includes('discount')) {
                                        onTabChange('offers');
                                      }
                                    }
                                  }}
                                  className="text-[10px] font-extrabold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{notif.actionLabel}</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs font-medium">
                          No new notifications right now.
                        </div>
                      )}
                    </div>

                    <div
                      className={`pt-2 border-t flex items-center justify-between text-[11px] ${theme.border}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onTabChange('doctors');
                        }}
                        className={`font-extrabold hover:underline cursor-pointer ${theme.accentText}`}
                      >
                        Doctors
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onTabChange('appointments');
                        }}
                        className={`font-bold hover:underline cursor-pointer ${theme.accentText}`}
                      >
                        OPD Schedule →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Call */}
            <a
              href={`tel:${CLINIC_CONFIG.phone}`}
              aria-label="Call Clinic"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors border text-[#5B3DF5] bg-[#EDE8FC] hover:bg-[#E2DAFB] border-[#D8CCF9]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Side Drawer (Opens from Left) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div
            className={`relative mr-auto w-76 max-w-[84vw] h-full shadow-2xl p-5 flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200 border-r ${theme.cardBg}`}
          >
            <div>
              <div className={`flex items-center justify-between pb-4 border-b ${theme.border}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-white p-0.5 shadow-2xs border border-slate-200/90 shrink-0 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Life Care"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className={`font-extrabold text-sm ${theme.headingText}`}>
                    Life Care Poly Clinic
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-75"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mt-4 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('home');
                    setDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'home' ? `border ${theme.softCardBg}` : 'hover:opacity-80'
                  }`}
                >
                  <span>🏠</span> Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('doctors');
                    setDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'doctors' ? `border ${theme.softCardBg}` : 'hover:opacity-80'
                  }`}
                >
                  <span>👨‍⚕️</span> Specialist Doctors
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('store');
                    setDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'store' ? `border ${theme.softCardBg}` : 'hover:opacity-80'
                  }`}
                >
                  <span>💊</span> Pharmacy & Supplies
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('appointments');
                    setDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'appointments' ? `border ${theme.softCardBg}` : 'hover:opacity-80'
                  }`}
                >
                  <span>📋</span> OPD Schedule & History
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('offers');
                    setDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'offers' ? `border ${theme.softCardBg}` : 'hover:opacity-80'
                  }`}
                >
                  <span>🎁</span> Special Offers
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer hover:bg-[#F4F1FF] text-[#1E2252]"
                >
                  <Settings className="w-4 h-4 text-[#6D4AFF]" />
                  <span>Settings (Notifications & Location)</span>
                </button>
              </div>

              {/* Install PWA App to Home Screen (Hidden once installed) */}
              {!isAppInstalled && (
                <div className="mt-4 p-3 rounded-2xl bg-[#F4F1FF] border border-[#D8CCF9] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-[#D8CCF9] shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                      <img src="/logo.png" alt="Life Care Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs text-[#1E2252] block leading-tight">
                        Install Life Care App
                      </span>
                      <span className="text-[10px] text-[#6D4AFF] font-medium block">
                        Add to your home screen
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstallPwa}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] hover:brightness-105 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </button>

                  {showIosTip && (
                    <div className="p-2.5 rounded-xl bg-white text-slate-700 text-[11px] leading-relaxed border border-teal-100 shadow-2xs space-y-1">
                      <p className="font-bold text-teal-900">How to add to your Home Screen:</p>
                      <p>• <strong>iPhone / iPad:</strong> Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari, then tap <strong>"Add to Home Screen"</strong>.</p>
                      <p>• <strong>Android / PC:</strong> Tap the <strong>Install</strong> icon in your browser's address bar or menu.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger Menu Footer */}
            <div className={`pt-4 border-t text-center space-y-1 ${theme.border}`}>
              <p className="text-[10px] text-slate-400 font-medium">
                © 2026 Life Care Medicine Store and Poly Clinic • Baripada
              </p>
              <p className={`text-[9px] ${theme.subText}`}>
                Hospital Square, Baripada • 8:00 AM - 10:00 PM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Settings Modal (Notifications, Location, Refresh, Install) */}
      <CustomerSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onNotificationPermissionChange={(perm) => {
          setNotifPerm(perm);
          onNotificationPermissionChange?.(perm);
        }}
        onRefreshCloudData={onRefreshCloudData}
        isAppInstalled={isAppInstalled}
        onInstallPwa={handleInstallPwa}
      />
    </>
  );
};
