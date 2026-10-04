import { useEffect, useState } from "react";
import {
  Grid, Paper, Typography, Stack, ToggleButton, ToggleButtonGroup,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Button, Dialog, DialogTitle, DialogContent, Box, Chip, IconButton,
  Tooltip, Snackbar,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNewOutlined";
import { getFootage, footageClipUrl } from "../api/client";
import type { RangePreset } from "../api/client";
import type { FootageClip } from "../types/telemetry";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "--";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function RecordedFootage() {
  const [range, setRange] = useState<Exclude<RangePreset, "custom">>("last_day");
  const [clips, setClips] = useState<FootageClip[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeClip, setActiveClip] = useState<FootageClip | null>(null);
  const [copied, setCopied] = useState(false);

  function copyClipLink(clip: FootageClip) {
    navigator.clipboard?.writeText(footageClipUrl(clip.url));
    setCopied(true);
  }

  async function fetchClips() {
    setLoading(true);
    try {
      const data = await getFootage({ range });
      setClips(data);
    } catch {
      // keep last known list on a transient error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClips();
    const id = setInterval(fetchClips, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MovieOutlinedIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6">Sliced Footage</Typography>
              <Chip size="small" label={`${clips.length} clip${clips.length === 1 ? "" : "s"}`} />
            </Stack>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={range}
              onChange={(_, v) => v && setRange(v)}
            >
              <ToggleButton value="last_hour">Last Hour</ToggleButton>
              <ToggleButton value="last_day">Last Day</ToggleButton>
              <ToggleButton value="last_week">Last Week</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Video recorded on the Jetson, sliced into fixed-length segments, and
            uploaded to the server automatically.
            {loading ? " (refreshing…)" : ""}
          </Typography>

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Started</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell align="right">Duration</TableCell>
                  <TableCell align="right">Size</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clips.map((clip) => (
                  <TableRow key={clip.id} hover>
                    <TableCell>{new Date(clip.started_at).toLocaleString()}</TableCell>
                    <TableCell>{clip.device_id}</TableCell>
                    <TableCell align="right">{formatDuration(clip.duration_seconds)}</TableCell>
                    <TableCell align="right">{formatSize(clip.size_bytes)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PlayCircleOutlineIcon />}
                          onClick={() => setActiveClip(clip)}
                        >
                          Play
                        </Button>
                        <Tooltip title="Copy direct link">
                          <IconButton size="small" onClick={() => copyClipLink(clip)}>
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in new tab">
                          <IconButton
                            size="small"
                            component="a"
                            href={footageClipUrl(clip.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {clips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        No clips for this range yet. Make sure footage_recorder.py is running.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Dialog open={!!activeClip} onClose={() => setActiveClip(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {activeClip && new Date(activeClip.started_at).toLocaleString()}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {activeClip && (
              <video
                key={activeClip.id}
                src={footageClipUrl(activeClip.url)}
                controls
                autoPlay
                style={{ width: "100%", borderRadius: 8, backgroundColor: "#000" }}
              />
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
