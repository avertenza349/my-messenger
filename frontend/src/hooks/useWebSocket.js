import { useEffect, useRef } from "react";

export function useWebSocket(token, onMessage) {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    };

    return () => ws.close();
  }, [token]);
}