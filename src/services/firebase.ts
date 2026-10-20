import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
import { Product } from '../types';

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

/**
 * Admin Logout & Session Cleanup
 */
export async function adminSignOut(): Promise<void> {
  const auth = getFirebaseAuth();
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
 * Enforces one active machine per admin account at any time.
 */
export async function registerAdminSession(
  user: User,
  adminName?: string
): Promise<string> {
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
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
          lastLoginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 120) : 'Web App',
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
 * Real-time listener for the admin's session.
 * If another machine or browser signs into this admin account, Firestore will update
 * activeSessionId to a different value, triggering onSessionRevoked immediately.
 */
export function listenToAdminSession(
  uid: string,
  localSessionId: string,
  onSessionRevoked: (reason: string) => void
): () => void {
  const db = getFirebaseDb();
  let unsubFirestore: (() => void) | null = null;

  if (db && uid) {
    try {
      const adminRef = doc(db, 'admins', uid);
      unsubFirestore = onSnapshot(
        adminRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data && data.active === false) {
              onSessionRevoked('Your administrator account access has been deactivated.');
              return;
            }
            if (data?.activeSessionId && localSessionId && data.activeSessionId !== localSessionId) {
              onSessionRevoked(
                'Session Terminated: This admin account was signed in from another machine or browser. Only one active machine is allowed at a time for security.'
              );
            }
          }
        },
        (err) => {
          console.warn('Admin session real-time listener error:', err);
        }
      );
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
          onSessionRevoked('Signed out: Another session was opened for this admin account.');
        }
      };
    }
  } catch {
    // ignore
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
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
    snapshot.forEach((d) => {
      list.push(d.data() as Product);
    });
    return list;
  } catch (err) {
    console.warn('Could not fetch products from Firestore, using local defaults:', err);
    return null;
  }
}
