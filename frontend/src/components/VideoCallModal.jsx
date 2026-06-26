import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, PhoneCall } from 'lucide-react';

export default function VideoCallModal({ session, socket, onClose }) {
  const [callConnected, setCallConnected] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callStatus, setCallStatus] = useState('Initiating stream...');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  // WebRTC ICE servers configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const processIceQueue = async () => {
    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding queued ice candidate:', err);
        }
      }
    }
  };

  useEffect(() => {
    // 1. Ask for local media (camera/mic) permission
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (session.isIncoming) {
          setCallStatus('Incoming video call...');
        } else {
          setCallStatus('Calling and waiting...');
          // Trigger the call signal to target recipient
          initiateWebRTCPeerCall(stream);
        }
      })
      .catch((err) => {
        console.error('Failed to get media devices:', err);
        setCallStatus('Permission denied (Microphone/Camera)');
      });

    // 2. Map global Socket signal receivers
    socket.on('call_accepted', async (signal) => {
      setCallStatus('Connecting...');
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
          await processIceQueue();
          setCallConnected(true);
          setCallStatus('Active Call');
        } catch (err) {
          console.error('Error accepting call session:', err);
        }
      }
    });

    socket.on('call_declined', () => {
      setCallStatus('Call Declined');
      setTimeout(cleanupCall, 1500);
    });

    socket.on('call_ended', () => {
      cleanupCall();
    });

    socket.on('receive_ice_candidate', async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ice candidate:', err);
        }
      } else {
        iceCandidatesQueue.current.push(candidate);
      }
    });

    return () => {
      socket.off('call_accepted');
      socket.off('call_declined');
      socket.off('call_ended');
      socket.off('receive_ice_candidate');
      cleanupCall();
    };
  }, []);

  const initiateWebRTCPeerCall = async (stream) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    // Add local tracks to peer
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // Handle remote video stream track arrival
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ICE candidates negotiation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send_ice_candidate', {
          toId: session.targetId,
          candidate: event.candidate
        });
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call_user', {
        userToCall: session.targetId,
        signalData: offer,
        fromId: session.callerId,
        fromName: session.callerName
      });
    } catch (err) {
      console.error(err);
    }
  };

  const acceptCall = async () => {
    setCallStatus('Connecting...');
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send_ice_candidate', {
          toId: session.callerId,
          candidate: event.candidate
        });
      }
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(session.signal));
      await processIceQueue();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer_call', {
        toId: session.callerId,
        signalData: answer
      });

      setCallConnected(true);
      setCallStatus('Active Call');
    } catch (err) {
      console.error('Call accept description error:', err);
    }
  };

  const declineCall = () => {
    socket.emit('decline_call', { toId: session.callerId });
    cleanupCall();
  };

  const hangupCall = () => {
    const partnerId = session.isIncoming ? session.callerId : session.targetId;
    socket.emit('hangup_call', { toId: partnerId });
    cleanupCall();
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOff(!videoTrack.enabled);
      }
    }
  };

  const cleanupCall = () => {
    // Stop local video camera and microphones
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    onClose();
  };


  return (
    <div className="modal-overlay">
      <div className="call-modal">
        {!callConnected ? (
          // Inactive Connecting Panel / Calling Notification
          <div className="call-notification-panel">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
              className="call-avatar" 
              alt="Avatar" 
            />
            <div className="call-name">
              {session.isIncoming ? session.callerName : session.targetName}
            </div>
            <div className="call-status-label">{callStatus}</div>
            
            <div className="call-actions-row">
              {session.isIncoming ? (
                <>
                  <button className="call-control-btn accept" onClick={acceptCall}>
                    <PhoneCall size={18} /> Accept
                  </button>
                  <button className="call-control-btn decline" onClick={declineCall}>
                    Decline
                  </button>
                </>
              ) : (
                <button className="call-control-btn decline" onClick={hangupCall}>
                  Cancel Call
                </button>
              )}
            </div>
          </div>
        ) : (
          // Active Streaming grid showing both local and remote cameras
          <>
            <div className="stream-grid">
              <div className="stream-container">
                <video ref={localVideoRef} autoPlay muted playsInline></video>
                <div className="stream-label">You</div>
              </div>
              <div className="stream-container">
                <video ref={remoteVideoRef} autoPlay playsInline></video>
                <div className="stream-label">
                  {session.isIncoming ? session.callerName : session.targetName}
                </div>
              </div>
            </div>

            <div className="stream-controls-bar">
              <button 
                className={`round-control-btn ${micMuted ? 'active' : ''}`} 
                onClick={toggleMic}
                title={micMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <button 
                className={`round-control-btn ${cameraOff ? 'active' : ''}`} 
                onClick={toggleCamera}
                title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {cameraOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
              </button>

              <button className="round-control-btn hangup" onClick={hangupCall} title="Hangup Call">
                <PhoneOff size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
