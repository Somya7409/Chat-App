// App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile'; 
import VideoCall from './pages/VideoCall';

function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/video-call/:roomId" element={<VideoCall />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;

