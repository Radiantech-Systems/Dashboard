import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../api/client";
import type { TelemetryPayload } from "../types/telemetry";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface TelemetryMessage {
  type: "telemetry";
  device_id: string;
  data: TelemetryPayload;
}

/**
 * Opens a persistent WebSocket to the backend and keeps the latest
 * telemetry payload(s) in state. Auto-reconnects with backoff so the
 * dashboard recovers automatically after a network blip or backend
 * restart, with no page refresh required.
 */
export function useTelemetrySocket() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [byDevice, setByDevice] = useState<Record<string, TelemetryPayload>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      if (!mountedRef.current) return;
      setStatus("connecting");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const msg: TelemetryMessage = JSON.parse(event.data);
          if (msg.type === "telemetry") {
            setByDevice((prev) => ({ ...prev, [msg.device_id]: msg.data }));
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus("disconnected");
        const delay = Math.min(1000 * 2 ** retryRef.current, 10000);
        retryRef.current += 1;
        setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
    };
  }, []);

  const devices = Object.keys(byDevice);
  const primary = devices.length > 0 ? byDevice[devices[0]] : undefined;

  return { status, byDevice, devices, primary };
}
