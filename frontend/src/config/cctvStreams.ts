// Cameras shown on the "Live CCTV Streams" table and reachable at
// /live/<path>.
//
// "mediamtx" — camera/RTSP stream pulled by MediaMTX and re-served
// as HLS to the Dashboard.

export interface CctvStream {
  label: string;
  path: string;
  source: "mjpeg" | "mediamtx";
  streamUrl?: string;
}

export const CCTV_STREAMS: CctvStream[] = [
  {
    label: "Front Gate (CP Plus)",
    path: "front_gate",
    source: "mediamtx",
  },
  {
    label: "Front Gate AI",
    path: "front_gate_ai",
    source: "mediamtx",
  },
];
