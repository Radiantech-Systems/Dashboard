import { createTheme } from "@mui/material/styles";

// Professional dark "industrial monitoring" theme: deep charcoal
// background, cyan accent (reads as telemetry/NVIDIA-adjacent without
// copying branding), rounded cards, subtle elevation.
const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0b0f14",
      paper: "#121824",
    },
    primary: {
      main: "#39d6c8",
    },
    secondary: {
      main: "#7c9cff",
    },
    success: { main: "#4caf50" },
    warning: { main: "#ffb547" },
    error: { main: "#ff5c5c" },
    text: {
      primary: "#e6ecf1",
      secondary: "#8fa1b3",
    },
    divider: "rgba(255,255,255,0.08)",
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: [
      "Inter", "Roboto", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif",
    ].join(","),
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { color: "#8fa1b3" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.06)",
          transition: "transform 160ms ease, box-shadow 160ms ease",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0d131b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0d131bcc",
          backdropFilter: "blur(8px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, height: 8 },
      },
    },
  },
});

export default theme;
