import React, { useState, useEffect, useContext } from 'react';
import { ref, push, onValue, set, off, update } from 'firebase/database';
import { db } from '../firebase';
import './Dashboard.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import IncomingCallModal from './IncomingCallModal';
import VideoCall from './VideoCall'; // adjust path if needed
import { format, isToday, isYesterday } from 'date-fns';
import SingleTick from '../components/SingleTick';
import DoubleTick from '../components/DoubleTick';
import MediaUpload from '../components/MediaUpload';




const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  console.log("USER OBJECT:", user);
  const currentUserUid = user?.firebaseUid || user?.uid || user?.userId || user?._id;
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [chatUsers, setChatUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null); // { from, roomId }
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [clearMedia, setClearMedia] = useState(false);


  // ✅ Restore chat on reload but exclude self-chat
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

  // ✅ Auto-select a user if none is selected
  useEffect(() => {
    if (!selectedUserId && chatUsers.length > 0) {
      const other = chatUsers.find(u => u.userId !== currentUserUid);
      if (other) {
        setSelectedUserId(other.userId);
        setSelectedUserName(other.username || 'User');
      }
    }
  }, [chatUsers, currentUserUid, selectedUserId]);

  // ✅ Fetch ChatUsers (with UID included)
  useEffect(() => {
    console.log("USERS EFFECT RUNNING");
    const usersRef = ref(db, "ChatUsers");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      console.log("RAW FIREBASE DATA:", data);

      if (!data) return;

      const allUsers = Object.entries(data).map(([uid, user]) => ({
        userId: uid,
        ...user,
      }));

      console.log("CURRENT USER UID:", currentUserUid);
      console.log("ALL USERS:", allUsers);


      const filteredUsers = allUsers.filter(u => u.userId !== currentUserUid);

      console.log("FILTERED USERS:", filteredUsers);


      setChatUsers(filteredUsers);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  useEffect(() => {
    if (!currentUserUid || !selectedUserId) return;

    const chatsRef = ref(db, 'Chats');
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }

      const allMessages = Object.entries(data); // Get key-value pairs
      const filtered = allMessages
        .filter(([_, msg]) =>
          (msg.sender === currentUserUid && msg.receiver === selectedUserId) ||
          (msg.sender === selectedUserId && msg.receiver === currentUserUid)
        )
        .map(([key, msg]) => {
          // ✅ Update SEEN status if current user is receiver and it's not already seen
          if (
            msg.receiver === currentUserUid &&
            msg.sender === selectedUserId &&
            msg.status !== 'SEEN'
          ) {
            console.log(`🔄 Marking message as SEEN:
    🔑 Key: ${key}
    🧑 Sender: ${msg.sender}
    📥 Receiver: ${msg.receiver}
    📩 Content: ${msg.text || '[No text field]'}
    🕒 Time: ${msg.time || '[No time field]'}
    🏷️ Previous Status: ${msg.status}`);

            const msgRef = ref(db, `Chats/${key}`);
            update(msgRef, { status: 'SEEN' });
          }
          return msg;
        });


      setMessages(filtered);
    });

    return () => unsubscribe();
  }, [currentUserUid, selectedUserId]);
  const handleMediaUpload = async (fileData) => {
    if (!currentUserUid || !selectedUserId) return;

    const now = new Date();

    const newMessage = {
      message: fileData.url,
      sender: currentUserUid,
      receiver: selectedUserId,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US'),
      timestamp: Date.now(),
      status: 'NOT_SEEN',
      type: fileData.type,
      img_message: '',
    };

    try {
      await push(ref(db, 'Chats'), newMessage);

      await set(
        ref(db, `Chatlist/${currentUserUid}/${selectedUserId}`),
        { id: selectedUserId }
      );

      await set(
        ref(db, `Chatlist/${selectedUserId}/${currentUserUid}`),
        { id: currentUserUid }
      );

      console.log("✅ Media message sent");
    } catch (err) {
      console.error("❌ Media send failed", err);
    }
  };
  // ✅ Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedMedia) ||
      !currentUserUid ||
      !selectedUserId) return;
    const now = new Date();
    const newMessage = {
      message: input,
      mediaUrl: selectedMedia ? selectedMedia.url : '',
      mediaType: selectedMedia ? selectedMedia.type : '',
      sender: currentUserUid,
      receiver: selectedUserId,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US'),
      timestamp: Date.now(),
      status: 'NOT_SEEN',
    };

    try {
      await push(ref(db, 'Chats'), newMessage);

      await set(ref(db, `Chatlist/${currentUserUid}/${selectedUserId}`), {
        id: selectedUserId,
      });
      await set(ref(db, `Chatlist/${selectedUserId}/${currentUserUid}`), {
        id: currentUserUid,
      });

      setInput('');
      setSelectedMedia(null);
      setClearMedia(true);

      setTimeout(() => {
        setClearMedia(false);
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    logout();
    localStorage.removeItem('selectedUserId');
    localStorage.removeItem('selectedUserName');
    navigate('/login');
  };

  // ✅ Get selected user from chatUsers list
  const selectedUser = chatUsers.find(user => user.userId === selectedUserId);

  // ✅ Send call request to the selected user
  const sendCallRequest = async () => {
    if (!currentUserUid || !selectedUserId) {
      console.error("Caller or receiver ID missing.");
      return;
    }

    const roomId = `${currentUserUid}-${selectedUserId}-${Date.now()}`;

    try {
      // Send call request to receiver
      await set(ref(db, `Calls/${selectedUserId}`), {
        from: currentUserUid,
        receiverId: selectedUserId,
        roomId,
        status: "incoming",
      });

      console.log("✅ Call request sent!");

      // ✅ Immediately join the room as caller
      setShowVideoCall(true);
      setActiveRoomId(roomId);

    } catch (error) {
      console.error("❌ Failed to send call request:", error);
    }
  };

  // ✅ Listen for incoming call
  useEffect(() => {
    if (!currentUserUid) return;

    const callRef = ref(db, `Calls/${currentUserUid}`);
    const unsubscribe = onValue(callRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.status === "incoming") {
        setIncomingCall({
          from: data.from,
          roomId: data.roomId,
        });
      } else {
        setIncomingCall(null); // Clear if declined/ended
      }
    });

    return () => unsubscribe();  // Cleanup listener
  }, [currentUserUid]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    console.log("📲 Accepting call", incomingCall);

    const roomId = incomingCall.roomId; // ✅ Store it BEFORE clearing state

    await update(ref(db, `Calls/${currentUserUid}`), {
      status: "accepted"
    });
    setShowVideoCall(true);        // ✅ This now works reliably
    setActiveRoomId(roomId);       // ✅ Use separate state for room ID
    setIncomingCall(null);         // ✅ Clear after storing

  };


  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    await update(ref(db, `Calls/${currentUserUid}`), {
      status: "declined"
    });
    setIncomingCall(null);
  };




  return (
    <div className="Dashboard-container">
      <div className="sidebar">
        <div>
          <h2>Contacts</h2>
          <div className="chat-list">
            {chatUsers.map((user) => (
              <div
                key={user.userId}
                className={`chat-list-item ${selectedUserId === user.userId ? 'active-chat' : ''}`}
                onClick={() => {
                  if (user.userId === currentUserUid) return;
                  setSelectedUserId(user.userId);
                  setSelectedUserName(user.username || 'User');
                  localStorage.setItem('selectedUserId', user.userId);
                  localStorage.setItem('selectedUserName', user.username || 'User');
                }}
              >
                <div className="chat-list-profile">
                  <img
                    src={user.photo || '/wavy.avif'}
                    alt="Profile"
                    className="chat-list-pic"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/wavy.avif';
                    }}
                  />
                  {user.isOnline && <span className="chat-list-online-indicator" />}
                </div>
                <p>{user.username}</p>
              </div>
            ))}

          </div>
        </div>
        <div>
          <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>

      </div>

      <div className="chat-section">

        <div className="chat-header">
          <div className="chat-header-content">
            <img
              src={selectedUser?.photo || '/wavy.avif'}
              onError={(e) => (e.target.src = '/wavy.avif')}
              className="profile-pic"
              alt="Profile"
            />
            <h3 className="chat-username">{selectedUserId ? selectedUserName : 'Select a user to chat'}</h3>
          </div>

          <span className="online-indicator"></span>
          <button className="call-button" onClick={sendCallRequest}>📞 Call</button>
        </div>
        <div className="chat-box">
          {messages
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((msg, index) => {
              const timeString = msg.timestamp
                ? format(new Date(msg.timestamp), 'hh:mm a')
                : msg.time || '';

              const msgDate = msg.timestamp ? new Date(msg.timestamp) : null;

              // Check if a date header is needed
              let showDateHeader = false;
              if (index === 0) {
                showDateHeader = true;
              } else {
                const prevMsg = messages[index - 1];
                const prevDate = new Date(prevMsg.timestamp);
                showDateHeader =
                  msgDate &&
                  (msgDate.getDate() !== prevDate.getDate() ||
                    msgDate.getMonth() !== prevDate.getMonth() ||
                    msgDate.getFullYear() !== prevDate.getFullYear());
              }

              let dateLabel = '';
              if (showDateHeader && msgDate) {
                if (isToday(msgDate)) {
                  dateLabel = 'Today';
                } else if (isYesterday(msgDate)) {
                  dateLabel = 'Yesterday';
                } else {
                  dateLabel = format(msgDate, 'MMMM d, yyyy');
                }
              }

              return (
                <React.Fragment key={index}>
                  {showDateHeader && (
                    <div className="date-header">
                      {dateLabel}
                    </div>
                  )}

                  <div
                    className={`message ${msg.sender === currentUserUid ? 'sent' : 'received'}`}
                  >
                    <div className="message-text">
 
                      {msg.mediaType === 'image' && (
                        <img
                          src={msg.mediaUrl}
                          alt="sent"
                          style={{ maxWidth: '200px' }}
                        />
                      )}

                      {msg.mediaType === 'video' && (
                        <video
                          src={msg.mediaUrl}
                          controls
                          style={{ maxWidth: '200px' }}
                        />
                      )}

                      {msg.mediaType === 'audio' && (
                        <audio
                          src={msg.mediaUrl}
                          controls
                        />
                      )}

                       {msg.message && (
                        <p>{msg.message}</p>
                      )}

                    </div>

                    <div className="message-time">
                      {timeString}
                      {msg.sender === currentUserUid && (
                        <>
                          {console.log("🔍 Tick check", msg.message, msg.status)}
                          <span className={`tick ${msg.status === 'SEEN' ? 'seen' : 'sent'}`}>
                            {msg.status === 'SEEN' ? <DoubleTick /> : <SingleTick />}
                          </span>
                        </>

                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <MediaUpload
            clearMedia={clearMedia}
            onUploadComplete={(fileData) => {
              setSelectedMedia(fileData);
            }}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
      {console.log("🧪 incomingCall value", incomingCall)}
      {incomingCall && (console.log("🎬 Rendering IncomingCallModal"), (
        <IncomingCallModal
          callerId={incomingCall.from}
          roomId={incomingCall.roomId}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      ))}
      {showVideoCall && activeRoomId && (
        <VideoCall
          roomId={activeRoomId}
          currentUserUid={currentUserUid}
          onCallEnd={() => {
            // 🔄 Reset call state
            setShowVideoCall(false);
            setActiveRoomId(null);
            // 🚀 Redirect to dashboard
            navigate("/dashboard");
          }}
        />
      )}



    </div>
  );
};

export default Dashboard;
