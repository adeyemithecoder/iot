const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ======================================
// UTIL: Broadcast message to all clients
// ======================================
function broadcast(obj) {
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(str);
  });
}

let deviceLastSeen = null;
let isDeviceOnline = false;

// Store latest sensor data
let latestSensor = {
  temperature: null,
  humidity: null,
};

wss.on("connection", (ws) => {
  console.log("WS client connected");

  ws.on("message", (msg) => {
    const text = msg.toString();
    console.log("Received:", text);

    // ================================
    // 🔥 HANDLE SIMPLE PING
    // ================================
    if (text === "PING") {
      deviceLastSeen = Date.now();
      isDeviceOnline = true;
      return;
    }

    // ================================
    // 🔥 HANDLE SENSOR JSON PAYLOAD
    // ================================
    try {
      const data = JSON.parse(text);

      // ESP32 sensor data format:
      // { type: "sensor", temperature: 23, humidity: 55 }
      if (data.type === "sensor") {
        latestSensor.temperature = data.temperature;
        latestSensor.humidity = data.humidity;

        // Broadcast to all dashboards
        broadcast({
          type: "sensor_update",
          temperature: data.temperature,
          humidity: data.humidity,
        });

        return;
      }
    } catch (err) {
      // Not JSON → ignore
      return;
    }
  });

  ws.on("close", () => {
    isDeviceOnline = false;
    console.log("Client disconnected");
  });
});

// ======================================
// ONLINE STATUS CHECKER
// ======================================
setInterval(() => {
  if (!deviceLastSeen) return;
  if (Date.now() - deviceLastSeen > 10000) {
    isDeviceOnline = false;
  }
}, 3000);

// ======================================
// REST API
// ======================================
app.get("/device-status", (req, res) => {
  res.json({
    online: isDeviceOnline,
    lastSeen: deviceLastSeen,
    temperature: latestSensor.temperature,
    humidity: latestSensor.humidity,
  });
});

// LED CONTROL API
app.post("/led", (req, res) => {
  const { state } = req.body;
  if (state === "on") broadcast("LED_ON");
  if (state === "off") broadcast("LED_OFF");
  res.json({ ok: true, state });
});

app.get("/", (req, res) => res.send("IoT WS server running"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`HTTP+WS server listening on http://localhost:${PORT}`)
);
