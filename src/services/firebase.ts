import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';
import {
  Product,
  Doctor,
  DoctorArrival,
  ClinicNotification,
  StoreOrder,
  CashTransaction,
  SpecialOffer,
  PinchUpdate,
} from '../types';

// Lightweight session operation counter for the Admin Usage Dashboard
let sessionFirestoreReads = 0;
let sessionFirestoreWrites = 0;

export function recordFirestoreRead(count = 1): void {
  sessionFirestoreReads += count;
}

export function recordFirestoreWrite(count = 1): void {
  sessionFirestoreWrites += count;
}

export function getSessionFirestoreStats() {
  return { reads: sessionFirestoreReads, writes: sessionFirestoreWrites };
}

// Load Firebase configuration from Vite environment variables (VITE_FIREBASE_*)
// Default fallback values configured from user's Firebase project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCUKqGPhxP01sizKHvHC3EWYJUeS-XkoRI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'life-care-3c598.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'life-care-3c598',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'life-care-3c598.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1072029958260',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1072029958260:web:6f382546ddd579462c1121',
};

// Check if Firebase configuration has been provided
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('your-firebase')
  );
};

// Initialize Firebase App instance safely
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!appInstance) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!dbInstance) {
    dbInstance = getFirestore(app);
  }
  return dbInstance;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Clinic Admin' | 'Store Admin' | 'Staff';
  active: boolean;
  activeSessionId?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  deviceInfo?: string;
  createdAt: string;
}

export interface AdminAuthStatus {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  email: string | null;
  uid: string | null;
  errorMessage?: string;
  source: 'firebase' | 'local_demo';
}

// Configured admin email and UID allowlists
const ADMIN_EMAILS: string[] = (
  (import.meta.env.VITE_FIREBASE_ADMIN_EMAILS as string) ||
  'prayaspratikmohanty41@gmail.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_UIDS: string[] = (
  (import.meta.env.VITE_FIREBASE_ADMIN_UIDS as string) || ''
)
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

/**
 * Checks whether a signed-in Firebase user is authorized as an Admin.
 * Enforces multi-tier verification:
 * 1. Firebase Custom Token Claim (`token.admin === true` or `token.role === 'admin'`)
 * 2. Firestore `/admins/{uid}` document existence
 * 3. Verified environment allowlist (`VITE_FIREBASE_ADMIN_EMAILS` or `VITE_FIREBASE_ADMIN_UIDS`)
 */
export async function verifyUserIsAdmin(user: User): Promise<{
  isAdmin: boolean;
  reason?: string;
}> {
  if (!user) return { isAdmin: false, reason: 'No user authenticated' };

  try {
    // 1. Inspect Firebase Token Custom Claims
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin') {
      return { isAdmin: true, reason: 'Firebase custom claims' };
    }

    // 2. Inspect Firestore admins collection if DB is available
    const db = getFirebaseDb();
    if (db) {
      try {
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          const data = adminDocSnap.data();
          if (data && data.active !== false) {
            return { isAdmin: true, reason: 'Firestore admin allowlist document' };
          }
        }
      } catch (dbErr) {
        console.warn('Firestore admin check skipped:', dbErr);
      }
    }

    // 3. Inspect trusted allowlist of admin emails or UIDs
    const userEmail = (user.email || '').toLowerCase();
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      return { isAdmin: true, reason: 'Trusted admin email allowlist' };
    }
    if (ADMIN_UIDS.includes(user.uid)) {
      return { isAdmin: true, reason: 'Trusted admin UID allowlist' };
    }

    // If none matched, deny authorization
    return {
      isAdmin: false,
      reason: 'User is authenticated, but not authorized as an administrator.',
    };
  } catch (err: any) {
    console.error('Error verifying admin authorization:', err);
    return { isAdmin: false, reason: err.message || 'Authorization verification failed' };
  }
}

/**
 * Admin Login with Firebase Email & Password
 */
