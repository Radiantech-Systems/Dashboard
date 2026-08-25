import { useEffect, useState } from "react";
import {
  Grid, Paper, Typography, Stack, ToggleButton, ToggleButtonGroup, Button,
  TextField, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import ReactECharts from "echarts-for-react";
import StatCard from "../components/StatCard";
import ThermostatIcon from "@mui/icons-material/ThermostatOutlined";
import AirIcon from "@mui/icons-material/AirOutlined";
import { getTemperatureHistory, buildTemperatureExportUrl } from "../api/client";
import type { RangePreset } from "../api/client";
import type { TemperatureHistoryPoint } from "../types/telemetry";
import type { useTelemetrySocket } from "../hooks/useTelemetrySocket";

export default function TemperatureHistory({ socket }: { socket: ReturnType<typeof useTelemetrySocket> }) {
  const [range, setRange] = useState<RangePreset>("last_hour");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [points, setPoints] = useState<TemperatureHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const cooling = socket.primary?.cooling;
  const cpuTemp = socket.primary?.cpu?.temperature_c;
  const gpuTemp = socket.primary?.gpu?.temperature_c;

  async function fetchHistory() {
    setLoading(true);
    try {
      const params =
        range === "custom"
          ? { start: customStart ? new Date(customStart).toISOString() : undefined,
              end: customEnd ? new Date(customEnd).toISOString() : undefined }
          : { range };
      const data = await getTemperatureHistory(params);
      setPoints(data);
    } catch {
      // keep last known data on transient errors
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    const id = setInterval(fetchHistory, 10000); // refresh chart/table every 10s
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, customStart, customEnd]);

  const chartOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["CPU", "GPU", "Board"], textStyle: { color: "#8fa1b3" } },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: "category",
      data: points.map((p) => new Date(p.timestamp).toLocaleString()),
      axisLabel: { color: "#8fa1b3", show: false },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
    },
    yAxis: {
      type: "value",
      name: "°C",
      axisLabel: { color: "#8fa1b3" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
    },
    series: [
      { name: "CPU", type: "line", smooth: true, showSymbol: false, data: points.map((p) => p.cpu_temperature), color: "#39d6c8" },
      { name: "GPU", type: "line", smooth: true, showSymbol: false, data: points.map((p) => p.gpu_temperature), color: "#7c9cff" },
      { name: "Board", type: "line", smooth: true, showSymbol: false, data: points.map((p) => p.board_temperature), color: "#ffb547" },
    ],
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="CPU Temp" value={cpuTemp?.toFixed(1)} unit="°C" icon={<ThermostatIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="GPU Temp" value={gpuTemp?.toFixed(1)} unit="°C" icon={<ThermostatIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Board Temp" value={cooling?.board_temperature_c?.toFixed(1)} unit="°C" icon={<ThermostatIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Fan RPM" value={cooling?.fan_rpm} unit="RPM" icon={<AirIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Fan PWM" value={cooling?.fan_pwm} unit="%" icon={<AirIcon />} />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
          <Typography variant="h6">Temperature Trend</Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={range}
              onChange={(_, v) => v && setRange(v)}
            >
              <ToggleButton value="last_hour">Last Hour</ToggleButton>
              <ToggleButton value="last_day">Last Day</ToggleButton>
              <ToggleButton value="last_week">Last Week</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
            {range === "custom" && (
              <>
                <TextField
                  size="small"
                  type="datetime-local"
                  label="Start"
                  InputLabelProps={{ shrink: true }}
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
                <TextField
                  size="small"
                  type="datetime-local"
                  label="End"
                  InputLabelProps={{ shrink: true }}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              href={buildTemperatureExportUrl(
                range === "custom"
                  ? { start: customStart ? new Date(customStart).toISOString() : undefined,
                      end: customEnd ? new Date(customEnd).toISOString() : undefined }
                  : { range }
              )}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>
        <ReactECharts option={chartOption} style={{ height: 320 }} notMerge={true} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Historical Readings {loading ? "(refreshing…)" : ""}</Typography>
        <TableContainer sx={{ maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell align="right">CPU (°C)</TableCell>
                <TableCell align="right">GPU (°C)</TableCell>
                <TableCell align="right">Board (°C)</TableCell>
                <TableCell align="right">Fan RPM</TableCell>
                <TableCell align="right">Fan PWM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...points].reverse().slice(0, 500).map((p, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{new Date(p.timestamp).toLocaleString()}</TableCell>
                  <TableCell align="right">{p.cpu_temperature?.toFixed(1) ?? "--"}</TableCell>
                  <TableCell align="right">{p.gpu_temperature?.toFixed(1) ?? "--"}</TableCell>
                  <TableCell align="right">{p.board_temperature?.toFixed(1) ?? "--"}</TableCell>
                  <TableCell align="right">{p.fan_rpm ?? "--"}</TableCell>
                  <TableCell align="right">{p.fan_pwm ?? "--"}</TableCell>
                </TableRow>
              ))}
              {points.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">No data for this range yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
