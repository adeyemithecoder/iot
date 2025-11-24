const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

function broadcast(obj) {
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(str);
  });
}
let deviceLastSeen = null;
let isDeviceOnline = false;

wss.on("connection", (ws) => {
  console.log("WS client connected");

  ws.on("message", (msg) => {
    if (msg === "PING") {
      deviceLastSeen = Date.now();
      isDeviceOnline = true;
    }
  });

  // When WebSocket disconnects
  ws.on("close", () => {
    isDeviceOnline = false;
    console.log("Client disconnected");
  });
});

setInterval(() => {
  if (!deviceLastSeen) return;

  if (Date.now() - deviceLastSeen > 10000) {
    // 10 seconds without ping
    isDeviceOnline = false;
  }
}, 3000);

app.get("/device-status", (req, res) => {
  res.json({
    online: isDeviceOnline,
    lastSeen: deviceLastSeen,
  });
});

// REST endpoint for LED control
app.post("/led", (req, res) => {
  const { state } = req.body;
  if (state === "on") {
    broadcast("LED_ON");
  } else if (state === "off") {
    broadcast("LED_OFF");
  }
  res.json({ ok: true, state });
});

app.get("/", (req, res) => res.send("IoT WS server running"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`HTTP+WS server listening on http://localhost:${PORT}`)
);
