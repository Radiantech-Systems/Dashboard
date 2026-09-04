import axios from "axios";
import type {
  DeviceSummary,
  TemperatureHistoryPoint,
  FootageClip,
  PowerEvent,
  AISnapshot,
} from "../types/telemetry";

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
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const JETSON_VIDEO_URL = "http://192.168.1.155:5000";
const API_KEY = import.meta.env.VITE_API_KEY || "";
export const WS_URL = API_KEY
  ? `${import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/telemetry"}?api_key=${encodeURIComponent(API_KEY)}`
  : (import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/telemetry");

const client = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: API_KEY ? { "X-API-Key": API_KEY } : {},
});

export async function getDashboard(): Promise<{ devices: DeviceSummary[] }> {
  const { data } = await client.get("/dashboard");
  return data;
}

export async function getSystemInfo(deviceId?: string) {
  const { data } = await client.get("/system-info", { params: { device_id: deviceId } });
  return data;
}

export async function getPerformance(deviceId?: string) {
  const { data } = await client.get("/performance", { params: { device_id: deviceId } });
  return data;
}

export async function getPower(deviceId?: string) {
  const { data } = await client.get("/power", { params: { device_id: deviceId } });
  return data;
}

export async function getNetwork(deviceId?: string) {
  const { data } = await client.get("/network", { params: { device_id: deviceId } });
  return data;
}

export type RangePreset = "last_hour" | "last_day" | "last_week" | "custom";

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
  if (params.deviceId) search.set("device_id", params.deviceId);
  if (params.range) search.set("range", params.range);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  if (API_KEY) search.set("api_key", API_KEY);
  return `${API_URL}/temperature/history/export?${search.toString()}`;
}

export async function getFootage(_params: {
  deviceId?: string;
  range?: Exclude<RangePreset, "custom">;
  start?: string;
  end?: string;
}): Promise<FootageClip[]> {
  const { data } = await axios.get(
    `${JETSON_VIDEO_URL}/videos`,
    { timeout: 8000 }
  );

  return data.map((video: { name: string; path: string }) => ({
    name: video.name,
    url: `/video/${video.path}`,
    path: video.path,
  }));
}

export function footageClipUrl(relativeUrl: string): string {
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  return `${JETSON_VIDEO_URL}${relativeUrl}`;
}
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

