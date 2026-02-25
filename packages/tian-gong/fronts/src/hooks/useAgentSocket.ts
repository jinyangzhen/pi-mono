import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';

interface WSMessage {
  type: string;
  payload?: unknown;
}

interface WSConnectedPayload {
  sessionId: string;
  cols?: number;
  rows?: number;
  uiMode: 'tui' | 'web';
}

interface WSErrorPayload {
  sessionId?: string;
  message: string;
  code?: string;
}

interface AgentEventPayload {
  sessionId: string;
  event: unknown;
}

interface UseAgentSocketOptions {
  sessionId: string;
  userId: string;
  mode?: 'tui' | 'web';
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseAgentSocketResult {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  events: AgentEventPayload[];
  sendPrompt: (prompt: string) => void;
  abort: () => void;
  disconnect: () => void;
}

export function useAgentSocket({
  sessionId,
  userId,
  mode = 'web',
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseAgentSocketOptions): UseAgentSocketResult {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AgentEventPayload[]>([]);

  const selectedModel = useChatStore((state) => state.selectedModel);

  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!sessionId || !userId) {
      setError('Missing sessionId or userId');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:5000/ws?session=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(userId)}&mode=${mode}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`WebSocket connected: session=${sessionId}`);
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;

        switch (message.type) {
          case 'connected':
            const connectedPayload = message.payload as WSConnectedPayload;
            console.log('WebSocket connection confirmed:', connectedPayload);
            setIsConnected(true);
            setError(null);
            break;

          case 'agent_event':
            const agentEventPayload = message.payload as AgentEventPayload;
            setEvents((prev) => [...prev, agentEventPayload]);
            break;

          case 'error':
            const errorPayload = message.payload as WSErrorPayload;
            setError(errorPayload.message);
            break;

          case 'message_complete':
          case 'aborted':
          case 'resize_ack':
            // Acknowledge these events silently
            break;

          default:
            console.warn('Unknown WebSocket message type:', message.type);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
      setSocket(null);

      // Attempt reconnection if enabled and max attempts not reached
      if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    setSocket(ws);
  }, [sessionId, userId, mode, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socket) {
      socket.close();
      setSocket(null);
    }

    setIsConnected(false);
  }, [socket]);

  const sendPrompt = useCallback(
    (prompt: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message: WSMessage = {
          type: 'input',
          payload: selectedModel ? {
            data: prompt,
            model: {
              providerId: selectedModel.providerId,
              providerName: selectedModel.providerName,
              modelId: selectedModel.modelId,
              modelName: selectedModel.modelName,
            },
          } : { data: prompt },
        };
        socket.send(JSON.stringify(message));
      } else {
        setError('WebSocket is not connected');
      }
    },
    [socket, selectedModel],
  );

  const abort = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        type: 'abort',
      };
      socket.send(JSON.stringify(message));
    } else {
      setError('WebSocket is not connected');
    }
  }, [socket]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    isConnected,
    error,
    events,
    sendPrompt,
    abort,
    disconnect,
  };
}