export async function adminSignIn(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return {
      success: false,
      error:
        'Firebase credentials are not yet configured in environment variables. Please configure VITE_FIREBASE_* in your deployment settings or .env file.',
    };
  }

  try {
    // Enforce inMemoryPersistence so no credentials linger in IndexedDB or localStorage
    // When the user dismisses the page or closes the tab, the admin session is immediately cleared
    try {
      await setPersistence(auth, inMemoryPersistence);
    } catch (persistErr) {
      console.warn('Could not set inMemoryPersistence:', persistErr);
    }
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const authCheck = await verifyUserIsAdmin(cred.user);
    if (!authCheck.isAdmin) {
      // User logged in, but lacks admin privileges
      await signOut(auth);
      return {
        success: false,
        error:
          'Access Denied: This account is not authorized as an administrator. Only designated clinic admins can access this area.',
      };
    }
    return { success: true, user: cred.user };
  } catch (err: any) {
    let msg = 'Failed to sign in. Please verify your email and password.';
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      msg = 'Invalid credentials. Please verify your email and password.';
    } else if (err.code === 'auth/user-not-found') {
      msg = 'No admin account found with this email address.';
    } else if (err.code === 'auth/too-many-requests') {
      msg = 'Access temporarily disabled due to many failed attempts. Try again later.';
    } else if (err.message) {
      msg = err.message;
    }
    return { success: false, error: msg };
  }
}

export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  message: string;
}

export function validateStrongPassword(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const valid = score === 5;
  const label: PasswordStrengthResult['label'] =
    score >= 5 ? 'Strong' : score >= 4 ? 'Good' : score >= 3 ? 'Fair' : 'Weak';

  const missing: string[] = [];
  if (!checks.minLength) missing.push('8+ chars');
  if (!checks.hasUpper) missing.push('uppercase');
  if (!checks.hasLower) missing.push('lowercase');
  if (!checks.hasNumber) missing.push('number');
  if (!checks.hasSpecial) missing.push('symbol');

  return {
    valid,
    score,
    checks,
    label,
    message: valid ? 'Strong password' : `Needs: ${missing.join(', ')}`,
  };
}

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem('lifecare_device_id');
    if (!id) {
      id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('lifecare_device_id', id);
    }
    return id;
  } catch {
    return 'dev_' + Math.random().toString(36).substring(2, 10);
  }
}

export function getReadableDeviceLabel(): string {
  if (typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const os = /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
    ? 'Android'
    : /Windows/i.test(ua)
    ? 'Windows'
    : /Mac/i.test(ua)
    ? 'Mac'
    : 'Linux';
  const browser = /Edg/i.test(ua)
    ? 'Edge'
    : /Chrome|CriOS/i.test(ua)
    ? 'Chrome'
    : /Safari/i.test(ua)
    ? 'Safari'
    : /Firefox/i.test(ua)
    ? 'Firefox'
    : 'Browser';
  return `${isMobile ? 'Phone' : 'PC'} • ${os} (${browser})`;
}

/**
 * Send Firebase Password Reset Email to Admin
 */
export async function sendAdminPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'Enter your admin email address.' };
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    return {
      success: false,
      message: 'Firebase Auth is not active in this environment.',
    };
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return {
      success: true,
      message: `Password reset email sent to ${cleanEmail}. Check your inbox or spam folder.`,
    };
  } catch (err: any) {
    let msg = 'Could not send reset email.';
    if (err.code === 'auth/user-not-found') {
      msg = 'No admin account found for that email.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    } else if (err.code === 'auth/too-many-requests') {
      msg = 'Too many requests. Please wait a few minutes.';
    } else if (err.message) {
      msg = err.message;
    }
    return { success: false, message: msg };
  }
}

