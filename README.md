<html lang="en">
<head>
<meta charset="UTF-8">

</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">

<h1>📱 Full-Stack Realtime Chat Application</h1>

<p>
A full-stack, WhatsApp-style <strong>realtime chat application</strong> built using 
<strong>React</strong>, <strong>Node.js</strong>, <strong>Express</strong>, <strong>MongoDB</strong>, 
<strong>Firebase Realtime Database</strong>, and <strong>Jitsi</strong> for video/audio calls.
<br>
Supports real-time messaging, media sharing, authentication, notifications, and in-app calling.
</p>

<hr>

<h2>🚀 Features</h2>

<h3>🔐 Authentication</h3>
<ul>
  <li>Register and login with JWT</li>
  <li>Secure protected routes</li>
</ul>

<h3>💬 Realtime Messaging</h3>
<ul>
  <li>1–1 messaging using Firebase RTDB</li>
  <li>Delivered / Seen indicators</li>
  <li>Timestamps & day grouping</li>
</ul>

<h3>📎 Media Sharing</h3>
<ul>
  <li>Send images, videos, and audio</li>
  <li>Drag-and-drop uploads</li>
  <li>Firebase Storage integration</li>
</ul>

<h3>📞 Video & Audio Calling</h3>
<ul>
  <li>Powered by Jitsi</li>
  <li>Firebase signaling</li>
</ul>

<h3>🔔 Notifications</h3>
<ul>
  <li>New message alerts</li>
  <li>Incoming call popups</li>
</ul>

<h3>👤 User & Chat Management</h3>
<ul>
  <li>User search</li>
  <li>Chat list with last message</li>
  <li>Online/offline presence</li>
</ul>

<hr>

<h2>🧱 Tech Stack</h2>

<h3>Frontend</h3>
<ul>
  <li>React</li>
  <li>React Router</li>
  <li>Axios</li>
  <li>Firebase Web SDK</li>
  <li>Jitsi External API</li>
  <li>Tailwind / CSS</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Node.js</li>
  <li>Express</li>
  <li>MongoDB & Mongoose</li>
  <li>Firebase Admin SDK</li>
  <li>JWT Authentication</li>
</ul>

<hr>

<h2>📁 Project Structure</h2>

<h3>Frontend</h3>
<pre>
frontend/
  src/
    api/
    components/
    pages/
    context/
    firebase/
    hooks/
    styles/
    App.js
    index.js
  package.json
</pre>

<h3>Backend</h3>
<pre>
backend/
  src/
    controllers/
    models/
    routes/
    middleware/
    utils/
    server.js
  package.json
</pre>

<hr>

<h2>⚙️ Installation</h2>

<h3>1️⃣ Clone Repository</h3>
<pre>
git clone https://github.com/&lt;your-username&gt;/&lt;repo-name&gt;.git
cd &lt;repo-name&gt;
</pre>

<h3>2️⃣ Frontend Setup</h3>
<pre>
cd frontend
npm install
</pre>

<p>Create a <code>.env</code> file:</p>
<pre>
REACT_APP_API_BASE_URL=http://localhost:5000/api

REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_DATABASE_URL=your_db_url
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_JITSI_DOMAIN=meet.jit.si
</pre>

<p>Run the frontend:</p>
<pre>npm start</pre>

<h3>3️⃣ Backend Setup</h3>
<pre>
cd backend
npm install
</pre>

<p>Create a <code>.env</code> file:</p>
<pre>
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
</pre>

<p>Place Firebase Admin key:</p>
<pre>
backend/src/utils/serviceAccountKey.json
</pre>

<p>Run the backend:</p>
<pre>npm run dev</pre>

<p>Backend runs at: <strong>http://localhost:5000</strong></p>

<hr>

<h2>🔗 API Endpoints</h2>

<h3>Auth</h3>
<ul>
  <li>POST /api/auth/register</li>
  <li>POST /api/auth/login</li>
</ul>

<h3>Users</h3>
<ul>
  <li>GET /api/users/me</li>
  <li>GET /api/users/search</li>
</ul>

<h3>Messages</h3>
<ul>
  <li>POST /api/messages/send</li>
  <li>GET /api/messages/:chatId</li>
</ul>

<h3>Chats</h3>
<ul>
  <li>GET /api/chats/:userId</li>
</ul>

<hr>

<h2>📌 Roadmap</h2>
<ul>
  <li>Group chats</li>
  <li>Typing indicators</li>
  <li>Push notifications</li>
  <li>Message search</li>
  <li>Profile pictures</li>
  <li>End-to-end encryption (experimental)</li>
</ul>

<hr>

<h2>👤 Author</h2>

<p>
<strong>Somya Aditya</strong><br>
Full-Stack Developer | Realtime Systems | React | Firebase
</p>

</body>
</html>
