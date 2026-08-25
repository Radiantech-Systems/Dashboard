"""
Reports a graceful power_off event to the backend, with a real reason,
right before the Jetson actually shuts down or reboots.

Wired in as the ExecStop= command of telemetry-agent.service, so
systemd runs this automatically whenever that service is stopped —
including during a normal `sudo shutdown`/`sudo reboot`, which is the
one case the offline-watcher's automatic detection can't explain (it
only ever sees "telemetry stopped arriving", not why).

Usage:
    python3 report_shutdown.py "System shutdown requested"
    python3 report_shutdown.py "System reboot requested"
"""
import os
import sys

import requests
from dotenv import load_dotenv

from logger import get_logger

load_dotenv()

logger = get_logger("report_shutdown")

SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8000")
DEVICE_ID = os.getenv("DEVICE_ID", "jetson-orin-01")
API_KEY = os.getenv("API_KEY", "")


def main():
    reason = sys.argv[1] if len(sys.argv) > 1 else "Service stopped (no reason given)"
    headers = {"X-API-Key": API_KEY} if API_KEY else {}
    try:
        resp = requests.post(
            f"{SERVER_URL.rstrip('/')}/power/events",
            headers=headers,
            json={"device_id": DEVICE_ID, "event_type": "power_off", "reason": reason},
            timeout=3,  # keep this short — shutdown is already in progress, don't hold it up
        )
        if resp.status_code == 200:
            logger.info(f"Reported power_off event: {reason}")
        else:
            logger.warning(f"Server rejected power_off report ({resp.status_code}): {resp.text[:200]}")
    except requests.exceptions.RequestException as e:
        # Network may already be going down — this is expected sometimes, don't block shutdown on it.
        logger.warning(f"Could not report power_off event (network may already be down): {e}")


if __name__ == "__main__":
    main()
