import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { useTelemetrySocket } from "./hooks/useTelemetrySocket";

import Dashboard from "./pages/Dashboard";
import SystemInformation from "./pages/SystemInformation";
import Performance from "./pages/Performance";
import Power from "./pages/Power";
import NetworkCameras from "./pages/NetworkCameras";
import AISnapshots from "./pages/AISnapshots";
import TemperatureHistory from "./pages/TemperatureHistory";
import RecordedFootage from "./pages/RecordedFootage";
import LiveCameraView from "./pages/LiveCameraView";
import Settings from "./pages/Settings";

export default function App() {
  const socket = useTelemetrySocket();

  return (
    <Layout status={socket.status}>
      <Routes>
        <Route path="/" element={<Dashboard socket={socket} />} />
        <Route path="/system-information" element={<SystemInformation socket={socket} />} />
        <Route path="/performance" element={<Performance socket={socket} />} />
        <Route path="/power" element={<Power socket={socket} />} />
        <Route path="/network-cameras" element={<NetworkCameras socket={socket} />} />
        <Route
          path="/ai-snapshots"
          element={<AISnapshots />}
        />
        <Route path="/temperature-history" element={<TemperatureHistory socket={socket} />} />
        <Route path="/sliced-footage" element={<RecordedFootage />} />
        <Route path="/live/:cameraPath" element={<LiveCameraView />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
