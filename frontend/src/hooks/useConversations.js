import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api';
import { useSocket } from '../context/SocketContext';

/**
 * Manages the full conversation list for a logged-in user.
 * Handles presence updates, starting DMs, creating group chats,
 * and real-time sidebar updates (lastMessage, unread counts, ordering).
 */
export function useConversations(dbUser, clerkUser) {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [usersList,     setUsersList]     = useState([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [unreadCounts,  setUnreadCounts]  = useState({});   // { convoId: number }
  const activeConvoIdRef = useRef(null);

  // ── Initial data load ──────────────────────────────────────────
  useEffect(() => {
    if (!dbUser) return;
    setIsLoading(true);

    Promise.all([
      API.get('/api/users'),
      API.get(`/api/conversations/user/${dbUser._id}`),
    ])
      .then(([usersRes, convosRes]) => {
        // Filter self out of the users list
        setUsersList(
          usersRes.data.filter(u => u.clerkId !== clerkUser?.id)
        );
        setConversations(convosRes.data);
      })
      .catch(err => console.error('[useConversations] load error:', err))
      .finally(() => setIsLoading(false));
  }, [dbUser, clerkUser]);

  // ── Presence updates from socket ───────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onPresence = ({ userId, isOnline }) => {
      setUsersList(prev =>
        prev.map(u => u._id === userId ? { ...u, isOnline } : u)
      );
      setConversations(prev =>
        prev.map(c => ({
          ...c,
          participants: c.participants.map(p =>
            p._id === userId ? { ...p, isOnline } : p
          ),
        }))
      );
    };

    socket.on('presence_update', onPresence);
    return () => socket.off('presence_update', onPresence);
  }, [socket]);

  // ── Real-time sidebar updates: new messages ────────────────────
  useEffect(() => {
    if (!socket || !dbUser) return;

    const onNewMessage = (msg) => {
      const msgConvoId = typeof msg.conversation === 'object'
        ? msg.conversation._id
        : msg.conversation;

      // Update the conversation's lastMessage and bump to top
      setConversations(prev => {
        const idx = prev.findIndex(c => c._id === msgConvoId);
        if (idx === -1) return prev; // unknown conversation — ignore

        const updated = {
          ...prev[idx],
          lastMessage: msg,
          updatedAt: msg.createdAt || new Date().toISOString(),
        };

        // Move to top
        const rest = [...prev];
        rest.splice(idx, 1);
        return [updated, ...rest];
      });

      // Increment unread if this conversation is NOT currently open
      // and the message is NOT from us
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      if (senderId !== dbUser._id && msgConvoId !== activeConvoIdRef.current) {
        setUnreadCounts(prev => ({
          ...prev,
          [msgConvoId]: (prev[msgConvoId] || 0) + 1,
        }));

        // Browser notification
        if (Notification.permission === 'granted') {
          const senderName = typeof msg.sender === 'object' ? msg.sender.username : 'Someone';
          new Notification(senderName, {
            body: msg.text || 'Sent a message',
            icon: typeof msg.sender === 'object' ? msg.sender.imageUrl : undefined,
            tag: msgConvoId, // collapse repeated notifs for same convo
          });
        }
      }
    };

    socket.on('receive_message', onNewMessage);
    return () => socket.off('receive_message', onNewMessage);
  }, [socket, dbUser]);

  // ── Request browser notification permission ────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ── Mark conversation as read (clear unread badge) ─────────────
  const markConvoRead = useCallback((convoId) => {
    activeConvoIdRef.current = convoId;
    setUnreadCounts(prev => {
      if (!prev[convoId]) return prev;
      const next = { ...prev };
      delete next[convoId];
      return next;
    });
  }, []);

  // ── Start a 1-on-1 DM ─────────────────────────────────────────
  const startChat = useCallback(async (recipient) => {
    if (!dbUser) return null;
    try {
      const res = await API.post('/api/conversations', {
        senderId:    dbUser._id,
        recipientId: recipient._id,
      });
      const convo = res.data;
      setConversations(prev =>
        prev.some(c => c._id === convo._id) ? prev : [convo, ...prev]
      );
      return convo;
    } catch (err) {
      console.error('[useConversations] startChat error:', err);
      return null;
    }
  }, [dbUser]);

  // ── Create group chat ──────────────────────────────────────────
  const createGroup = useCallback(async (name, participantIds) => {
    try {
      const res = await API.post('/api/conversations/group', { name, participantIds });
      const convo = res.data;
      setConversations(prev => [convo, ...prev]);
      return convo;
    } catch (err) {
      console.error('[useConversations] createGroup error:', err);
      return null;
    }
  }, []);

  // ── Prepend a conversation after returning from ChatPanel ──────
  const upsertConversation = useCallback((convo) => {
    setConversations(prev =>
      prev.some(c => c._id === convo._id)
        ? prev.map(c => c._id === convo._id ? convo : c)
        : [convo, ...prev]
    );
  }, []);

  return {
    conversations,
    usersList,
    isLoading,
    unreadCounts,
    startChat,
    createGroup,
    upsertConversation,
    markConvoRead,
  };
}
