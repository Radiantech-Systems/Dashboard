import { FormEvent, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { login } from "../api/client";
import "./Login.css";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("Radiantech-Dashboard");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
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
      <header className="login-header">
        <div className="company-brand">
          <img
            src="/radiantech-logo.jpg"
            alt="Radiantech System logo"
            className="company-logo"
          />
          <Typography className="company-name">
            Radiantech System
          </Typography>
        </div>

        <div className="product-brand">
          <Typography className="product-name">
            RADIAN DRISHTI
          </Typography>
          <Typography className="product-powered">
            POWERED BY RADIAN-EDGE
          </Typography>
        </div>
      </header>

      <main className="login-main">
        <Paper elevation={0} className="login-card">
          <Box className="login-title">
            <Typography component="h1">
              Dashboard Login
            </Typography>
            <span className="login-title-accent" />
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="login-form"
          >
            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <TextField
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              fullWidth
              required
              autoComplete="username"
              className="login-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="field-symbol">♙</span>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              required
              autoComplete="current-password"
              className="login-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="field-symbol">♙</span>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((value) => !value)}
                      edge="end"
                    >
                      {showPassword ? "◉" : "◎"}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              className="login-submit"
            >
              {loading ? (
                <CircularProgress size={23} color="inherit" />
              ) : (
                <>
                  SIGN IN <span className="submit-arrow">→</span>
                </>
              )}
            </Button>
          </Box>
        </Paper>
      </main>
    </Box>
  );
}
