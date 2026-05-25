'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WsMessage } from '@/types';

// Dynamically determine WebSocket URL from API URL or fallback
const getWsUrl = () => {
  if (typeof window === 'undefined') return '';
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  // Replace http:// or https:// with ws:// or wss://
  return apiUrl.replace(/^http/, 'ws') + '/ws';
};

export function useWebSocket(
  assignmentId: string | null,
  onMessage: (msg: WsMessage) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!assignmentId) return;
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    try {
      const ws = new WebSocket(`${wsUrl}?assignmentId=${assignmentId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WsMessage;
          onMessageRef.current(data);
        } catch {
          /* ignore malformed */
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (assignmentId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };
    } catch (err) {
      console.warn('WebSocket connection attempt failed:', err);
      setIsConnected(false);
      if (assignmentId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    }
  }, [assignmentId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect trigger on manual close
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    };
  }, [connect]);

  return { isConnected };
}

