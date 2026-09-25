import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/config';
import { DEFAULT_SUBJECTS } from '@/types/subject';

const SUBJECTS_COLLECTION = 'subjects';
const LOCAL_SUBJECTS_KEY = 'eboard_stored_subjects_v1';

/**
 * Get stored subjects from localStorage
 */
export function getLocalSubjects(): string[] {
  if (typeof window === 'undefined') return DEFAULT_SUBJECTS;
  try {
    const raw = localStorage.getItem(LOCAL_SUBJECTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_SUBJECTS_KEY, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

/**
 * Save subjects to localStorage
 */
export function saveLocalSubjects(subjects: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (err) {
    console.warn('Failed to save subjects to localStorage:', err);
  }
}

/**
 * Fetch all active subjects from Firestore + LocalStorage + Defaults
 */
export async function getAllSubjects(): Promise<string[]> {
  const subjectsSet = new Set<string>(DEFAULT_SUBJECTS);

  // Load from local storage
  const local = getLocalSubjects();
  local.forEach((s) => subjectsSet.add(s.trim()));

  // If Firebase is configured, fetch from Firestore
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, SUBJECTS_COLLECTION));
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.name) subjectsSet.add(data.name.trim());
      });
    } catch (err) {
      console.warn('Firestore fetch subjects failed, using local subjects:', err);
    }
  }

  const combined = Array.from(subjectsSet).filter(Boolean).sort();
  saveLocalSubjects(combined);
  return combined;
}

/**
 * Add a new subject to Firestore and LocalStorage
 */
export async function createSubject(name: string): Promise<string> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Subject name cannot be empty');

  // Save to local storage first
  const current = getLocalSubjects();
  if (!current.some((s) => s.toLowerCase() === cleanName.toLowerCase())) {
    current.push(cleanName);
    current.sort();
    saveLocalSubjects(current);
  }

  // Save to Firestore
  if (isConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, SUBJECTS_COLLECTION), {
        name: cleanName,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.warn('Firestore add subject failed, saved to local cache:', err);
    }
  }

  return `subject-${Date.now()}`;
}
