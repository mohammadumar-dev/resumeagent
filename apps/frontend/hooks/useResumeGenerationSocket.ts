import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type AgentStatus = "STARTED" | "SUCCESS" | "FAILED";

export function useResumeGenerationSocket(
  userId?: string | null,
  resetKey?: number,
) {
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setStatuses({});
      setConnectionError(null);
      return;
    }

    const socketUrl = `${API_BASE_URL.replace(/\/$/, "")}/ws`;
    const socket = new SockJS(socketUrl);
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setConnectionError(null);
      client.subscribe(
        `/topic/resume-status/${userId}`,
        (message) => {
          const data = JSON.parse(message.body);
          const nextStatus = data.status as AgentStatus;
          setStatuses((prev) => ({
            ...prev,
            [data.agentName]: nextStatus,
          }));
        }
      );
    };
    client.onStompError = (frame) => {
      const message =
        frame.headers?.message ||
        frame.body ||
        "WebSocket error while receiving resume status.";
      setConnectionError(message);
    };
    client.onWebSocketError = () => {
      setConnectionError("WebSocket connection failed.");
    };

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [userId]);

  useEffect(() => {
    if (resetKey !== undefined) {
      setStatuses({});
      setConnectionError(null);
    }
  }, [resetKey]);

  return { statuses, connectionError };
}
