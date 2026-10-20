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
import { DoctorDirectory } from './components/DoctorDirectory';
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
  Pill,
  ChevronRight,
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
            <div className="space-y-3.5 pt-2 pb-20">
              {/* Short, Slim Special Offer Banner */}
              {topOffer && (
                <div className="px-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('offers');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2 px-3 rounded-xl shadow-2xs border border-teal-600/30 bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-between gap-2 text-left transition-all active:scale-99 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-300 text-slate-950 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        {topOffer.discountText}
                      </span>
                      <span className="text-xs font-bold truncate">
                        {topOffer.title}
                      </span>
                    </div>

                    <span className="shrink-0 text-[11px] font-bold flex items-center gap-0.5 text-amber-200">
                      Offer <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              )}

              {/* Main Heading & Subtitle */}
              <section className="px-4 pt-0.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                  {t.heroTitle || 'Caring for your family. Supporting your health'}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Life Care Pharmacy & Poly Clinic • Hospital Square, Baripada</span>
                </p>
              </section>

              {/* 3 Focused Primary Action Cards */}
              <section className="px-4 space-y-2.5">
                {/* Action 1: Book a Doctor */}
                <div className="p-3.5 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 to-white shadow-xs hover:border-teal-300 transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-sm text-slate-900 leading-tight">
                        Book a Doctor
                      </h2>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        11 Specialist Consultants • Neuro, Ortho, Gynae, Child & Skin
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('appointments');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[11px] font-bold text-slate-600 hover:text-teal-800 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Calendar
                    </button>
                    <a
                      href={doctorBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'doctor',
                          title: 'Doctor OPD Registration',
                          subtitle: 'Booked from Home Primary Action',
                          url: doctorBookingUrl,
                        })
                      }
                      className="font-extrabold text-xs py-2 px-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Book OPD</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Action 2: Book a Pathology Test */}
                <div className="p-3.5 rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50/70 to-white shadow-xs hover:border-rose-300 transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-rose-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-sm text-slate-900 leading-tight">
                        Book a Pathology Test
                      </h2>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        Certified Diagnostics • CBC, Thyroid, Blood Sugar, LFT, Lipid
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setAppointmentsSubTab('pathology');
                        setActiveTab('appointments');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[11px] font-bold text-slate-600 hover:text-rose-800 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Price List
                    </button>
                    <a
                      href={pathologyBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'pathology',
                          title: 'Pathology Lab Online Booking',
                          subtitle: 'Booked from Home Primary Action',
                          url: pathologyBookingUrl,
                        })
                      }
                      className="font-extrabold text-xs py-2 px-3.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Book Lab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Action 3: Buy Medicines */}
                <div className="p-3.5 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 to-white shadow-xs hover:border-blue-300 transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-sm text-slate-900 leading-tight">
                        Buy Medicines
                      </h2>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        Genuine Pharmacy, Baby Care & Physiotherapy Rehab Supplies
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('store');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-extrabold text-xs py-2 px-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>Open Store</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

              {/* Specialists Swipe Stack Preview on Home (Compact Image Cards) */}
              <section className="space-y-1">
                <DoctorSwipe doctors={doctors} t={t} />

                {/* Quick Link to Full Doctors Directory */}
                <div className="px-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('doctors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 font-extrabold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>👨‍⚕️</span>
                      <span>View All 11 Specialist Doctors with Filters</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-teal-700">
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              </section>

              {/* Clinic Location & Map Section (Starts Much Higher on Page) */}
              <section className="pt-1">
                <ClinicMap t={t} />
              </section>
            </div>
          )}

          {/* 3. DOCTORS DIRECTORY TAB (Search, Specialty Filters, Compact Cards & Profiles) */}
          {activeTab === 'doctors' && (
            <DoctorDirectory
              doctors={doctors}
              t={t}
              doctorBookingUrl={doctorBookingUrl}
            />
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
