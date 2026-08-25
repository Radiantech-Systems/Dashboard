# Jetson AGX Orin Telemetry Dashboard

Industrial-style real-time monitoring system:

```
Jetson AGX Orin  --(POST /telemetry every 1s)-->  Ubuntu Server
  jetson-agent/                                     backend/  (FastAPI, WebSocket, PostgreSQL)
                                                      frontend/ (React + TS + MUI + ECharts)
                                                          |
                                                       Browser (never runs on the Jetson)
```

Only temperature/cooling readings are stored historically (`temperature_history`
table). Everything else (CPU/GPU/RAM/Storage/Power/Network/Camera) is live-only,
held in the backend's memory and pushed to the browser over WebSocket.

---

## 1. Prerequisites

**On the Ubuntu Server/Laptop:**
- Docker + Docker Compose plugin (`docker compose version`)
  - OR: Python 3.11+, Node 20+, PostgreSQL 16 if you'd rather run without Docker

**On the Jetson AGX Orin:**
- Python 3.8+ (ships with JetPack)
- Network reachability to the server (same LAN, or routable)

---

## 2. Run the server side (Docker Compose — recommended)

```bash
cd telemetry-dashboard
cp .env.example .env
```

Edit `.env` and set `VITE_API_URL` / `VITE_WS_URL` to the **server's actual LAN
IP** (not `localhost`) so the Jetson and any other machine's browser can reach
it, e.g.:

```
VITE_API_URL=http://192.168.1.50:8000
VITE_WS_URL=ws://192.168.1.50:8000/ws/telemetry
```

Then build and start everything:

```bash
docker compose up -d --build
```

This starts:
| Service   | Port | Purpose                          |
|-----------|------|-----------------------------------|
| postgres  | 5432 | Stores devices + temperature history |
| backend   | 8000 | FastAPI REST + WebSocket API      |
| frontend  | 8080 | Dashboard UI (served by nginx)    |

Check everything is healthy:

```bash
docker compose ps
curl http://localhost:8000/health        # {"status":"ok"}
```

Open the dashboard: **http://<server-ip>:8080**

You'll see "Waiting for telemetry…" / OFFLINE until the Jetson agent starts
sending data — that's expected.

### Without Docker (manual)

```bash
# Postgres: create the DB and run database/init.sql against it yourself first

cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit POSTGRES_HOST=localhost, etc.
uvicorn app.main:app --host 0.0.0.0 --port 8000

# In another terminal
cd frontend
npm install
cp .env.example .env   # point VITE_API_URL/VITE_WS_URL at the backend
npm run dev            # dev server on :5173
```

---

## 3. Run the Jetson agent (on the Jetson AGX Orin itself)

All three Jetson-side services (telemetry agent, footage recorder, live
stream) live in **one shared folder** and share one `.env` — copy
`jetson-agent/` there once, everything else builds on top of it.

Copy the `jetson-agent/` folder to the Jetson (scp, git clone, USB — any method):

```bash
scp -r jetson-agent/ root@<jetson-ip>:/root/telemetry-agent-app
```

On the Jetson:

```bash
cd /root/telemetry-agent-app
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
nano .env
```

Set at minimum:
```
SERVER_URL=http://<server-ip>:8000
DEVICE_ID=jetson-orin-01
DEVICE_NAME=Jetson AGX Orin #1
NETWORK_INTERFACE=eth0        # or your actual interface, check with `ip a`
```

Run it in the foreground first to confirm it works:

```bash
python3 agent.py
```

You should see log lines like:
```
Starting telemetry agent | device_id=jetson-orin-01 | server=http://192.168.1.50:8000 | interval=1.0s
```

If you see repeated `Failed to reach server` errors, check the server IP/port,
firewall rules, and that both devices are on the same network.

**Now refresh the browser dashboard** — the status chip should flip to
`ONLINE` and the cards/gauges should start updating every second.

### Run everything permanently (auto-start on boot)

The easiest way — installs and starts all three Jetson services
(telemetry agent, footage recorder, live stream) in one shot:
```bash
chmod +x start-jetson.sh
./start-jetson.sh
```
It prints each service's status when done. Re-run it anytime — it's
safe, just re-confirms everything's installed and active.

