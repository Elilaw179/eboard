import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isConfigured } from './config';

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo?: boolean;
}

// Key for storing fallback demo session
const DEMO_AUTH_KEY = 'eboard_demo_auth_session';

export async function loginWithEmail(email: string, pass: string): Promise<AdminUser> {
  // If Firebase is configured with real credentials, use Firebase Auth
  if (isConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || 'Teacher',
        isDemo: false,
      };
    } catch (error: any) {
      console.warn('Firebase Auth attempt failed, checking fallback:', error);
      // If error is invalid-api-key or unauthorized, allow fallback demo login
      if (
        error.code === 'auth/invalid-api-key' ||
        error.code === 'auth/network-request-failed' ||
        error.code === 'auth/api-key-not-valid'
      ) {
        return handleDemoLogin(email, pass);
      }

      // Format clean student/teacher friendly error messages
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Incorrect email or password. Please verify your administrator credentials.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Administrator account not found. Please contact school administration.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
      }
      throw new Error(error.message || 'Failed to authenticate. Please check your credentials.');
    }
  }

  // Fallback demo authentication
  return handleDemoLogin(email, pass);
}

function handleDemoLogin(email: string, pass: string): AdminUser {
  // Allow login for testing if in development/demo mode
  const cleanEmail = email.trim().toLowerCase();
  if (
    (cleanEmail === 'teacher@eboard.edu' || cleanEmail === 'admin@eboard.edu' || cleanEmail.includes('teacher') || cleanEmail.includes('admin')) &&
    pass.length >= 6
  ) {
    const demoUser: AdminUser = {
      uid: 'demo-teacher-001',
      email: cleanEmail,
      displayName: 'Teacher Admin',
      isDemo: true,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(demoUser));
    }
    return demoUser;
  }

  throw new Error('Invalid credentials. For quick preview, use teacher@eboard.edu with password: admin123');
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
  // Check local demo session first
  if (typeof window !== 'undefined') {
    const demoSaved = localStorage.getItem(DEMO_AUTH_KEY);
    if (demoSaved) {
      try {
        const parsed = JSON.parse(demoSaved);
        callback(parsed);
        return () => {};
      } catch (e) {
        localStorage.removeItem(DEMO_AUTH_KEY);
      }
    }
  }

  if (isConfigured && auth) {
    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Teacher',
          isDemo: false,
        });
      } else {
        // Fallback check in case window was updated
        if (typeof window !== 'undefined') {
          const demoSaved = localStorage.getItem(DEMO_AUTH_KEY);
          if (demoSaved) {
            callback(JSON.parse(demoSaved));
            return;
          }
        }
        callback(null);
      }
    });
  }

  callback(null);
  return () => {};
}
