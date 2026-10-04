import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    background: {
      default: "#08141c",
      paper: "#101f2a",
    },

    primary: {
      main: "#39d6c8",
    },

    secondary: {
      main: "#7c9cff",
    },

    success: {
      main: "#4caf50",
    },

    warning: {
      main: "#ffb547",
    },

    error: {
      main: "#ff5c5c",
    },

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
      "Inter",
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "sans-serif",
    ].join(","),

    h4: {
      fontWeight: 700,
      fontSize: "clamp(1.35rem, 2.5vw, 2rem)",
    },

    h5: {
      fontWeight: 700,
      fontSize: "clamp(1.2rem, 2vw, 1.75rem)",
    },

    h6: {
      fontWeight: 600,
      fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
    },

    subtitle1: {
      fontSize: "clamp(0.9rem, 1.2vw, 1rem)",
    },

    subtitle2: {
      color: "#8fa1b3",
      fontSize: "clamp(0.78rem, 1vw, 0.9rem)",
    },

    body1: {
      fontSize: "clamp(0.875rem, 1vw, 1rem)",
    },

    body2: {
      fontSize: "clamp(0.78rem, 0.9vw, 0.95rem)",
    },

    caption: {
      fontSize: "clamp(0.7rem, 0.8vw, 0.8rem)",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: "100%",
          minHeight: "100%",
          overflowX: "hidden",
        },

        body: {
          width: "100%",
          minHeight: "100%",
          margin: 0,
          overflowX: "hidden",
        },


        ".page-content": {
          isolation: "isolate",
          position: "relative",
          minHeight: "calc(100dvh - 64px)",
          backgroundColor: "#08141c",
        },

        ".page-content::before": {
          content: '""',
          position: "absolute",
          top: "54%",
          left: "50%",
          width: "42%",
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%)",
          backgroundImage: 'url("/radiantech-logo.png")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          opacity: 0.16,
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 0,
        },

        ".page-content > *": {
          position: "relative",
          zIndex: 1,
        },

        "#root": {
          position: "relative",
          zIndex: 1,
          width: "100%",
          minHeight: "100dvh",
          overflowX: "hidden",
        },

        "*": {
          boxSizing: "border-box",
        },

        "img, video, canvas, svg": {
          maxWidth: "100%",
        },

        "img, video": {
          height: "auto",
        },

        "a, code": {
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        },

        "pre": {
          maxWidth: "100%",
          overflowX: "auto",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(16, 31, 42, 0.72)",
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.06)",
          minWidth: 0,
          maxWidth: "100%",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(16, 31, 42, 0.72)",
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.06)",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",

          transition:
            "transform 160ms ease, box-shadow 160ms ease",
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          minWidth: 0,
          padding: "clamp(12px, 2vw, 24px)",

          "&:last-child": {
            paddingBottom: "clamp(12px, 2vw, 24px)",
          },
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

    MuiToolbar: {
      styleOverrides: {
        root: {
          minWidth: 0,
        },
      },
    },

    MuiGrid: {
      styleOverrides: {
        root: {
          minWidth: 0,
          maxWidth: "100%",
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          minWidth: 520,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          whiteSpace: "nowrap",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          width: "100%",
          maxWidth: "900px",
          margin: "clamp(8px, 3vw, 32px)",
          maxHeight: "calc(100dvh - 16px)",
          overflow: "hidden",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          minWidth: 0,
          overflowX: "hidden",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          maxWidth: "100%",
          minWidth: 0,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
        },
      },
    },
  },
});

export default theme;
