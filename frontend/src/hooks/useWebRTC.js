import { useRef, useCallback, useState } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Encapsulates all WebRTC peer connection logic.
 * Returns refs for video elements and control functions.
 */
export function useWebRTC({ session, onCallConnected, onCallEnded }) {
  const { socket }         = useSocket();
  const peerRef            = useRef(null);
  const localStreamRef     = useRef(null);
  const remoteStreamRef    = useRef(null);
  const iceCandidateQueue  = useRef([]);

  // Element refs for direct DOM access inside event handlers
  const localVideoElRef  = useRef(null);
  const remoteVideoElRef = useRef(null);

  // Callback refs: auto-assign srcObject when the <video> element mounts
  const localVideoRef = useCallback((node) => {
    localVideoElRef.current = node;
    if (node && localStreamRef.current) {
      node.srcObject = localStreamRef.current;
    }
  }, []);

  const remoteVideoRef = useCallback((node) => {
    remoteVideoElRef.current = node;
    if (node && remoteStreamRef.current) {
      node.srcObject = remoteStreamRef.current;
    }
  }, []);

  const [micMuted,   setMicMuted]   = useState(false);
  const [cameraOff,  setCameraOff]  = useState(false);
  const [callStatus, setCallStatus] = useState('Initializing...');

  const RTC_CONFIG = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  // ── Drain queued ICE candidates once remote description is set ─
  const drainIceQueue = useCallback(async () => {
    const pc = peerRef.current;
    if (!pc?.remoteDescription?.type) return;
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[WebRTC] ice queue drain error', e); }
    }
  }, []);

  // ── Shared peer setup ──────────────────────────────────────────
  const setupPeer = useCallback((stream, remoteId) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerRef.current = pc;

    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    pc.ontrack = (evt) => {
      if (evt.streams[0]) {
        remoteStreamRef.current = evt.streams[0];
        if (remoteVideoElRef.current) {
          remoteVideoElRef.current.srcObject = evt.streams[0];
        }
      }
    };

    pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        socket.emit('send_ice_candidate', { toId: remoteId, candidate: evt.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('Active Call');
        onCallConnected?.();
      }
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        cleanup();
      }
    };

    return pc;
  }, [socket, onCallConnected]);

  // ── Get local media ────────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoElRef.current) localVideoElRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      setCallStatus('Camera/Mic permission denied');
      throw err;
    }
  }, []);

  // ── Outgoing call: create offer ────────────────────────────────
  const initiateCall = useCallback(async () => {
    try {
      setCallStatus('Calling...');
      const stream = await startLocalStream();
      const pc = setupPeer(stream, session.targetId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call_user', {
        userToCall: session.targetId,
        signalData: offer,
        fromId:     session.callerId,
        fromName:   session.callerName,
      });
    } catch (err) {
      console.error('[WebRTC] initiateCall error:', err);
    }
  }, [session, socket, setupPeer, startLocalStream]);

  // ── Incoming call: accept ──────────────────────────────────────
  const acceptCall = useCallback(async () => {
    try {
      setCallStatus('Connecting...');
      const stream = await startLocalStream();
      const pc = setupPeer(stream, session.callerId);

      await pc.setRemoteDescription(new RTCSessionDescription(session.signal));
      await drainIceQueue();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer_call', { toId: session.callerId, signalData: answer });
      setCallStatus('Active Call');
      onCallConnected?.();
    } catch (err) {
      console.error('[WebRTC] acceptCall error:', err);
    }
  }, [session, socket, setupPeer, startLocalStream, drainIceQueue, onCallConnected]);

  // ── Handle remote answer (for caller) ─────────────────────────
  const handleCallAccepted = useCallback(async (signal) => {
    try {
      const pc = peerRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      await drainIceQueue();
      setCallStatus('Active Call');
      onCallConnected?.();
    } catch (err) {
      console.error('[WebRTC] handleCallAccepted error:', err);
    }
  }, [drainIceQueue, onCallConnected]);

  // ── Add remote ICE candidate ───────────────────────────────────
  const addRemoteIceCandidate = useCallback(async (candidate) => {
    const pc = peerRef.current;
    if (pc?.remoteDescription?.type) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[WebRTC] addIceCandidate error', e); }
    } else {
      iceCandidateQueue.current.push(candidate);
    }
  }, []);

  // ── Mic toggle ─────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicMuted(!track.enabled);
  }, []);

  // ── Camera toggle ──────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraOff(!track.enabled);
  }, []);

  // ── Hang up / cleanup ──────────────────────────────────────────
  const hangup = useCallback((partnerId) => {
    socket?.emit('hangup_call', { toId: partnerId });
    cleanup();
  }, [socket]);

  const decline = useCallback(() => {
    socket?.emit('decline_call', { toId: session.callerId });
    cleanup();
  }, [socket, session]);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerRef.current?.close();
    peerRef.current        = null;
    remoteStreamRef.current = null;
    onCallEnded?.();
  }, [onCallEnded]);

  return {
    localVideoRef,
    remoteVideoRef,
    micMuted,
    cameraOff,
    callStatus,
    setCallStatus,
    initiateCall,
    acceptCall,
    handleCallAccepted,
    addRemoteIceCandidate,
    toggleMic,
    toggleCamera,
    hangup,
    decline,
    cleanup,
  };
}
