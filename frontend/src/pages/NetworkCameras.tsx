import { useState } from "react";
import {
  Grid, Paper, Typography, Stack, Chip, Table, TableHead, TableRow,
  TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, Box,
  Snackbar, IconButton, Tooltip,
} from "@mui/material";
import WifiIcon from "@mui/icons-material/WifiOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownwardOutlined";
import VideocamIcon from "@mui/icons-material/VideocamOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNewOutlined";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import StatCard from "../components/StatCard";
import VideoPlayer from "../components/VideoPlayer";
import MjpegPlayer from "../components/MjpegPlayer";
import { CCTV_STREAMS } from "../config/cctvStreams";
import type { CctvStream } from "../config/cctvStreams";
import type { useTelemetrySocket } from "../hooks/useTelemetrySocket";

function liveViewUrl(path: string): string {
  return `${window.location.origin}/live/${path}`;
}

export default function NetworkCameras({ socket }: { socket: ReturnType<typeof useTelemetrySocket> }) {
  const network = socket.primary?.network;
  const cameras = socket.primary?.cameras ?? [];
  const [activeStream, setActiveStream] = useState<CctvStream | null>(null);
  const [copied, setCopied] = useState(false);

  function copyLink(path: string) {
    navigator.clipboard?.writeText(liveViewUrl(path));
    setCopied(true);
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <WifiIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6">Ethernet</Typography>
            <Chip
              size="small"
              label={network?.ethernet_status?.toUpperCase() ?? "--"}
              color={network?.ethernet_status === "up" ? "success" : "error"}
            />
          </Stack>
          <Stack spacing={1.25}>
            <Row label="IP Address" value={network?.ip_address} />
            <Row label="MAC Address" value={network?.mac_address} />
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Upload Speed"
          value={network?.upload_speed_kbps?.toFixed(0)}
          unit="kbps"
          icon={<ArrowUpwardIcon />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Download Speed"
          value={network?.download_speed_kbps?.toFixed(0)}
          unit="kbps"
          icon={<ArrowDownwardIcon />}
        />
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Onboard Cameras</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Resolution</TableCell>
                <TableCell>FPS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cameras.map((cam) => (
                <TableRow key={cam.name}>
                  <TableCell>{cam.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={cam.status} color={cam.status === "connected" ? "success" : "default"} />
                  </TableCell>
                  <TableCell>{cam.resolution ?? "--"}</TableCell>
                  <TableCell>{cam.fps ?? "--"}</TableCell>
                </TableRow>
              ))}
              {cameras.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">No cameras detected.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Live CCTV Streams</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Each camera has a direct, shareable link that opens straight to the
            live stream — no need to click through this page first.
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Camera</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Direct Link</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {CCTV_STREAMS.map((cam) => (
                <TableRow key={cam.path} hover>
                  <TableCell>{cam.label}</TableCell>
                  <TableCell><code>{cam.source}</code></TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {liveViewUrl(cam.path)}
                      </Typography>
                      <Tooltip title="Copy link">
                        <IconButton size="small" onClick={() => copyLink(cam.path)}>
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open in new tab">
                        <IconButton size="small" component="a" href={`/live/${cam.path}`} target="_blank" rel="noopener noreferrer">
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VideocamIcon />}
                      onClick={() => setActiveStream(cam)}
                    >
                      View Live
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {CCTV_STREAMS.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      No CCTV streams configured. Add one to
                      frontend/src/config/cctvStreams.ts.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      <Dialog open={!!activeStream} onClose={() => setActiveStream(null)} maxWidth="md" fullWidth>
        <DialogTitle>{activeStream?.label}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {activeStream?.source === "mjpeg" && activeStream.streamUrl && (
              <MjpegPlayer streamUrl={activeStream.streamUrl} />
            )}
            {activeStream?.source === "mediamtx" && (
              <VideoPlayer cameraPath={activeStream.path} />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link copied to clipboard"
      />
    </Grid>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value ?? "--"}</Typography>
    </Stack>
  );
}
