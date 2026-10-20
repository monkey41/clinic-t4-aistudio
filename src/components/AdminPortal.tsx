import React, { useState, useEffect } from 'react';
import {
  Doctor,
  Product,
  DoctorArrival,
  SpecialOffer,
  PathologyTest,
  ClinicConfig,
  BookingHistoryItem,
} from '../types';
import {
  getDoctors,
  saveDoctors,
  DEFAULT_DOCTORS,
  DEFAULT_MALE_DOCTOR_PHOTO,
  DEFAULT_FEMALE_DOCTOR_PHOTO,
  getProducts,
  saveProducts,
  DEFAULT_PRODUCTS,
  getPathologyTests,
  savePathologyTests,
  DEFAULT_PATHOLOGY_TESTS,
  getSpecialOffers,
  saveSpecialOffers,
  DEFAULT_SPECIAL_OFFERS,
  getUnannouncedArrivals,
  saveUnannouncedArrivals,
  DEFAULT_UNANNOUNCED_ARRIVALS,
  getClinicConfig,
  saveClinicConfig,
  DEFAULT_CLINIC_CONFIG,
  getBookingHistory,
  clearBookingHistory,
  resetAllToFactoryDefaults,
} from '../data/clinicData';
import {
  Shield,
  KeyRound,
  Users,
  Bell,
  Sparkles,
  Pill,
  FlaskConical,
  Settings,
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowLeft,
  RotateCcw,
  Save,
  Download,
  Upload,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Mail,
  Loader2,
  LogOut,
  Database,
  Copy,
  ShieldCheck,
  Laptop,
  Monitor,
  Smartphone,
  UserPlus,
  Power,
  RefreshCw,
} from 'lucide-react';
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  adminSignIn,
  adminSignOut,
  verifyUserIsAdmin,
  syncProductToFirestore,
  syncAllProductsToFirestore,
  deleteProductFromFirestore,
  registerAdminSession,
  listenToAdminSession,
  fetchAllAdmins,
  saveAdminProfile,
  toggleAdminStatus,
  deleteAdminProfile,
  AdminProfile,
} from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AdminPortalProps {
  onBackToApp: () => void;
}

