import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api';
import { useSocket } from '../context/SocketContext';

/**
 * Manages message history, real-time updates, typing indicators,
 * and read receipts for a single conversation.
 */
export function useMessages(convoId, currentUserId) {
  const { socket }          = useSocket();
  const [messages, setMessages]   = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const typingTimerRef            = useRef(null);
  const isTypingRef               = useRef(false);

  // ── Fetch history ──────────────────────────────────────────────
  useEffect(() => {
    if (!convoId) return;
    setIsLoading(true);
    setMessages([]);

    API.get(`/api/conversations/${convoId}/messages`)
      .then(r => setMessages(r.data))
      .catch(err => console.error('[useMessages] fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [convoId]);

  // ── Join room + mark read ──────────────────────────────────────
  useEffect(() => {
    if (!socket || !convoId || !currentUserId) return;
    socket.emit('join_conversation', convoId);
    socket.emit('mark_read', { conversationId: convoId, userId: currentUserId });
  }, [socket, convoId, currentUserId]);

  // ── Real-time socket events ────────────────────────────────────
  useEffect(() => {
    if (!socket || !convoId) return;

    const onReceiveMessage = (msg) => {
      // msg.conversation may be an ObjectId string or a populated object
      const msgConvoId = typeof msg.conversation === 'object' ? msg.conversation._id : msg.conversation;
      if (msgConvoId !== convoId) return;
      setMessages(prev => [...prev, msg]);
      socket.emit('mark_read', { conversationId: convoId, userId: currentUserId });
    };

    const onTyping = ({ conversationId, username, isTyping }) => {
      if (conversationId !== convoId) return;
      setTypingUser(isTyping ? username : null);
    };

    const onMarkedRead = ({ conversationId, userId: readerId }) => {
      if (conversationId !== convoId) return;
      // readerId is the user who just read the messages — add them to readBy
      setMessages(prev =>
        prev.map(m =>
          m.readBy.includes(readerId) ? m : { ...m, readBy: [...m.readBy, readerId] }
        )
      );
    };

    socket.on('receive_message',     onReceiveMessage);
    socket.on('typing_update',       onTyping);
    socket.on('messages_marked_read',onMarkedRead);

    return () => {
      socket.off('receive_message',      onReceiveMessage);
      socket.off('typing_update',        onTyping);
      socket.off('messages_marked_read', onMarkedRead);
    };
  }, [socket, convoId, currentUserId]);

  // ── Send message ───────────────────────────────────────────────
  const sendMessage = useCallback((text) => {
    if (!socket || !text.trim()) return;
    socket.emit('send_message', {
      conversationId: convoId,
      senderId:       currentUserId,
      text:           text.trim(),
    });
    // Stop typing
    stopTyping();
  }, [socket, convoId, currentUserId]);

  // ── Typing signals ─────────────────────────────────────────────
  const startTyping = useCallback((username) => {
    if (!socket) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing_start', { conversationId: convoId, username });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => stopTyping(username), 2500);
  }, [socket, convoId]);

  const stopTyping = useCallback((username) => {
    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    socket.emit('typing_stop', { conversationId: convoId, username });
  }, [socket, convoId]);

  return { messages, typingUser, isLoading, sendMessage, startTyping, stopTyping };
}
