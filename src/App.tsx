import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SpecialOffer,
  Doctor,
  Product,
  ClinicConfig,
  ClinicNotification,
  PinchUpdate,
} from './types';
import { Header } from './components/Header';
import { DoctorSwipe } from './components/DoctorSwipe';
import { ClinicMap } from './components/ClinicMap';
import { PharmacySection } from './components/PharmacySection';
import { AppointmentsList } from './components/AppointmentsList';
import { SpecialOfferPage } from './components/SpecialOfferPage';
import { BottomNav } from './components/BottomNav';
import { AdminPortal } from './components/AdminPortal';
import { DoctorDirectory } from './components/DoctorDirectory';
import { PinchAssistant } from './components/PinchAssistant';
import {
  getDoctors,
  saveDoctors,
  getProducts,
  getSpecialOffers,
  saveSpecialOffers,
  saveUnannouncedArrivals,
  getClinicNotifications,
  saveClinicNotifications,
  getClinicConfig,
  getPinchUpdates,
  savePinchUpdates,
  addBookingHistoryItem,
  TRANSLATIONS,
} from './data/clinicData';
import {
  Stethoscope,
  FlaskConical,
  Sparkles,
  ExternalLink,
  Pill,
  BellRing,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchProductsFromFirestore,
  adminSignOut,
  subscribeToClinicNotifications,
  fetchNotificationsFromFirestore,
  subscribeToArrivals,
  fetchArrivalsFromFirestore,
  fetchDoctorsFromFirestore,
  subscribeToDoctors,
  fetchOffersFromFirestore,
  subscribeToOffers,
  fetchPinchUpdatesFromFirestore,
  subscribeToPinchUpdates,
} from './services/firebase';
import { dispatchMobileNotification } from './services/notifications';

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
    if (stored && ['home', 'doctors', 'store', 'appointments', 'offers'].includes(stored)) {
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

  // Preview customer app directly from Admin Portal without destroying admin session
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<
    'home' | 'doctors' | 'store' | 'appointments' | 'offers'
  >('home');

  const [appointmentsSubTab, setAppointmentsSubTab] = useState<'calendar' | 'pathology'>('calendar');

  // Dynamic reactive data
  const [doctors, setDoctors] = useState<Doctor[]>(() => getDoctors());
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(() => getSpecialOffers());
  const [notifications, setNotifications] = useState<ClinicNotification[]>(() =>
    getClinicNotifications()
  );
  const [pinchUpdates, setPinchUpdates] = useState<PinchUpdate[]>(() => getPinchUpdates());
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => getClinicConfig());
  const [liveAlertToast, setLiveAlertToast] = useState<ClinicNotification | null>(null);

  const knownNotifIdsRef = useRef<Set<string>>(
    new Set((() => {
      try {
        const stored = localStorage.getItem('lifecare_seen_push_ids');
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })())
  );
  const initialNotifSyncDoneRef = useRef(false);

  const markNotifSeen = (ids: string[]) => {
    ids.forEach((id) => knownNotifIdsRef.current.add(id));
    try {
      localStorage.setItem(
        'lifecare_seen_push_ids',
        JSON.stringify(Array.from(knownNotifIdsRef.current).slice(-100))
      );
    } catch {
      // ignore
    }
  };

  // Seed initial notification IDs on first mount so stale defaults don't pop on reload
  useEffect(() => {
    markNotifSeen(getClinicNotifications().map((n) => n.id));
  }, []);

  // Listen to live clinic data modifications (same device)
  useEffect(() => {
    const syncData = () => {
      setDoctors(getDoctors());
      setProducts(getProducts());
      setSpecialOffers(getSpecialOffers());
      setNotifications(getClinicNotifications());
      setPinchUpdates(getPinchUpdates());
      setClinicConfig(getClinicConfig());
    };
    window.addEventListener('clinic-data-updated', syncData);
    return () => window.removeEventListener('clinic-data-updated', syncData);
  }, []);

  const refreshCloudData = useCallback(async () => {
    await Promise.all([
      fetchProductsFromFirestore()
        .then((cloudProducts) => {
          if (cloudProducts && cloudProducts.length > 0) {
            setProducts(cloudProducts);
          }
        })
        .catch(() => {}),

      fetchDoctorsFromFirestore()
        .then((cloudDoctors) => {
          if (cloudDoctors && cloudDoctors.length > 0) {
            setDoctors(cloudDoctors);
            saveDoctors(cloudDoctors);
          }
        })
        .catch(() => {}),

      fetchOffersFromFirestore()
        .then((cloudOffers) => {
          if (cloudOffers && Array.isArray(cloudOffers)) {
            setSpecialOffers(cloudOffers);
            saveSpecialOffers(cloudOffers);
          }
        })
        .catch(() => {}),

      fetchPinchUpdatesFromFirestore()
        .then((cloudPinch) => {
          if (cloudPinch && Array.isArray(cloudPinch)) {
            setPinchUpdates(cloudPinch);
            savePinchUpdates(cloudPinch);
          }
        })
        .catch(() => {}),

      fetchNotificationsFromFirestore()
        .then((cloudNotifs) => {
          if (cloudNotifs && Array.isArray(cloudNotifs) && cloudNotifs.length > 0) {
            setNotifications(cloudNotifs);
            saveClinicNotifications(cloudNotifs);
            markNotifSeen(cloudNotifs.map((n) => n.id));
          }
          initialNotifSyncDoneRef.current = true;
        })
        .catch(() => {
          initialNotifSyncDoneRef.current = true;
        }),

      fetchArrivalsFromFirestore()
        .then((cloudArrivals) => {
          if (cloudArrivals && Array.isArray(cloudArrivals) && cloudArrivals.length > 0) {
            saveUnannouncedArrivals(cloudArrivals);
          }
        })
        .catch(() => {}),
    ]);
  }, []);

  // Real-time Firestore sync across all customer phones
  useEffect(() => {
    refreshCloudData();

    const unsubNotifs = subscribeToClinicNotifications((liveNotifs) => {
      if (!Array.isArray(liveNotifs)) return;

      if (initialNotifSyncDoneRef.current) {
        const brandNew = liveNotifs.find(
          (n) => n.active !== false && !knownNotifIdsRef.current.has(n.id)
        );
        if (brandNew) {
          setLiveAlertToast(brandNew);
          dispatchMobileNotification(brandNew.title, brandNew.message, {
            tag: brandNew.id,
            url: brandNew.actionUrl,
          });
          setTimeout(() => {
            setLiveAlertToast((prev) => (prev?.id === brandNew.id ? null : prev));
          }, 7000);
        }
      } else {
        initialNotifSyncDoneRef.current = true;
      }

      markNotifSeen(liveNotifs.map((n) => n.id));
      setNotifications(liveNotifs);
      saveClinicNotifications(liveNotifs);
    });

    const unsubArrivals = subscribeToArrivals((liveArrivals) => {
      if (Array.isArray(liveArrivals)) {
        saveUnannouncedArrivals(liveArrivals);
      }
    });

    const unsubDoctors = subscribeToDoctors((liveDoctors) => {
      if (Array.isArray(liveDoctors) && liveDoctors.length > 0) {
        setDoctors(liveDoctors);
        saveDoctors(liveDoctors);
      }
    });

    const unsubOffers = subscribeToOffers((liveOffers) => {
      if (Array.isArray(liveOffers)) {
        setSpecialOffers(liveOffers);
        saveSpecialOffers(liveOffers);
      }
    });

    const unsubPinch = subscribeToPinchUpdates((livePinch) => {
      if (Array.isArray(livePinch)) {
        setPinchUpdates(livePinch);
        savePinchUpdates(livePinch);
      }
    });

    return () => {
      unsubNotifs();
      unsubArrivals();
      unsubDoctors();
      unsubOffers();
      unsubPinch();
    };
  }, [refreshCloudData]);

  // Handle URL history and browser back/forward/refresh buttons
  useEffect(() => {
    const handleLocationChange = () => {
      const current = resolveCurrentTab();
      if (current !== 'admin') {
        setIsAdminPreview(false);
      }
      setActiveTab(current);
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Unified Tab Change Handler
  const handleTabChange = (
    tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin'
  ) => {
    if (isAdminPreview && tab !== 'admin') {
      if (tab === 'appointments') setAppointmentsSubTab('calendar');
      setPreviewTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (activeTab === 'admin' && tab !== 'admin') {
      setIsAdminPreview(false);
      adminSignOut().catch(() => {});
    }
    if (tab === 'appointments') {
      setAppointmentsSubTab('calendar');
    }
    setActiveTab(tab);
    if (tab !== 'admin') {
      try {
        localStorage.setItem('lifecare_active_tab', tab);
      } catch {
        // ignore
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const targetHash = tab === 'home' ? '' : `#${tab}`;
    if (window.location.hash !== targetHash) {
      if (tab === 'home') {
        window.history.pushState(null, '', window.location.pathname);
      } else {
        window.location.hash = targetHash;
      }
    }
  };

  const t = TRANSLATIONS.en;
  const doctorBookingUrl = clinicConfig.doctorBookingUrl;
  const pathologyBookingUrl = clinicConfig.pathologyBookingUrl;

  // Which customer screen to render (normal tab OR admin preview tab)
  const displayedCustomerTab = isAdminPreview ? previewTab : activeTab;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-xl mx-auto min-h-screen shadow-lg flex flex-col justify-between relative bg-white border-x border-slate-200">
        {/* Sticky Admin Preview Floating Return Bar */}
        {activeTab === 'admin' && isAdminPreview && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-700 via-teal-700 to-emerald-700 text-white px-4 py-2.5 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Admin Preview Mode</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAdminPreview(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 text-xs font-black shadow-xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
            >
              <span>← Back to Admin Portal</span>
            </button>
          </div>
        )}

        {/* Live Foreground Notification Toast */}
        {liveAlertToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-gradient-to-r from-teal-800 to-emerald-700 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-4 h-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                  {liveAlertToast.badge || 'New Update'}
                </span>
                <p className="text-xs font-black mt-1 leading-snug">{liveAlertToast.title}</p>
                <p className="text-[11px] text-emerald-100 line-clamp-2 mt-0.5">
                  {liveAlertToast.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLiveAlertToast(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sticky Header (shown in Customer view & Admin Preview) */}
        {(activeTab !== 'admin' || isAdminPreview) && (
          <Header
            brandName={clinicConfig.name || t.brand || 'Life Care'}
            onTabChange={handleTabChange}
            activeTab={displayedCustomerTab}
            notifications={notifications}
            onRefreshCloudData={refreshCloudData}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1">
          {/* 1. ADMIN PORTAL TAB (Kept mounted & hidden during Preview to preserve session) */}
          {activeTab === 'admin' && (
            <div className={isAdminPreview ? 'hidden' : ''}>
              <AdminPortal
                onBackToApp={() => handleTabChange('home')}
                onEnterPreview={() => {
                  setPreviewTab('home');
                  setIsAdminPreview(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* 2. HOME TAB (Clean 2x2 Quick Services, Smooth Doctor Swipe & Map — no duplicate buttons or top ribbons) */}
          {(activeTab !== 'admin' || isAdminPreview) && displayedCustomerTab === 'home' && (
            <div className="space-y-4 pt-3 pb-24">
              {/* 4 Distinct Colorful Service Cards */}
              <section className="px-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={doctorBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      addBookingHistoryItem({
                        type: 'doctor',
                        title: 'Doctor OPD Registration',
                        subtitle: 'Home OPD Booking',
                        url: doctorBookingUrl,
                      })
                    }
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-sm flex items-center gap-2.5 transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-xs leading-tight">Book OPD</span>
                        <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
                      </div>
                      <p className="text-[10px] text-teal-100 truncate mt-0.5">
                        {doctors.length} Specialists
                      </p>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentsSubTab('pathology');
                      if (isAdminPreview) {
                        setPreviewTab('appointments');
                      } else {
                        setActiveTab('appointments');
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-sm flex items-center gap-2.5 text-left transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-xs leading-tight block">Lab Tests</span>
                      <p className="text-[10px] text-rose-100 truncate mt-0.5">
                        Pathology & Rates
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('store')}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm flex items-center gap-2.5 text-left transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-xs leading-tight block">Pharmacy</span>
                      <p className="text-[10px] text-blue-100 truncate mt-0.5">
                        Meds & Physio
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('offers')}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-sm flex items-center gap-2.5 text-left transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-xs leading-tight block">Offers</span>
                      <p className="text-[10px] text-slate-900/80 font-bold truncate mt-0.5">
                        {specialOffers.length} Active Packages
                      </p>
                    </div>
                  </button>
                </div>
              </section>

              {/* Smooth Doctor Swipe Carousel */}
              <DoctorSwipe
                doctors={doctors}
                t={t}
                onViewAll={() => handleTabChange('doctors')}
              />

              {/* Clinic Location & Map */}
              <section className="pt-1">
                <ClinicMap t={t} />
              </section>
            </div>
          )}

          {/* 3. DOCTORS DIRECTORY TAB */}
          {(activeTab !== 'admin' || isAdminPreview) && displayedCustomerTab === 'doctors' && (
            <DoctorDirectory doctors={doctors} t={t} doctorBookingUrl={doctorBookingUrl} />
          )}

          {/* 4. PHARMACY & PHYSIO STORE TAB */}
          {(activeTab !== 'admin' || isAdminPreview) && displayedCustomerTab === 'store' && (
            <div className="pb-24">
              <PharmacySection products={products} t={t} />
            </div>
          )}

          {/* 5. BOOKINGS TAB */}
          {(activeTab !== 'admin' || isAdminPreview) && displayedCustomerTab === 'appointments' && (
            <AppointmentsList t={t} initialSubTab={appointmentsSubTab} />
          )}

          {/* 6. SPECIAL OFFERS TAB */}
          {(activeTab !== 'admin' || isAdminPreview) && displayedCustomerTab === 'offers' && (
            <SpecialOfferPage offers={specialOffers} onBack={() => handleTabChange('home')} />
          )}
        </main>

        {/* Floating PINCH Updates Assistant (Customer App & Admin Preview) */}
        {(activeTab !== 'admin' || isAdminPreview) && (
          <PinchAssistant updates={pinchUpdates} />
        )}

        {/* Bottom Navigation Bar */}
        {(activeTab !== 'admin' || isAdminPreview) && (
          <BottomNav activeTab={displayedCustomerTab} onTabChange={handleTabChange} t={t} />
        )}
      </div>
    </div>
  );
}
