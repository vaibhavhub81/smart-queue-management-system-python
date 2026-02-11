import { useState, useEffect, useRef } from 'react';
import { getAuthTokens } from '../utils/auth';

const useWebSocket = () => {
  const [lastJsonMessage, setLastJsonMessage] = useState<any>(null);
  const webSocketUrl = `ws://${window.location.host.split(':')[0]}:8000/ws/notifications/`;
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const { accessToken } = getAuthTokens();
    if (!accessToken) return;

    ws.current = new WebSocket(`${webSocketUrl}?token=${accessToken}`);
    
    ws.current.onopen = () => console.log("WebSocket opened");
    ws.current.onclose = () => console.log("WebSocket closed");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastJsonMessage(message);
    };
    
    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, [webSocketUrl]);

  return lastJsonMessage;
};

export default useWebSocket;
