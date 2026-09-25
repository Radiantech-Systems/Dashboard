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
    label: "Main Stream (CP Plus)",
    path: "jetson1_raw",
    source: "mediamtx",
  },
  {
    label: "Processed AI Stream",
    path: "jetson1_ai",
    source: "mediamtx",
  },
];
