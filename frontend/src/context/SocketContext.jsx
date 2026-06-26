import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

const resolveSocketUrl = () => {
  const configuredUrl = normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '');

  if (configuredUrl) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configuredUrl)) {
      return window.location.origin;
    }

    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:5000';
};

export function SocketProvider({ userId, children }) {
  const [socket, setSocket]           = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(resolveSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('register_user', userId);
    });

    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('reconnect',  () => {
      setIsConnected(true);
      newSocket.emit('register_user', userId);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
