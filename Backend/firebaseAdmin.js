// firebaseAdmin.js

const admin = require('firebase-admin');

// ✅ Safer, portable path to service account file
const path = require('path');
const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));

// ✅ Avoid reinitializing if already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-app-9349a-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

// ✅ Export both database and auth
const db = admin.database();
const auth = admin.auth();

module.exports = { admin, db, auth };
