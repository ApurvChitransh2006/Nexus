import React, { createContext, useContext, useState, useCallback } from 'react';

const CallContext = createContext(null);

/**
 * Global call session state so any component can initiate / receive / end calls.
 *
 * callSession shape:
 *   { isIncoming, callerId, callerName, signal?, targetId?, targetName? }
 */
export function CallProvider({ children }) {
  const [callActive,  setCallActive]  = useState(false);
  const [callSession, setCallSession] = useState(null);

  const initiateCall = useCallback((caller, target) => {
    setCallSession({
      isIncoming:  false,
      callerId:    caller._id,
      callerName:  caller.username,
      targetId:    target._id,
      targetName:  target.username,
    });
    setCallActive(true);
  }, []);

  const receiveCall = useCallback(({ signal, fromId, fromName }) => {
    setCallSession({
      isIncoming: true,
      callerId:   fromId,
      callerName: fromName,
      signal,
    });
    setCallActive(true);
  }, []);

  const endCall = useCallback(() => {
    setCallActive(false);
    setCallSession(null);
  }, []);

  return (
    <CallContext.Provider value={{ callActive, callSession, initiateCall, receiveCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
