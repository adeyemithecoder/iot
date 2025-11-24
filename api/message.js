// server.js
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

// Broadcast helper
function broadcast(obj) {
  const str = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(str);
  });
}

// WS connections
wss.on("connection", (ws) => {
  console.log("WS client connected");
  // Optionally send a welcome message
  ws.send(
    JSON.stringify({
      message: "Welcome from server",
      time: new Date().toISOString(),
    })
  );

  ws.on("message", (msg) => {
    console.log("Received from client:", msg.toString());
    // optional: if clients send messages, you can handle them here
  });

  ws.on("close", () => console.log("Client disconnected"));
});

// REST endpoint to simulate DB change and broadcast
app.post("/update", (req, res) => {
  const payload = req.body || {};
  const data = {
    ...payload,
    serverTime: new Date().toISOString(),
  };

  broadcast(data);
  res.json({ ok: true, broadcasted: data });
});

// Optional: simple health check
app.get("/", (req, res) => res.send("IoT WS server running"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`HTTP+WS server listening on http://localhost:${PORT}`)
);
