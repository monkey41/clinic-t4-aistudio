import React, { useState, useEffect } from 'react';
import { SpecialOffer, DoctorArrival, Doctor, Product, ClinicConfig } from './types';
import { Header } from './components/Header';
import { DoctorSwipe } from './components/DoctorSwipe';
import { ClinicMap } from './components/ClinicMap';
import { PharmacySection } from './components/PharmacySection';
import { AppointmentsList } from './components/AppointmentsList';
import { SpecialOfferPage } from './components/SpecialOfferPage';
import { BottomNav } from './components/BottomNav';
import { AdminPortal } from './components/AdminPortal';
import {
  getDoctors,
  getProducts,
  getSpecialOffers,
  getUnannouncedArrivals,
  getClinicConfig,
  getThemePalette,
  addBookingHistoryItem,
  TRANSLATIONS,
  DEFAULT_SPECIAL_OFFERS,
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
import { fetchProductsFromFirestore } from './services/firebase';

const resolveCurrentTab = (): 'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin' => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '').trim();
  if (['home', 'doctors', 'store', 'appointments', 'offers', 'admin'].includes(hash)) {
    return hash as any;
  }
  const path = window.location.pathname.toLowerCase().replace(/^\//, '').trim();
  if (['home', 'doctors', 'store', 'appointments', 'offers', 'admin'].includes(path)) {
    return path as any;
  }
  try {
    const stored = localStorage.getItem('lifecare_active_tab');
    if (stored && ['home', 'doctors', 'store', 'appointments', 'offers', 'admin'].includes(stored)) {
      return stored as any;
    }
  } catch {
    // ignore
  }
  return 'home';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin'
  >(() => resolveCurrentTab());

  const [appointmentsSubTab, setAppointmentsSubTab] = useState<
    'calendar' | 'pathology'
  >('calendar');

  // Dynamic reactive data
  const [doctors, setDoctors] = useState<Doctor[]>(() => getDoctors());
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(() => getSpecialOffers());
  const [unannouncedArrivals, setUnannouncedArrivals] = useState<DoctorArrival[]>(() =>
    getUnannouncedArrivals()
  );
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => getClinicConfig());

  // Listen to live clinic data modifications from Admin Portal
  useEffect(() => {
    const syncData = () => {
      setDoctors(getDoctors());
      setProducts(getProducts());
      setSpecialOffers(getSpecialOffers());
      setUnannouncedArrivals(getUnannouncedArrivals());
      setClinicConfig(getClinicConfig());
    };
    window.addEventListener('clinic-data-updated', syncData);
    return () => window.removeEventListener('clinic-data-updated', syncData);
  }, []);

  // Sync products from Firestore on initial app load if available
  useEffect(() => {
    fetchProductsFromFirestore()
      .then((cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
        }
      })
      .catch((err) => {
        console.warn('Firestore initial sync skipped, using local cache:', err);
      });
  }, []);

  // Handle URL history and browser back/forward/refresh buttons
  useEffect(() => {
    const handleLocationChange = () => {
      const current = resolveCurrentTab();
      setActiveTab(current);
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Unified Tab Change Handler with URL synchronization
  const handleTabChange = (
    tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin'
  ) => {
    if (tab === 'appointments') {
      setAppointmentsSubTab('calendar');
    }
    setActiveTab(tab);
    try {
      localStorage.setItem('lifecare_active_tab', tab);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL hash for 100% reliable refresh without server 404
    const targetHash = tab === 'home' ? '' : `#${tab}`;
    if (window.location.hash !== targetHash) {
      if (tab === 'home') {
        // Clear hash cleanly
        window.history.pushState(null, '', window.location.pathname);
      } else {
        window.location.hash = targetHash;
      }
    }
  };

  const t = TRANSLATIONS.en;
  const p = getThemePalette();

  const topOffer = specialOffers[0] || DEFAULT_SPECIAL_OFFERS[0];
  const doctorBookingUrl = clinicConfig.doctorBookingUrl;
  const pathologyBookingUrl = clinicConfig.pathologyBookingUrl;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800">
      <div
        className="max-w-xl mx-auto min-h-screen shadow-lg flex flex-col justify-between relative bg-white border-x border-slate-200"
      >
        {/* Sticky Header with Notifications & Left Menu */}
        <Header
          brandName={clinicConfig.name || t.brand || 'Life Care Medicine Store and Poly Clinic'}
          onTabChange={handleTabChange}
          activeTab={activeTab}
          specialOffers={specialOffers}
          unannouncedArrivals={unannouncedArrivals}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {/* 1. ADMIN PORTAL TAB */}
          {activeTab === 'admin' && (
            <AdminPortal onBackToApp={() => handleTabChange('home')} />
          )}

          {/* 2. HOME TAB */}
          {activeTab === 'home' && (
            <div className="space-y-3.5 pt-2.5 pb-20">
              {/* Thicker Special Offer Ribbon on Home Page */}
              {topOffer && (
                <div className="px-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('offers');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl shadow-sm border border-teal-600 bg-gradient-to-r from-teal-800 via-teal-700 to-rose-700 text-white flex items-center justify-between gap-3 text-left transition-all active:scale-99 cursor-pointer hover:opacity-95"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs bg-amber-300 text-slate-950">
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

                    <span className="shrink-0 text-xs font-extrabold flex items-center gap-1 text-amber-200">
                      Offer <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              )}

              {/* Hero Banner with Direct Booking Buttons */}
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
                      href={doctorBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'doctor',
                          title: 'Doctor OPD Registration',
                          subtitle: 'Booked from Home Hero',
                          url: doctorBookingUrl,
                        })
                      }
                      className={`active:scale-98 font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${p.primaryBtn}`}
                    >
                      <Stethoscope className="w-4 h-4 shrink-0" />
                      <span>🩺 Doctor OPD Booking</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>

                    <a
                      href={pathologyBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'pathology',
                          title: 'Pathology Test Booking',
                          subtitle: 'Booked from Home Hero',
                          url: pathologyBookingUrl,
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

              {/* 2x2 Quick Feature Grid */}
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
                      Tests & Fees
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

              {/* Specialists Swipe Stack Section on Home */}
              <DoctorSwipe doctors={doctors} t={t} />

              {/* Prominent Geographic Map Section */}
              <ClinicMap t={t} />
            </div>
          )}

          {/* 3. DOCTORS DIRECTORY TAB */}
          {activeTab === 'doctors' && (
            <div className="py-4 px-4 pb-24 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${p.heading}`}>
                    <span>👨‍⚕️</span> {t.doctors || 'Meet Our Doctors'}
                  </h2>
                  <p className={`text-xs mt-0.5 font-medium ${p.subtext}`}>
                    All {doctors.length} Specialist Doctors at Life Care Medicine Store and Poly Clinic
                  </p>
                </div>

                <a
                  href={doctorBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    addBookingHistoryItem({
                      type: 'doctor',
                      title: 'General Doctor OPD Registration',
                      subtitle: 'Booked from Doctors Directory',
                      url: doctorBookingUrl,
                    })
                  }
                  className={`text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${p.primaryBtn}`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Book OPD</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Doctors Directory List */}
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`rounded-2xl p-4 border shadow-sm transition-all ${p.card}`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-teal-500/30 bg-teal-50 shadow-xs"
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
                        href={doctorBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          addBookingHistoryItem({
                            type: 'doctor',
                            title: doctor.name,
                            subtitle: `${doctor.specialty} • ${doctor.timing}`,
                            url: doctorBookingUrl,
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

          {/* 4. PHARMACY & PHYSIO STORE TAB */}
          {activeTab === 'store' && (
            <div className="pb-24">
              <PharmacySection products={products} t={t} />
            </div>
          )}

          {/* 5. BOOKINGS TAB */}
          {activeTab === 'appointments' && (
            <AppointmentsList t={t} initialSubTab={appointmentsSubTab} />
          )}

          {/* 6. SPECIAL OFFERS TAB */}
          {activeTab === 'offers' && (
            <SpecialOfferPage
              offers={specialOffers}
              onBack={() => setActiveTab('home')}
            />
          )}
        </main>



        {/* Bottom Navigation Bar */}
        {activeTab !== 'admin' && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