Or install just the telemetry agent on its own:
```bash
sudo cp telemetry-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now telemetry-agent
sudo systemctl status telemetry-agent     # confirm it's active/running
journalctl -u telemetry-agent -f          # live logs
```

> **Note on `tegrastats`/`nvpmodel`/fan sysfs paths:** these are real Jetson
> hardware interfaces and only produce data when the agent runs directly on
> a Jetson with JetPack installed. If you test the agent on a regular Ubuntu
> PC first (to verify connectivity before deploying to the Jetson), CPU/RAM/
> Storage/Network will populate normally; GPU/Power/Fan/Board-temperature
> fields will simply read `null` until run on the actual device — this is
> expected and the dashboard renders `--` for missing values rather than
> erroring.

---

## 4. Verify you're seeing live data

1. `docker compose logs -f backend` — you should see no errors, and the
   offline-watcher should stay quiet as long as telemetry keeps arriving.
2. Dashboard → **Dashboard** page: status chip = `ONLINE`, cards populate.
3. Dashboard → **Performance** page: gauges and per-core bars move every second.
4. Dashboard → **Temperature History** page: after a minute or two, switch to
   "Last Hour" and you should see a line chart forming plus rows in the table.
   Try **Export CSV**.

If the status chip shows `Disconnected` (top right), the browser can't reach
the WebSocket — double check `VITE_WS_URL` matches the server's reachable
address and that port 8000 isn't blocked by a firewall:

```bash
sudo ufw allow 8000/tcp
sudo ufw allow 8080/tcp
```

---

## 5. Project structure

```
telemetry-dashboard/
├── docker-compose.yml
├── database/init.sql              # devices, temperature_history tables
├── backend/                       # FastAPI + SQLAlchemy + WebSocket
│   └── app/
│       ├── main.py                # app, CORS, WS endpoint, offline watcher
│       ├── config.py / database.py / models.py / schemas.py
│       ├── websocket_manager.py   # connection manager + in-memory live store
│       └── routers/               # telemetry, dashboard, system-info,
│                                   # performance, power, network, temperature
├── jetson-agent/                  # runs ON the Jetson, not the server
│   ├── agent.py                   # main 1s collection loop
│   ├── sender.py
│   ├── telemetry-agent.service    # systemd unit for auto-start
│   └── collectors/                # one module per metric category
└── frontend/                      # runs ON the server, never on the Jetson
    └── src/
        ├── hooks/useTelemetrySocket.ts   # WebSocket + auto-reconnect
        ├── api/client.ts                 # REST calls
        ├── components/                   # Layout, StatCard, GaugeChart
        └── pages/                        # the 7 dashboard pages
```

## 6. API reference

| Method | Endpoint                    | Purpose                                  |
|--------|------------------------------|-------------------------------------------|
| POST   | `/telemetry`                 | Agent → server ingestion (every 1s)       |
| GET    | `/dashboard`                 | Summary cards for all devices             |
| GET    | `/system-info`               | Device identity                           |
| GET    | `/performance`                | Live CPU/GPU/RAM/Storage                  |
| GET    | `/power`                      | Live power mode/consumption               |
| GET    | `/network`                    | Live network + cameras                    |
| GET    | `/temperature/history`        | Historical rows (`range`/`start`/`end`)   |
| GET    | `/temperature/history/export` | CSV download                              |
| WS     | `/ws/telemetry`               | Real-time push to the dashboard           |

## 7. Exposing this to the public internet (quick tunnel with ngrok)

By default the API has no authentication — fine for a LAN-only setup, but
**not safe to expose publicly as-is**. This project includes a simple
shared API-key check on every REST endpoint and the WebSocket. Turn it on
before tunneling.

### 8.1 Generate a key and enable auth
```bash
openssl rand -hex 24
```
Put the result in `.env` on the server:
```
API_KEY=<the generated key>
VITE_API_KEY=<the same generated key>
```

### 8.2 Install ngrok (one-time)
```bash
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
ngrok config add-authtoken <your-token-from-ngrok.com>
```

### 8.3 Open two tunnels (backend and frontend need separate public URLs)
In one terminal:
```bash
ngrok http 8000
```
Copy the `https://xxxx.ngrok-free.app` URL it prints — this is your public **backend** URL.

