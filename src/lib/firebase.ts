import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Set up custom parameters for Google Auth popup
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// Validate connection to Firestore on initial boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'siteSettings'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client is offline or Firestore initializing.');
    }
  }
}

testFirestoreConnection();
