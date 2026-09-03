import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  Firestore 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { JournalEntry } from './types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore (support named database if specified)
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Strict undefined-stripping utility to ensure Zero-Crash Payload Hygiene.
 * Firestore throws errors if any nested property contains undefined.
 */
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_, value) => {
    if (value === undefined) {
      return null;
    }
    return value;
  }));
}

/**
 * Signs in user with Google popup
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
}

/**
 * Signs out current user
 */
export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Saves or updates a journal entry isolated to the user's document path
 * /users/{userId}/entries/{entryId}
 */
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId || !entry.id) {
    throw new Error('User ID and Entry ID are required to save entry');
  }
  const cleanEntry = sanitizeForFirestore({
    ...entry,
    userId,
    updatedAt: Date.now(),
  });
  const entryRef = doc(db, 'users', userId, 'entries', entry.id);
  await setDoc(entryRef, cleanEntry, { merge: true });
}

/**
 * Fetches all journal entries for the authenticated user, sorted by updatedAt desc
 */
export async function getUserJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];
  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  const entries: JournalEntry[] = [];
  snapshot.forEach((docSnap) => {
    entries.push(docSnap.data() as JournalEntry);
  });
  return entries;
}

/**
 * Deletes a journal entry for a user
 */
export async function deleteUserEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) return;
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryRef);
}
