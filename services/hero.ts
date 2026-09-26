import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { uploadNoteImage } from '@/lib/firebase/storage';

const HERO_DOC = 'hero';
const SETTINGS_COLLECTION = 'settings';

export interface HeroImage {
  url: string;
  alt: string;
}

export interface HeroSettings {
  headline: string;
  subheadline: string;
  supportingText: string;
  images: HeroImage[];
}

export const DEFAULT_HERO: HeroSettings = {
  headline: 'ClassBoard',
  subheadline: 'Your classroom notes, always within reach.',
  supportingText: 'Select your class to access your lessons, whiteboard summaries, and study notes.',
  images: [
    {
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      alt: 'Students learning in a modern classroom',
    },
    {
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
      alt: 'Teacher writing on a digital whiteboard',
    },
  ],
};

/**
 * Fetch the hero settings from Firestore.
 * Falls back to DEFAULT_HERO if the document doesn't exist yet.
 */
export async function getHeroSettings(): Promise<HeroSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, HERO_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        headline: data.headline || DEFAULT_HERO.headline,
        subheadline: data.subheadline || DEFAULT_HERO.subheadline,
        supportingText: data.supportingText || DEFAULT_HERO.supportingText,
        images: Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : DEFAULT_HERO.images,
      };
    }
    return DEFAULT_HERO;
  } catch (err) {
    console.warn('getHeroSettings failed, using defaults:', err);
    return DEFAULT_HERO;
  }
}

/**
 * Save hero settings to Firestore.
 */
export async function saveHeroSettings(settings: HeroSettings): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, HERO_DOC);
  await setDoc(docRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Upload a hero image to Firebase Storage and return the download URL.
 */
export async function uploadHeroImage(file: File): Promise<string> {
  return uploadNoteImage(file);
}
