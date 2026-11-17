import React, { useState } from 'react';
import { ClinicNotification } from '../types';
import {
  Phone,
  Menu,
  X,
  Bell,
  BellRing,
  ArrowRight,
  Settings,
  MapPin,
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
  onOpenMap?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  brandName,
  onTabChange,
  activeTab,
  notifications = [],
  onNotificationPermissionChange,
  onRefreshCloudData,
  onOpenMap,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );

  const notifRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const theme = getThemePalette();

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

  const [readNotifKeys, setReadNotifKeys] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lifecare_read_notif_keys');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const unreadCount = React.useMemo(() => {
    return currentNotifKeys.filter((k) => !readNotifKeys.includes(k)).length;
  }, [currentNotifKeys, readNotifKeys]);

  const handleOpenNotifications = () => {
    setMenuOpen(false);
    const nextState = !notifOpen;
    setNotifOpen(nextState);

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

  const handleToggleMenu = () => {
    setNotifOpen(false);
    setMenuOpen((prev) => !prev);
  };

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (notifOpen || menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [notifOpen, menuOpen]);

  const whatsappUrl = `https://wa.me/${CLINIC_CONFIG.whatsapp.replace(
    /[^0-9]/g,
    ''
  )}?text=${encodeURIComponent(
    'Hello Life Care Medicine Store and Poly Clinic, I would like to inquire about medicines or doctor OPD.'
  )}`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs transition-colors ${theme.headerBg}`}
      >
        <div className="max-w-2xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-2">
          {/* Left: Compact Menu Box Anchor + Clinic Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={handleToggleMenu}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className="p-2 rounded-xl transition-colors cursor-pointer text-[#122B22] hover:text-[#059669] hover:bg-[#ECFDF5] border border-transparent hover:border-[#A7F3D0]"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Compact Floating Menu Popover Box (matches Notification box, does NOT hijack screen) */}
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-3xl shadow-2xl border border-[#EAE4D3] bg-[#FCFBF7] p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D3]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg overflow-hidden bg-white p-0.5 border border-[#EAE4D3] shrink-0">
                          <img src="/logo.png" alt="Life Care" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-black text-xs text-[#122B22]">Menu</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        className="p-1 rounded-lg text-[#4B6358] hover:bg-[#ECFDF5] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('home');
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeTab === 'home'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : 'text-[#122B22] hover:bg-[#F7F4EC]'
                        }`}
                      >
                        <span>🏠</span>
                        <span>Home</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('doctors');
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeTab === 'doctors'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : 'text-[#122B22] hover:bg-[#F7F4EC]'
                        }`}
                      >
                        <span>👨‍⚕️</span>
                        <span>Specialist Doctors</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('store');
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeTab === 'store'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : 'text-[#122B22] hover:bg-[#F7F4EC]'
                        }`}
                      >
                        <span>💊</span>
                        <span>Pharmacy & Supplies</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('appointments');
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeTab === 'appointments'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : 'text-[#122B22] hover:bg-[#F7F4EC]'
                        }`}
                      >
                        <span>📋</span>
                        <span>Bookings & OPD Schedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('offers');
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeTab === 'offers'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : 'text-[#122B22] hover:bg-[#F7F4EC]'
                        }`}
                      >
                        <span>🎁</span>
                        <span>Special Offers</span>
                      </button>

                      {/* Location Item inside Hamburger Menu Box */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          if (onOpenMap) {
                            onOpenMap();
                          } else {
                            setSettingsOpen(true);
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-between gap-2 text-[#122B22] hover:bg-[#ECFDF5] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-[#059669]" />
                          <span>Location & Map</span>
                        </span>
                        <span className="text-[10px] font-extrabold text-[#D97706]">Baripada</span>
                      </button>

                      {/* Settings Item */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setSettingsOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2.5 text-[#122B22] hover:bg-[#F7F4EC] transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#059669]" />
                        <span>Settings (Alerts & GPS)</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#EAE4D3] text-center">
                      <p className="text-[10px] text-[#7C8F86] font-semibold">
                        Hospital Square, Baripada · 8 AM – 10 PM
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2 text-left group focus:outline-hidden cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-0.5 shadow-xs border border-[#EAE4D3] shrink-0 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Life Care"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <span
                  className={`font-extrabold text-sm leading-tight tracking-tight block truncate ${theme.headingText}`}
                >
                  {brandName}
                </span>
                <span className={`text-[10px] font-semibold block truncate ${theme.accentText}`}>
                  Pharmacy · Clinic · Lab
                </span>
              </div>
            </button>
          </div>

          {/* Right actions: WhatsApp + Notification Bell + Call */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* WhatsApp icon directly beside Notification icon */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Chat"
              title="Chat on WhatsApp"
              className="p-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer border bg-[#ECFDF5] hover:bg-[#D1FAE5] border-[#A7F3D0] flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 fill-[#059669]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleOpenNotifications}
                aria-label="Notifications"
                className="relative p-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer border bg-white text-[#122B22] hover:text-[#059669] border-[#EAE4D3]"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs bg-[#D97706] text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Box */}
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl shadow-2xl border border-[#EAE4D3] bg-[#FCFBF7] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE4D3]">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔔</span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#122B22]">
                          Notifications
                        </h4>
                      </div>

                      {isNotificationSupported() && (
                        notifPerm === 'granted' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-1">
                            <BellRing className="w-3 h-3" />
                            <span>Alerts On</span>
                          </span>
                        ) : notifPerm === 'default' ? (
                          <button
                            type="button"
                            onClick={handleEnablePhoneAlerts}
                            className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <BellRing className="w-3 h-3" />
                            <span>Enable Alerts</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-medium text-[#7C8F86]">
                            Blocked in browser
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
                                ? 'bg-rose-50 border-rose-200'
                                : notif.type === 'offer'
                                ? 'bg-[#FEF3C7]/60 border-[#FDE68A]'
                                : 'bg-[#ECFDF5]/80 border-[#A7F3D0]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                  notif.type === 'alert' || notif.type === 'urgent'
                                    ? 'bg-rose-600 text-white'
                                    : notif.type === 'offer'
                                    ? 'bg-[#D97706] text-white'
                                    : 'bg-[#059669] text-white'
                                }`}
                              >
                                {notif.badge || notif.category || 'Notice'}
                              </span>
                              <span className="text-[9px] font-semibold text-[#7C8F86]">
                                {notif.sentByAdminAt || 'Recent'}
                              </span>
                            </div>

                            <h5 className="font-extrabold text-xs text-[#122B22] leading-tight">
                              {notif.title}
                            </h5>
                            <p className="text-[11px] text-[#4B6358] mt-1 leading-relaxed">
                              {notif.message}
                            </p>

                            {notif.actionLabel && (
                              <div className="mt-2 pt-1.5 border-t border-[#EAE4D3] flex justify-end">
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
                                  className="text-[10px] font-extrabold text-[#065F46] hover:text-[#122B22] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{notif.actionLabel}</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-[#7C8F86] text-xs font-medium">
                          No new notifications right now.
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#EAE4D3] flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onTabChange('doctors');
                        }}
                        className="font-extrabold hover:underline cursor-pointer text-[#059669]"
                      >
                        Doctors
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onTabChange('appointments');
                        }}
                        className="font-bold hover:underline cursor-pointer text-[#059669]"
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
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-2 rounded-xl transition-colors border text-[#92400E] bg-[#FEF3C7] hover:bg-[#FDE68A] border-[#FDE68A]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Customer Settings Modal */}
      <CustomerSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onNotificationPermissionChange={(perm) => {
          setNotifPerm(perm);
          onNotificationPermissionChange?.(perm);
        }}
        onRefreshCloudData={onRefreshCloudData}
      />
    </>
  );
};
