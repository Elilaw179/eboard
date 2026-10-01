import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/config';
import { ClassPassword, SetClassPasswordInput } from '@/types/classPassword';
import { CLASSES } from '@/types/class';

const PASSWORDS_COLLECTION = 'class_passwords';
const LOCAL_STORAGE_KEY = 'eboard_class_passwords';
const SESSION_UNLOCKED_PREFIX = 'unlocked_class_';

function getLocalPasswords(): Record<string, ClassPassword> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalPasswords(map: Record<string, ClassPassword>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save local class passwords cache', e);
  }
}

/**
 * Fetch all class password configurations
 */
export async function getAllClassPasswords(): Promise<Record<string, ClassPassword>> {
  const localMap = getLocalPasswords();

  if (isConfigured && db) {
    try {
      const colRef = collection(db, PASSWORDS_COLLECTION);
      const snapshot = await getDocs(colRef);
      const firestoreMap: Record<string, ClassPassword> = {};

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreMap[docSnap.id] = {
          classSlug: docSnap.id,
          className: data.className || docSnap.id,
          password: data.password || '',
          enabled: data.enabled !== false,
          updatedAt: data.updatedAt?.seconds
            ? new Date(data.updatedAt.seconds * 1000).toISOString()
            : data.updatedAt || new Date().toISOString(),
          updatedBy: data.updatedBy || '',
        };
      });

      // Merge and update local cache
      const merged = { ...localMap, ...firestoreMap };
      saveLocalPasswords(merged);
      return merged;
    } catch (err) {
      console.warn('Failed to load class passwords from Firestore, using local cache:', err);
    }
  }

  return localMap;
}

/**
 * Get password configuration for a specific class
 */
export async function getClassPassword(classSlug: string): Promise<ClassPassword | null> {
  const localMap = getLocalPasswords();

  if (isConfigured && db) {
    try {
      const docRef = doc(db, PASSWORDS_COLLECTION, classSlug);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const config: ClassPassword = {
          classSlug,
          className: data.className || classSlug,
          password: data.password || '',
          enabled: data.enabled !== false,
          updatedAt: data.updatedAt?.seconds
            ? new Date(data.updatedAt.seconds * 1000).toISOString()
            : data.updatedAt,
          updatedBy: data.updatedBy || '',
        };
        localMap[classSlug] = config;
        saveLocalPasswords(localMap);
        return config;
      } else {
        // Document does not exist in Firestore -> remove from local cache if present
        if (localMap[classSlug]) {
          delete localMap[classSlug];
          saveLocalPasswords(localMap);
        }
        return null;
      }
    } catch (err) {
      console.warn(`Failed to fetch password for ${classSlug} from Firestore:`, err);
    }
  }

  return localMap[classSlug] || null;
}

/**
 * Set or update a class password
 */
export async function setClassPassword(
  input: SetClassPasswordInput,
  userEmail: string = 'admin'
): Promise<ClassPassword> {
  const cleanPassword = input.password.trim();
  const config: ClassPassword = {
    classSlug: input.classSlug,
    className: input.className,
    password: cleanPassword,
    enabled: input.enabled !== false,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, PASSWORDS_COLLECTION, input.classSlug);
      await setDoc(docRef, {
        classSlug: input.classSlug,
        className: input.className,
        password: cleanPassword,
        enabled: input.enabled !== false,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });
    } catch (err) {
      console.warn('Failed to save class password to Firestore:', err);
    }
  }

  const localMap = getLocalPasswords();
  localMap[input.classSlug] = config;
  saveLocalPasswords(localMap);

  return config;
}

/**
 * Set password for ALL classes simultaneously
 */
export async function setAllClassPasswords(
  password: string,
  userEmail: string = 'admin'
): Promise<ClassPassword[]> {
  const cleanPassword = password.trim();
  const results: ClassPassword[] = [];
  const localMap = getLocalPasswords();

  for (const c of CLASSES) {
    const config: ClassPassword = {
      classSlug: c.slug,
      className: c.name,
      password: cleanPassword,
      enabled: true,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    };

    if (isConfigured && db) {
      try {
        const docRef = doc(db, PASSWORDS_COLLECTION, c.slug);
        await setDoc(docRef, {
          classSlug: c.slug,
          className: c.name,
          password: cleanPassword,
          enabled: true,
          updatedAt: serverTimestamp(),
          updatedBy: userEmail,
        });
      } catch (err) {
        console.warn(`Failed to set password for ${c.slug}:`, err);
      }
    }

    localMap[c.slug] = config;
    results.push(config);
  }

  saveLocalPasswords(localMap);
  return results;
}

/**
 * Delete / Remove password for a specific class (makes it public)
 */
export async function deleteClassPassword(classSlug: string): Promise<void> {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, PASSWORDS_COLLECTION, classSlug);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Failed to delete class password from Firestore:', err);
    }
  }

  const localMap = getLocalPasswords();
  delete localMap[classSlug];
  saveLocalPasswords(localMap);
}

/**
 * Remove passwords for ALL classes
 */
export async function deleteAllClassPasswords(): Promise<void> {
  for (const c of CLASSES) {
    if (isConfigured && db) {
      try {
        const docRef = doc(db, PASSWORDS_COLLECTION, c.slug);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn(`Failed to delete password for ${c.slug}:`, err);
      }
    }
  }

  saveLocalPasswords({});
}

/**
 * Verify a student's entered password for a given class
 */
export async function verifyClassPassword(
  classSlug: string,
  candidate: string
): Promise<{ success: boolean; message?: string }> {
  const config = await getClassPassword(classSlug);

  // If no password is configured or password protection is disabled, it is open
  if (!config || !config.enabled || !config.password) {
    return { success: true };
  }

  const match = config.password.trim() === candidate.trim();
  if (match) {
    unlockClassInSession(classSlug);
    return { success: true };
  }

  return {
    success: false,
    message: 'Incorrect password for this class. Please contact your subject teacher or class administrator.',
  };
}

/**
 * Session verification helpers
 */
export function isClassUnlocked(classSlug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SESSION_UNLOCKED_PREFIX + classSlug) === 'true';
  } catch {
    return false;
  }
}

export function unlockClassInSession(classSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_UNLOCKED_PREFIX + classSlug, 'true');
  } catch {}
}

export function lockClassInSession(classSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_UNLOCKED_PREFIX + classSlug);
  } catch {}
}
