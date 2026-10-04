import axios from "axios";
import type {
  DeviceSummary,
  TemperatureHistoryPoint,
  FootageClip,
  PowerEvent,
  AISnapshot,
} from "../types/telemetry";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const JETSON_VIDEO_URL =
  import.meta.env.VITE_JETSON_VIDEO_URL || "http://192.168.1.155:5000";

export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://localhost:8000/ws/telemetry";

const client = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  withCredentials: true,
});


// =========================
// Authentication
// =========================

export interface AuthResponse {
  authenticated: boolean;
  username?: string;
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>("/auth/login", {
    username,
    password,
  });

  return data;
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const { data } = await client.get<AuthResponse>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await client.post("/auth/logout");
}


// =========================
// AI Snapshots
// =========================

export async function getAISnapshots(params?: {
  category?: "vehicle" | "human" | "other";
  camera?: string;
  limit?: number;
}): Promise<AISnapshot[]> {
  const { data } = await client.get("/ai-snapshots", {
    params,
  });

  return data;
}

export function aiSnapshotImageUrl(relativeUrl: string): string {
  if (
    relativeUrl.startsWith("http://") ||
    relativeUrl.startsWith("https://")
  ) {
    return relativeUrl;
  }

  return `${API_URL}${relativeUrl}`;
}


// =========================
// Dashboard
// =========================

export async function getDashboard(): Promise<{
  devices: DeviceSummary[];
}> {
  const { data } = await client.get("/dashboard");
  return data;
}


// =========================
// System Information
// =========================

export async function getSystemInfo(deviceId?: string) {
  const { data } = await client.get("/system-info", {
    params: {
      device_id: deviceId,
    },
  });

  return data;
}


// =========================
// Performance
// =========================

export async function getPerformance(deviceId?: string) {
  const { data } = await client.get("/performance", {
    params: {
      device_id: deviceId,
    },
  });

  return data;
}


// =========================
// Power
// =========================

export async function getPower(deviceId?: string) {
  const { data } = await client.get("/power", {
    params: {
      device_id: deviceId,
    },
  });

  return data;
}


// =========================
// Network
// =========================

export async function getNetwork(deviceId?: string) {
  const { data } = await client.get("/network", {
    params: {
      device_id: deviceId,
    },
  });

  return data;
}


// =========================
// Temperature
// =========================

export type RangePreset =
  | "last_hour"
  | "last_day"
  | "last_week"
  | "custom";

export async function getTemperatureHistory(params: {
  deviceId?: string;
  range?: Exclude<RangePreset, "custom">;
  start?: string;
  end?: string;
}): Promise<TemperatureHistoryPoint[]> {
  const { data } = await client.get("/temperature/history", {
    params: {
      device_id: params.deviceId,
      range: params.range,
      start: params.start,
      end: params.end,
    },
  });

  return data;
}

export function buildTemperatureExportUrl(params: {
  deviceId?: string;
  range?: Exclude<RangePreset, "custom">;
  start?: string;
  end?: string;
}): string {
  const search = new URLSearchParams();

  if (params.deviceId) {
    search.set("device_id", params.deviceId);
  }

  if (params.range) {
    search.set("range", params.range);
  }

  if (params.start) {
    search.set("start", params.start);
  }

  if (params.end) {
    search.set("end", params.end);
  }

  return `${API_URL}/temperature/history/export?${search.toString()}`;
}


// =========================
// Recorded Footage
// =========================

export async function getFootage(_params: {
  deviceId?: string;
  range?: Exclude<RangePreset, "custom">;
  start?: string;
  end?: string;
}): Promise<FootageClip[]> {
  const { data } = await axios.get(
    `${JETSON_VIDEO_URL}/videos`,
    {
      timeout: 8000,
    }
  );

  return data.map((video: { name: string; path: string }) => ({
    name: video.name,
    url: `/video/${video.path}`,
    path: video.path,
  }));
}

export function footageClipUrl(relativeUrl: string): string {
  if (
    relativeUrl.startsWith("http://") ||
    relativeUrl.startsWith("https://")
  ) {
    return relativeUrl;
  }

  return `${JETSON_VIDEO_URL}${relativeUrl}`;
}


// =========================
// Power Events
// =========================

export async function getPowerEvents(params: {
  deviceId?: string;
  range?: Exclude<RangePreset, "custom">;
  start?: string;
  end?: string;
}): Promise<PowerEvent[]> {
  const { data } = await client.get("/power/events", {
    params: {
      device_id: params.deviceId,
      range: params.range,
      start: params.start,
      end: params.end,
    },
  });

  return data;
}


export default client;
