import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Chip, Stack,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import SpeedIcon from "@mui/icons-material/SpeedOutlined";
import BoltIcon from "@mui/icons-material/BoltOutlined";
import WifiIcon from "@mui/icons-material/WifiOutlined";
import ThermostatIcon from "@mui/icons-material/ThermostatOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import MemoryIcon from "@mui/icons-material/MemoryOutlined";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import type { ConnectionStatus } from "../hooks/useTelemetrySocket";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "System Information", path: "/system-information", icon: <InfoIcon /> },
  { label: "Performance", path: "/performance", icon: <SpeedIcon /> },
  { label: "Power", path: "/power", icon: <BoltIcon /> },
  { label: "Network & Cameras", path: "/network-cameras", icon: <WifiIcon /> },
  { label: "Temperature History", path: "/temperature-history", icon: <ThermostatIcon /> },
  { label: "Sliced Footage", path: "/sliced-footage", icon: <MovieOutlinedIcon /> },
  {
  label: "AI Snapshots",
  path: "/ai-snapshots",
  icon: <CameraAltOutlinedIcon />,
  },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

function StatusChip({ status }: { status: ConnectionStatus }) {
  const map = {
    connected: { color: "success" as const, label: "Live" },
    connecting: { color: "warning" as const, label: "Connecting…" },
    disconnected: { color: "error" as const, label: "Disconnected" },
  };
  const cfg = map[status];
  return <Chip size="small" color={cfg.color} label={cfg.label} sx={{ fontWeight: 600 }} />;
}

export default function Layout({ children, status }: { children: ReactNode; status: ConnectionStatus }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <MemoryIcon sx={{ color: "primary.main" }} />
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            Jetson Telemetry
          </Typography>
        </Toolbar>
        <List sx={{ px: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "rgba(57,214,200,0.12)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6">
              {NAV_ITEMS.find((n) => n.path === location.pathname)?.label ?? "Dashboard"}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip status={status} />
            </Stack>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
