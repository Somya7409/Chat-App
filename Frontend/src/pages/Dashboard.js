import React, { useState, useEffect, useContext } from 'react';
import { ref, push, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import './Dashboard.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const currentUserUid = user?.firebaseUid ||user?.uid || user?.userId || user?._id;
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [chatUsers, setChatUsers] = useState([]);

  // ✅ Fix: Prevent user from chatting with themselves on reload
  useEffect(() => {
    const savedId = localStorage.getItem('selectedUserId');
    const savedName = localStorage.getItem('selectedUserName');

    if (savedId && savedId !== currentUserUid) {
      setSelectedUserId(savedId);
      setSelectedUserName(savedName);
    } else {
      localStorage.removeItem('selectedUserId');
      localStorage.removeItem('selectedUserName');

    }
  }, [currentUserUid]);
  useEffect(() => {
    if (!selectedUserId && chatUsers.length > 0) {
      const other = chatUsers.find(u => u.userId !== currentUserUid);
      if (other) {
        setSelectedUserId(other.userId);
        setSelectedUserName(other.username || 'User');
      }
    }
  }, [chatUsers, currentUserUid, selectedUserId]);

  // ✅ Restore selected chat from localStorage on refresh
  useEffect(() => {
    const savedId = localStorage.getItem('selectedUserId');
    const savedName = localStorage.getItem('selectedUserName');
    if (savedId) {
      setSelectedUserId(savedId);
      setSelectedUserName(savedName);
    }
  }, []);

  // ✅ Fetch ChatUsers (excluding self)
  useEffect(() => {
    const usersRef = ref(db, 'ChatUsers');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const allUsers = Object.values(data).filter(
        (u) => u.userId !== currentUserUid
      );
      setChatUsers(allUsers);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  // ✅ Fetch messages
  useEffect(() => {
    if (!currentUserUid || !selectedUserId) return;

    const chatsRef = ref(db, 'Chats');
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }

      const loadedMessages = Object.values(data).filter(
        (msg) =>
          (msg.sender === currentUserUid && msg.receiver === selectedUserId) ||
          (msg.sender === selectedUserId && msg.receiver === currentUserUid)
      );

      loadedMessages.sort(
        (a, b) =>
          new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)
      );

      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [currentUserUid, selectedUserId]);

  // ✅ Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUserUid || !selectedUserId) return;

    const now = new Date();
    const newMessage = {
      message: input,
      sender: currentUserUid,
      receiver: selectedUserId,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US'),
      status: 'NOT_SEEN',
      img_message: '',
    };
    console.log("🟢 Sending message from:", currentUserUid);
    console.log("📩 To:", selectedUserId);
    try {

      await push(ref(db, 'Chats'), newMessage);
      await set(ref(db, `Chatlist/${currentUserUid}/${selectedUserId}`), {
        id: selectedUserId,
      });
      await set(ref(db, `Chatlist/${selectedUserId}/${currentUserUid}`), {
        id: currentUserUid,
      });
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // ✅ Logout handler using context
  const handleLogout = () => {
    logout();
    localStorage.removeItem('selectedUserId');
    localStorage.removeItem('selectedUserName');
    navigate('/login');
  };

  return (
    <div className="Dashboard-container">
      <div className="sidebar">
        <div>
          <h2>Contacts</h2>

        <div className="chat-list">
          
          {chatUsers
            .filter((u) => u.userId !== currentUserUid) // ❗ exclude yourself
            .map((user) => (
              <p
                key={user.userId}
                className={selectedUserId === user.userId ? 'active-chat' : ''}
                onClick={() => {
                  // ❌ Prevent selecting yourself
                  if (user.userId === currentUserUid) return;

                  setSelectedUserId(user.userId);
                  setSelectedUserName(user.username || 'User');
                  localStorage.setItem('selectedUserId', user.userId);
                  localStorage.setItem('selectedUserName', user.username || 'User');
                }}
              >
                {user.username}
              </p>
            ))}

        </div>

        </div>
        

        
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        
      </div>

      <div className="chat-section">
        <div className="chat-header">
          <h3>
            {selectedUserId
              ? `Chat with ${selectedUserName}`
              : 'Select a user to chat'}
          </h3>
        </div>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === currentUserUid ? 'sent' : 'received'
                }`}
            >
              {msg.message}
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
