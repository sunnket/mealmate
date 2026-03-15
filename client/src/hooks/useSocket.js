import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(events = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    for (const [event, handler] of Object.entries(events)) {
      socket.on(event, handler);
    }

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
