// Firebase Admin SDK setup for server-side functionality

import admin from 'firebase-admin';
import fs from 'fs';

// --- Admin SDK Setup ---
let app;

try {
  const serviceAccount = JSON.parse(
    fs.readFileSync(new URL('../serviceAccountKey.json', import.meta.url))
  );

  app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
} catch (e) {
  console.warn("Admin Firebase SDK not initialized. If needed, check serviceAccountKey.json presence.");
}

const db = app ? admin.firestore() : null;

export { admin, db };