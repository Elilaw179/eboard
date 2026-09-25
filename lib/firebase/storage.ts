import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isConfigured } from './config';

/**
 * Compresses an image file client-side to ensure fast uploads and prevent browser freezing
 */
async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve) => {
    // If it's an SVG, don't compress
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            resolve({ blob: blob || file, dataUrl });
          },
          'image/jpeg',
          quality
        );
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads a note diagram/image to Firebase Storage with 5s timeout & instant local fallback.
 * Returns the public download URL or compressed data URI.
 */
export async function uploadNoteImage(file: File): Promise<string> {
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB limit. Please choose a smaller file.');
  }

  // Validate type
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file format. Only image files (PNG, JPEG, WebP, SVG) are allowed.');
  }

  // Compress first for fast upload and zero UI lag
  const { blob, dataUrl } = await compressImage(file);

  // If live Firebase is configured, attempt upload with a fast 5s timeout
  if (isConfigured && storage) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `note-images/${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, filename);

      const uploadPromise = uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timed out after 5s')), 5000)
      );

      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err: any) {
      console.warn('Firebase Storage upload failed or timed out, using compressed embedded image:', err?.message || err);
      // Fast fallback to compressed data URL so the editor never stalls
      return dataUrl;
    }
  }

  // Fallback for offline/demo mode
  return dataUrl;
}
