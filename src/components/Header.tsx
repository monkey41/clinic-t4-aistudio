import React, { useState } from 'react';
import { Language, DoctorArrival, SpecialOffer, DarkColorOption } from '../types';
import {
  Phone,
  Menu,
  X,
  Bell,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  DEFAULT_SPECIAL_OFFERS,
  DOCTOR_BOOKING_URL,
  getThemePalette,
  addBookingHistoryItem,
} from '../data/clinicData';

interface HeaderProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  brandName: string;
  onTabChange: (tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers') => void;
  activeTab: string;
  isDark?: boolean;
  onToggleDark?: () => void;
  darkColor?: DarkColorOption;
  onSelectDarkColor?: (color: DarkColorOption) => void;
  specialOffers?: SpecialOffer[];
  unannouncedArrivals?: DoctorArrival[];
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  brandName,
  onTabChange,
  activeTab,
  isDark = false,
  onToggleDark,
  darkColor = 'ocean',
  onSelectDarkColor,
  specialOffers = DEFAULT_SPECIAL_OFFERS,
  unannouncedArrivals = [],
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = React.useRef<HTMLDivElement>(null);

  const theme = getThemePalette(isDark, darkColor);
  const topOffers = specialOffers.slice(0, 2);
  const totalNotifications = unannouncedArrivals.length + topOffers.length;

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

  const darkColorOptions: { id: DarkColorOption; label: string; swatchClass: string }[] = [
    { id: 'ocean', label: 'Ocean Green', swatchClass: 'bg-[#0d9488] border-teal-300' },
    { id: 'black', label: 'Black', swatchClass: 'bg-[#0a0a0a] border-zinc-400' },
    { id: 'babypink', label: 'Baby Pink', swatchClass: 'bg-[#f9a8d4] border-pink-200' },
  ];

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
              className={`p-1.5 -ml-1 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'hover:bg-white/10' : 'text-slate-700 hover:text-teal-800 hover:bg-slate-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2 text-left group focus:outline-hidden cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-colors shrink-0 ${theme.primaryBtn}`}
              >
                ✚
              </div>
              <div>
                <span
                  className={`font-extrabold text-sm sm:text-base leading-tight tracking-tight block ${theme.headingText}`}
                >
                  {brandName}
                </span>
                <span className={`text-[10px] font-medium flex items-center gap-1 ${theme.accentText}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open Now • Pharmacy & Clinic
                </span>
              </div>
            </button>
          </div>

          {/* Right actions: WhatsApp, Notifications Bell, Language picker & Quick Call */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Direct WhatsApp Chat Button */}
            <a
              href={`https://wa.me/${CLINIC_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Life%20Care%20Medicine%20Store%20and%20Poly%20Clinic%2C%20I%20would%20like%20to%20consult%20or%20inquire%20about%20medicines.`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className={`flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg transition-colors border ${
                isDark
                  ? `${theme.cardBg} hover:opacity-90`
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Chat with Clinic on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden xs:inline">WhatsApp</span>
            </a>

            {/* Notification Bell: Doctors Arriving Unannounced & Special Offers (No Admin Alert button/form) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className={`relative p-2 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer border ${
                  isDark ? theme.cardBg : 'bg-white text-slate-700 hover:text-teal-700 border-slate-200'
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {totalNotifications > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-pulse ${
                      isDark ? theme.primaryBtn : 'bg-rose-500 text-white'
                    }`}
                  >
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer (Clean: No Admin Alert button/form) */}
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3 ${theme.cardBg}`}
                  >
                    <div className={`flex items-center justify-between pb-2 border-b ${theme.border}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🔔</span>
                        <div>
                          <h4 className={`font-extrabold text-xs sm:text-sm ${theme.headingText}`}>
                            Notifications
                          </h4>
                          <span className={`text-[10px] block ${theme.subText}`}>
                            Special Offers & Doctors Arriving Unannounced
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                      {/* 1. SPECIAL OFFER NOTIFICATIONS */}
                      <div className="space-y-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider block ${theme.accentText}`}
                        >
                          🎁 Special Offers
                        </span>
                        {topOffers.map((offer) => (
                          <button
                            key={offer.id}
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              onTabChange('offers');
                            }}
                            className={`w-full p-2.5 rounded-2xl border text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${theme.softCardBg}`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 shrink-0" />
                                <span
                                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${theme.primaryBtn}`}
                                >
                                  {offer.discountText}
                                </span>
                              </div>
                              <h5 className={`font-extrabold text-xs truncate mt-1 ${theme.headingText}`}>
                                {offer.title}
                              </h5>
                              <p className={`text-[10px] truncate ${theme.subText}`}>
                                {offer.subtitle}
                              </p>
                            </div>
                            <span
                              className={`text-[11px] font-bold shrink-0 flex items-center gap-0.5 ${theme.accentText}`}
                            >
                              Open <ArrowRight className="w-3 h-3" />
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* 2. DOCTORS ARRIVING UNANNOUNCED */}
                      <div className="space-y-1.5 pt-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider block ${theme.accentText}`}
                        >
                          👨‍⚕️ Doctors Arriving Unannounced
                        </span>

                        {unannouncedArrivals.map((arrival) => (
                          <div
                            key={arrival.id}
                            className={`p-2.5 rounded-2xl border text-left transition-colors flex items-start gap-2.5 ${theme.subtleBg}`}
                          >
                            <img
                              src={arrival.photo}
                              alt={arrival.doctorName}
                              className="w-10 h-10 rounded-xl object-cover object-top border border-white/20 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${theme.badge}`}
                                >
                                  Unannounced Visit
                                </span>
                                <span className={`text-[9px] font-semibold ${theme.subText}`}>
                                  {arrival.sentByAdminAt || 'Today'}
                                </span>
                              </div>
                              <h5 className={`font-extrabold text-xs truncate mt-1 ${theme.headingText}`}>
                                {arrival.doctorName}
                              </h5>
                              <p className={`text-[10px] truncate font-semibold ${theme.accentText}`}>
                                {arrival.specialty}
                              </p>
                              {arrival.note && (
                                <p className={`text-[10px] mt-0.5 leading-snug ${theme.subText}`}>
                                  {arrival.note}
                                </p>
                              )}
                              <div
                                className={`flex items-center justify-between mt-1.5 pt-1 border-t text-[10px] ${theme.border}`}
                              >
                                <span className={`truncate font-bold ${theme.headingText}`}>
                                  🕒 {arrival.timing}
                                </span>
                                <a
                                  href={DOCTOR_BOOKING_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    addBookingHistoryItem(
                                      'doctor',
                                      arrival.doctorName,
                                      arrival.timing
                                    );
                                    setNotifOpen(false);
                                  }}
                                  className={`font-extrabold underline flex items-center gap-0.5 ml-1 shrink-0 ${theme.accentText}`}
                                >
                                  Book OPD <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`pt-2 border-t flex items-center justify-between text-[11px] ${theme.border}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onTabChange('offers');
                        }}
                        className={`font-extrabold hover:underline cursor-pointer ${theme.accentText}`}
                      >
                        🎁 View All Special Offers
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onTabChange('appointments');
                        }}
                        className={`font-bold hover:underline cursor-pointer ${theme.accentText}`}
                      >
                        Visit Calendar →
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
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border ${
                isDark ? theme.cardBg : 'text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200/60'
              }`}
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
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${theme.primaryBtn}`}
                  >
                    ✚
                  </div>
                  <span className={`font-extrabold text-sm ${theme.headingText}`}>
                    Life Care Medicine Store
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
                  <span>👨‍⚕️</span> Meet Our Doctors (11)
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
                  <span>💊</span> Pharmacy & Physiotherapy
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
                  <span>📋</span> Bookings, History & Calendar
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
              </div>

              {/* Dark Theme Switch + 3 Separate Color Options (Ocean Green, Black, Baby Pink) */}
              <div className={`mt-6 pt-4 border-t ${theme.border} space-y-3`}>
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${theme.softCardBg}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs ${theme.primaryBtn}`}
                    >
                      {isDark ? '🌙' : '☀️'}
                    </div>
                    <div>
                      <span className={`text-xs font-extrabold block ${theme.headingText}`}>
                        Dark Theme
                      </span>
                      <span className={`text-[10px] block font-medium ${theme.subText}`}>
                        {isDark
                          ? `Active: ${
                              darkColor === 'ocean'
                                ? 'Ocean Green'
                                : darkColor === 'black'
                                ? 'Black'
                                : 'Baby Pink'
                            }`
                          : 'Off (Default Light)'}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={onToggleDark}
                    aria-label="Toggle dark theme"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isDark ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isDark ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3 Separate Dark Theme Color Options */}
                <div className={`p-3 rounded-2xl border space-y-2 ${theme.subtleBg}`}>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${theme.headingText}`}>
                    Dark Theme Color Options (Choose 1)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {darkColorOptions.map((opt) => {
                      const isSelected = isDark && darkColor === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (!isDark && onToggleDark) {
                              onToggleDark();
                            }
                            if (onSelectDarkColor) {
                              onSelectDarkColor(opt.id);
                            }
                          }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'ring-2 ring-white font-extrabold bg-black/30 border-white'
                              : 'opacity-80 hover:opacity-100 border-white/20 bg-black/10'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border shadow-xs flex items-center justify-center ${opt.swatchClass}`}
                          >
                            {isSelected && (
                              <Check
                                className={`w-3 h-3 ${
                                  opt.id === 'babypink' ? 'text-black' : 'text-white'
                                }`}
                              />
                            )}
                          </span>
                          <span className="text-[10px] leading-tight">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className={`pt-4 border-t text-center space-y-1 ${theme.border}`}>
              <p className={`text-xs font-bold ${theme.headingText}`}>
                Life Care Medicine Store and Poly Clinic
              </p>
              <p className={`text-[10px] ${theme.subText}`}>
                Hospital Square, Baripada • 8:00 AM - 10:00 PM
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
