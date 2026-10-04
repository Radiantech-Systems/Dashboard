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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";

type Category = "vehicle" | "human" | "other";

type FlaskSnapshot = {
  filename: string;
  category: string;
  timestamp: number;
  url: string;
};

type FlaskSnapshotResponse = {
  people: FlaskSnapshot[];
  vehicles: FlaskSnapshot[];
  others: FlaskSnapshot[];
};

const JETSON_SNAPSHOT_API = "http://192.168.137.2:5000";
const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    icon: React.ReactNode;
  }
> = {
  vehicle: {
    label: "Vehicles",
    icon: <DirectionsCarOutlinedIcon />,
  },
  human: {
    label: "People",
    icon: <PersonOutlineOutlinedIcon />,
  },
  other: {
    label: "Others",
    icon: <CategoryOutlinedIcon />,
  },
};

function imageUrl(snapshot: FlaskSnapshot): string {
  return `${JETSON_SNAPSHOT_API}${snapshot.url}`;
}

function snapshotLabel(snapshot: FlaskSnapshot): string {
  if (snapshot.category === "people") {
    return "Person";
  }

  if (snapshot.category === "vehicles") {
    return "Vehicle";
  }

  if (snapshot.category === "animals") {
    return "Animal";
  }

  if (snapshot.category === "electronics") {
    return "Electronics";
  }

  return "Other";
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export default function AISnapshots() {
  const [category, setCategory] = useState<Category>("vehicle");
  const [snapshots, setSnapshots] = useState<FlaskSnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedSnapshot, setSelectedSnapshot] =
    useState<FlaskSnapshot | null>(null);

  async function loadSnapshots() {
    setLoading(true);

    try {
      const response = await fetch(
        `${JETSON_SNAPSHOT_API}/api/snapshots`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Snapshot server returned ${response.status}`,
        );
      }

      const data: FlaskSnapshotResponse = await response.json();

      if (category === "human") {
        setSnapshots(data.people || []);
      } else if (category === "vehicle") {
        setSnapshots(data.vehicles || []);
      } else {
        setSnapshots(data.others || []);
      }
    } catch (error) {
      console.error(
        "Failed to load AI snapshots from Jetson Flask server:",
        error,
      );

      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSnapshots();

    const interval = setInterval(loadSnapshots, 5000);

    return () => clearInterval(interval);
  }, [category]);

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <CameraAltOutlinedIcon color="primary" />

        <Typography variant="h5" fontWeight={700}>
          AI Snapshots
        </Typography>

        <Chip
          size="small"
          label={`${snapshots.length} snapshots`}
        />
      </Stack>

      <Grid container spacing={3}>
        {/* LEFT CATEGORY MENU */}
        <Grid item xs={12} md={2.5}>
          <Paper sx={{ overflow: "hidden" }}>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
              >
                Categories
              </Typography>
            </Box>

            <Divider />

            <List sx={{ p: 1 }}>
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map(
                (item) => (
                  <ListItemButton
                    key={item}
                    selected={category === item}
                    onClick={() => setCategory(item)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon>
                      {CATEGORY_CONFIG[item].icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={CATEGORY_CONFIG[item].label}
                    />
                  </ListItemButton>
                ),
              )}
            </List>
          </Paper>
        </Grid>

        {/* SNAPSHOT CONTENT */}
        <Grid item xs={12} md={9.5}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">
              {CATEGORY_CONFIG[category].label}
            </Typography>

            {loading && <CircularProgress size={22} />}
          </Stack>

          {snapshots.length === 0 && !loading && (
            <Paper sx={{ p: 5, textAlign: "center" }}>
              <Typography
                variant="body1"
                color="text.secondary"
              >
                No AI snapshots available for this category.
              </Typography>
            </Paper>
          )}

          <Grid container spacing={2}>
            {snapshots.map((snapshot) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                key={`${snapshot.category}-${snapshot.filename}-${snapshot.timestamp}`}
              >
                <Card>
                  <CardMedia
                    component="img"
                    image={imageUrl(snapshot)}
                    alt={snapshotLabel(snapshot)}
                    onClick={() => setSelectedSnapshot(snapshot)}
                    sx={{
                      height: 220,
                      objectFit: "cover",
                      backgroundColor: "#111",
                      cursor: "pointer",
                    }}
                  />

                  <CardContent>
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                      >
                        {snapshotLabel(snapshot)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        File: {snapshot.filename}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatTimestamp(snapshot.timestamp)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        open={selectedSnapshot !== null}
        onClose={() => setSelectedSnapshot(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedSnapshot && (
          <Box
            sx={{
              backgroundColor: "#111",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 1,
            }}
          >
            <Box
              component="img"
              src={imageUrl(selectedSnapshot)}
              alt={snapshotLabel(selectedSnapshot)}
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
