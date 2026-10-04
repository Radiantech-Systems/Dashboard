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
import WifiIcon from "@mui/icons-material/WifiOutlined";
import ThermostatIcon from "@mui/icons-material/ThermostatOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import MemoryIcon from "@mui/icons-material/MemoryOutlined";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CompanyWatermark from "./CompanyWatermark";
import type { ConnectionStatus } from "../hooks/useTelemetrySocket";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    icon: <DashboardIcon />,
  },
  {
    label: "System Information",
    path: "/system-information",
    icon: <InfoIcon />,
  },
  {
    label: "Performance",
    path: "/performance",
    icon: <SpeedIcon />,
  },
  {
    label: "Power",
    path: "/power",
    icon: <BoltIcon />,
  },
  {
    label: "Network & Cameras",
    path: "/network-cameras",
    icon: <WifiIcon />,
  },
  {
    label: "Temperature History",
    path: "/temperature-history",
    icon: <ThermostatIcon />,
  },
  {
    label: "Sliced Footage",
    path: "/sliced-footage",
    icon: <MovieOutlinedIcon />,
  },
  {
    label: "AI Snapshots",
    path: "/ai-snapshots",
    icon: <CameraAltOutlinedIcon />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsIcon />,
  },
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
}: {
  children: ReactNode;
  status: ConnectionStatus;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  /*
   * The navigation becomes a drawer when there isn't
   * enough horizontal space for the permanent sidebar.
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage =
    NAV_ITEMS.find((item) => item.path === location.pathname)?.label ??
    "Dashboard";

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
          gap: 1,
          px: { xs: 2, md: 2.5 },
          minHeight: 64,
        }}
      >
        <MemoryIcon
          sx={{
            color: "primary.main",
            flexShrink: 0,
          }}
        />

        <Typography
          variant="subtitle1"
          fontWeight={700}
          noWrap
          sx={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Jetson Telemetry
        </Typography>
      </Toolbar>

      <List
        sx={{
          px: { xs: 1, md: 1.25 },
          pb: 2,
        }}
      >
        {NAV_ITEMS.map((item) => (
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
