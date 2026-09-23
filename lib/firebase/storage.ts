import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isConfigured } from './config';

/**
 * Uploads a note diagram/image to Firebase Storage
 * Returns the public download URL
 */
export async function uploadNoteImage(file: File): Promise<string> {
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB limit. Please choose a smaller file.');
  }

  // Validate type
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file format. Only image files (PNG, JPEG, WebP, SVG) are allowed.');
  }

  // If live Firebase is configured, upload to storage
  if (isConfigured && storage) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `note-images/${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err: any) {
      console.warn('Firebase Storage upload failed, converting to local data URI:', err);
    }
  }

  // Fallback for offline / demo mode: Convert to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };
    reader.readAsDataURL(file);
  });
}
