#!/usr/bin/env bash
###############################################################
# start-jetson.sh — one command to bring up everything that runs
# on the Jetson: telemetry agent, footage recorder, live stream.
#
# All three live in THIS SAME FOLDER (wherever this script is) —
# they share one .env and one venv. No separate folders needed.
#
# Run this from the jetson-agent folder, on the JETSON:
#   ./start-jetson.sh
#
# First run installs the three systemd services (idempotent — safe
# to run again later, it just re-confirms everything's active).
###############################################################
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SERVICES=(telemetry-agent footage-recorder live-stream)

echo "==> Working directory: $SCRIPT_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $SCRIPT_DIR — copy .env.example to .env and configure it first."
  exit 1
fi

if [ ! -d venv ]; then
  echo "ERROR: venv/ not found in $SCRIPT_DIR — run:"
  echo "  python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

echo "==> Installing/refreshing systemd service files..."
for svc in "${SERVICES[@]}"; do
  if [ -f "${svc}.service" ]; then
    sudo cp "${svc}.service" /etc/systemd/system/
  else
    echo "    WARNING: ${svc}.service not found in $SCRIPT_DIR, skipping."
  fi
done
sudo systemctl daemon-reload

echo "==> Enabling and starting all services..."
for svc in "${SERVICES[@]}"; do
  if [ -f "/etc/systemd/system/${svc}.service" ]; then
    sudo systemctl enable --now "${svc}"
  fi
done

echo
echo "==> Status:"
for svc in "${SERVICES[@]}"; do
  state=$(systemctl is-active "${svc}" 2>/dev/null || echo "not-installed")
  printf "    %-20s %s\n" "${svc}" "${state}"
done

echo
echo "==> Logs anytime:"
for svc in "${SERVICES[@]}"; do
  echo "    journalctl -u ${svc} -f"
done
