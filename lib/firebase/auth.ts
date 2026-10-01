import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { auth, db, isConfigured } from './config';

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'staff';
  subject?: string;
  isDemo?: boolean;
}

// Key for storing session in localStorage
const DEMO_AUTH_KEY = 'eboard_demo_auth_session';
// The main admin email — only this email gets role 'admin'
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

/**
 * Determine if an account belongs to a staff member and return their record.
 */
async function getStaffRole(
  email: string,
  uid?: string,
  roleHint?: 'staff' | 'admin'
): Promise<{ role: 'admin' | 'staff'; displayName?: string; subject?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // If it explicitly matches configured admin email, always admin
  if (ADMIN_EMAIL && cleanEmail === ADMIN_EMAIL.trim().toLowerCase()) {
    return { role: 'admin' };
  }

  // 1. Check local staff accounts cache (instant, reliable across offline/online)
  if (typeof window !== 'undefined') {
    try {
      const localStaffRaw = localStorage.getItem('eboard_staff_accounts');
      if (localStaffRaw) {
        const localList = JSON.parse(localStaffRaw);
        if (Array.isArray(localList)) {
          const match = localList.find(
            (s: any) =>
              (s.email && s.email.trim().toLowerCase() === cleanEmail) ||
              (uid && (s.uid === uid || s.id === uid))
          );
          if (match) {
            if (match.active === false) {
              throw new Error('Your account has been suspended. Please contact school administration.');
            }
            return {
              role: 'staff',
              displayName: match.name,
              subject: match.subject,
            };
          }
        }
      }
    } catch (e: any) {
      if (e.message?.includes('suspended')) throw e;
    }
  }

  // 2. Check Firestore
  if (isConfigured && db) {
    // 2a. Check by UID first (most reliable with Firebase security rules)
    if (uid) {
      try {
        const staffDocRef = doc(db, 'staff', uid);
        const staffDoc = await getDoc(staffDocRef);
        if (staffDoc.exists()) {
          const data = staffDoc.data();
          if (data.active === false) {
            throw new Error('Your account has been suspended. Please contact school administration.');
          }
          return {
            role: 'staff',
            displayName: data.name,
            subject: data.subject,
          };
        }
      } catch (err: any) {
        if (err.message?.includes('suspended')) throw err;
        console.warn('Error checking staff doc by uid:', err);
      }
    }

    // 2b. Query by email
    try {
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, where('email', '==', cleanEmail), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        if (data.active === false) {
          throw new Error('Your account has been suspended. Please contact school administration.');
        }
        return {
          role: 'staff',
          displayName: data.name,
          subject: data.subject,
        };
      }
    } catch (err: any) {
      if (err.message?.includes('suspended')) throw err;
      console.warn('Error checking staff collection by email:', err);
    }
  }

  // 3. If logging in via staff portal login, respect the staff intent unless master admin
  if (roleHint === 'staff') {
    return {
      role: 'staff',
      displayName: cleanEmail.split('@')[0],
    };
  }

  // Fallback to admin if not in staff records
  return { role: 'admin' };
}

export async function loginWithEmail(
  email: string,
  pass: string,
  roleHint?: 'staff' | 'admin'
): Promise<AdminUser> {
  // If Firebase is configured with real credentials, use Firebase Auth
  if (isConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const roleData = await getStaffRole(cred.user.email || email, cred.user.uid, roleHint);
      const user: AdminUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: roleData.displayName || cred.user.displayName || (roleData.role === 'staff' ? 'Staff Member' : 'Admin'),
        role: roleData.role,
        subject: roleData.subject,
        isDemo: false,
      };
      // Cache in localStorage so subscribeToAuth can read it
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(user));
      }
      return user;
    } catch (error: any) {
      console.warn('Firebase Auth attempt failed, checking fallback:', error);
      if (
        error.code === 'auth/invalid-api-key' ||
        error.code === 'auth/network-request-failed' ||
        error.code === 'auth/api-key-not-valid'
      ) {
        return handleDemoLogin(email, pass, roleHint);
      }

      if (error.message?.includes('suspended')) {
        throw new Error(error.message);
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Incorrect email or password. Please verify your credentials.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Account not found. Please contact school administration.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
      }
      throw new Error(error.message || 'Failed to authenticate. Please check your credentials.');
    }
  }

  // Fallback demo authentication
  return handleDemoLogin(email, pass, roleHint);
}

function handleDemoLogin(email: string, pass: string, roleHint?: 'staff' | 'admin'): AdminUser {
  const cleanEmail = email.trim().toLowerCase();
  const isStaffIntent = roleHint === 'staff' || cleanEmail.includes('staff');

  if (isStaffIntent && pass.length >= 6) {
    const demoStaff: AdminUser = {
      uid: 'demo-staff-001',
      email: cleanEmail,
      displayName: 'Teacher Staff',
      role: 'staff',
      subject: 'General',
      isDemo: true,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(demoStaff));
    }
    return demoStaff;
  }

  if (
    (cleanEmail === 'teacher@eboard.edu' ||
      cleanEmail === 'admin@eboard.edu' ||
      cleanEmail.includes('teacher') ||
      cleanEmail.includes('admin')) &&
    pass.length >= 6
  ) {
    const demoUser: AdminUser = {
      uid: 'demo-teacher-001',
      email: cleanEmail,
      displayName: 'Teacher Admin',
      role: 'admin',
      isDemo: true,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(demoUser));
    }
    return demoUser;
  }

  throw new Error('Invalid credentials. Please enter a valid account email and password.');
}

export async function logoutUser(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEMO_AUTH_KEY);
  }
  if (isConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
  }
}

export function subscribeToAuth(callback: (user: AdminUser | null) => void): () => void {
  // Check local session first (works for both real and demo)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(DEMO_AUTH_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AdminUser;
        // Ensure role field is present for old sessions
        if (!parsed.role) parsed.role = 'admin';
        callback(parsed);
        return () => {};
      } catch (e) {
        localStorage.removeItem(DEMO_AUTH_KEY);
      }
    }
  }

  if (isConfigured && auth) {
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Try to restore from localStorage cache first (fast)
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(DEMO_AUTH_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved) as AdminUser;
              if (parsed.uid === firebaseUser.uid) {
                if (!parsed.role) parsed.role = 'admin';
                callback(parsed);
                return;
              }
            } catch {}
          }
        }

        // Otherwise fetch role from Firestore
        try {
          const roleData = await getStaffRole(firebaseUser.email || '');
          const user: AdminUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: roleData.displayName || firebaseUser.displayName || 'Teacher',
            role: roleData.role,
            subject: roleData.subject,
            isDemo: false,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(user));
          }
          callback(user);
        } catch {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Teacher',
            role: 'admin',
            isDemo: false,
          });
        }
      } else {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(DEMO_AUTH_KEY);
          if (saved) {
            try {
              callback(JSON.parse(saved));
              return;
            } catch {}
          }
        }
        callback(null);
      }
    });
  }

  callback(null);
  return () => {};
}
