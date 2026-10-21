import { FormEvent, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { login } from "../api/client";
import "./Login.css";

type AccountRole = "Admin" | "User" | "IT";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<AccountRole>("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password, role);
      onLogin();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Unable to connect to the dashboard server.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="login-page">
      <main className="login-main">
        <Paper elevation={0} className="login-card">
          <Box className="login-heading">
            <Typography component="p" className="login-welcome">
              Welcome to
            </Typography>

            <Typography component="h1" className="login-brand">
              Radian Edge Platform
            </Typography>

            <Typography className="login-subtitle">
              Sign in to access your dashboard
            </Typography>
          </Box>

          <Box className="role-section">
            <Typography className="role-label">
              Select your account type
            </Typography>

            <Box
              className="role-switch"
              role="group"
              aria-label="Select account type"
            >
              {(["Admin", "User", "IT"] as AccountRole[]).map((item) => (
                <Button
                  key={item}
                  type="button"
                  disableRipple
                  className={`role-option ${
                    role === item ? "selected" : ""
                  }`}
                  aria-pressed={role === item}
                  onClick={() => setRole(item)}
                >
                  {item}
                </Button>
              ))}
            </Box>

          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="login-form"
          >
            {error && <Alert severity="error">{error}</Alert>}

            <Box className="login-field-group">
              <Typography component="label" htmlFor="login-username">
                Username
              </Typography>

              <TextField
                id="login-username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                fullWidth
                required
                autoComplete="username"
                size="small"
                className="login-field"
              />
            </Box>

            <Box className="login-field-group">
              <Typography component="label" htmlFor="login-password">
                Password
              </Typography>

              <TextField
                id="login-password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                size="small"
                className="login-field"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              className="login-submit"
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                <>
                  Sign In <span className="submit-arrow">→</span>
                </>
              )}
            </Button>
          </Box>

          <Box component="footer" className="login-copyright">
            © {new Date().getFullYear()} Radiantech-Systems Pvt LTD.
            {" "}All rights reserved.
          </Box>
        </Paper>
      </main>
    </Box>
  );
}
