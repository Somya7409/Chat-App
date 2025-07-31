const admin = require('firebase-admin');
const path = require('path');

// Use safer absolute path
const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));

// Prevent reinitialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-app-9349a-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "chat-app-9349a.appspot.com",  // ✅ Firebase Storage
  });
}

// ✅ Realtime DB, Auth, Storage Bucket
const db = admin.database();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = { admin, db, auth, bucket };
