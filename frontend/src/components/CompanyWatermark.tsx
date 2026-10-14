import { Box, Typography } from "@mui/material";

export default function CompanyWatermark() {
  return (
    <Box
      sx={{
        position: "fixed",
        right: 24,
        bottom: 18,
        zIndex: 9999,
        opacity: 0.35,
        pointerEvents: "none",
        userSelect: "none",
        textAlign: "right",
      }}
    >
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: 700,
          color: "text.primary",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        Radian Drishti
      </Typography>
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 500,
          color: "text.primary",
          whiteSpace: "nowrap",
        }}
      >
        Powered by Radian Edge Platform
      </Typography>
    </Box>
  );
}
