import { Card, CardContent, Typography, Box, LinearProgress, Stack } from "@mui/material";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  unit?: string;
  icon?: ReactNode;
  progress?: number | null; // 0-100, renders a bar if provided
  progressColor?: "primary" | "warning" | "error" | "success";
  subtitle?: string;
}

function fmt(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
}

export default function StatCard({ title, value, unit, icon, progress, progressColor = "primary", subtitle }: StatCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
          {icon && <Box sx={{ color: "primary.main", opacity: 0.85 }}>{icon}</Box>}
        </Stack>
        <Typography variant="h5" sx={{ mt: 1 }}>
          {fmt(value)}{value !== null && value !== undefined && unit ? <Typography component="span" variant="body2" color="text.secondary"> {unit}</Typography> : null}
        </Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        {progress !== undefined && progress !== null && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            color={progressColor}
            sx={{ mt: 1.5, backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        )}
      </CardContent>
    </Card>
  );
}
