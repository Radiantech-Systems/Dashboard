import { Typography } from "@mui/material";

export default function CompanyWatermark() {
  return (
    <Typography
      sx={{
        position: "fixed",
        right: 24,
        bottom: 18,
        zIndex: 9999,
        opacity: 0.35,
        pointerEvents: "none",
        userSelect: "none",
        fontSize: "18px",
        fontWeight: 700,
        color: "text.primary",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      Radiantech-Systems Pvt LTD
    </Typography>
  );
}
