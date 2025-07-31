// src/components/VideoCall.js
import React, { useEffect, useRef } from "react";

const VideoCall = ({ roomId, currentUserUid, onCallEnd }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi Meet API script not loaded.");
      return;
    }

    if (!roomId || !currentUserUid) return;

    const domain = "meet.jit.si";
    const options = {
      roomName: roomId,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: currentUserUid,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        disableInviteFunctions: true,
        startAudioOnly: false,
        prejoinPageEnabled: false, // 🧠 Skip pre-join screen
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        TOOLBAR_ALWAYS_VISIBLE: true,
        SHOW_CHROME_EXTENSION_BANNER: false,
        DEFAULT_REMOTE_DISPLAY_NAME: "Guest",
        DISPLAY_WELCOME_FOOTER: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    apiRef.current = api;

    api.addEventListener("readyToClose", () => {
      if (onCallEnd) onCallEnd();
    });

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomId, currentUserUid, onCallEnd]);

  return (
    <div
      ref={jitsiContainerRef}
      id="jitsi-container"
      style={{ height: "100vh", width: "100%" }}
    />
  );
};

export default VideoCall;
