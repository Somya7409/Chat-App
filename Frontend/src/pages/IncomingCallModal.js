// src/components/IncomingCallModal.js

import React from 'react';
import './IncomingCallModal.css'; // Optional: for styling

const IncomingCallModal = ({ callerId, roomId, onAccept, onDecline }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>📞 Incoming Call</h3>
        <p>Caller: {callerId}</p>
        <p>Room ID: {roomId}</p>
        <div className="modal-buttons">
          <button className="accept-btn" onClick={onAccept}>Accept</button>
          <button className="decline-btn" onClick={onDecline}>Decline</button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
