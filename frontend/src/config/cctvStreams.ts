// Cameras shown on the "Live CCTV Streams" table and reachable at
// /live/<path>. Two kinds of source are supported:
//
// 1. "mediamtx" — a camera reached via RTSP and pulled in through
//    MediaMTX (Docker, running on the server), re-served as HLS. This
//    is what the Ubuntu server's own webcam uses: its local RTSP
//    server (port 8554) is the source, configured in
//    docker/mediamtx.yml under "paths:".
//
// 2. "mjpeg" — streamed directly from a device's own camera via a
//    Flask server (jetson-agent/live_stream_server.py). Only use this
//    for a device that actually has its own camera attached.
export interface CctvStream {
  label: string;
  path: string; // used in the /live/<path> URL — keep it URL-safe
  source: "mjpeg" | "mediamtx";
  // For source: "mjpeg" — full URL to the device's stream endpoint.
  streamUrl?: string;
}

export const CCTV_STREAMS: CctvStream[] = [
  {
    label: "Front Gate (Ubuntu server webcam)",
    path: "front_gate",
    source: "mediamtx",
  },
  // Only add an "mjpeg" entry for a device that actually has its own
  // camera attached (the Jetson AGX Orin in this setup does not).
  // {
  //   label: "Jetson Camera",
  //   path: "jetson_camera",
  //   source: "mjpeg",
  //   streamUrl: "http://192.168.1.155:5001/video_feed",
  // },
];