/**
 * Update signed-in admin's password with strong password enforcement
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const strength = validateStrongPassword(newPassword);
  if (!strength.valid) {
    return { success: false, message: `Weak password — ${strength.message}` };
  }

  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user || !user.email) {
    return { success: false, message: 'No active Firebase admin session found.' };
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true, message: 'Admin password updated successfully!' };
  } catch (err: any) {
    let msg = 'Failed to update password.';
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      msg = 'Current password is incorrect.';
    } else if (err.code === 'auth/requires-recent-login') {
      msg = 'Please sign out and sign in again before changing your password.';
    } else if (err.message) {
      msg = err.message;
    }
    return { success: false, message: msg };
  }
}

/**
 * Admin Logout & Session Cleanup
 */
export async function adminSignOut(): Promise<void> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const currentUid = auth?.currentUser?.uid;
  const localSessionId = sessionStorage.getItem('lifecare_admin_session_id');

  // Clear cloud activeSessionId ONLY if it still belongs to this machine/session
  if (db && currentUid && localSessionId) {
    try {
      const adminRef = doc(db, 'admins', currentUid);
      const snap = await getDoc(adminRef);
      if (snap.exists() && snap.data()?.activeSessionId === localSessionId) {
        await setDoc(
          adminRef,
          { activeSessionId: null, lastActiveAt: new Date().toISOString() },
          { merge: true }
        );
      }
    } catch {
      // ignore
    }
  }

  if (auth) {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }
  sessionStorage.removeItem('lifecare_admin_auth');
  sessionStorage.removeItem('lifecare_admin_email');
  sessionStorage.removeItem('lifecare_admin_session_id');
  localStorage.removeItem('lifecare_admin_session_id');
}

/**
 * Register single active session for an admin in Firestore and local storage.
 * Enforces one active machine/phone per admin account at any time.
 */
