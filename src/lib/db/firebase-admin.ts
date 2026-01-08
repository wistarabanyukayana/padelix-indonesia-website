/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only';
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } else {
        console.warn("Missing Firebase Admin credentials. Using mock mode.");
    }
  }
  
  if (admin.apps.length) {
      db = admin.firestore();
      storage = admin.storage();
  } else {
      // Mock objects for build time
      db = {
          collection: () => ({
              get: async () => ({ docs: [], empty: true }),
              where: () => ({ limit: () => ({ get: async () => ({ docs: [], empty: true }) }), get: async () => ({ docs: [], empty: true }) }),
              doc: () => ({ get: async () => ({ exists: false }) }),
          })
      } as any;
      storage = {
          bucket: () => ({})
      } as any;
  }

} catch (error) {
  console.error('Firebase Admin initialization error', error);
  // Fallback mocks
  db = {
      collection: () => ({
          get: async () => ({ docs: [], empty: true }),
          where: () => ({ limit: () => ({ get: async () => ({ docs: [], empty: true }) }), get: async () => ({ docs: [], empty: true }) }),
          doc: () => ({ get: async () => ({ exists: false }) }),
      })
  } as any;
  storage = {} as any;
}

export { db, storage };
