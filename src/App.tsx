import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SpecialOffer,
  Doctor,
  Product,
  ClinicConfig,
  ClinicNotification,
  PinchUpdate,
  ClinicPromotionsConfig,
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
import { FloatingInstallPrompt } from './components/FloatingInstallPrompt';
import {
  FestiveOverlay,
  RunningBanner,
  TopAdShowcase,
  FooterShowcase,
} from './components/FestiveLibrary';
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
  getPromotionsConfig,
  savePromotionsConfig,
  addBookingHistoryItem,
  TRANSLATIONS,
} from './data/clinicData';
import {
  Stethoscope,
  Sparkles,
  ExternalLink,
  BellRing,
  X,
  ShieldCheck,
  Flame,
  Zap,
  ChevronRight,
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
  fetchPromotionsFromFirestore,
  subscribeToPromotions,
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

const STORE_CATEGORY_CARDS: {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  bg: string;
  target: 'store' | 'pathology';
}[] = [
  {
    id: 'skincare',
    label: 'Skin Care',
    sublabel: 'Creams & SPF',
    icon: '✨',
    bg: 'bg-[#FFFDF7] border-[#FDE68A]',
    target: 'store',
  },
  {
    id: 'babycare',
    label: 'Baby Products',
    sublabel: 'Gentle Care',
    icon: '👶',
    bg: 'bg-[#ECFDF5] border-[#A7F3D0]',
    target: 'store',
  },
  {
    id: 'medicines',
    label: 'Medicines',
    sublabel: 'Rx & First Aid',
    icon: '💊',
    bg: 'bg-white border-[#EAE4D3]',
    target: 'store',
  },
  {
    id: 'physio',
    label: 'Physio Care',
    sublabel: 'Braces & Belts',
    icon: '🦵',
    bg: 'bg-[#ECFDF5] border-[#A7F3D0]',
    target: 'store',
  },
  {
    id: 'wellness',
    label: 'Wellness',
    sublabel: 'Vitamins & Steam',
    icon: '🍊',
    bg: 'bg-[#FEF3C7]/60 border-[#FDE68A]',
    target: 'store',
  },
  {
    id: 'pathology',
    label: 'Lab Tests',
    sublabel: 'Blood Checkups',
    icon: '🧪',
    bg: 'bg-white border-[#EAE4D3]',
    target: 'pathology',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin'
  >(() => resolveCurrentTab());

  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<
    'home' | 'doctors' | 'store' | 'appointments' | 'offers'
  >('home');

  const [appointmentsSubTab, setAppointmentsSubTab] = useState<'calendar' | 'pathology'>('calendar');
  const [storeCategory, setStoreCategory] = useState<string>('all');
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Dynamic reactive data
  const [doctors, setDoctors] = useState<Doctor[]>(() => getDoctors());
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(() => getSpecialOffers());
  const [notifications, setNotifications] = useState<ClinicNotification[]>(() =>
    getClinicNotifications()
  );
  const [pinchUpdates, setPinchUpdates] = useState<PinchUpdate[]>(() => getPinchUpdates());
  const [promotions, setPromotions] = useState<ClinicPromotionsConfig>(() => getPromotionsConfig());
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

  useEffect(() => {
    markNotifSeen(getClinicNotifications().map((n) => n.id));
  }, []);

  useEffect(() => {
    const syncData = () => {
      setDoctors(getDoctors());
      setProducts(getProducts());
      setSpecialOffers(getSpecialOffers());
      setNotifications(getClinicNotifications());
      setPinchUpdates(getPinchUpdates());
      setPromotions(getPromotionsConfig());
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

      fetchPromotionsFromFirestore()
        .then((cloudPromo) => {
          if (cloudPromo) {
            setPromotions(cloudPromo);
            savePromotionsConfig(cloudPromo);
          }
        })
        .catch(() => {}),
    ]);
  }, []);

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

    const unsubPromos = subscribeToPromotions((livePromo) => {
      if (livePromo) {
        setPromotions(livePromo);
        savePromotionsConfig(livePromo);
      }
    });

    return () => {
      unsubNotifs();
      unsubArrivals();
      unsubDoctors();
      unsubOffers();
      unsubPinch();
      unsubPromos();
    };
  }, [refreshCloudData]);

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

  const openStoreWithCategory = (category: string) => {
    setStoreCategory(category);
    handleTabChange('store');
  };

  const t = TRANSLATIONS.en;
  const doctorBookingUrl = clinicConfig.doctorBookingUrl;

  const displayedCustomerTab = isAdminPreview ? previewTab : activeTab;
  const isCustomerView = activeTab !== 'admin' || isAdminPreview;

  return (
    <div className="relative min-h-screen aura-page-bg text-[#122B22]">
      <div className="max-w-xl mx-auto min-h-screen shadow-xl flex flex-col justify-between relative aura-shell border-x border-[#EAE4D3]">
        {/* Sticky Admin Preview Return Bar */}
        {activeTab === 'admin' && isAdminPreview && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-[#065F46] via-[#059669] to-[#D97706] text-white px-4 py-2.5 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4 text-amber-200 shrink-0" />
              <span>Admin Preview Mode</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAdminPreview(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white text-[#065F46] hover:bg-[#ECFDF5] text-xs font-black shadow-xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
            >
              <span>← Back to Admin Portal</span>
            </button>
          </div>
        )}

        {/* Live Foreground Notification Toast */}
        {liveAlertToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-gradient-to-r from-[#065F46] to-[#059669] text-white p-3.5 rounded-2xl shadow-2xl border border-[#A7F3D0] flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-4 h-4 text-[#FDE68A]" />
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

        {/* Sticky Header */}
        {isCustomerView && (
          <Header
            brandName={clinicConfig.name || t.brand || 'Life Care'}
            onTabChange={handleTabChange}
            activeTab={displayedCustomerTab}
            notifications={notifications}
            onRefreshCloudData={refreshCloudData}
            onOpenMap={() => setMapModalOpen(true)}
          />
        )}

        {/* Optional Admin Running Banner */}
        {isCustomerView && (
          <RunningBanner
            config={promotions.runningBanner}
            onNavigate={(tab) => handleTabChange(tab)}
          />
        )}

        {/* Optional Lightweight Festive Accent Overlay */}
        {isCustomerView && <FestiveOverlay config={promotions.festiveDecoration} />}

        {/* Main Content Area */}
        <main className="flex-1">
          {/* 1. ADMIN PORTAL TAB */}
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
          {isCustomerView && displayedCustomerTab === 'home' && (
            <div className="space-y-4 pt-3.5 pb-4">
              {/* Top 4 Bigger Highlight Boxes (Book OPD, Offers, Popular, Quick Order) + Admin Ad/Festive Showcase */}
              <section className="px-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Box 1: Book OPD */}
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
                    className="min-h-[108px] p-4 rounded-3xl bg-gradient-to-br from-[#065F46] via-[#059669] to-[#10B981] text-white shadow-md shadow-emerald-950/15 border border-[#6EE7B7]/30 flex flex-col justify-between transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-[#FEF3C7]" />
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </div>
                    <div className="mt-2.5">
                      <span className="font-black text-sm leading-tight block">Book OPD</span>
                      <p className="text-[11px] text-emerald-100 mt-0.5 truncate">
                        {doctors.length} Specialists
                      </p>
                    </div>
                  </a>

                  {/* Box 2: Offers */}
                  <button
                    type="button"
                    onClick={() => handleTabChange('offers')}
                    className="min-h-[108px] p-4 rounded-3xl bg-gradient-to-br from-[#FEF3C7] via-[#FFFBEB] to-[#FFFFFF] border border-[#FDE68A] text-[#122B22] shadow-sm flex flex-col justify-between text-left transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#FDE68A] text-[#D97706] flex items-center justify-center shrink-0 shadow-2xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#D97706] text-white">
                        Deals
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <span className="font-black text-sm leading-tight block">Offers</span>
                      <p className="text-[11px] text-[#92400E] font-semibold mt-0.5 truncate">
                        {specialOffers.length} Active Packages
                      </p>
                    </div>
                  </button>

                  {/* Box 3: Popular */}
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
                    className="min-h-[108px] p-4 rounded-3xl bg-gradient-to-br from-[#ECFDF5] via-[#FFFFFF] to-[#FCFBF7] border border-[#A7F3D0] text-[#122B22] shadow-sm flex flex-col justify-between text-left transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#A7F3D0] text-[#059669] flex items-center justify-center shrink-0 shadow-2xs">
                        <Flame className="w-5 h-5" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#059669]" />
                    </div>
                    <div className="mt-2.5">
                      <span className="font-black text-sm leading-tight block">Popular</span>
                      <p className="text-[11px] text-[#4B6358] font-semibold mt-0.5 truncate">
                        Lab Tests & Packages
                      </p>
                    </div>
                  </button>

                  {/* Box 4: Quick Order */}
                  <button
                    type="button"
                    onClick={() => openStoreWithCategory('all')}
                    className="min-h-[108px] p-4 rounded-3xl bg-white border border-[#EAE4D3] text-[#122B22] shadow-sm flex flex-col justify-between text-left transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center shrink-0 shadow-2xs">
                        <Zap className="w-5 h-5 text-[#D97706]" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7C8F86]" />
                    </div>
                    <div className="mt-2.5">
                      <span className="font-black text-sm leading-tight block">Quick Order</span>
                      <p className="text-[11px] text-[#4B6358] font-semibold mt-0.5 truncate">
                        Medicines & Store
                      </p>
                    </div>
                  </button>
                </div>

                {/* Optional Admin-Uploaded Top Ad / Festive Pictures & GIFs */}
                <TopAdShowcase
                  config={promotions.topShowcase}
                  onNavigate={(tab) => handleTabChange(tab)}
                />
              </section>

              {/* Smooth Doctor Carousel (Name, Field & Book OPD Only) */}
              <DoctorSwipe
                doctors={doctors}
                t={t}
                onViewAll={() => handleTabChange('doctors')}
              />

              {/* Swipeable Category Boxes Under Doctor Carousel */}
              <section className="px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-sm tracking-tight text-[#122B22]">
                    Shop by Category
                  </h2>
                  <button
                    type="button"
                    onClick={() => openStoreWithCategory('all')}
                    className="text-xs font-extrabold text-[#059669] hover:text-[#065F46] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Browse Store</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
                  {STORE_CATEGORY_CARDS.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (cat.target === 'pathology') {
                          setAppointmentsSubTab('pathology');
                          handleTabChange('appointments');
                        } else {
                          openStoreWithCategory(cat.id);
                        }
                      }}
                      className={`min-w-[116px] shrink-0 snap-start rounded-2xl p-3 border shadow-2xs hover:shadow-sm transition-all active:scale-96 text-left flex flex-col justify-between gap-2 cursor-pointer ${cat.bg}`}
                    >
                      <span className="w-9 h-9 rounded-xl bg-white border border-[#EAE4D3] flex items-center justify-center text-lg shadow-2xs">
                        {cat.icon}
                      </span>
                      <div>
                        <span className="font-black text-xs text-[#122B22] block leading-tight">
                          {cat.label}
                        </span>
                        <span className="text-[10px] font-semibold text-[#4B6358] block mt-0.5">
                          {cat.sublabel}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Single-Button Clinic Location Map (Opens Interactive Modal) */}
              <section className="pt-1">
                <ClinicMap
                  t={t}
                  externalOpen={mapModalOpen}
                  onExternalClose={() => setMapModalOpen(false)}
                />
              </section>
            </div>
          )}

          {/* Keep single ClinicMap modal mountable when triggered from Header Menu on non-Home tabs */}
          {isCustomerView && displayedCustomerTab !== 'home' && mapModalOpen && (
            <div className="hidden">
              <ClinicMap
                t={t}
                externalOpen={mapModalOpen}
                onExternalClose={() => setMapModalOpen(false)}
              />
            </div>
          )}

          {/* 3. DOCTORS DIRECTORY TAB */}
          {isCustomerView && displayedCustomerTab === 'doctors' && (
            <DoctorDirectory doctors={doctors} t={t} doctorBookingUrl={doctorBookingUrl} />
          )}

          {/* 4. PHARMACY & PHYSIO STORE TAB */}
          {isCustomerView && displayedCustomerTab === 'store' && (
            <div className="pb-6">
              <PharmacySection
                products={products}
                t={t}
                defaultCategory={storeCategory}
              />
            </div>
          )}

          {/* 5. BOOKINGS TAB */}
          {isCustomerView && displayedCustomerTab === 'appointments' && (
            <AppointmentsList t={t} initialSubTab={appointmentsSubTab} />
          )}

          {/* 6. SPECIAL OFFERS TAB */}
          {isCustomerView && displayedCustomerTab === 'offers' && (
            <SpecialOfferPage offers={specialOffers} onBack={() => handleTabChange('home')} />
          )}

          {/* Optional Admin Footer Media / Festive / Offer Card */}
          {isCustomerView && (
            <FooterShowcase
              config={promotions.footerShowcase}
              festiveConfig={promotions.festiveDecoration}
              activeOffers={specialOffers}
              onNavigate={(tab) => handleTabChange(tab)}
            />
          )}
          {isCustomerView && !promotions.footerShowcase.enabled && (
            <div className="h-24" aria-hidden="true" />
          )}
        </main>

        {/* Floating App Download Prompt for Website Visitors */}
        {isCustomerView && <FloatingInstallPrompt />}

        {/* Floating Alive PINCH Assistant (Right Side, Higher Up) */}
        {isCustomerView && (
          <PinchAssistant
            updates={pinchUpdates}
            elevateOnStore={displayedCustomerTab === 'store'}
          />
        )}

        {/* Sticky Bottom Navigation Bar (Bookings replaces WhatsApp) */}
        {isCustomerView && (
          <BottomNav activeTab={displayedCustomerTab} onTabChange={handleTabChange} t={t} />
        )}
      </div>
    </div>
  );
}
