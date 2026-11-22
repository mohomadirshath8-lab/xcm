import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.ts';

/**
 * Uploads a customer manual bank transfer receipt/slip to Firebase Storage
 * Stored under: /payment_slips/{orderCode}/{filename}
 */
export async function uploadPaymentSlip(orderCode: string, file: Blob | File, filename?: string): Promise<string> {
  try {
    const name = filename || `slip_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, `payment_slips/${orderCode}/${name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Failed to upload payment slip to Firebase Storage:', error);
    throw error;
  }
}

/**
 * Uploads a product image asset to Firebase Storage
 * Stored under: /products/{filename}
 */
export async function uploadProductImage(file: Blob | File, filename?: string): Promise<string> {
  try {
    const name = filename || `prod_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, `products/${name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Failed to upload product image to Firebase Storage:', error);
    throw error;
  }
}

/**
 * Uploads a user profile avatar image to Firebase Storage
 * Stored under: /avatars/{userId}/{filename}
 */
export async function uploadUserAvatar(userId: string, file: Blob | File, filename?: string): Promise<string> {
  try {
    const name = filename || `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, `avatars/${userId}/${name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Failed to upload avatar to Firebase Storage:', error);
    throw error;
  }
}
