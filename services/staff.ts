import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { db, firebaseConfig, isConfigured } from '@/lib/firebase/config';
import { StaffMember, CreateStaffInput } from '@/types/staff';

const STAFF_COLLECTION = 'staff';
const DEMO_STAFF_KEY = 'eboard_staff_accounts';

function getLocalStaff(): StaffMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEMO_STAFF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStaff(staffList: StaffMember[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_STAFF_KEY, JSON.stringify(staffList));
  } catch (e) {
    console.error('Failed to save local staff cache', e);
  }
}

/**
 * Fetch all staff accounts
 */
export async function getAllStaff(): Promise<StaffMember[]> {
  try {
    if (isConfigured && db) {
      const staffRef = collection(db, STAFF_COLLECTION);
      const snapshot = await getDocs(staffRef);
      const staffList: StaffMember[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          name: data.name || 'Staff Member',
          email: data.email || '',
          subject: data.subject || 'General',
          role: 'staff',
          active: data.active !== false,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
        } as StaffMember;
      });

      // Sort newest first
      staffList.sort((a, b) => {
        const timeA = (a.createdAt as any)?.seconds
          ? (a.createdAt as any).seconds * 1000
          : new Date(a.createdAt || 0).getTime();
        const timeB = (b.createdAt as any)?.seconds
          ? (b.createdAt as any).seconds * 1000
          : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      // Update local cache
      saveLocalStaff(staffList);
      return staffList;
    }
  } catch (error) {
    console.warn('Failed to fetch staff from Firestore, falling back to local storage:', error);
  }

  return getLocalStaff();
}

/**
 * Create a new staff account (Gmail & Password)
 * Uses a secondary in-memory Firebase App instance to avoid signing out the current admin!
 */
export async function createStaffAccount(
  input: CreateStaffInput,
  creatorEmail: string = 'admin@eboard.edu'
): Promise<{ staff: StaffMember; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanName = input.name.trim();
  const cleanSubject = input.subject?.trim() || 'General';
  let uid = `staff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (isConfigured) {
    const secondaryAppName = `StaffProvision_${Date.now()}`;
    let secondaryApp = null;
    try {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        cleanEmail,
        input.password
      );
      uid = userCred.user.uid;

      if (cleanName) {
        await updateProfile(userCred.user, { displayName: cleanName });
      }

      await signOut(secondaryAuth);
    } catch (authErr: any) {
      console.warn('Firebase Auth user creation warning:', authErr);
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email/Gmail address already exists.');
      } else if (authErr.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      } else if (authErr.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      // If network fails or quota issues, we continue to save to Firestore & local cache
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch {}
      }
    }
  }

  const newStaff: StaffMember = {
    id: uid,
    uid: uid,
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    role: 'staff',
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: creatorEmail,
  };

  // Save to Firestore
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, STAFF_COLLECTION, uid), {
        uid,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        role: 'staff',
        active: true,
        createdAt: serverTimestamp(),
        createdBy: creatorEmail,
      });
    } catch (dbErr) {
      console.warn('Firestore staff save warning:', dbErr);
    }
  }

  // Also update local cache
  const local = getLocalStaff().filter((s) => s.email !== cleanEmail);
  local.unshift(newStaff);
  saveLocalStaff(local);

  return { staff: newStaff };
}

/**
 * Delete a staff account
 */
export async function deleteStaffAccount(staffId: string): Promise<void> {
  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, STAFF_COLLECTION, staffId));
    } catch (err) {
      console.warn('Failed to delete staff document from Firestore:', err);
    }
  }

  // Update local cache
  const local = getLocalStaff().filter((s) => s.id !== staffId && s.uid !== staffId);
  saveLocalStaff(local);
}

/**
 * Toggle staff active status (Enable / Suspend)
 */
export async function toggleStaffStatus(
  staffId: string,
  currentStatus: boolean
): Promise<boolean> {
  const newStatus = !currentStatus;

  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, STAFF_COLLECTION, staffId), {
        active: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Failed to update staff status in Firestore:', err);
    }
  }

  const local = getLocalStaff().map((s) =>
    s.id === staffId || s.uid === staffId ? { ...s, active: newStatus } : s
  );
  saveLocalStaff(local);

  return newStatus;
}
