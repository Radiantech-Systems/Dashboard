import { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import SpeedIcon from "@mui/icons-material/SpeedOutlined";
import BoltIcon from "@mui/icons-material/BoltOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import MonitorIcon from "@mui/icons-material/Monitor";
import ThermostatIcon from "@mui/icons-material/ThermostatOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import MemoryIcon from "@mui/icons-material/MemoryOutlined";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import TrafficIcon from "@mui/icons-material/Traffic";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltIcon from "@mui/icons-material/PeopleAltOutlined";
import CompanyWatermark from "./CompanyWatermark";
import type { ConnectionStatus } from "../hooks/useTelemetrySocket";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: "Cameras", path: "/network-cameras", icon: <VideocamOutlinedIcon />, permission: "network_cameras" },
  { label: "Live CCTV", path: "/live-cctv", icon: <MonitorIcon />, permission: "live_cctv" },
  { label: "Sliced Footage", path: "/sliced-footage", icon: <MovieOutlinedIcon />, permission: "sliced_footage" },
  { label: "Violations", path: "/ai-snapshots", icon: <CameraAltOutlinedIcon />, permission: "violations" },
  { label: "Traffic Signal Control", path: "/traffic-signal-control", icon: <TrafficIcon />, permission: "traffic_signal_control" },
  { label: "Settings", path: "/settings", icon: <SettingsIcon />, permission: "settings" },
];

function StatusChip({
  status,
}: {
  status: ConnectionStatus;
}) {
  const map = {
    connected: {
      color: "success" as const,
      label: "Live",
    },
    connecting: {
      color: "warning" as const,
      label: "Connecting…",
    },
    disconnected: {
      color: "error" as const,
      label: "Disconnected",
    },
  };

  const cfg = map[status];

  return (
    <Chip
      size="small"
      color={cfg.color}
      label={cfg.label}
      sx={{
        fontWeight: 600,
        flexShrink: 0,
      }}
    />
  );
}

export default function Layout({
  children,
  status,
  userRole = "",
  permissions = [],
}: {
  children: ReactNode;
  status: ConnectionStatus;
  userRole?: string;
  permissions?: string[];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const canSee = (permission: string) =>
    userRole === "Admin" || permissions.includes(permission);

  const visibleNavItems = [
    ...NAV_ITEMS.filter((item) => canSee(item.permission)),
    ...(userRole === "Admin"
      ? [{
          label: "User Management",
          path: "/user-management",
          icon: <PeopleAltIcon />,
          permission: "user_management",
        }]
      : []),
  ];


  /*
   * The navigation becomes a drawer when there isn't
   * enough horizontal space for the permanent sidebar.
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [deviceStatusOpen, setDeviceStatusOpen] = useState(
    ["/", "/system-information", "/temperature-history", "/network"].includes(location.pathname)
  );


  const currentPage =
    (location.pathname === "/network-cameras" ? "Cameras" : undefined) ??
    visibleNavItems.find((item) => item.path === location.pathname)?.label ??
    ({ "/": "Health", "/system-information": "System Information", "/temperature-history": "Temperature History", "/network": "Network" } as Record<string, string>)[location.pathname] ??
    "Health";

  const handleNavigation = (path: string) => {
    navigate(path);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Toolbar
        sx={{
          gap: 1.25,
          px: { xs: 1.5, md: 2 },
          minHeight: 72,
          boxSizing: "border-box",
        }}
      >
        <Box
          component="img"
          src="/radiantech-logo-watermark.png"
          alt="Radiantech System logo"
          sx={{
            width: 130,
            height: 52,
            objectFit: "contain",
            flexShrink: 0,
            display: "block",
            background: "transparent",
          }}
        />

        
      </Toolbar>

      <List
        sx={{
          px: { xs: 1, md: 1.25 },
          pb: 2,
        }}
      >
        <ListItemButton
          selected={["/", "/system-information", "/temperature-history", "/network"].includes(location.pathname)}
          onClick={() => setDeviceStatusOpen((open) => !open)}
          sx={{
            minHeight: 48,
            borderRadius: 2,
            mb: 0.5,
            "&.Mui-selected": {
              backgroundColor: "rgba(57,214,200,0.12)",
              color: "primary.main",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Device Status" />
          <Typography component="span">{deviceStatusOpen ? "▾" : "▸"}</Typography>
        </ListItemButton>

        {deviceStatusOpen && [
          { label: "Health", path: "/", icon: <SpeedIcon />, permission: "dashboard" },
          { label: "System Information", path: "/system-information", icon: <InfoIcon />, permission: "system_information" },
          { label: "Temperature History", path: "/temperature-history", icon: <ThermostatIcon />, permission: "temperature_history" },
          { label: "Network", path: "/network", icon: <MonitorIcon />, permission: "network" },
        ].filter((item) => canSee(item.permission)).map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              minHeight: 44,
              pl: 5,
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                backgroundColor: "rgba(57,214,200,0.12)",
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ noWrap: true }} />
          </ListItemButton>
        ))}

        {visibleNavItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              minHeight: 48,
              borderRadius: 2,
              mb: 0.5,

              "&.Mui-selected": {
                backgroundColor: "rgba(57,214,200,0.12)",
                color: "primary.main",

                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              },

              "&.Mui-selected:hover": {
                backgroundColor: "rgba(57,214,200,0.18)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
                primaryTypographyProps={{ noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      className="app-shell"
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100dvh",
        overflowX: "hidden",
      }}
    >
      {/* =====================================================
          DESKTOP SIDEBAR
          ===================================================== */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,

            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* =====================================================
          MOBILE / SMALL SCREEN SIDEBAR
          ===================================================== */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: "min(82vw, 300px)",
              maxWidth: "300px",
              boxSizing: "border-box",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* =====================================================
          MAIN AREA
          ===================================================== */}
      <Box
        component="main"
        className="main-content"
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ===================================================
            TOP BAR
            =================================================== */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            width: "100%",
            flexShrink: 0,
          }}
        >
          <Toolbar
            sx={{
              minHeight: {
                xs: 56,
                sm: 60,
                md: 64,
              },

              px: {
                xs: 1.25,
                sm: 2,
                md: 3,
              },

              gap: 1,
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              {isMobile && (
                <IconButton
                  color="inherit"
                  edge="start"
                  aria-label="open navigation"
                  onClick={() => setMobileOpen(true)}
                  sx={{
                    flexShrink: 0,
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Typography
                variant="h6"
                noWrap
                sx={{

                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",

                  fontSize: {
                    xs: "1rem",
                    sm: "1.1rem",
                    md: "1.25rem",
                  },
                }}
              >
                {currentPage}
              </Typography>
            </Stack>

            <StatusChip status={status} />
          </Toolbar>
        </AppBar>

        {/* ===================================================
            CONTENT
            =================================================== */}
        <Box
          className="page-content"
          sx={{
            flex: "1 1 auto",
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",

            p: {
              xs: 1.25,
              sm: 2,
              md: 3,
              lg: 4,
            },

            overflowX: "hidden",
          }}
        >
          {children}
          <CompanyWatermark />
        </Box>
      </Box>
    </Box>
  );
}
