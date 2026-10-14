import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SearchIcon from "@mui/icons-material/Search";

import { API_URL } from "../api/client";


type Snapshot = {
  filename: string;
  image: string;
  mime_type: string;
  timestamp: string;
  category: string;
};

type SnapshotData = {
  people: Snapshot[];
  vehicles: Snapshot[];
  others: Snapshot[];
};

type SnapshotRequestResponse = {
  status: string;
  request_id: string;
  device_id: string;
};

type SnapshotResultResponse = {
  status: string;
  request_id: string;
  device_id?: string;
  data?: SnapshotData;
};

const DEVICE_ID = "radian-edge-asrock-01";


function imageUrl(snapshot: Snapshot): string {
  return `data:${snapshot.mime_type};base64,${snapshot.image}`;
}

function snapshotLabel(snapshot: Snapshot): string {
  const value = `${snapshot.category} ${snapshot.filename}`.toLowerCase();
  if (/person|people|human/.test(value)) return "Person";
  if (/vehicle|car|truck|bus|motorcycle|bicycle/.test(value)) return "Vehicle";
  if (/dog|cat|bird|horse|sheep|cow|animal/.test(value)) return "Animal";
  if (/laptop|keyboard|mouse|remote|cell_phone|electronics/.test(value)) return "Electronics";
  return snapshot.category || "Snapshot";
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

export default function AISnapshots() {
  const [search, setSearch] = useState("");

  /*
   * Keep all categories in state.
   *
   * The Jetson sends:
   *   people
   *   vehicles
   *   others
   *
   * We keep them separately so changing the selected
   * category does NOT trigger another Jetson request.
   */
  const [snapshotData, setSnapshotData] =
    useState<SnapshotData>({
      people: [],
      vehicles: [],
      others: [],
    });

  const [loading, setLoading] =
    useState(false);

  const [selectedSnapshot, setSelectedSnapshot] =
    useState<Snapshot | null>(null);

  async function loadSnapshots() {
  setLoading(true);

  try {
    const BATCH_SIZE = 30;

    let offset = 0;

    const allData: SnapshotData = {
      people: [],
      vehicles: [],
      others: [],
    };

    while (true) {
      /*
       * Ask AWS for the next 30 snapshots
       * from the Jetson.
       */
      const requestResponse = await fetch(
        `${API_URL}/snapshot-commands/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            device_id: DEVICE_ID,
            offset,
            limit: BATCH_SIZE,
          }),
        },
      );

      if (!requestResponse.ok) {
        throw new Error(
          `Snapshot request failed: ${requestResponse.status}`,
        );
      }

      const requestData: SnapshotRequestResponse =
        await requestResponse.json();

      /*
       * Wait for Jetson to process this batch.
       */
      const maxAttempts = 120;

      let batchData: SnapshotData | null = null;

      for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500),
        );

        const resultResponse = await fetch(
          `${API_URL}/snapshot-commands/result/${requestData.request_id}`,
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          },
        );

        if (!resultResponse.ok) {
          throw new Error(
            `Snapshot result failed: ${resultResponse.status}`,
          );
        }

        const resultData: SnapshotResultResponse =
          await resultResponse.json();

        if (
          resultData.status === "ready" &&
          resultData.data
        ) {
          batchData = resultData.data;
          break;
        }
      }

      if (!batchData) {
        throw new Error(
          "Jetson did not return snapshots in time.",
        );
      }

      /*
       * Append this batch to everything received so far.
       */
      allData.people.push(
        ...(batchData.people || []),
      );

      allData.vehicles.push(
        ...(batchData.vehicles || []),
      );

      allData.others.push(
        ...(batchData.others || []),
      );

      /*
       * IMPORTANT:
       * Display the batch immediately.
       * Don't wait for all old snapshots.
       */
      setSnapshotData({
        people: [...allData.people],
        vehicles: [...allData.vehicles],
        others: [...allData.others],
      });

      /*
       * Check whether there are more snapshots.
       */
      const peopleCount =
        batchData.people?.length || 0;

      const vehiclesCount =
        batchData.vehicles?.length || 0;

      const othersCount =
        batchData.others?.length || 0;

      const maxCategoryCount = Math.max(
        peopleCount,
        vehiclesCount,
        othersCount,
      );

      /*
       * If no category returned a full batch,
       * we reached the end.
       */
      if (maxCategoryCount < BATCH_SIZE) {
        break;
      }

      /*
       * Move to the next 30 older snapshots.
       */
      offset += BATCH_SIZE;
    }
  } catch (error) {
    console.error(
      "Failed to load AI snapshots:",
      error,
    );
  } finally {
    setLoading(false);
  }
}




  /*
   * Request snapshots only while this page is mounted.
   *
   * IMPORTANT:
   * category is intentionally NOT in the dependency list.
   *
   * Therefore changing People / Vehicles / Others
   * does NOT create another request to Jetson.
   */
useEffect(() => {
  let cancelled = false;
  let inFlight = false;

  async function refresh() {
    if (cancelled || inFlight) {
      return;
    }

    inFlight = true;

    try {
      await loadSnapshots();
    } finally {
      inFlight = false;
    }
  }

  refresh();

  const interval = window.setInterval(
    refresh,
    5000,
  );

  return () => {
    cancelled = true;
    window.clearInterval(interval);
  };
}, []);

  /*
   * Select the correct array for the currently selected category.
   */
  const snapshots = [
    ...snapshotData.people,
    ...snapshotData.vehicles,
    ...snapshotData.others,
  ].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredSnapshots = snapshots.filter((snapshot) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      snapshot.filename,
      snapshot.category,
      snapshot.timestamp,
      formatTimestamp(snapshot.timestamp),
    ].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <CameraAltOutlinedIcon color="primary" />

        <Typography
          variant="h5"
          fontWeight={700}
        >
          Violations
        </Typography>

        <Chip
          size="small"
          label={`${filteredSnapshots.length} snapshots`}
        />

        {loading && (
          <CircularProgress
            size={20}
            sx={{ ml: 1 }}
          />
        )}
      </Stack>

      <Grid
        container
        spacing={3}
      >
        {/* SNAPSHOTS */}
        <Grid item xs={12} md={12}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by filename, category, or date..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Grid
            container
            spacing={2}
          >
            {filteredSnapshots.map(
              (snapshot) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`${snapshot.category}-${snapshot.filename}`}
                >
                  <Card
                    sx={{
                      cursor: "pointer",
                      height: "100%",
                    }}
                    onClick={() =>
                      setSelectedSnapshot(
                        snapshot,
                      )
                    }
                  >
                    <CardMedia
                      component="img"
                      image={imageUrl(
                        snapshot,
                      )}
                      alt={
                        snapshot.filename
                      }
                      sx={{
                        width: "100%",
                        aspectRatio: "4 / 3",
                        objectFit: "cover",
                      }}
                    />

                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                      >
                        {snapshotLabel(snapshot)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {
                          snapshot.filename
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatTimestamp(
                          snapshot.timestamp,
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ),
            )}

            {!loading &&
              filteredSnapshots.length === 0 && (
                <Grid
                  item
                  xs={12}
                >
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      {search.trim() ? "No snapshots match your search." : "No snapshots available"}
                    </Typography>
                  </Paper>
                </Grid>
              )}
          </Grid>
        </Grid>
      </Grid>

      {/* IMAGE PREVIEW */}
      <Dialog
        open={Boolean(
          selectedSnapshot,
        )}
        onClose={() =>
          setSelectedSnapshot(null)
        }
        maxWidth="md"
        fullWidth
      >
        {selectedSnapshot && (
          <Box>
            <CardMedia
              component="img"
              image={imageUrl(
                selectedSnapshot,
              )}
              alt={
                selectedSnapshot.filename
              }
              sx={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />

            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                fontWeight={600}
              >
                {snapshotLabel(selectedSnapshot)}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {
                  selectedSnapshot.filename
                }
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {formatTimestamp(
                  selectedSnapshot.timestamp,
                )}
              </Typography>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
