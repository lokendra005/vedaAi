import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WsEvent, WsPayload } from '../types/assignment.js';

const clients = new Map<string, Set<WebSocket>>();

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const assignmentId = url.searchParams.get('assignmentId');

    if (assignmentId) {
      if (!clients.has(assignmentId)) clients.set(assignmentId, new Set());
      clients.get(assignmentId)!.add(ws);
    }

    ws.on('close', () => {
      if (assignmentId) {
        clients.get(assignmentId)?.delete(ws);
      }
    });
  });

  return wss;
}

export function broadcast(assignmentId: string, event: WsEvent, payload: WsPayload): void {
  const message = JSON.stringify({ event, payload });
  const subs = clients.get(assignmentId);
  if (!subs) return;

  for (const ws of subs) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}