export async function registerAdminSession(
  user: User,
  adminName?: string
): Promise<string> {
  const deviceId = getOrCreateDeviceId();
  const deviceLabel = getReadableDeviceLabel();
  const sessionId = `sess_${deviceId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  localStorage.setItem('lifecare_admin_session_id', sessionId);
  sessionStorage.setItem('lifecare_admin_session_id', sessionId);

  const db = getFirebaseDb();
  if (db && user) {
    try {
      const adminRef = doc(db, 'admins', user.uid);
      await setDoc(
        adminRef,
        {
          uid: user.uid,
          email: (user.email || '').toLowerCase(),
          name: adminName || user.displayName || 'Clinic Administrator',
          activeSessionId: sessionId,
          activeDeviceId: deviceId,
          lastLoginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          deviceInfo: deviceLabel,
          active: true,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not register cloud session, using local session guard:', err);
    }
  }

  // Cross-tab notification via BroadcastChannel
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('lifecare_admin_session_channel');
      bc.postMessage({ type: 'NEW_SESSION_STARTED', sessionId, uid: user.uid });
      bc.close();
    }
  } catch {
    // ignore
  }

  return sessionId;
}

/**
 * Real-time listener + heartbeat verification for the admin's single-machine session.
 * If another machine or phone signs into this admin account, Firestore updates
 * activeSessionId to a different value, triggering onSessionRevoked immediately.
 */
export function listenToAdminSession(
  uid: string,
  localSessionId: string,
  onSessionRevoked: (reason: string) => void
): () => void {
  const db = getFirebaseDb();
  let unsubFirestore: (() => void) | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let revoked = false;

  const triggerRevoke = (msg: string) => {
    if (revoked) return;
    revoked = true;
    onSessionRevoked(msg);
  };

  const inspectDocData = (data: Record<string, any> | undefined) => {
    if (!data) return;
    if (data.active === false) {
      triggerRevoke('Your administrator account access has been deactivated.');
      return;
    }
    if (data.activeSessionId && localSessionId && data.activeSessionId !== localSessionId) {
      triggerRevoke(
        `Session ended: Logged in from another device (${data.deviceInfo || 'Another machine/phone'}). Only 1 device is allowed at a time.`
      );
    }
  };

  if (db && uid) {
    try {
      const adminRef = doc(db, 'admins', uid);
      unsubFirestore = onSnapshot(
        adminRef,
        (snap) => {
          if (snap.exists()) {
            inspectDocData(snap.data());
          }
        },
        (err) => {
          console.warn('Admin session real-time listener error:', err);
        }
      );

      // Periodic verification in case mobile browser suspends real-time socket
      heartbeatTimer = setInterval(async () => {
        if (revoked) return;
        try {
          const snap = await getDoc(adminRef);
          if (snap.exists()) {
            inspectDocData(snap.data());
          }
        } catch {
          // ignore transient offline
        }
      }, 10000);
    } catch (err) {
      console.warn('Could not start Firestore session listener:', err);
    }
  }

  // Cross-tab broadcast listener on same machine
  let bc: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('lifecare_admin_session_channel');
      bc.onmessage = (event) => {
        if (
          event.data?.type === 'NEW_SESSION_STARTED' &&
          event.data?.uid === uid &&
          event.data?.sessionId !== localSessionId
        ) {
          triggerRevoke('Session ended: Another tab or device signed into this admin account.');
        }
      };
    }
  } catch {
    // ignore
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (bc) bc.close();
  };
}

/**
 * Fetch all registered administrators from Firestore
 */
export async function fetchAllAdmins(): Promise<AdminProfile[]> {
  const db = getFirebaseDb();
  const defaultList: AdminProfile[] = [
    {
      id: 'primary-admin',
      email: 'prayaspratikmohanty41@gmail.com',
      name: 'Primary Clinic Admin',
      role: 'Super Admin',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  if (!db) return defaultList;

  try {
    const adminsCol = collection(db, 'admins');
    const snap = await getDocs(adminsCol);
    if (snap.empty) {
      return defaultList;
    }
    const list: AdminProfile[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        email: data.email || '',
        name: data.name || 'Clinic Admin',
        role: data.role || 'Clinic Admin',
        active: data.active !== false,
        activeSessionId: data.activeSessionId,
        lastLoginAt: data.lastLoginAt,
        lastActiveAt: data.lastActiveAt,
        deviceInfo: data.deviceInfo,
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });

    if (!list.some((a) => a.email.toLowerCase() === 'prayaspratikmohanty41@gmail.com')) {
      list.unshift(defaultList[0]);
    }

    return list;
  } catch (err) {
    console.warn('Could not fetch admins from Firestore:', err);
    return defaultList;
  }
}

/**
 * Add or update an administrator in Firestore
 */
export async function saveAdminProfile(admin: Partial<AdminProfile>): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !admin.email) return false;

  const docId = admin.id || admin.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  const adminRef = doc(db, 'admins', docId);

  await setDoc(
    adminRef,
    {
      ...admin,
      email: admin.email.toLowerCase(),
      updatedAt: new Date().toISOString(),
      createdAt: admin.createdAt || new Date().toISOString(),
      active: admin.active !== false,
    },
    { merge: true }
  );

  return true;
}

/**
 * Deactivate or toggle an administrator's access
 */
export async function toggleAdminStatus(adminId: string, active: boolean): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const adminRef = doc(db, 'admins', adminId);
  await setDoc(adminRef, { active, updatedAt: new Date().toISOString() }, { merge: true });
  return true;
}

/**
 * Remove an administrator from Firestore
 */
export async function deleteAdminProfile(adminId: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const adminRef = doc(db, 'admins', adminId);
    await deleteDoc(adminRef);
    return true;
  } catch (err) {
    console.warn('Could not delete admin from Firestore:', err);
    return false;
  }
}

/**
 * Sync Products to Firestore
 * Updates Firestore collection 'products' (enforced by firestore.rules)
 */
export async function syncProductToFirestore(product: Product): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, {
      ...product,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err: any) {
    console.error('Firestore sync error for product:', err);
    throw err;
  }
}

/**
 * Batch upload / sync all products to Firestore collection 'products'
 */
export async function syncAllProductsToFirestore(
  products: Product[]
): Promise<{ count: number; error?: string }> {
  const db = getFirebaseDb();
  if (!db) return { count: 0, error: 'Firestore is not configured.' };

  try {
    let count = 0;
    for (const prod of products) {
      const productRef = doc(db, 'products', prod.id);
      await setDoc(productRef, {
        ...prod,
        updatedAt: new Date().toISOString(),
      });
      count++;
    }
    return { count };
  } catch (err: any) {
    console.error('Error batch syncing products to Firestore:', err);
    throw err;
  }
}

/**
 * Delete Product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return true;
  } catch (err: any) {
    console.error('Firestore delete error for product:', err);
    throw err;
  }
}

/**
 * Fetch all products from Firestore (Customer public read)
 */
export async function fetchProductsFromFirestore(): Promise<Product[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) return null;

    const list: Product[] = [];
    const feedDocIds = new Set([
      'clinic_notifications_feed',
      'clinic_arrivals_feed',
      'clinic_doctors_feed',
      'clinic_orders_feed',
      'clinic_ledger_feed',
      'clinic_offers_feed',
      'clinic_pinch_feed',
    ]);
    recordFirestoreRead(snapshot.size || 1);
    snapshot.forEach((d) => {
      // Exclude feed documents
      if (!feedDocIds.has(d.id)) {
        const data = d.data();
        if (data && data.name && data.category) {
          list.push(data as Product);
        }
      }
    });
    return list;
  } catch (err) {
    console.warn('Could not fetch products from Firestore, using local defaults:', err);
    return null;
  }
}

/**
 * =========================================================================
 * CLINIC BROADCAST NOTIFICATIONS (General Customer Notices & Announcements)
 * =========================================================================
 * Uses dual-channel sync:
 * 1. Primary Public Channel: 'products/clinic_notifications_feed' (Guaranteed 100% public read across all devices)
 * 2. Secondary Collection: 'clinic_notifications/{id}' (Collection-level backup)
 */

/**
 * Sync / Save Broadcast Notification to Firestore
 */
export async function syncNotificationToFirestore(
  notification: ClinicNotification,
  allNotifications?: ClinicNotification[]
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const currentList = allNotifications || [notification];

  // 1. Write to Primary Public Feed in 'products' collection (Instant sync to all customer phones)
  try {
    const feedRef = doc(db, 'products', 'clinic_notifications_feed');
    await setDoc(feedRef, {
      items: currentList,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Feed sync notice in products skipped:', err);
  }

  // 2. Also try writing to 'clinic_notifications' collection
  try {
    const notifRef = doc(db, 'clinic_notifications', notification.id);
    await setDoc(
      notifRef,
      {
        ...notification,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    // collection may require specific rules; primary feed handles customer sync
  }

  return true;
}

/**
 * Delete Broadcast Notification from Firestore
 */
export async function deleteNotificationFromFirestore(
  notificationId: string,
  remainingNotifications?: ClinicNotification[]
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  // 1. Update Primary Public Feed
  if (remainingNotifications) {
    try {
      const feedRef = doc(db, 'products', 'clinic_notifications_feed');
      await setDoc(feedRef, {
        items: remainingNotifications,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not update feed on delete:', err);
    }
  }

  // 2. Also try deleting from 'clinic_notifications'
  try {
    const notifRef = doc(db, 'clinic_notifications', notificationId);
    await deleteDoc(notifRef);
  } catch {
    // ignore
  }

  return true;
}

/**
 * Fetch all active Broadcast Notifications from Firestore
 */
export async function fetchNotificationsFromFirestore(): Promise<ClinicNotification[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  // 1. Try Primary Public Feed (100% accessible to unauthenticated customer phones)
  try {
    const feedRef = doc(db, 'products', 'clinic_notifications_feed');
    const feedSnap = await getDoc(feedRef);
    if (feedSnap.exists()) {
      const data = feedSnap.data();
      if (Array.isArray(data?.items)) {
        return data.items as ClinicNotification[];
      }
    }
  } catch (feedErr) {
    console.warn('Could not fetch from primary notifications feed:', feedErr);
  }

  // 2. Fallback to 'clinic_notifications' collection
  try {
    const colRef = collection(db, 'clinic_notifications');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const list: ClinicNotification[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ClinicNotification);
      });
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    // collection read error
  }

  return null;
}

/**
 * Real-time listener for Broadcast Notifications
 * Ensures customer devices instantly receive notifications sent by Admin in real-time
 */
export function subscribeToClinicNotifications(
  callback: (notifications: ClinicNotification[]) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  let unsubCol: (() => void) | null = null;

  // 1. Real-time onSnapshot on Primary Public Feed
  try {
    const feedRef = doc(db, 'products', 'clinic_notifications_feed');
    const unsubFeed = onSnapshot(
      feedRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.items)) {
            callback(data.items as ClinicNotification[]);
          }
        }
      },
      (err) => {
        console.warn('Real-time feed listener notice:', err);
      }
    );

    // 2. Also listen to collection if available
    try {
      const colRef = collection(db, 'clinic_notifications');
      unsubCol = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ClinicNotification[] = [];
            snapshot.forEach((d) => list.push(d.data() as ClinicNotification));
            const sorted = list.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            callback(sorted);
          }
        },
        () => {}
      );
    } catch {
      // ignore collection permission error
    }

    return () => {
      unsubFeed();
      if (unsubCol) unsubCol();
    };
  } catch (err) {
    console.warn('Could not establish real-time notification listener:', err);
    return () => {};
  }
}

/**
 * =========================================================================
 * UNANNOUNCED DOCTOR ARRIVALS (Syncs doctor visits across devices)
 * =========================================================================
 */

/**
 * Sync Doctor Arrival Alert to Firestore
 */
export async function syncArrivalToFirestore(
  arrival: DoctorArrival,
  allArrivals?: DoctorArrival[]
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const currentList = allArrivals || [arrival];

  // 1. Write to Primary Public Feed
  try {
    const feedRef = doc(db, 'products', 'clinic_arrivals_feed');
    await setDoc(feedRef, {
      items: currentList,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Feed sync arrival in products skipped:', err);
  }

  // 2. Also try writing to 'unannounced_arrivals' collection
  try {
    const arrivalRef = doc(db, 'unannounced_arrivals', arrival.id);
    await setDoc(
      arrivalRef,
      {
        ...arrival,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    // ignore
  }

  return true;
}

/**
 * Delete Doctor Arrival Alert from Firestore
 */
export async function deleteArrivalFromFirestore(
  arrivalId: string,
  remainingArrivals?: DoctorArrival[]
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  // 1. Update Primary Public Feed
  if (remainingArrivals) {
    try {
      const feedRef = doc(db, 'products', 'clinic_arrivals_feed');
      await setDoc(feedRef, {
        items: remainingArrivals,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not update arrival feed on delete:', err);
    }
  }

  // 2. Also try deleting from 'unannounced_arrivals'
  try {
    const arrivalRef = doc(db, 'unannounced_arrivals', arrivalId);
    await deleteDoc(arrivalRef);
  } catch {
    // ignore
  }

  return true;
}

/**
 * Fetch all Doctor Arrivals from Firestore
 */
export async function fetchArrivalsFromFirestore(): Promise<DoctorArrival[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  // 1. Try Primary Public Feed
  try {
    const feedRef = doc(db, 'products', 'clinic_arrivals_feed');
    const feedSnap = await getDoc(feedRef);
    if (feedSnap.exists()) {
      const data = feedSnap.data();
      if (Array.isArray(data?.items)) {
        return data.items as DoctorArrival[];
      }
    }
  } catch (err) {
    console.warn('Could not fetch from primary arrivals feed:', err);
  }

  // 2. Fallback to 'unannounced_arrivals' collection
  try {
    const colRef = collection(db, 'unannounced_arrivals');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const list: DoctorArrival[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as DoctorArrival);
      });
      return list;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Real-time listener for Unannounced Doctor Arrivals
 * Ensures customer phones instantly see doctor alerts posted by Admin
 */
export function subscribeToArrivals(
  callback: (arrivals: DoctorArrival[]) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  let unsubCol: (() => void) | null = null;

  // 1. Real-time onSnapshot on Primary Public Feed
  try {
    const feedRef = doc(db, 'products', 'clinic_arrivals_feed');
    const unsubFeed = onSnapshot(
      feedRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.items)) {
            callback(data.items as DoctorArrival[]);
          }
        }
      },
      (err) => {
        console.warn('Real-time arrival feed listener notice:', err);
      }
    );

    // 2. Also listen to collection if available
    try {
      const colRef = collection(db, 'unannounced_arrivals');
      unsubCol = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: DoctorArrival[] = [];
            snapshot.forEach((d) => list.push(d.data() as DoctorArrival));
            callback(list);
          }
        },
        () => {}
      );
    } catch {
      // ignore
    }

    return () => {
      unsubFeed();
      if (unsubCol) unsubCol();
    };
  } catch (err) {
    console.warn('Could not establish real-time arrival listener:', err);
    return () => {};
  }
}

/**
 * =========================================================================
 * DOCTORS SYNC (Allows Admin photo/profile edits to reflect on all phones)
 * =========================================================================
 */
export async function syncDoctorsToFirestore(doctors: Doctor[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    const feedRef = doc(db, 'products', 'clinic_doctors_feed');
    await setDoc(feedRef, {
      items: doctors,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Could not sync doctors to Firestore:', err);
    return false;
  }
}

export async function fetchDoctorsFromFirestore(): Promise<Doctor[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const feedRef = doc(db, 'products', 'clinic_doctors_feed');
    const snap = await getDoc(feedRef);
    if (snap.exists() && Array.isArray(snap.data()?.items)) {
      return snap.data().items as Doctor[];
    }
  } catch (err) {
    console.warn('Could not fetch doctors from Firestore:', err);
  }
  return null;
}

export function subscribeToDoctors(callback: (doctors: Doctor[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};
  try {
    const feedRef = doc(db, 'products', 'clinic_doctors_feed');
    return onSnapshot(
      feedRef,
      (snap) => {
        if (snap.exists() && Array.isArray(snap.data()?.items)) {
          callback(snap.data().items as Doctor[]);
        }
      },
      () => {}
    );
  } catch {
    return () => {};
  }
}

/**
 * =========================================================================
 * CUSTOMER ORDERS & DAILY CASH LEDGER SYNC
 * =========================================================================
 */
export async function syncCustomerOrderToFirestore(order: StoreOrder): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Could not sync customer order to Firestore:', err);
    return false;
  }
}

export async function syncAdminOrdersToFirestore(orders: StoreOrder[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    const feedRef = doc(db, 'products', 'clinic_orders_feed');
    await setDoc(feedRef, {
      items: orders.slice(0, 150),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Could not sync admin orders feed:', err);
    return false;
  }
}

export async function fetchAdminOrdersFromFirestore(): Promise<StoreOrder[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const map = new Map<string, StoreOrder>();

    const feedSnap = await getDoc(doc(db, 'products', 'clinic_orders_feed'));
    if (feedSnap.exists() && Array.isArray(feedSnap.data()?.items)) {
      for (const item of feedSnap.data().items as StoreOrder[]) {
        map.set(item.id, item);
      }
    }

    try {
      const colSnap = await getDocs(collection(db, 'orders'));
      colSnap.forEach((d) => {
        const data = d.data() as StoreOrder;
        if (data?.id && !map.has(data.id)) {
          map.set(data.id, data);
        }
      });
    } catch {
      // ignore if rules block
    }

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return combined;
  } catch (err) {
    console.warn('Could not fetch orders from Firestore:', err);
    return null;
  }
}

export async function syncTransactionsToFirestore(transactions: CashTransaction[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    const feedRef = doc(db, 'products', 'clinic_ledger_feed');
    await setDoc(feedRef, {
      items: transactions.slice(0, 250),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Could not sync cash transactions:', err);
    return false;
  }
}

export async function fetchTransactionsFromFirestore(): Promise<CashTransaction[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'products', 'clinic_ledger_feed'));
    recordFirestoreRead(1);
    if (snap.exists() && Array.isArray(snap.data()?.items)) {
      return snap.data().items as CashTransaction[];
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * =========================================================================
 * SPECIAL OFFERS SYNC (Ensures Admin offers reflect live on Customer phones)
 * =========================================================================
 */
export async function syncOffersToFirestore(offers: SpecialOffer[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const feedRef = doc(db, 'products', 'clinic_offers_feed');
    await setDoc(feedRef, {
      items: offers,
      updatedAt: new Date().toISOString(),
    });
    recordFirestoreWrite(1);
    return true;
  } catch (err) {
    console.warn('Could not sync offers feed to Firestore:', err);
    return false;
  }
}

export async function fetchOffersFromFirestore(): Promise<SpecialOffer[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const feedSnap = await getDoc(doc(db, 'products', 'clinic_offers_feed'));
    recordFirestoreRead(1);
    if (feedSnap.exists() && Array.isArray(feedSnap.data()?.items)) {
      return feedSnap.data().items as SpecialOffer[];
    }
  } catch (err) {
    console.warn('Could not fetch offers feed from Firestore:', err);
  }

  try {
    const colSnap = await getDocs(collection(db, 'special_offers'));
    recordFirestoreRead(colSnap.size || 1);
    if (!colSnap.empty) {
      const list: SpecialOffer[] = [];
      colSnap.forEach((d) => list.push(d.data() as SpecialOffer));
      return list;
    }
  } catch {
    // ignore
  }

  return null;
}

export function subscribeToOffers(callback: (offers: SpecialOffer[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const feedRef = doc(db, 'products', 'clinic_offers_feed');
    return onSnapshot(
      feedRef,
      (snap) => {
        recordFirestoreRead(1);
        if (snap.exists() && Array.isArray(snap.data()?.items)) {
          callback(snap.data().items as SpecialOffer[]);
        }
      },
      () => {}
    );
  } catch {
    return () => {};
  }
}

/**
 * =========================================================================
 * PINCH ASSISTANT UPDATES SYNC (Admin-published clinic updates)
 * =========================================================================
 */
export async function syncPinchUpdatesToFirestore(updates: PinchUpdate[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const feedRef = doc(db, 'products', 'clinic_pinch_feed');
    await setDoc(feedRef, {
      items: updates,
      updatedAt: new Date().toISOString(),
    });
    recordFirestoreWrite(1);
    return true;
  } catch (err) {
    console.warn('Could not sync PINCH updates to Firestore:', err);
    return false;
  }
}

export async function deletePinchUpdateFromFirestore(
  updateId: string,
  remainingUpdates: PinchUpdate[]
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const feedRef = doc(db, 'products', 'clinic_pinch_feed');
    await setDoc(feedRef, {
      items: remainingUpdates,
      updatedAt: new Date().toISOString(),
    });
    recordFirestoreWrite(1);
  } catch (err) {
    console.warn('Could not update PINCH feed on delete:', err);
  }

  try {
    await deleteDoc(doc(db, 'pinch_updates', updateId));
  } catch {
    // ignore
  }
  return true;
}

export async function fetchPinchUpdatesFromFirestore(): Promise<PinchUpdate[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const snap = await getDoc(doc(db, 'products', 'clinic_pinch_feed'));
    recordFirestoreRead(1);
    if (snap.exists() && Array.isArray(snap.data()?.items)) {
      return snap.data().items as PinchUpdate[];
    }
  } catch (err) {
    console.warn('Could not fetch PINCH updates:', err);
  }

  return null;
}

export function subscribeToPinchUpdates(callback: (updates: PinchUpdate[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const feedRef = doc(db, 'products', 'clinic_pinch_feed');
    return onSnapshot(
      feedRef,
      (snap) => {
        recordFirestoreRead(1);
        if (snap.exists() && Array.isArray(snap.data()?.items)) {
          callback(snap.data().items as PinchUpdate[]);
        }
      },
      () => {}
    );
  } catch {
    return () => {};
  }
}