In a second terminal:
```bash
ngrok http 8080
```
Copy this second URL — your public **frontend** URL. This is the link you share.

### 8.4 Rebuild the frontend pointing at the public backend tunnel
Edit `.env` on the server:
```
VITE_API_URL=https://<your-backend-tunnel>.ngrok-free.app
VITE_WS_URL=wss://<your-backend-tunnel>.ngrok-free.app/ws/telemetry
```
Then:
```bash
docker compose up -d --build frontend
```

### 8.5 Point the Jetson agent at the public backend tunnel too
On the Jetson, edit `jetson-agent/.env`:
```
SERVER_URL=https://<your-backend-tunnel>.ngrok-free.app
API_KEY=<the same generated key>
```
Restart the agent (`Ctrl+C` then `python3 agent.py`, or `sudo systemctl restart telemetry-agent`).

### 8.6 Share the link
Send anyone the frontend tunnel URL: `https://<your-frontend-tunnel>.ngrok-free.app`

**Notes:**
- Free ngrok URLs change every time you restart the tunnel — you'll need to
  repeat 8.3–8.5 each session, or upgrade ngrok for a fixed subdomain.
- Keep both `ngrok http 8000` and `ngrok http 8080` terminals running for as
  long as you want the link to work.
- Without `API_KEY` set, anyone with the link can read your telemetry and
  post fake data — don't skip step 8.1 for anything public-facing.

## 8. Live camera view (two ways, pick what fits your camera)

