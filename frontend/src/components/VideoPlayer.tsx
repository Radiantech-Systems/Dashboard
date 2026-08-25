import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";

const MEDIAMTX_URL = import.meta.env.VITE_MEDIAMTX_URL || "http://localhost:8888";

interface VideoPlayerProps {
  /** The MediaMTX path name configured in docker/mediamtx.yml, e.g. "front_gate" */
  cameraPath: string;
}

/**
 * Plays a live HLS stream from the MediaMTX gateway.
 * - Chrome/Firefox/Edge: uses hls.js (MediaSource Extensions).
 * - Safari/iOS: has native HLS support, so hls.js is skipped entirely.
 */
export default function VideoPlayer({ cameraPath }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = `${MEDIAMTX_URL.replace(/\/$/, "")}/${cameraPath}/index.m3u8`;
    setStatus("loading");

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true, backBufferLength: 10 });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setStatus("playing");
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setStatus("error");
          setErrorMsg("Stream unavailable — check the camera is online and the MediaMTX path name is correct.");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari: native HLS
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
        setStatus("playing");
      });
      video.addEventListener("error", () => {
        setStatus("error");
        setErrorMsg("Stream unavailable — check the camera is online and the MediaMTX path name is correct.");
      });
    } else {
      setStatus("error");
      setErrorMsg("This browser doesn't support HLS playback.");
    }

    return () => {
      hls?.destroy();
    };
  }, [cameraPath]);

  return (
    <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000", borderRadius: 2, overflow: "hidden" }}>
      <video ref={videoRef} muted playsInline controls style={{ width: "100%", height: "100%", display: "block" }} />
      {status === "loading" && (
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <CircularProgress size={28} />
          <Typography variant="caption" color="text.secondary">Connecting to camera…</Typography>
        </Box>
      )}
      {status === "error" && (
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Alert severity="warning" sx={{ maxWidth: 360 }}>{errorMsg}</Alert>
        </Box>
      )}
    </Box>
  );
}
