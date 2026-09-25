import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Layout from "./components/Layout";
import { useTelemetrySocket } from "./hooks/useTelemetrySocket";
import { getCurrentUser, logout } from "./api/client";

import Login from "./pages/Login";
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

function ProtectedDashboard() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        setAuthenticated(false);
      });
  }, []);

  if (authenticated === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AuthenticatedApp onLogout={() => navigate("/login")} />;
}

function AuthenticatedApp({ onLogout }: { onLogout: () => void }) {
  const socket = useTelemetrySocket();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      onLogout();
    }
  }

  return (
    <Layout status={socket.status}>
      <Routes>
        <Route path="/" element={<Dashboard socket={socket} />} />
        <Route
          path="/system-information"
          element={<SystemInformation socket={socket} />}
        />
        <Route
          path="/performance"
          element={<Performance socket={socket} />}
        />
        <Route path="/power" element={<Power socket={socket} />} />
        <Route
          path="/network-cameras"
          element={<NetworkCameras socket={socket} />}
        />
        <Route path="/ai-snapshots" element={<AISnapshots />} />
        <Route
          path="/temperature-history"
          element={<TemperatureHistory socket={socket} />}
        />
        <Route path="/sliced-footage" element={<RecordedFootage />} />
        <Route path="/live/:cameraPath" element={<LiveCameraView />} />
        <Route path="/settings" element={<Settings />} />

        <Route
          path="/logout"
          element={
            <LogoutHandler onLogout={handleLogout} />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function LogoutHandler({ onLogout }: { onLogout: () => void }) {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedDashboard />} />
    </Routes>
  );
}

function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      onLogin={() => {
        navigate("/", { replace: true });
      }}
    />
  );
}