The **Live CCTV Streams** table on the Network & Cameras page (and each
camera's direct `/live/<path>` link) supports two independent sources,
configured in `frontend/src/config/cctvStreams.ts`:

### 8A. Live from the Jetson's own camera (MJPEG via Flask — simpler, recommended)

The Jetson runs a small Flask server that reads its camera with `ffmpeg`
and serves it as an MJPEG stream — a format browsers display natively
with a plain `<img>` tag. No MediaMTX, no HLS.js, no separate RTSP
server needed for this case.

**On the Jetson:**
```bash
cd /root/telemetry-agent-app   # or wherever jetson-agent/ was copied to
source venv/bin/activate
pip install -r requirements.txt   # picks up flask if not already installed
```
In `.env`, confirm/adjust:
```
LIVE_STREAM_DEVICE=/dev/video0
LIVE_STREAM_WIDTH=1280
LIVE_STREAM_HEIGHT=720
LIVE_STREAM_FPS=15
LIVE_STREAM_PORT=5001
```
Test it once:
```bash
python3 live_stream_server.py
```
Expected: `Starting live stream server | device=/dev/video0 | 1280x720@15fps | port=5001`.
Open `http://<jetson-ip>:5001/video_feed` directly in a browser — you
should see the live feed as a plain image that keeps updating.

Make it permanent:
```bash
sudo cp live-stream.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now live-stream
sudo systemctl status live-stream
```

**On the server**, edit `frontend/src/config/cctvStreams.ts` and set
`streamUrl` to the Jetson's actual IP:
```ts
{
  label: "Jetson Camera",
  path: "jetson_camera",
  source: "mjpeg",
  streamUrl: "http://192.168.1.155:5001/video_feed",
}
```
Then rebuild the frontend:
```bash
docker compose up -d --build frontend
```

**Note on device conflicts:** if this same camera is also used by
`footage_recorder.py` (Sliced Footage) or the telemetry agent's onboard
camera detection, only one process can hold `/dev/video0` at a time —
same "Device or resource busy" issue covered earlier. Decide which
feature owns that camera, or use separate camera devices.

### 8B. External RTSP CCTV/IP camera via MediaMTX (for a real standalone camera)

Browsers can't play RTSP directly, so a gateway (**MediaMTX**, already
wired into `docker-compose.yml`) pulls the RTSP stream from your camera
and re-serves it as HLS, which the dashboard plays in a `<video>` element
via `hls.js`. Use this instead of 8A when the camera is a real external
CCTV/IP camera (not the Jetson's own camera).

### 8B.1 Get your camera's RTSP URL
Check your camera/NVR's manual — typically:
```
rtsp://<username>:<password>@<camera-ip>:554/<stream-path>
```
Common paths: `Streaming/Channels/101` (Hikvision), `stream1` (generic ONVIF),
`live/ch0` (varies by brand). If unsure, VLC → Media → Open Network Stream →
paste candidate URLs to test which one works.

### 8B.2 Configure MediaMTX
Edit `docker/mediamtx.yml`:
```yaml
paths:
  front_gate:
    source: rtsp://admin:yourpassword@192.168.1.64:554/Streaming/Channels/101
    sourceOnDemand: yes
```
Add one block per camera, each with a unique path name (letters/numbers/underscores only).

### 8B.3 Register it in the dashboard UI
Edit `frontend/src/pages/NetworkCameras.tsx`, update the `CCTV_STREAMS` array:
```ts
const CCTV_STREAMS = [
  { label: "Front Gate", path: "front_gate" },
  { label: "Backyard", path: "backyard" },
];
```
The `path` here must exactly match the path name in `mediamtx.yml`.

### 8B.4 Set the MediaMTX URL the browser will use
In `.env`:
```
VITE_MEDIAMTX_URL=http://<server-ip>:8888
```

### 8B.5 Rebuild and start
```bash
docker compose up -d --build
```
Confirm MediaMTX is running:
```bash
docker compose logs mediamtx
```

### 8B.6 Watch it live
Go to **Network & Cameras** in the dashboard → **Live CCTV Streams** section →
click **View Live** next to your camera. First connect can take a couple
seconds (MediaMTX connects to the camera on-demand, only while someone's watching).

**Notes:**
- `sourceOnDemand: yes` means MediaMTX only opens the RTSP connection while
  at least one viewer has the stream open — saves camera/network load when
  nobody's watching.
- If exposing this publicly (Part 8), also forward/tunnel port `8888` and
  update `VITE_MEDIAMTX_URL` to the public tunnel address for that port.
- Multiple cameras: just repeat 9.2–9.3 for each one.

### 8.7 Direct shareable links
Every camera on this page has a direct link that opens straight to the
live stream — no clicking through the dashboard first:
```
http://<server>:8080/live/front_gate
```
Use the link/copy icon next to each camera row to copy it, or the
open-in-new-tab icon to test it immediately. Bookmark or share this URL
directly. Add more cameras by adding entries to both
`docker/mediamtx.yml` and `frontend/src/config/cctvStreams.ts` — the
link for each follows `/live/<path>` automatically.

## 9. Sliced Footage (recorded video clips, uploaded to the backend)

This records fixed-length video segments and uploads each finished
segment to the backend, which lists them in the dashboard's **Sliced
Footage** page for playback. `footage_recorder.py` supports two source
types:
- `v4l2` — opens a camera device directly (works when that device has
  its own free camera, e.g. a Jetson with a CSI/USB camera attached).
- `rtsp` — pulls from an existing RTSP stream instead (e.g. a webcam
  already served by another process). Use this when the recorder and
  the live CCTV view need to share one camera without fighting over
  the device — this is the mode this project's example setup uses,
  since the webcam lives on the Ubuntu server, not the Jetson.

### 9.1 Get ffmpeg
Standard JetPack/Ubuntu: `sudo apt install -y ffmpeg`. On a minimal/
custom image with no package manager (e.g. Yocto/OpenEmbedded — check
with `cat /etc/os-release`), use a static binary instead:
```bash
# on a machine WITH internet:
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz
tar xf ffmpeg-release-arm64-static.tar.xz
scp ffmpeg-*-arm64-static/ffmpeg root@<target-ip>:/usr/local/bin/ffmpeg
ssh root@<target-ip> "chmod +x /usr/local/bin/ffmpeg && ffmpeg -version"
```

### 9.2 Configure it
In `jetson-agent/.env` (or wherever you're running `footage_recorder.py`
from — it doesn't have to be the Jetson; running it on the same host as
the camera avoids a network hop):
```
SERVER_URL=http://<server-ip>:8000
DEVICE_ID=<a-unique-name-for-this-recorder>
DEVICE_NAME=<a-friendly-name>
API_KEY=

FOOTAGE_ENABLED=true
FOOTAGE_SOURCE_TYPE=rtsp
FOOTAGE_RTSP_URL=rtsp://<camera-host>:8554/<path>
FOOTAGE_SEGMENT_SECONDS=60
```
Or, for a device with its own free camera:
```
FOOTAGE_SOURCE_TYPE=v4l2
FOOTAGE_DEVICE=/dev/video0
FOOTAGE_RESOLUTION=1280x720
FOOTAGE_FRAMERATE=15
```
Confirm the RTSP path before assuming it — `ffprobe -rtsp_transport tcp
rtsp://<camera-host>:8554/<path>` should show real stream info.

### 9.3 Run it once to test
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 footage_recorder.py
```
Expected: `Starting footage recorder | source=rtsp | rtsp=... | segment=60s | server=...`,
then `Uploaded <device-id>_....mp4` roughly once per segment. `Ctrl+C`
to stop the test.

### 9.4 Make it permanent (systemd)
```bash
sudo cp footage-recorder.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now footage-recorder
sudo systemctl status footage-recorder
```
Or use `./start-jetson.sh` if running on the Jetson — installs and
starts this alongside `telemetry-agent` in one command.

### 9.5 View it
Dashboard → **Sliced Footage**. Filter by Last Hour / Last Day / Last
Week, click **Play** on any clip. Each clip also has a copy-link and
open-in-new-tab icon pointing at the file directly
(`http://<server>:8000/footage-files/....mp4`).

**Notes:**
- Clips are stored on the server under the `footage_data` Docker volume
  and served back at `/footage-files/...` — no separate file server
  needed.
- If the same camera is also used for the live CCTV view (section 8),
  `FOOTAGE_SOURCE_TYPE=rtsp` pulling from the same RTSP source as
  MediaMTX avoids the device-conflict issue that `v4l2` mode would hit
  (only one process can hold a raw camera device at a time; most RTSP
  servers support multiple simultaneous viewers).
- There's currently no retry queue: if an upload fails (server
  unreachable mid-upload), that segment is discarded rather than
  retried — acceptable for most monitoring use cases, but worth
  knowing.

## 10. Subsystem Power Details (power on/off log)

The **Power** page now includes a power on/off event log with timestamp,
date, and — for power-off events — a reason. Since a device can't report
"I just lost power" (it's off by then), events come from two sources:

1. **Automatic** (no setup needed) — the backend logs a `power_on` event
   whenever a device's telemetry resumes after being offline or unseen,
   and a `power_off` event whenever a device stops sending telemetry for
   longer than `DEVICE_OFFLINE_TIMEOUT_SECONDS` (default 5s). The reason
   in this case is always some variant of "no telemetry received" — the
   server genuinely can't know *why* it stopped, only that it did.

2. **Graceful, with a real reason** (needs the systemd setup below) — the
   Jetson reports its own shutdown/reboot to the backend a moment before
   it actually happens, so the reason is meaningful instead of a guess.

### 10.1 Wire up the graceful-shutdown report (recommended)
This is already wired into `telemetry-agent.service`'s `ExecStop=` line —
if you already installed that service (Part 3, Step 17), you likely just
need to reinstall the updated version:
```bash
cd /root/telemetry-agent-app   # or wherever jetson-agent/ was copied to
sudo cp telemetry-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart telemetry-agent
```
From now on, `sudo systemctl stop telemetry-agent`, `sudo reboot`, and
`sudo shutdown` will all log a `power_off` event with the reason "Service
stopped (shutdown, reboot, or manual stop)" — a real reason, not a guess.

### 10.2 Tune the automatic-detection sensitivity (optional)
`DEVICE_OFFLINE_TIMEOUT_SECONDS=5` (the default) means a brief WiFi hiccup
can log a `power_off` event within 5 seconds — useful for a demo, noisy
for real use. If you want fewer false "power off" entries from ordinary
network blips, raise it in `.env`:
```
DEVICE_OFFLINE_TIMEOUT_SECONDS=30
```
then `docker compose up -d backend` to apply it.

### 10.3 View the log
Dashboard → **Power** → **Subsystem Power Details** section at the bottom.
Filter by Last Hour / Last Day / Last Week.

## 11. Scaling to multiple Jetsons

The schema already supports it — every table and endpoint is keyed by
`device_id`. Just run the agent on each Jetson with a unique `DEVICE_ID`
pointed at the same server; the Dashboard page will list every device once
you extend the device-selector in the UI (currently the pages default to the
first/primary device — add a device picker in `Layout.tsx`/pages if you need
multi-device views side by side).
