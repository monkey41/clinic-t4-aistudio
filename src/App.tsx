import React, { useState, useEffect } from 'react';
import { SpecialOffer, DoctorArrival, DarkColorOption } from './types';
import { Header } from './components/Header';
import { DoctorSwipe } from './components/DoctorSwipe';
import { ClinicMap } from './components/ClinicMap';
import { PharmacySection } from './components/PharmacySection';
import { AppointmentsList } from './components/AppointmentsList';
import { SpecialOfferPage } from './components/SpecialOfferPage';
import { BottomNav } from './components/BottomNav';
import {
  DOCTORS,
  PRODUCTS,
  TRANSLATIONS,
  CLINIC_CONFIG,
  DEFAULT_SPECIAL_OFFERS,
  DOCTOR_BOOKING_URL,
  PATHOLOGY_BOOKING_URL,
  getUnannouncedArrivals,
  getThemePalette,
  addBookingHistoryItem,
} from './data/clinicData';
import {
  Stethoscope,
  FlaskConical,
  Calendar as CalendarIcon,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'doctors' | 'store' | 'appointments' | 'offers'
  >('home');
  const [appointmentsSubTab, setAppointmentsSubTab] = useState<
    'calendar' | 'pathology'
  >('calendar');

  // Clear any legacy localStorage custom photo overrides so the 4 original photos + default male/female avatars are always used
  useEffect(() => {
    try {
      localStorage.removeItem('lifecare_custom_doctor_photos');
    } catch {
      // ignore
    }
  }, []);

  const [specialOffers] = useState<SpecialOffer[]>(() => {
    try {
      const saved = localStorage.getItem('careplus_special_offers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SPECIAL_OFFERS;
  });

  const [unannouncedArrivals, setUnannouncedArrivals] = useState<DoctorArrival[]>(() =>
    getUnannouncedArrivals()
  );

  useEffect(() => {
    const syncArrivals = () => setUnannouncedArrivals(getUnannouncedArrivals());
    window.addEventListener('unannounced-arrivals-updated', syncArrivals);
    return () => window.removeEventListener('unannounced-arrivals-updated', syncArrivals);
  }, []);

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('careplus_theme') === 'dark';
  });

  // 3 separate color options for Dark Theme: 'ocean' | 'black' | 'babypink'
  const [darkColor, setDarkColor] = useState<DarkColorOption>(() => {
    const saved = localStorage.getItem('careplus_dark_color') as DarkColorOption;
    if (saved && ['ocean', 'black', 'babypink'].includes(saved)) {
      return saved;
    }
    return 'ocean';
  });

  const handleToggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('careplus_theme', next ? 'dark' : 'ocean');
      return next;
    });
  };

  const handleSelectDarkColor = (color: DarkColorOption) => {
    setDarkColor(color);
    localStorage.setItem('careplus_dark_color', color);
    if (!isDark) {
      setIsDark(true);
      localStorage.setItem('careplus_theme', 'dark');
    }
  };

  const t = TRANSLATIONS.en;
  const p = getThemePalette(isDark, darkColor);

  const topOffer = specialOffers[0] || DEFAULT_SPECIAL_OFFERS[0];

  const backdropClass = !isDark
    ? 'ocean-green-backdrop'
    : darkColor === 'ocean'
    ? 'dark-ocean-backdrop'
    : darkColor === 'black'
    ? 'dark-black-backdrop'
    : 'dark-babypink-backdrop';

  return (
    <div className={`relative min-h-screen transition-colors ${p.pageBg}`}>
      <div className={backdropClass} />

      <div
        className={`max-w-xl mx-auto min-h-screen shadow-2xl flex flex-col justify-between relative transition-colors ${p.shellBg}`}
      >
        {/* Sticky Header with Notifications & 3 Dark Theme Color Options (English only) */}
        <Header
          currentLang="en"
          onSelectLang={() => {}}
          brandName={t.brand || 'Life Care Medicine Store and Poly Clinic'}
          onTabChange={(tab) => {
            if (tab === 'appointments') {
              setAppointmentsSubTab('calendar');
            }
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeTab={activeTab}
          isDark={isDark}
          darkColor={darkColor}
          onToggleDark={handleToggleDark}
          onSelectDarkColor={handleSelectDarkColor}
          specialOffers={specialOffers}
          unannouncedArrivals={unannouncedArrivals}
        />

        {/* Main Content (Original clean transition) */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <div className="space-y-3.5 pt-2.5 pb-20">
              {/* Slightly Thicker Special Offer Ribbon on Home Page */}
              <div className="px-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('offers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl shadow-sm border flex items-center justify-between gap-3 text-left transition-all active:scale-99 cursor-pointer ${
                    !isDark
                      ? 'bg-gradient-to-r from-teal-800 via-teal-700 to-rose-700 border-teal-600 text-white hover:opacity-95'
                      : darkColor === 'ocean'
                      ? 'bg-[#083834] border-teal-600 text-teal-50 hover:bg-[#0d4a44]'
                      : darkColor === 'black'
                      ? 'bg-[#121212] border-neutral-700 text-white hover:bg-neutral-900'
                      : 'bg-[#3d1629] border-pink-400/50 text-pink-50 hover:bg-[#4d1c35]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs ${
                        !isDark
                          ? 'bg-amber-300 text-slate-950'
                          : darkColor === 'ocean'
                          ? 'bg-teal-400 text-[#021c1a]'
                          : darkColor === 'black'
                          ? 'bg-white text-black'
                          : 'bg-pink-300 text-[#2a0e1d]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {topOffer.discountText}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold block truncate">
                        {topOffer.title}
                      </span>
                      <span className="text-[10px] opacity-85 block truncate">
                        {topOffer.subtitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 text-xs font-extrabold flex items-center gap-1 ${
                      !isDark
                        ? 'text-amber-200'
                        : darkColor === 'ocean'
                        ? 'text-teal-300'
                        : darkColor === 'black'
                        ? 'text-neutral-300'
                        : 'text-pink-200'
                    }`}
                  >
                    Offer <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              {/* Hero Banner with Direct Booking Buttons (No clinic badge above, no extra writing below quote) */}
              <section
                className={`mx-4 rounded-3xl p-5 shadow-xs relative overflow-hidden transition-colors border ${p.cardAlt}`}
              >
                <div className="relative z-10">
                  <h1
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${p.heading}`}
                  >
                    {t.heroTitle || 'Caring for your family. Supporting your health'}
                  </h1>

                  {/* Direct Link Buttons to Official Booking Links */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={DOCTOR_BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'doctor',
                          title: 'Doctor OPD Registration',
                          subtitle: 'Booked from Home Hero',
                          url: DOCTOR_BOOKING_URL,
                        })
                      }
                      className={`active:scale-98 font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${p.primaryBtn}`}
                    >
                      <Stethoscope className="w-4 h-4 shrink-0" />
                      <span>🩺 Doctor OPD Booking</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>

                    <a
                      href={PATHOLOGY_BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'pathology',
                          title: 'Pathology Test Booking',
                          subtitle: 'Booked from Home Hero',
                          url: PATHOLOGY_BOOKING_URL,
                        })
                      }
                      className={`active:scale-98 font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${p.secondaryBtn}`}
                    >
                      <FlaskConical className="w-4 h-4 shrink-0" />
                      <span>🧪 Pathology Test Booking</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                </div>
              </section>

              {/* 2x2 Quick Feature Grid (Descriptive writings under headings removed) */}
              <section className="grid grid-cols-2 gap-3 px-4">
                {/* 1. Pathology Tests & Costs */}
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentsSubTab('pathology');
                    setActiveTab('appointments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl shadow-xs text-left transition-all active:scale-98 group cursor-pointer border ${p.card}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🧪</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${p.badge}`}>
                      78+ Tests
                    </span>
                  </div>
                  <h3 className={`font-extrabold text-sm leading-snug ${p.heading}`}>
                    Pathology & Costs
                  </h3>
                </button>

                {/* 2. Doctor Visit Calendar */}
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentsSubTab('calendar');
                    setActiveTab('appointments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl shadow-xs text-left transition-all active:scale-98 group cursor-pointer border ${p.card}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                    <CalendarIcon className={`w-4 h-4 ${p.accentText}`} />
                  </div>
                  <h3 className={`font-extrabold text-sm leading-snug ${p.heading}`}>
                    Doctor Calendar
                  </h3>
                </button>

                {/* 3. Pharmacy & Physiotherapy Store */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl shadow-md text-left transition-all active:scale-98 group cursor-pointer border ${p.cardAlt}`}
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💊</div>
                  <h3 className={`font-extrabold text-sm leading-snug ${p.heading}`}>
                    Medicine & Physio Store
                  </h3>
                </button>

                {/* 4. Special Offers */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('offers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl shadow-xs text-left transition-all active:scale-98 group cursor-pointer border ${p.card}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🎁</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${p.badge}`}>
                      Offers
                    </span>
                  </div>
                  <h3 className={`font-extrabold text-sm leading-snug ${p.heading}`}>
                    Special Offers
                  </h3>
                </button>
              </section>

              {/* All 11 Doctors Swipe Stack Section on Home */}
              <DoctorSwipe
                doctors={DOCTORS}
                t={t}
                isDark={isDark}
                darkColor={darkColor}
              />

              {/* Prominent Geographic Map Section */}
              <ClinicMap t={t} isDark={isDark} darkColor={darkColor} />
            </div>
          )}

          {/* Doctors Directory Tab (All 11 Doctors) */}
          {activeTab === 'doctors' && (
            <div className="py-4 px-4 pb-24 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${p.heading}`}>
                    <span>👨‍⚕️</span> {t.doctors || 'Meet Our Doctors'}
                  </h2>
                  <p className={`text-xs mt-0.5 font-medium ${p.subtext}`}>
                    All {DOCTORS.length} Specialist Doctors at Life Care Medicine Store and Poly Clinic
                  </p>
                </div>

                <a
                  href={DOCTOR_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    addBookingHistoryItem({
                      type: 'doctor',
                      title: 'General Doctor OPD Registration',
                      subtitle: 'Booked from Doctors Directory',
                      url: DOCTOR_BOOKING_URL,
                    })
                  }
                  className={`text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${p.primaryBtn}`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Book OPD</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Complete 11 Doctors Directory List */}
              <div className="space-y-3">
                {DOCTORS.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`rounded-2xl p-4 border shadow-sm transition-all ${p.card}`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className={`w-20 h-20 rounded-2xl object-cover object-top border-2 shadow-xs ${
                            !isDark
                              ? 'border-teal-500/30 bg-teal-50'
                              : darkColor === 'ocean'
                              ? 'border-teal-500/40 bg-[#083834]'
                              : darkColor === 'black'
                              ? 'border-neutral-700 bg-neutral-900'
                              : 'border-pink-300/40 bg-[#3d1629]'
                          }`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className={`font-extrabold text-sm leading-tight ${p.heading}`}>
                            {doctor.name}
                          </h4>
                        </div>
                        <span className={`text-xs font-bold block mt-0.5 ${p.accentText}`}>
                          {doctor.specialty}
                        </span>
                        <p className={`text-[11px] mt-0.5 ${p.subtext}`}>
                          {doctor.qualification} • {doctor.experience}
                        </p>
                        <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${p.heading}`}>
                          <span>🕒</span>
                          <span>{doctor.timing}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-3.5 pt-3 border-t flex items-center justify-between gap-2 ${p.divider}`}>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${p.badge}`}>
                        🩺 {doctor.department}
                      </span>
                      <a
                        href={DOCTOR_BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          addBookingHistoryItem({
                            type: 'doctor',
                            title: doctor.name,
                            subtitle: `${doctor.specialty} • ${doctor.timing}`,
                            url: DOCTOR_BOOKING_URL,
                          })
                        }
                        className={`active:scale-95 text-xs font-extrabold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${p.primaryBtn}`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Book Doctor OPD</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pharmacy & Physio Store Tab */}
          {activeTab === 'store' && (
            <div className="pb-24">
              <PharmacySection
                products={PRODUCTS}
                t={t}
                isDark={isDark}
                darkColor={darkColor}
              />
            </div>
          )}

          {/* Bookings Tab: Direct Booking Link Buttons, Small Booking History, Visit Calendar & Pathology Test Costs */}
          {activeTab === 'appointments' && (
            <AppointmentsList
              t={t}
              isDark={isDark}
              darkColor={darkColor}
              initialSubTab={appointmentsSubTab}
            />
          )}

          {/* Special Offer Page */}
          {activeTab === 'offers' && (
            <SpecialOfferPage
              offers={specialOffers}
              onBack={() => setActiveTab('home')}
              isDark={isDark}
              darkColor={darkColor}
            />
          )}
        </main>

        {/* Footer */}
        <footer
          className={`px-4 py-6 border-t text-center text-[11px] mb-16 transition-colors ${p.footerBg}`}
        >
          <p className={p.subtext}>
            {t.footer || '© 2026 Life Care Medicine Store and Poly Clinic • Baripada'}
          </p>
          <p className={`text-[10px] mt-1 ${p.mutedText}`}>
            WhatsApp & Help Desk: {CLINIC_CONFIG.phone} • GPS: {CLINIC_CONFIG.lat.toFixed(4)}° N,{' '}
            {CLINIC_CONFIG.lng.toFixed(4)}° E
          </p>
        </footer>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'appointments') {
              setAppointmentsSubTab('calendar');
            }
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          t={t}
          isDark={isDark}
          darkColor={darkColor}
        />
      </div>
    </div>
  );
}
