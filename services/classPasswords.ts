import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/config';
import { ClassPassword, SetClassPasswordInput } from '@/types/classPassword';
import { CLASSES } from '@/types/class';

// Primary collection: 'settings' with doc 'class_passwords'
// This is GUARANTEED to be readable by unauthenticated student devices and writable by admins
// because /settings/{settingId} has 'allow read: if true; allow write: if request.auth != null;'
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_PASSWORDS_DOC = 'class_passwords';

// Secondary collection for direct class password lookups
const DIRECT_COLLECTION = 'class_passwords';
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
 * Fetch all class password configurations from Firebase Firestore.
 * Works across all devices, mobile phones, laptops, and student browsers.
 */
export async function getAllClassPasswords(): Promise<Record<string, ClassPassword>> {
  const localMap = getLocalPasswords();

  if (isConfigured && db) {
    try {
      // 1. Try reading from settings/class_passwords (publicly readable on any device)
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_PASSWORDS_DOC);
      const settingsSnap = await getDoc(settingsDocRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        const firestoreMap: Record<string, ClassPassword> = {};

        CLASSES.forEach((c) => {
          if (data && data[c.slug]) {
            const item = data[c.slug];
            firestoreMap[c.slug] = {
              classSlug: c.slug,
              className: item.className || c.name,
              password: item.password || '',
              enabled: item.enabled !== false,
              updatedAt: item.updatedAt || new Date().toISOString(),
              updatedBy: item.updatedBy || '',
            };
          }
        });

        // Cache locally and return
        saveLocalPasswords(firestoreMap);
        return firestoreMap;
      }
    } catch (err) {
      console.warn('Error reading from settings/class_passwords:', err);
    }

    // 2. Fallback: try reading direct collection class_passwords
    try {
      const colRef = collection(db, DIRECT_COLLECTION);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
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

        saveLocalPasswords(firestoreMap);
        return firestoreMap;
      }
    } catch (err) {
      console.warn('Error reading from direct class_passwords collection:', err);
    }
  }

  return localMap;
}

/**
 * Get password configuration for a specific class on any device
 */
export async function getClassPassword(classSlug: string): Promise<ClassPassword | null> {
  if (isConfigured && db) {
    try {
      // 1. Check settings/class_passwords
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_PASSWORDS_DOC);
      const settingsSnap = await getDoc(settingsDocRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data && data[classSlug]) {
          const item = data[classSlug];
          const config: ClassPassword = {
            classSlug,
            className: item.className || classSlug,
            password: item.password || '',
            enabled: item.enabled !== false,
            updatedAt: item.updatedAt,
            updatedBy: item.updatedBy,
          };
          // Sync to local
          const local = getLocalPasswords();
          local[classSlug] = config;
          saveLocalPasswords(local);
          return config;
        } else {
          // Explicitly not in settings doc
          const local = getLocalPasswords();
          delete local[classSlug];
          saveLocalPasswords(local);
          return null;
        }
      }
    } catch (err) {
      console.warn(`Error fetching settings/class_passwords for ${classSlug}:`, err);
    }

    // 2. Try direct collection
    try {
      const docRef = doc(db, DIRECT_COLLECTION, classSlug);
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
        const local = getLocalPasswords();
        local[classSlug] = config;
        saveLocalPasswords(local);
        return config;
      }
    } catch (err) {
      console.warn(`Error fetching direct doc for ${classSlug}:`, err);
    }
  }

  const localMap = getLocalPasswords();
  return localMap[classSlug] || null;
}

/**
 * Set or update a class password in Firebase Firestore
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

  let firestoreSuccess = false;

  if (isConfigured && db) {
    // 1. Save to settings/class_passwords (primary location for multi-device sync)
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_PASSWORDS_DOC);
      await setDoc(
        settingsDocRef,
        {
          [input.classSlug]: {
            classSlug: input.classSlug,
            className: input.className,
            password: cleanPassword,
            enabled: input.enabled !== false,
            updatedAt: new Date().toISOString(),
            updatedBy: userEmail,
          },
          lastModified: serverTimestamp(),
        },
        { merge: true }
      );
      firestoreSuccess = true;
    } catch (err: any) {
      console.error('Failed to save to settings/class_passwords:', err);
      throw new Error(`Firebase write error: ${err.message || 'Permission denied'}`);
    }

    // 2. Also save to class_passwords collection as secondary store
    try {
      const docRef = doc(db, DIRECT_COLLECTION, input.classSlug);
      await setDoc(docRef, {
        classSlug: input.classSlug,
        className: input.className,
        password: cleanPassword,
        enabled: input.enabled !== false,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });
    } catch (err) {
      // Secondary collection write failure is non-fatal if settings succeeded
      console.warn('Secondary class_passwords collection write warning:', err);
    }
  }

  // Update local storage cache
  const localMap = getLocalPasswords();
  localMap[input.classSlug] = config;
  saveLocalPasswords(localMap);

  return config;
}

/**
 * Set password for ALL classes simultaneously in Firebase Firestore
 */
export async function setAllClassPasswords(
  password: string,
  userEmail: string = 'admin'
): Promise<ClassPassword[]> {
  const cleanPassword = password.trim();
  const results: ClassPassword[] = [];
  const localMap = getLocalPasswords();
  const settingsPayload: Record<string, any> = {
    lastModified: serverTimestamp(),
  };

  for (const c of CLASSES) {
    const config: ClassPassword = {
      classSlug: c.slug,
      className: c.name,
      password: cleanPassword,
      enabled: true,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    };
    results.push(config);
    localMap[c.slug] = config;
    settingsPayload[c.slug] = {
      classSlug: c.slug,
      className: c.name,
      password: cleanPassword,
      enabled: true,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    };
  }

  if (isConfigured && db) {
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_PASSWORDS_DOC);
      await setDoc(settingsDocRef, settingsPayload, { merge: true });
    } catch (err: any) {
      console.error('Failed to save bulk passwords to settings/class_passwords:', err);
      throw new Error(`Firebase write error: ${err.message || 'Permission denied'}`);
    }

    // Secondary individual docs
    for (const c of CLASSES) {
      try {
        const docRef = doc(db, DIRECT_COLLECTION, c.slug);
        await setDoc(docRef, {
          classSlug: c.slug,
          className: c.name,
          password: cleanPassword,
          enabled: true,
          updatedAt: serverTimestamp(),
          updatedBy: userEmail,
        });
      } catch {}
    }
  }

  saveLocalPasswords(localMap);
  return results;
}

/**
 * Delete / Remove password for a specific class in Firebase Firestore
 */
export async function deleteClassPassword(classSlug: string): Promise<void> {
  if (isConfigured && db) {
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_PASSWORDS_DOC);
      await setDoc(
        settingsDocRef,
        {
          [classSlug]: deleteField(),
          lastModified: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to delete from settings/class_passwords:', err);
    }

    try {
      const docRef = doc(db, DIRECT_COLLECTION, classSlug);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Failed to delete from direct collection:', err);
    }
  }

  const localMap = getLocalPasswords();
  delete localMap[classSlug];
  saveLocalPasswords(localMap);
}

/**
 * Remove passwords for ALL classes in Firebase Firestore
 */
export async function deleteAllClassPasswords(): Promise<void> {
  if (isConfigured && db) {
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_PASSWORDS_DOC);
      await deleteDoc(settingsDocRef);
    } catch (err) {
      console.warn('Failed to delete settings/class_passwords:', err);
    }

    for (const c of CLASSES) {
      try {
        const docRef = doc(db, DIRECT_COLLECTION, c.slug);
        await deleteDoc(docRef);
      } catch {}
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
