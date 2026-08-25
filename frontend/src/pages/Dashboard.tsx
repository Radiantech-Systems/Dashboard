import { useEffect, useState } from "react";
import { Grid, Paper, Stack, Typography, Chip, Box } from "@mui/material";
import MemoryIcon from "@mui/icons-material/MemoryOutlined";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoardOutlined";
import StorageIcon from "@mui/icons-material/StorageOutlined";
import ThermostatIcon from "@mui/icons-material/ThermostatOutlined";
import AirIcon from "@mui/icons-material/AirOutlined";
import BoltIcon from "@mui/icons-material/BoltOutlined";
import StatCard from "../components/StatCard";
import { getDashboard } from "../api/client";
import type { DeviceSummary } from "../types/telemetry";
import type { useTelemetrySocket } from "../hooks/useTelemetrySocket";

export default function Dashboard({ socket }: { socket: ReturnType<typeof useTelemetrySocket> }) {
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await getDashboard();
        if (active) setDevices(res.devices);
      } catch {
        // server may briefly be unreachable; keep last known values
      }
    }
    poll();
    const id = setInterval(poll, 2000);
    return () => { active = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const live = socket.primary;
  const device = devices[0];
  const isOnline = device?.status === "online" || (live !== undefined && socket.status === "connected");

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5">{live?.system_info?.device_name || device?.device_name || "Jetson AGX Orin"}</Typography>
            <Typography variant="body2" color="text.secondary">
              {live?.system_info?.hostname || device?.device_id || "Waiting for telemetry..."}
            </Typography>
          </Box>
          <Stack alignItems="flex-end" spacing={0.5}>
            <Chip
              label={isOnline ? "ONLINE" : "OFFLINE"}
              color={isOnline ? "success" : "error"}
              sx={{ fontWeight: 700, px: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Last update: {now.toLocaleTimeString()}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CPU"
            value={live?.cpu?.usage_percent?.toFixed(0) ?? device?.cpu_usage_percent?.toFixed(0)}
            unit="%"
            icon={<MemoryIcon />}
            progress={live?.cpu?.usage_percent ?? device?.cpu_usage_percent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GPU"
            value={live?.gpu?.usage_percent?.toFixed(0) ?? device?.gpu_usage_percent?.toFixed(0)}
            unit="%"
            icon={<DeveloperBoardIcon />}
            progress={live?.gpu?.usage_percent ?? device?.gpu_usage_percent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="RAM"
            value={live?.memory?.ram_usage_percent?.toFixed(0) ?? device?.ram_usage_percent?.toFixed(0)}
            unit="%"
            icon={<MemoryIcon />}
            progress={live?.memory?.ram_usage_percent ?? device?.ram_usage_percent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Storage"
            value={live?.storage?.disk_usage_percent?.toFixed(0) ?? device?.disk_usage_percent?.toFixed(0)}
            unit="%"
            icon={<StorageIcon />}
            progress={live?.storage?.disk_usage_percent ?? device?.disk_usage_percent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CPU Temperature"
            value={live?.cpu?.temperature_c?.toFixed(1) ?? device?.cpu_temperature_c?.toFixed(1)}
            unit="°C"
            icon={<ThermostatIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GPU Temperature"
            value={live?.gpu?.temperature_c?.toFixed(1) ?? device?.gpu_temperature_c?.toFixed(1)}
            unit="°C"
            icon={<ThermostatIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fan"
            value={live?.cooling?.fan_rpm ?? device?.fan_rpm}
            unit="RPM"
            icon={<AirIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Power"
            value={live?.power?.power_consumption_mw ? (live.power.power_consumption_mw / 1000).toFixed(2) : (device?.power_consumption_mw ? (device.power_consumption_mw / 1000).toFixed(2) : null)}
            unit="W"
            subtitle={live?.power?.power_mode || device?.power_mode || undefined}
            icon={<BoltIcon />}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