type AdminTab =
  | 'overview'
  | 'doctors'
  | 'arrivals'
  | 'offers'
  | 'products'
  | 'pathology'
  | 'settings'
  | 'logs'
  | 'admins';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToApp }) => {
  // Authentication & Authorization State
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem('lifecare_admin_email') || 'prayaspratikmohanty41@gmail.com';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lifecare_admin_auth') === 'true';
  });
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [sessionWarning, setSessionWarning] = useState<string | null>(null);
  const [firebaseActive, setFirebaseActive] = useState<boolean>(false);
  const [testingFirebase, setTestingFirebase] = useState<boolean>(false);

  // Single-machine session tracking
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessionStorage.getItem('lifecare_admin_session_id') || '';
  });

  // Admin Team Management State
  const [adminList, setAdminList] = useState<AdminProfile[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [newAdminName, setNewAdminName] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminRole, setNewAdminRole] = useState<'Super Admin' | 'Clinic Admin' | 'Store Admin' | 'Staff'>('Clinic Admin');
  const [isSavingAdmin, setIsSavingAdmin] = useState<boolean>(false);

  // Active Admin Sub-Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('doctors');

  // Local Reactive State for Entities
  const [doctors, setDoctors] = useState<Doctor[]>(() => getDoctors());
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(() => getSpecialOffers());
  const [unannouncedArrivals, setUnannouncedArrivals] = useState<DoctorArrival[]>(() =>
    getUnannouncedArrivals()
  );
  const [pathologyTests, setPathologyTests] = useState<PathologyTest[]>(() => getPathologyTests());
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => getClinicConfig());
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>(() => getBookingHistory());

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state on clinic data change
  const reloadData = () => {
    setDoctors(getDoctors());
    setProducts(getProducts());
    setSpecialOffers(getSpecialOffers());
    setUnannouncedArrivals(getUnannouncedArrivals());
    setPathologyTests(getPathologyTests());
    setClinicConfig(getClinicConfig());
    setBookingHistory(getBookingHistory());
  };

  useEffect(() => {
    const handleUpdate = () => reloadData();
    window.addEventListener('clinic-data-updated', handleUpdate);
    return () => window.removeEventListener('clinic-data-updated', handleUpdate);
  }, []);

  // Fetch admin team directory
  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const list = await fetchAllAdmins();
      setAdminList(list);
    } catch (err) {
      console.warn('Could not load admins list:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdmins();
    }
  }, [isAuthenticated]);

  // Listen for Firebase Auth state changes & restore session without reload errors
  useEffect(() => {
    const configured = isFirebaseConfigured();
    setFirebaseActive(configured);
    const auth = getFirebaseAuth();

    if (!auth) {
      // In local demo or offline mode, preserve session if previously logged in
      setAuthChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Enforce strict admin authorization check
        const check = await verifyUserIsAdmin(user);
        if (check.isAdmin) {
          setAdminUser(user);
          setAdminEmail(user.email || 'Admin');
          setIsAuthenticated(true);
          sessionStorage.setItem('lifecare_admin_auth', 'true');
          sessionStorage.setItem('lifecare_admin_email', user.email || '');
          setAuthError('');

          // Register or maintain active machine session
          let currentSessionId = sessionStorage.getItem('lifecare_admin_session_id');
          if (!currentSessionId) {
            currentSessionId = await registerAdminSession(user, user.displayName || undefined);
            setActiveSessionId(currentSessionId);
          }
        } else {
          // User is authenticated, but not an admin! Deny access and sign out.
          await adminSignOut();
          setAdminUser(null);
          setIsAuthenticated(false);
          sessionStorage.removeItem('lifecare_admin_auth');
          sessionStorage.removeItem('lifecare_admin_email');
          setAuthError(
            `Access Denied: The account "${user.email}" lacks administrator authorization. Only authorized clinic admins can access the admin portal.`
          );
        }
      } else {
        // Firebase returned null user.
        // If we had a local valid session, give Firebase a moment or verify if signed out intentionally
        const hasSession = sessionStorage.getItem('lifecare_admin_auth') === 'true';
        if (!hasSession && configured) {
          setAdminUser(null);
          setIsAuthenticated(false);
        }
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time single-machine listener: Revoke immediately if another machine logs in
  useEffect(() => {
    if (!isAuthenticated) return;
    const uid = adminUser?.uid || 'primary-admin';
    const localSess = activeSessionId || sessionStorage.getItem('lifecare_admin_session_id') || '';
    if (!localSess) return;

    const cleanup = listenToAdminSession(uid, localSess, (reason) => {
      setSessionWarning(reason);
      setAuthError(reason);
      setIsAuthenticated(false);
      sessionStorage.removeItem('lifecare_admin_auth');
      sessionStorage.removeItem('lifecare_admin_session_id');
    });

    return () => {
      cleanup();
    };
  }, [isAuthenticated, adminUser?.uid, activeSessionId]);

  // Handle Login with Email & Password
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setSessionWarning(null);

    if (!emailInput.trim()) {
      setAuthError('Please enter your admin email address.');
      return;
    }
    if (!passwordInput) {
      setAuthError('Please enter your password.');
      return;
    }

    setIsSigningIn(true);
    try {
      if (isFirebaseConfigured()) {
        const result = await adminSignIn(emailInput.trim(), passwordInput);
        if (result.success && result.user) {
          setAdminUser(result.user);
          setAdminEmail(result.user.email || emailInput.trim());
          setIsAuthenticated(true);
          sessionStorage.setItem('lifecare_admin_auth', 'true');
          sessionStorage.setItem('lifecare_admin_email', result.user.email || '');

          // Enforce single-machine session
          const newSessId = await registerAdminSession(result.user);
          setActiveSessionId(newSessId);
          showToast('Logged in as verified administrator (Single machine lock active)');
        } else {
          setAuthError(result.error || 'Invalid credentials or unauthorized account.');
        }
      } else {
        // Demo / local preview mode when VITE_FIREBASE_* is pending deployment in Cloudflare
        const normalized = emailInput.trim().toLowerCase();
        const allowedAdmins = [
          'prayaspratikmohanty41@gmail.com',
          'admin@lifecare.com',
          'admin@lifecarepharmacy.com',
          ...adminList.map((a) => a.email.toLowerCase()),
        ];
        if (allowedAdmins.includes(normalized) && passwordInput.length >= 6) {
          setIsAuthenticated(true);
          setAdminEmail(emailInput.trim());
          sessionStorage.setItem('lifecare_admin_auth', 'true');
          sessionStorage.setItem('lifecare_admin_email', emailInput.trim());
          const fallbackSess = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
          sessionStorage.setItem('lifecare_admin_session_id', fallbackSess);
          localStorage.setItem('lifecare_admin_session_id', fallbackSess);
          setActiveSessionId(fallbackSess);
          showToast('Admin session active. Single-session lock engaged.');
        } else {
          setAuthError(
            'Unauthorized: Only designated admin accounts (e.g. prayaspratikmohanty41@gmail.com) with 6+ character passwords can sign in.'
          );
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Add new administrator
  const handleSaveNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      showToast('Admin email is required');
      return;
    }
    setIsSavingAdmin(true);
    try {
      const success = await saveAdminProfile({
        name: newAdminName.trim() || 'Clinic Administrator',
        email: newAdminEmail.trim().toLowerCase(),
        role: newAdminRole,
        active: true,
        createdAt: new Date().toISOString(),
      });
      if (success) {
        showToast(`Admin ${newAdminEmail.trim()} authorized successfully!`);
        setAdminModalOpen(false);
        setNewAdminName('');
        setNewAdminEmail('');
        await loadAdmins();
      } else {
        // Add to local admin list if offline
        setAdminList((prev) => [
          ...prev,
          {
            id: 'admin_' + Date.now(),
            name: newAdminName.trim() || 'Clinic Administrator',
            email: newAdminEmail.trim().toLowerCase(),
            role: newAdminRole,
            active: true,
            createdAt: new Date().toISOString(),
          },
        ]);
        setAdminModalOpen(false);
        setNewAdminName('');
        setNewAdminEmail('');
        showToast('Admin added locally! Will sync to Firestore.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to authorize admin');
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Toggle admin active/deactivated
  const handleToggleAdmin = async (admin: AdminProfile) => {
    if (admin.email.toLowerCase() === 'prayaspratikmohanty41@gmail.com') {
      showToast('The primary administrator cannot be deactivated.');
      return;
    }
    const nextStatus = !admin.active;
    await toggleAdminStatus(admin.id, nextStatus);
    showToast(`Admin ${admin.name} is now ${nextStatus ? 'Active' : 'Deactivated'}.`);
    await loadAdmins();
  };

  // Force Revoke Machine Session
  const handleRevokeMachineSession = async (admin: AdminProfile) => {
    if (
      window.confirm(
        `Force terminate active machine session for ${admin.name} (${admin.email})? They will be immediately signed out on their machine.`
      )
    ) {
      await saveAdminProfile({
        id: admin.id,
        email: admin.email,
        activeSessionId: 'revoked_' + Date.now(),
      });
      showToast(`Machine session revoked for ${admin.name}.`);
      await loadAdmins();
    }
  };

  // Delete an administrator
  const handleDeleteAdmin = async (admin: AdminProfile) => {
    if (admin.email.toLowerCase() === 'prayaspratikmohanty41@gmail.com') {
      showToast('The primary administrator cannot be removed.');
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to revoke admin privileges for ${admin.name} (${admin.email})?`
      )
    ) {
      await deleteAdminProfile(admin.id);
      showToast(`Admin privileges revoked for ${admin.email}`);
      await loadAdmins();
    }
  };

  const handleLogout = async () => {
    try {
      await adminSignOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    setActiveSessionId('');
    sessionStorage.removeItem('lifecare_admin_auth');
    sessionStorage.removeItem('lifecare_admin_session_id');
    localStorage.removeItem('lifecare_admin_session_id');
    sessionStorage.removeItem('lifecare_admin_email');
    setEmailInput('');
    setPasswordInput('');
    showToast('Signed out of Admin Portal.');
  };

  // ----------------------------------------------------------------------
  // MODALS & FORMS STATE
  // ----------------------------------------------------------------------
  // Doctor Add/Edit Modal
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<Doctor>({
    id: '',
    name: '',
    specialty: '',
    department: 'General Medicine',
    qualification: '',
    experience: '',
    timing: '',
    fee: 0,
    photo: DEFAULT_MALE_DOCTOR_PHOTO,
  });

  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({
      id: `doc-${Date.now()}`,
      name: '',
      specialty: '',
      department: 'General Medicine',
      qualification: 'MBBS, MD',
      experience: 'Consultant Specialist',
      timing: 'Mon - Sat (10:00 AM - 01:00 PM)',
      fee: 0,
      photo: DEFAULT_MALE_DOCTOR_PHOTO,
    });
    setDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDoctorForm({ ...doc });
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorForm.name.trim()) return;

    let updated: Doctor[];
    if (editingDoctor) {
      updated = doctors.map((d) => (d.id === editingDoctor.id ? { ...doctorForm } : d));
    } else {
      updated = [
        ...doctors,
        { ...doctorForm, id: doctorForm.id || `doc-${Date.now()}` },
      ];
    }
    setDoctors(updated);
    saveDoctors(updated);
    setDoctorModalOpen(false);
    showToast(editingDoctor ? 'Doctor details updated!' : 'New doctor added successfully!');
  };

  const handleDeleteDoctor = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      const updated = doctors.filter((d) => d.id !== id);
      setDoctors(updated);
      saveDoctors(updated);
      showToast('Doctor removed.');
    }
  };

  // ----------------------------------------------------------------------
  // Doctor Arrival Alerts
  // ----------------------------------------------------------------------
  const [arrivalModalOpen, setArrivalModalOpen] = useState(false);
  const [arrivalForm, setArrivalForm] = useState<Partial<DoctorArrival>>({
    doctorId: '',
    doctorName: '',
    specialty: '',
    department: '',
    photo: DEFAULT_MALE_DOCTOR_PHOTO,
    date: new Date().toISOString().split('T')[0],
    timing: 'Today • 04:00 PM - 07:00 PM',
    note: 'Special OPD session today.',
    sentByAdminAt: 'Today',
  });

  const handleOpenAddArrival = () => {
    const firstDoc = doctors[0];
    setArrivalForm({
      doctorId: firstDoc ? firstDoc.id : 'custom',
      doctorName: firstDoc ? firstDoc.name : '',
      specialty: firstDoc ? firstDoc.specialty : '',
      department: firstDoc ? firstDoc.department : '',
      photo: firstDoc ? firstDoc.photo : DEFAULT_MALE_DOCTOR_PHOTO,
      date: new Date().toISOString().split('T')[0],
      timing: 'Today • 04:00 PM - 07:00 PM',
      note: 'Special unscheduled consultation slots open today.',
      sentByAdminAt: 'Today',
    });
    setArrivalModalOpen(true);
  };

  const handleSelectDoctorForArrival = (docId: string) => {
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setArrivalForm((prev) => ({
        ...prev,
        doctorId: doc.id,
        doctorName: doc.name,
        specialty: doc.specialty,
        department: doc.department,
        photo: doc.photo,
      }));
    }
  };

  const handleSaveArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrivalForm.doctorName) return;

    const dateStr = arrivalForm.date || new Date().toISOString().split('T')[0];
    const day = parseInt(dateStr.split('-')[2] || '1', 10);

    const newArrival: DoctorArrival = {
      id: `unannounced-${Date.now()}`,
      doctorId: arrivalForm.doctorId || `custom-${Date.now()}`,
      doctorName: arrivalForm.doctorName,
      specialty: arrivalForm.specialty || 'Specialist Doctor',
      department: arrivalForm.department || 'General OPD',
      photo: arrivalForm.photo || DEFAULT_MALE_DOCTOR_PHOTO,
      date: dateStr,
      dayOfMonth: day,
      timing: arrivalForm.timing || 'Today • Available',
      note: arrivalForm.note || '',
      isUnannounced: true,
      sentByAdminAt: arrivalForm.sentByAdminAt || 'Today',
    };

    const updated = [newArrival, ...unannouncedArrivals];
    setUnannouncedArrivals(updated);
    saveUnannouncedArrivals(updated);
    setArrivalModalOpen(false);
    showToast('Doctor arrival alert published to patient notification bell!');
  };

  const handleDeleteArrival = (id: string) => {
    const updated = unannouncedArrivals.filter((a) => a.id !== id);
    setUnannouncedArrivals(updated);
    saveUnannouncedArrivals(updated);
    showToast('Alert removed.');
  };

  // ----------------------------------------------------------------------
  // Special Offers
  // ----------------------------------------------------------------------
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [offerForm, setOfferForm] = useState<SpecialOffer>({
    id: '',
    badge: '🔥 SPECIAL OFFER',
    title: '',
    subtitle: '',
    description: '',
    discountText: 'FLAT 20% OFF',
    validUntil: 'Valid this week at Life Care',
    category: 'pathology',
    promoCode: 'CARE20',
    originalPrice: 1000,
    offerPrice: 800,
  });

  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      id: `offer-${Date.now()}`,
      badge: '🔥 SPECIAL OFFER',
      title: '',
      subtitle: '',
      description: '',
      discountText: '20% OFF',
      validUntil: 'Valid all month',
      category: 'pathology',
      promoCode: 'OFFER20',
      originalPrice: 1000,
      offerPrice: 800,
    });
    setOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setOfferForm({ ...offer });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim()) return;

    let updated: SpecialOffer[];
    if (editingOffer) {
      updated = specialOffers.map((o) => (o.id === editingOffer.id ? { ...offerForm } : o));
    } else {
      updated = [
        { ...offerForm, id: offerForm.id || `offer-${Date.now()}` },
        ...specialOffers,
      ];
    }
    setSpecialOffers(updated);
    saveSpecialOffers(updated);
    setOfferModalOpen(false);
    showToast(editingOffer ? 'Special offer updated!' : 'New special offer added!');
  };

  const handleDeleteOffer = (id: string) => {
    if (window.confirm('Delete this special offer?')) {
      const updated = specialOffers.filter((o) => o.id !== id);
      setSpecialOffers(updated);
      saveSpecialOffers(updated);
      showToast('Special offer deleted.');
    }
  };

  // ----------------------------------------------------------------------
  // Products
  // ----------------------------------------------------------------------
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Product>({
    id: '',
    name: '',
    category: 'medicines',
    price: 150,
    originalPrice: 200,
    unit: '1 Unit',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: '',
  });

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      id: `prod-${Date.now()}`,
      name: '',
      category: 'medicines',
      price: 100,
      originalPrice: 150,
      unit: '1 Unit',
      inStock: true,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      description: 'High quality genuine medicine item.',
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setProductModalOpen(true);
  };

  const handleToggleProductStock = (id: string) => {
    const updated = products.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p));
    setProducts(updated);
    saveProducts(updated);
    showToast('Product stock status updated!');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    const targetProduct: Product = {
      ...productForm,
      id: productForm.id || `prod-${Date.now()}`,
    };

    let updated: Product[];
    if (editingProduct) {
      updated = products.map((p) => (p.id === editingProduct.id ? targetProduct : p));
    } else {
      updated = [...products, targetProduct];
    }
    setProducts(updated);
    saveProducts(updated);
    setProductModalOpen(false);

    try {
      if (isFirebaseConfigured()) {
        await syncProductToFirestore(targetProduct);
        showToast(
          editingProduct
            ? 'Product updated in inventory & synced to Firestore!'
            : 'New product added & synced to Firestore!'
        );
      } else {
        showToast(editingProduct ? 'Product updated locally!' : 'Product added to inventory!');
      }
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      if (err.code === 'permission-denied') {
        showToast('Firestore Security Rule Blocked: Only verified admins can edit products.');
      } else {
        showToast('Saved locally. Cloud sync pending.');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Delete this product from store inventory?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveProducts(updated);

      try {
        if (isFirebaseConfigured()) {
          await deleteProductFromFirestore(id);
          showToast('Product deleted from inventory & cloud Firestore.');
        } else {
          showToast('Product deleted locally.');
        }
      } catch (err: any) {
        console.error('Firestore delete failed:', err);
        if (err.code === 'permission-denied') {
          showToast('Firestore Security Rule Blocked: Only verified admins can delete products.');
        } else {
          showToast('Product deleted locally.');
        }
      }
    }
  };

  const [isSyncingAllProducts, setIsSyncingAllProducts] = useState(false);

  const handleSyncAllProducts = async () => {
    if (!isFirebaseConfigured()) {
      showToast('Firebase is not configured.');
      return;
    }
    setIsSyncingAllProducts(true);
    try {
      const res = await syncAllProductsToFirestore(products);
      showToast(`Uploaded ${res.count} products to Firestore collection 'products'!`);
    } catch (err: any) {
      console.error('Batch sync error:', err);
      if (err.code === 'permission-denied') {
        showToast('Firestore Permission Denied: Ensure your UID is added in the admins collection.');
      } else {
        showToast(`Sync failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsSyncingAllProducts(false);
    }
  };

  // ----------------------------------------------------------------------
  // Pathology Tests
  // ----------------------------------------------------------------------
  const [testSearch, setTestSearch] = useState('');
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<PathologyTest | null>(null);
  const [testForm, setTestForm] = useState<PathologyTest>({
    id: '',
    name: '',
    category: 'HAEMATOLOGY',
    price: 300,
    parameters: '',
  });

  const handleOpenAddTest = () => {
    setEditingTest(null);
    setTestForm({
      id: `test-${Date.now()}`,
      name: '',
      category: 'BIOCHEMISTRY',
      price: 400,
      parameters: '',
    });
    setTestModalOpen(true);
  };

  const handleOpenEditTest = (test: PathologyTest) => {
    setEditingTest(test);
    setTestForm({ ...test });
    setTestModalOpen(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.name.trim()) return;

    let updated: PathologyTest[];
    if (editingTest) {
      updated = pathologyTests.map((t) => (t.id === editingTest.id ? { ...testForm } : t));
    } else {
      updated = [
        ...pathologyTests,
        { ...testForm, id: testForm.id || `test-${Date.now()}` },
      ];
    }
    setPathologyTests(updated);
    savePathologyTests(updated);
    setTestModalOpen(false);
    showToast(editingTest ? 'Test price/details updated!' : 'New test added to catalog!');
  };

  const handleDeleteTest = (id: string) => {
    if (window.confirm('Delete this pathology test?')) {
      const updated = pathologyTests.filter((t) => t.id !== id);
      setPathologyTests(updated);
      savePathologyTests(updated);
      showToast('Test removed.');
    }
  };

  // ----------------------------------------------------------------------
  // Clinic Settings Form
  // ----------------------------------------------------------------------
  const [configForm, setConfigForm] = useState<ClinicConfig>(() => clinicConfig);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setClinicConfig(configForm);
    saveClinicConfig(configForm);
    showToast('Clinic details & booking URLs updated successfully!');
  };

  // ----------------------------------------------------------------------
  // Backup & Factory Reset
  // ----------------------------------------------------------------------
  const handleExportData = () => {
    const payload = {
      doctors,
      products,
      pathologyTests,
      specialOffers,
      unannouncedArrivals,
      clinicConfig,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lifecare_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON downloaded!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.doctors) saveDoctors(parsed.doctors);
          if (parsed.products) saveProducts(parsed.products);
          if (parsed.pathologyTests) savePathologyTests(parsed.pathologyTests);
          if (parsed.specialOffers) saveSpecialOffers(parsed.specialOffers);
          if (parsed.unannouncedArrivals) saveUnannouncedArrivals(parsed.unannouncedArrivals);
          if (parsed.clinicConfig) saveClinicConfig(parsed.clinicConfig);
          reloadData();
          showToast('Data restored from backup!');
        } catch {
          alert('Invalid backup JSON file.');
        }
      };
    }
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the entire clinic back to default factory settings (All 11 doctors, original products & original tests)?'
      )
    ) {
      resetAllToFactoryDefaults();
      reloadData();
      showToast('Clinic reset to factory defaults.');
    }
  };

  // ----------------------------------------------------------------------
  // If Checking Auth State -> Show Loading Spinner
  // ----------------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto animate-spin">
            <Loader2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Verifying Admin Authorization...</p>
          <p className="text-xs text-slate-400">Connecting to Firebase Auth & checking permissions</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // If Not Authenticated -> Show Secure Firebase Email & Password Gate
  // ----------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToApp}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Clinic</span>
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-teal-800 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-900/10">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Life Care Pharmacy Admin
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Sign in with your verified administrator credentials to manage products, pricing, doctors, and clinic operations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@lifecare.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium text-sm focus:outline-teal-600 placeholder:text-slate-400"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium text-sm focus:outline-teal-600 placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-70 text-white font-extrabold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Authorization Disclosure */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              <span>Role-Based Access Control (RBAC)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Admin operations and database writes are strictly protected by Firebase Security Rules. Merely signing up does not grant admin access; only verified accounts in the admin allowlist or Firestore <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">/admins</code> collection are authorized.
            </p>
            {!firebaseActive && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>⚙️ Cloudflare Environment Notice:</span>
                </div>
                <p>
                  To connect live Firebase Auth, set <code className="font-mono text-[10px] bg-amber-100 px-1">VITE_FIREBASE_*</code> in your Cloudflare Pages Settings or <code className="font-mono text-[10px] bg-amber-100 px-1">.env</code>. You can also sign in with your designated admin email: <strong className="underline">prayaspratikmohanty41@gmail.com</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // Authenticated Admin Dashboard
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen pb-24 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBackToApp}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Return to Customer Clinic view"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm text-slate-900">Admin Control</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified Admin
                </span>
                {firebaseActive ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" />
                    Firebase Live
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded-md">
                    Local Cache
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate max-w-[220px] sm:max-w-xs font-medium">
                Signed in as: <strong className="text-slate-700">{adminEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onBackToApp}
              className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1.5 rounded-xl hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1"
              title="View Customer App"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
              title="Sign Out from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Admin Tabs Navigation Bar */}
        <div className="max-w-xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'doctors'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Doctors ({doctors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arrivals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'arrivals'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Arrivals & Bell ({unannouncedArrivals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'offers'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offers ({specialOffers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'products'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Store ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pathology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pathology'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Tests ({pathologyTests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Clinic Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'logs'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Logs ({bookingHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'admins'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admins & Security ({adminList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Body */}
      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* ================================================================ */}
        {/* TAB 1: DOCTORS MANAGER                                           */}
        {/* ================================================================ */}
        {activeTab === 'doctors' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Specialist Doctors Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Add, edit timings, qualifications, or remove doctors.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddDoctor}
                className="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="space-y-3">
              {doctors.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-14 h-14 rounded-xl object-cover object-top border border-slate-200 bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {doc.name}
                        </h4>
                      </div>
                      <p className="text-xs font-semibold text-teal-700 truncate">
                        {doc.specialty}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {doc.qualification} • {doc.department}
                      </p>
                      <p className="text-[10px] text-slate-600 font-medium truncate mt-1">
                        🕒 {doc.timing}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDoctor(doc)}
                      className="p-2 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Doctor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: UNANNOUNCED ARRIVALS & NOTIFICATION BELL ALERTS           */}
        {/* ================================================================ */}
        {activeTab === 'arrivals' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Doctor Arrivals & Bell Alerts
                </h3>
                <p className="text-xs text-slate-500">
                  Triggers notification count badge on the patient header bell.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddArrival}
                className="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Arrival Alert</span>
              </button>
            </div>

            {unannouncedArrivals.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
                No active unannounced doctor visits at the moment.
              </div>
            ) : (
              <div className="space-y-3">
                {unannouncedArrivals.map((arrival) => (
                  <div
                    key={arrival.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={arrival.photo}
                        alt={arrival.doctorName}
                        className="w-12 h-12 rounded-xl object-cover object-top border border-slate-200 bg-slate-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                            {arrival.sentByAdminAt || 'Alert'}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Date: {arrival.date}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate mt-1">
                          {arrival.doctorName}
                        </h4>
                        <p className="text-xs font-semibold text-teal-700 truncate">
                          {arrival.specialty}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                          🕒 {arrival.timing}
                        </p>
                        {arrival.note && (
                          <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {arrival.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteArrival(arrival.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer shrink-0"
                      title="Remove Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: SPECIAL OFFERS                                            */}
        {/* ================================================================ */}
        {activeTab === 'offers' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Special Offers & Home Ribbon
                </h3>
                <p className="text-xs text-slate-500">
                  The first offer appears directly in the Home page top ribbon.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddOffer}
                className="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Offer</span>
              </button>
            </div>

            <div className="space-y-3">
              {specialOffers.map((offer, idx) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                        {offer.discountText}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                          ★ Home Ribbon Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditOffer(offer)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Offer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{offer.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{offer.subtitle}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{offer.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>Code: {offer.promoCode || 'None'}</span>
                    <span>Valid: {offer.validUntil}</span>
                    {offer.offerPrice ? (
                      <span className="font-bold text-teal-700">₹{offer.offerPrice}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: STORE PRODUCTS                                            */}
        {/* ================================================================ */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Pharmacy & Physio Inventory
                </h3>
                <p className="text-xs text-slate-500">
                  Add items, edit prices, or toggle in-stock / out-of-stock.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncAllProducts}
                  disabled={isSyncingAllProducts}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Upload all default products to your Firestore 'products' collection"
                >
                  {isSyncingAllProducts ? (
                    <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                  ) : (
                    <Database className="w-4 h-4 text-teal-700" />
                  )}
                  <span>{isSyncingAllProducts ? 'Syncing...' : 'Sync All to Firestore'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-extrabold text-xs text-teal-700">₹{prod.price}</span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{prod.originalPrice}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 capitalize">
                          • {prod.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleProductStock(prod.id)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        prod.inStock
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {prod.inStock ? 'In Stock' : 'Out of Stock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(prod)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 5: PATHOLOGY TESTS                                           */}
        {/* ================================================================ */}
        {activeTab === 'pathology' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Pathology Tests & Pricing
                </h3>
                <p className="text-xs text-slate-500">
                  Update diagnostic fees or add new blood tests.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddTest}
                className="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Test</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Search test by name or category..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold placeholder:font-normal focus:outline-teal-600"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {pathologyTests
                .filter(
                  (t) =>
                    t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
                    t.category.toLowerCase().includes(testSearch.toLowerCase())
                )
                .map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {test.category}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {test.name}
                        </h4>
                      </div>
                      {test.parameters && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {test.parameters}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                        ₹{test.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditTest(test)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTest(test.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 6: CLINIC SETTINGS                                           */}
        {/* ================================================================ */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Clinic Configuration & Booking URLs
              </h3>
              <p className="text-xs text-slate-500">
                Update phone numbers, WhatsApp, clinic address, and external booking links.
              </p>
            </div>

            <form
              onSubmit={handleSaveConfig}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={configForm.name}
                  onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={configForm.phone}
                    onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp (Digits with country code)
                  </label>
                  <input
                    type="text"
                    value={configForm.whatsapp}
                    onChange={(e) => setConfigForm({ ...configForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={configForm.hours}
                  onChange={(e) => setConfigForm({ ...configForm, hours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor OPD Registration Link
                </label>
                <input
                  type="text"
                  value={configForm.doctorBookingUrl}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, doctorBookingUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pathology Lab Booking Link
                </label>
                <input
                  type="text"
                  value={configForm.pathologyBookingUrl}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, pathologyBookingUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Clinic Settings</span>
              </button>
            </form>

            {/* Firebase Admin Authorization & Database Security Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                      Firebase Admin Authorization & Security Rules
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Role-based access control and database isolation
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    firebaseActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {firebaseActive ? 'Cloud Live' : 'Local Standby'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Authorized Admin Email:</span>
                  <span className="font-bold text-slate-800">{adminEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Firebase User UID:</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <span>{adminUser?.uid || 'local-admin-uid'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const uid = adminUser?.uid || 'local-admin-uid';
                        navigator.clipboard?.writeText(uid);
                        showToast('Admin UID copied to clipboard!');
                      }}
                      className="text-teal-700 hover:text-teal-900 cursor-pointer ml-1"
                      title="Copy UID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Enforced Rules:</span>
                  <span className="font-semibold text-teal-800">firestore.rules (RBAC)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <p>
                  <strong>• Customer Access:</strong> Customers browse products & prices freely without login.
                </p>
                <p>
                  <strong>• Admin Protection:</strong> Only authenticated admins can create, update, or delete products and change pricing.
                </p>
                <p>
                  <strong>• Customer Privacy:</strong> Orders and private customer details cannot be viewed or modified by other customers.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={testingFirebase}
                  onClick={async () => {
                    setTestingFirebase(true);
                    try {
                      if (isFirebaseConfigured()) {
                        // Test Firestore write rule
                        const testProd: Product = {
                          ...products[0],
                          id: products[0]?.id || 'test-prod',
                        };
                        await syncProductToFirestore(testProd);
                        showToast('✓ Verified: Firestore accepted authorized admin write rule.');
                      } else {
                        showToast('Standby Mode: Configure VITE_FIREBASE_* in Cloudflare to test live connection.');
                      }
                    } catch (err: any) {
                      showToast(`Rule Check: ${err.message || err.code}`);
                    } finally {
                      setTestingFirebase(false);
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-200"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{testingFirebase ? 'Testing Rules...' : 'Verify Firestore Admin Rules'}</span>
                </button>
              </div>
            </div>

            {/* Backup & Factory Reset Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                Backup & Restore
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer text-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <label className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer text-slate-700 text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Factory Defaults (11 Original Doctors)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 7: BOOKING LOGS                                              */}
        {/* ================================================================ */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Patient Booking Activity</h3>
                <p className="text-xs text-slate-500">
                  Recent OPD & Pathology clicks registered on the app.
                </p>
              </div>
              {bookingHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all booking history logs?')) {
                      clearBookingHistory();
                      setBookingHistory([]);
                      showToast('Booking logs cleared.');
                    }
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {bookingHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
                No recent booking interactions recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {bookingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            item.type === 'doctor'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.type.toUpperCase()}
                        </span>
                        <span className="font-extrabold text-slate-900">{item.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.dateLabel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 8: ADMINS & SINGLE-MACHINE SECURITY                           */}
        {/* ================================================================ */}
        {activeTab === 'admins' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Header with Title and Add Button */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  <span>Admin Team & Single-Machine Lock</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Manage administrator accounts, roles, and enforce one-machine-at-a-time security.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadAdmins}
                  disabled={loadingAdmins}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Refresh admins list"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAdmins ? 'animate-spin text-teal-700' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Admin</span>
                </button>
              </div>
            </div>

            {/* Single-Machine Lock Enforced Banner */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-teal-950">
                    Single-Machine Session Protection Active
                  </h4>
                  <p className="text-[11px] text-teal-800 leading-relaxed mt-0.5">
                    For strict security, an admin account can only be actively logged in on <strong>one machine or browser at any given time</strong>. If an administrator signs in from another computer, phone, or browser, the previous session is immediately disconnected in real-time.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-teal-100 flex items-center justify-between text-[11px] font-semibold text-teal-900">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Current Device Session: Active</span>
                </span>
                <span className="font-mono text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                  {activeSessionId ? activeSessionId.substring(0, 16) + '...' : 'Local Secure Lock'}
                </span>
              </div>
            </div>

            {/* Admin Directory List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>Authorized Administrators ({adminList.length})</span>
                <span>Role & Device Session</span>
              </div>

              {adminList.map((admin) => {
                const isPrimary = admin.email.toLowerCase() === 'prayaspratikmohanty41@gmail.com';
                const isCurrentLogged = admin.email.toLowerCase() === (adminEmail || '').toLowerCase();

                return (
                  <div
                    key={admin.id}
                    className={`bg-white rounded-2xl p-4 border transition-all ${
                      !admin.active
                        ? 'border-slate-200 opacity-60 bg-slate-50'
                        : isCurrentLogged
                        ? 'border-teal-300 shadow-sm ring-1 ring-teal-200'
                        : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isPrimary
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {isPrimary ? '👑' : '👨‍💼'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {admin.name}
                            </h4>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                admin.role === 'Super Admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : admin.role === 'Store Admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              {admin.role}
                            </span>
                            {isPrimary && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                                Primary Owner
                              </span>
                            )}
                            {isCurrentLogged && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                You (This Device)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                            {admin.email}
                          </p>

                          {/* Machine / Device status */}
                          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                            {admin.activeSessionId ? (
                              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Laptop className="w-3.5 h-3.5" />
                                <span>1 Machine Logged In</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Monitor className="w-3.5 h-3.5" />
                                <span>No Active Session</span>
                              </span>
                            )}

                            {admin.lastActiveAt && (
                              <span className="text-[10px] text-slate-400">
                                Last active: {new Date(admin.lastActiveAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Revoke Session button */}
                        {admin.activeSessionId && (
                          <button
                            type="button"
                            onClick={() => handleRevokeMachineSession(admin)}
                            className="p-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Force terminate active session on their machine"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}

                        {/* Toggle Active status */}
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleToggleAdmin(admin)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-bold ${
                              admin.active
                                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={admin.active ? 'Deactivate this admin' : 'Reactivate this admin'}
                          >
                            {admin.active ? 'Disable' : 'Enable'}
                          </button>
                        )}

                        {/* Delete Admin */}
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(admin)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Remove admin privileges"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How to add new admins info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 text-xs text-slate-600">
              <h5 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>💡 Adding Admins in Future</span>
              </h5>
              <p className="leading-relaxed text-[11px]">
                To authorize a new staff member or doctor as an admin:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 pl-1">
                <li>Click <strong>Add Admin</strong> and enter their official email address.</li>
                <li>Assign their role (Super Admin, Clinic Admin, Store Admin, or Staff).</li>
                <li>When they sign into the portal using Firebase Auth, their account is granted access with the single-machine lock enforced.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* MODAL: DOCTOR ADD / EDIT                                           */}
      {/* ================================================================== */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingDoctor ? 'Edit Doctor' : 'Add New Specialist Doctor'}
              </h3>
              <button
                type="button"
                onClick={() => setDoctorModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DR AJIT KUMAR NAYAK"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specialty Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Consultant Neurosurgeon (Brain & Spine)"
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neurosurgery"
                    value={doctorForm.department}
                    onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MS (Neurosurgery)"
                    value={doctorForm.qualification}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, qualification: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Consultation Timings / Days
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visit Every Friday (12:00 PM - 03:00 PM)"
                  value={doctorForm.timing}
                  onChange={(e) => setDoctorForm({ ...doctorForm, timing: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experience & Focus Areas
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brain, Spine, Headache, Vertigo Specialist"
                  value={doctorForm.experience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              {/* Photo Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Doctor Photo / Avatar
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDoctorForm({ ...doctorForm, photo: DEFAULT_MALE_DOCTOR_PHOTO })
                    }
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      doctorForm.photo === DEFAULT_MALE_DOCTOR_PHOTO
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    👨‍⚕️ Male Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDoctorForm({ ...doctorForm, photo: DEFAULT_FEMALE_DOCTOR_PHOTO })
                    }
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      doctorForm.photo === DEFAULT_FEMALE_DOCTOR_PHOTO
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    👩‍⚕️ Female Avatar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom image URL"
                  value={doctorForm.photo.startsWith('data:') ? '' : doctorForm.photo}
                  onChange={(e) => setDoctorForm({ ...doctorForm, photo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: DOCTOR ARRIVAL NOTIFICATION ALERT                           */}
      {/* ================================================================== */}
      {arrivalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                Broadcast Doctor Arrival Alert
              </h3>
              <button
                type="button"
                onClick={() => setArrivalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveArrival} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Specialist Doctor
                </label>
                <select
                  value={arrivalForm.doctorId}
                  onChange={(e) => handleSelectDoctorForArrival(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    required
                    value={arrivalForm.date}
                    onChange={(e) => setArrivalForm({ ...arrivalForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={arrivalForm.sentByAdminAt}
                    onChange={(e) =>
                      setArrivalForm({ ...arrivalForm, sentByAdminAt: e.target.value })
                    }
                    placeholder="e.g. Today / Urgent"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arrival OPD Timings
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Today • 04:00 PM - 06:30 PM (Unscheduled)"
                  value={arrivalForm.timing}
                  onChange={(e) => setArrivalForm({ ...arrivalForm, timing: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Note for Patients
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Special unscheduled stomach & liver consultation session today."
                  value={arrivalForm.note}
                  onChange={(e) => setArrivalForm({ ...arrivalForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setArrivalModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: SPECIAL OFFER ADD / EDIT                                    */}
      {/* ================================================================== */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingOffer ? 'Edit Special Offer' : 'Add Special Offer'}
              </h3>
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Highlight
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLAT 25% OFF / SAVE ₹250"
                  value={offerForm.discountText}
                  onChange={(e) => setOfferForm({ ...offerForm, discountText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Full Body Blood Profile Package"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. CBC + LFT + KFT + Lipid Profile"
                  value={offerForm.subtitle}
                  onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Details of what is included in the package..."
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={offerForm.category}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        category: e.target.value as 'doctor' | 'pathology' | 'pharmacy' | 'physio',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  >
                    <option value="pathology">Pathology</option>
                    <option value="doctor">Doctor OPD</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="physio">Physiotherapy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. LIFECARE25"
                    value={offerForm.promoCode}
                    onChange={(e) => setOfferForm({ ...offerForm, promoCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={offerForm.originalPrice || ''}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    value={offerForm.offerPrice || ''}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, offerPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: PRODUCT ADD / EDIT                                          */}
      {/* ================================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add Store Product'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Digital Rapid Clinical Thermometer"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as 'medicines' | 'physio' | 'wellness' | 'babycare',
                        isPhysio: e.target.value === 'physio',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  >
                    <option value="medicines">Pharmacy Medicines</option>
                    <option value="physio">Physiotherapy & Rehab</option>
                    <option value="wellness">Wellness & Immunity</option>
                    <option value="babycare">Baby Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Pack</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Unit / Strip of 10"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MRP / Original (₹)
                  </label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief clinical description and usage instructions..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prodInStock"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="rounded text-teal-700"
                />
                <label htmlFor="prodInStock" className="text-xs font-bold text-slate-700">
                  Item is currently in stock
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: PATHOLOGY TEST ADD / EDIT                                   */}
      {/* ================================================================== */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingTest ? 'Edit Pathology Test' : 'Add Pathology Test'}
              </h3>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COMPLETE BLOOD COUNT (CBC)"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HAEMATOLOGY / BIOCHEMISTRY"
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={testForm.price}
                    onChange={(e) => setTestForm({ ...testForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parameters Included
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hemoglobin, TLC, DLC, Platelet Count, RBC, Hct..."
                  value={testForm.parameters}
                  onChange={(e) => setTestForm({ ...testForm, parameters: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: ADD NEW ADMINISTRATOR                                       */}
      {/* ================================================================== */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">
                  Authorize New Administrator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name / Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Pratik Mohanty / Manager"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff.admin@lifecare.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Must match the Firebase Auth account email used for sign in.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Role & Privileges
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-teal-600"
                >
                  <option value="Clinic Admin">Clinic Admin (Doctors, Arrivals & Offers)</option>
                  <option value="Store Admin">Store Admin (Products & Inventory)</option>
                  <option value="Super Admin">Super Admin (Full Access & User Management)</option>
                  <option value="Staff">Staff (View & Basic Operations)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Single-Machine Enforcement Applied:</span>
                </span>
                <p className="leading-relaxed">
                  Once authorized, this admin can sign into the Admin Portal. The 1-active-machine rule will automatically apply to their account as well.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-extrabold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingAdmin ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorize Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
