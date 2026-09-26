import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DEFAULT_SUBJECTS } from '@/types/subject';

const SUBJECTS_COLLECTION = 'subjects';

export interface SubjectRecord {
  id: string;
  name: string;
}

/**
 * Fetch all subjects from Firestore.
 * Returns a merged list of Firestore subjects + default subjects (as name-only strings).
 */
export async function getAllSubjects(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, SUBJECTS_COLLECTION));
    const firestoreNames: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.name) firestoreNames.push(data.name.trim());
    });

    // Merge with defaults, deduplicate, sort
    const merged = Array.from(new Set([...DEFAULT_SUBJECTS, ...firestoreNames])).sort();
    return merged;
  } catch (err) {
    console.warn('getAllSubjects Firestore error, returning defaults:', err);
    return [...DEFAULT_SUBJECTS].sort();
  }
}

/**
 * Fetch subjects from Firestore as full records (with doc IDs) for the admin panel.
 */
export async function getAllSubjectRecords(): Promise<SubjectRecord[]> {
  try {
    const snap = await getDocs(collection(db, SUBJECTS_COLLECTION));
    const records: SubjectRecord[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.name) {
        records.push({ id: d.id, name: data.name.trim() });
      }
    });
    return records.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.warn('getAllSubjectRecords Firestore error:', err);
    return [];
  }
}

/**
 * Add a new subject to Firestore. Returns the new document ID.
 */
export async function createSubject(name: string): Promise<string> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Subject name cannot be empty');

  const docRef = await addDoc(collection(db, SUBJECTS_COLLECTION), {
    name: cleanName,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Rename an existing subject in Firestore.
 */
export async function updateSubject(id: string, newName: string): Promise<void> {
  const cleanName = newName.trim();
  if (!cleanName) throw new Error('Subject name cannot be empty');
  const docRef = doc(db, SUBJECTS_COLLECTION, id);
  await updateDoc(docRef, { name: cleanName, updatedAt: serverTimestamp() });
}

/**
 * Delete a subject from Firestore by document ID.
 */
export async function deleteSubject(id: string): Promise<void> {
  const docRef = doc(db, SUBJECTS_COLLECTION, id);
  await deleteDoc(docRef);
}
