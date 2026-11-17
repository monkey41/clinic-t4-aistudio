import React, { useState, useEffect, useRef } from 'react';
import { SpecialOffer, Doctor, Product, ClinicConfig, ClinicNotification } from './types';
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
  saveDoctors,
  getProducts,
  getSpecialOffers,
  saveUnannouncedArrivals,
  getClinicNotifications,
  saveClinicNotifications,
  getClinicConfig,
  addBookingHistoryItem,
  TRANSLATIONS,
  DEFAULT_SPECIAL_OFFERS,
} from './data/clinicData';
import {
  Stethoscope,
  FlaskConical,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Pill,
  ChevronRight,
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
} from './services/firebase';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestMobileNotificationPermission,
  dispatchMobileNotification,
} from './services/notifications';

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
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => getClinicConfig());

  // Customer mobile notification permission & live in-app banner state
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [alertPromptDismissed, setAlertPromptDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lifecare_alert_prompt_dismissed') === 'true';
    } catch {
      return false;
    }
  });
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
      setClinicConfig(getClinicConfig());
    };
    window.addEventListener('clinic-data-updated', syncData);
    return () => window.removeEventListener('clinic-data-updated', syncData);
  }, []);

  // Real-time Firestore sync across all customer phones
  useEffect(() => {
    fetchProductsFromFirestore()
      .then((cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
        }
      })
      .catch(() => {});

    fetchDoctorsFromFirestore()
      .then((cloudDoctors) => {
        if (cloudDoctors && cloudDoctors.length > 0) {
          setDoctors(cloudDoctors);
          saveDoctors(cloudDoctors);
        }
      })
      .catch(() => {});

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
      });

    fetchArrivalsFromFirestore()
      .then((cloudArrivals) => {
        if (cloudArrivals && Array.isArray(cloudArrivals) && cloudArrivals.length > 0) {
          saveUnannouncedArrivals(cloudArrivals);
        }
      })
      .catch(() => {});

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

    return () => {
      unsubNotifs();
      unsubArrivals();
      unsubDoctors();
    };
  }, []);

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

  const handleEnablePhoneAlerts = async () => {
    const res = await requestMobileNotificationPermission();
    setNotifPerm(res);
  };

  const t = TRANSLATIONS.en;
  const topOffer = specialOffers[0] || DEFAULT_SPECIAL_OFFERS[0];
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
            onNotificationPermissionChange={(perm) => setNotifPerm(perm)}
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

          {/* 2. HOME TAB */}
          {(activeTab !== 'admin' || isAdminPreview) && displayedCustomerTab === 'home' && (
            <div className="space-y-4 pt-2 pb-20">
              {/* Mobile Notification Opt-In Strip (1-tap permission for phones) */}
              {isNotificationSupported() && notifPerm === 'default' && !alertPromptDismissed && (
                <div className="px-4">
                  <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <BellRing className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="text-xs font-bold truncate">
                        Get doctor & clinic alerts on your phone
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleEnablePhoneAlerts}
                        className="px-2.5 py-1 rounded-lg bg-white text-indigo-900 text-[11px] font-black cursor-pointer hover:bg-indigo-50"
                      >
                        Allow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertPromptDismissed(true);
                          try {
                            localStorage.setItem('lifecare_alert_prompt_dismissed', 'true');
                          } catch {
                            // ignore
                          }
                        }}
                        className="p-1 rounded-lg hover:bg-white/20 text-white/80 cursor-pointer"
                        aria-label="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Vibrant Special Offer Banner */}
              {topOffer && (
                <div className="px-4">
                  <button
                    type="button"
                    onClick={() => handleTabChange('offers')}
                    className="w-full py-2.5 px-3.5 rounded-2xl shadow-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-between gap-2 text-left transition-all active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        {topOffer.discountText}
                      </span>
                      <span className="text-xs font-black truncate text-slate-950">
                        {topOffer.title}
                      </span>
                    </div>

                    <span className="shrink-0 text-xs font-black flex items-center gap-0.5 text-slate-950">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              )}

              {/* Colorful Compact Hero Card */}
              <section className="px-4">
                <div className="bg-gradient-to-br from-teal-700 via-emerald-700 to-cyan-800 text-white rounded-3xl p-4 shadow-md relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/15 blur-xl pointer-events-none" />
                  <div className="relative z-10 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        Open Daily • 8 AM – 10 PM
                      </span>
                      <span className="text-emerald-200">Baripada</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                      Life Care Pharmacy & Poly Clinic
                    </h1>
                  </div>
                </div>
              </section>

              {/* 5 Quick-Launch Colorful Category Icons */}
              <section className="px-4">
                <div className="grid grid-cols-5 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleTabChange('doctors')}
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-purple-900 leading-none">
                      Doctors
                    </span>
                  </button>

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
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-rose-900 leading-none">
                      Lab Tests
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('store')}
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-blue-900 leading-none">
                      Pharmacy
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('appointments')}
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-teal-900 leading-none">
                      OPD Dates
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('offers')}
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-amber-900 leading-none">
                      Offers
                    </span>
                  </button>
                </div>
              </section>

              {/* 3 Colorful Primary Action Tiles */}
              <section className="px-4 space-y-2.5">
                <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-sm sm:text-base leading-tight">
                        Book Doctor OPD
                      </h2>
                      <p className="text-xs text-teal-100 font-medium truncate">
                        {doctors.length} Specialists
                      </p>
                    </div>
                  </div>

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
                    className="shrink-0 font-black text-xs py-2 px-3.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Book</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-pink-700 text-white shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-sm sm:text-base leading-tight">
                        Pathology Lab Tests
                      </h2>
                      <p className="text-xs text-rose-100 font-medium truncate">
                        Blood, Thyroid & Profiles
                      </p>
                    </div>
                  </div>

                  <a
                    href={pathologyBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      addBookingHistoryItem({
                        type: 'pathology',
                        title: 'Pathology Lab Online Booking',
                        subtitle: 'Home Lab Booking',
                        url: pathologyBookingUrl,
                      })
                    }
                    className="shrink-0 font-black text-xs py-2 px-3.5 rounded-xl bg-white text-rose-900 hover:bg-rose-50 shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Book</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-sm sm:text-base leading-tight">
                        Order Medicines
                      </h2>
                      <p className="text-xs text-blue-100 font-medium truncate">
                        Medicines & Physio Supplies
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabChange('store')}
                    className="shrink-0 font-black text-xs py-2 px-3.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Store</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

              {/* Specialists Swipe Carousel */}
              <section className="space-y-1">
                <DoctorSwipe doctors={doctors} t={t} />

                <div className="px-4">
                  <button
                    type="button"
                    onClick={() => handleTabChange('doctors')}
                    className="w-full py-2.5 px-4 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>👨‍⚕️</span>
                      <span>All Specialist Doctors</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-purple-700 font-black">
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              </section>

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

        {/* Bottom Navigation Bar */}
        {(activeTab !== 'admin' || isAdminPreview) && (
          <BottomNav activeTab={displayedCustomerTab} onTabChange={handleTabChange} t={t} />
        )}
      </div>
    </div>
  );
}
