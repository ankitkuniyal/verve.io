// config/firebase.js
import admin from 'firebase-admin';
import fs from 'fs';

// Read and parse the service account key JSON file
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;