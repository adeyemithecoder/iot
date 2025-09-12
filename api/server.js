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

function broadcast(obj) {
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(str);
  });
}

wss.on("connection", (ws) => {
  console.log("WS client connected");
  ws.send("Welcome ESP32/Client");
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
