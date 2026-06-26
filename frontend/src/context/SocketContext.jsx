import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ userId, children }) {
  const [socket, setSocket]           = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:5000',
      { transports: ['websocket', 'polling'], reconnectionAttempts: 5 }
    );

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
