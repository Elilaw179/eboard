import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Note, NoteFormData, NoteStatus } from '@/types/note';
import { ClassGrade, CLASSES } from '@/types/class';
import { extractPlainText } from '@/lib/utils/format';

const NOTES_COLLECTION = 'notes';

/**
 * Sort notes newest-first (handles both Firestore Timestamps and Date objects)
 */
function sortByNewest(notes: Note[]): Note[] {
  return notes.sort((a, b) => {
    const timeA = (a.createdAt as any)?.seconds
      ? (a.createdAt as any).seconds * 1000
      : new Date(a.createdAt).getTime();
    const timeB = (b.createdAt as any)?.seconds
      ? (b.createdAt as any).seconds * 1000
      : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}

/**
 * Fetch published notes for students, optionally filtered by class and/or subject.
 * NOTE: Combining multiple where() clauses on different fields requires a composite
 * Firestore index. We use a single where() and filter the rest client-side.
 */
export async function getPublishedNotes(options?: {
  className?: string;
  classSlug?: string;
  subject?: string;
}): Promise<Note[]> {
  let q = query(
    collection(db, NOTES_COLLECTION),
    where('status', '==', 'published')
  );

  // Filter by class (single extra where — uses status+className composite index)
  if (options?.className) {
    q = query(
      collection(db, NOTES_COLLECTION),
      where('status', '==', 'published'),
      where('className', '==', options.className)
    );
  } else if (options?.classSlug) {
    q = query(
      collection(db, NOTES_COLLECTION),
      where('status', '==', 'published'),
      where('classSlug', '==', options.classSlug)
    );
  }

  const snapshot = await getDocs(q);
  let notes: Note[] = [];
  snapshot.forEach((docSnap) => {
    notes.push({ id: docSnap.id, ...docSnap.data() } as Note);
  });

  // Client-side subject filter (avoids needing a 3-field composite index)
  if (options?.subject && options.subject !== 'All') {
    notes = notes.filter(
      (n) => n.subject.toLowerCase() === options.subject!.toLowerCase()
    );
  }

  return sortByNewest(notes);
}

/**
 * Fetch a single note by Firestore document ID.
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const docRef = doc(db, NOTES_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Note;
}

/**
 * Fetch ALL notes (draft + published) for the Admin Dashboard.
 */
export async function getAllNotesForAdmin(): Promise<Note[]> {
  const snapshot = await getDocs(collection(db, NOTES_COLLECTION));
  const notes: Note[] = [];
  snapshot.forEach((docSnap) => {
    notes.push({ id: docSnap.id, ...docSnap.data() } as Note);
  });
  return sortByNewest(notes);
}

/**
 * Create a new note in Firestore and return the new document ID.
 */
export async function createNote(
  formData: NoteFormData,
  authorName: string = 'Teacher'
): Promise<string> {
  const classDef = CLASSES.find((c) => c.name === formData.className);
  const classSlug =
    classDef?.slug ||
    formData.className.toLowerCase().replace(/\s+/g, '-');
  const plainTextPreview = extractPlainText(formData.content, 180);

  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    title: formData.title.trim(),
    subject: formData.subject.trim(),
    className: formData.className,
    classSlug,
    content: formData.content,
    plainTextPreview,
    status: formData.status,
    authorName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update an existing note in Firestore.
 */
export async function updateNote(
  id: string,
  formData: Partial<NoteFormData>
): Promise<void> {
  const classDef = formData.className
    ? CLASSES.find((c) => c.name === formData.className)
    : undefined;
  const classSlug = classDef?.slug;
  const plainTextPreview = formData.content
    ? extractPlainText(formData.content, 180)
    : undefined;

  const updates: Record<string, any> = {
    ...formData,
    updatedAt: serverTimestamp(),
  };
  if (classSlug) updates.classSlug = classSlug;
  if (plainTextPreview !== undefined) updates.plainTextPreview = plainTextPreview;

  const docRef = doc(db, NOTES_COLLECTION, id);
  await updateDoc(docRef, updates);
}

/**
 * Toggle a note's status between 'draft' and 'published'.
 * Returns the new status.
 */
export async function toggleNoteStatus(
  id: string,
  currentStatus: NoteStatus
): Promise<NoteStatus> {
  const newStatus: NoteStatus =
    currentStatus === 'published' ? 'draft' : 'published';
  await updateNote(id, { status: newStatus });
  return newStatus;
}

/**
 * Permanently delete a note from Firestore.
 */
export async function deleteNote(id: string): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Search published notes by title, subject, class, or plain-text preview.
 * Firestore doesn't support full-text search natively, so we fetch all
 * published notes and filter client-side.
 */
export async function searchNotes(queryText: string): Promise<Note[]> {
  const cleanQuery = queryText.toLowerCase().trim();
  if (!cleanQuery) return [];

  const notes = await getPublishedNotes();
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(cleanQuery) ||
      n.subject.toLowerCase().includes(cleanQuery) ||
      n.className.toLowerCase().includes(cleanQuery) ||
      (n.plainTextPreview || '').toLowerCase().includes(cleanQuery)
  );
}

/**
 * Get distinct subject names present in published notes for a given class.
 */
export async function getSubjectsForClass(
  classNameOrSlug?: string
): Promise<string[]> {
  const notes = await getPublishedNotes(
    classNameOrSlug?.startsWith('year-')
      ? { classSlug: classNameOrSlug }
      : { className: classNameOrSlug }
  );
  const subjects = new Set<string>();
  notes.forEach((n) => {
    if (n.subject) subjects.add(n.subject.trim());
  });
  return Array.from(subjects).sort();
}
