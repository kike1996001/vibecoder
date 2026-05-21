const PARTY_HOST = import.meta.env.VITE_PARTYKIT_HOST;
const PartySocket = (typeof window !== 'undefined' ? (window as any).PartySocket : undefined) as any;

export interface UserPresence {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { file: string; line: number; column: number };
  status: 'active' | 'idle' | 'typing';
}

interface CursorUpdate {
  type: 'cursor';
  userId: string;
  x: number;
  y: number;
  file: string;
}

interface SelectionUpdate {
  type: 'selection';
  userId: string;
  file: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

interface ChatMessage {
  type: 'chat';
  userId: string;
  message: string;
  timestamp: number;
}

type PresenceMessage = CursorUpdate | SelectionUpdate | ChatMessage;

export class PresenceService {
  private socket: any | null = null;
  private userId: string;
  private listeners: Map<string, Set<Function>> = new Map();
  private presence: Map<string, UserPresence> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(userId: string, roomId: string) {
    this.userId = userId;
    this.socket = new PartySocket({
      host: PARTY_HOST,
      room: roomId,
      query: { userId },
    });

    this.setupSocket();
    this.startHeartbeat();
  }

  private setupSocket() {
    if (!this.socket) return;

    this.socket.addEventListener('open', () => {
      this.broadcast({
        type: 'join',
        userId: this.userId,
        timestamp: Date.now(),
      });
    });

    this.socket.addEventListener('message', (event: any) => {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      this.handleMessage(data);
    });

    this.socket.addEventListener('close', () => {
      this.stopHeartbeat();
    });
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'presence':
        this.presence.set(data.userId, data.presence);
        this.emit('presenceChange', Array.from(this.presence.values()));
        break;
      case 'cursor':
        this.emit('cursor', data);
        break;
      case 'selection':
        this.emit('selection', data);
        break;
      case 'chat':
        this.emit('chat', data);
        break;
      case 'join':
        this.emit('userJoined', data.userId);
        break;
      case 'leave':
        this.presence.delete(data.userId);
        this.emit('presenceChange', Array.from(this.presence.values()));
        this.emit('userLeft', data.userId);
        break;
    }
  }

  private broadcast(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({
        type: 'heartbeat',
        userId: this.userId,
        timestamp: Date.now(),
      });
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  // Public API
  updateCursor(x: number, y: number, file: string) {
    this.broadcast({
      type: 'cursor',
      userId: this.userId,
      x,
      y,
      file,
    });
  }

  updateSelection(
    file: string,
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number
  ) {
    this.broadcast({
      type: 'selection',
      userId: this.userId,
      file,
      startLine,
      startColumn,
      endLine,
      endColumn,
    });
  }

  sendChat(message: string) {
    this.broadcast({
      type: 'chat',
      userId: this.userId,
      message,
      timestamp: Date.now(),
    });
  }

  updateStatus(status: UserPresence['status']) {
    this.broadcast({
      type: 'presence',
      userId: this.userId,
      presence: { status },
    });
  }

  // Event handling
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  destroy() {
    this.stopHeartbeat();
    this.broadcast({
      type: 'leave',
      userId: this.userId,
    });
    this.socket?.close();
  }
}

// React Hook
import { useEffect, useRef, useState, useCallback } from 'react';

export function usePresence(roomId: string, userId: string) {
  const serviceRef = useRef<PresenceService | null>(null);
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorUpdate>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const service = new PresenceService(userId, roomId);
    serviceRef.current = service;

    service.on('presenceChange', (users: UserPresence[]) => setUsers(users));
    service.on('cursor', (cursor: CursorUpdate) => {
      setCursors((prev) => new Map(prev).set(cursor.userId, cursor));
    });
    service.on('chat', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => service.destroy();
  }, [roomId, userId]);

  const updateCursor = useCallback((x: number, y: number, file: string) => {
    serviceRef.current?.updateCursor(x, y, file);
  }, []);

  const sendMessage = useCallback((message: string) => {
    serviceRef.current?.sendChat(message);
  }, []);

  return {
    users,
    cursors,
    messages,
    updateCursor,
    sendMessage,
  };
}
