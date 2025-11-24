import { useEffect, useState } from "react";
import axios from "axios";

const HOST = "adeyemi-iot.onrender.com";
const WS_URL = `wss://${HOST}`;
const HTTP_URL = `https://${HOST}`;

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [deviceOnline, setDeviceOnline] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${HTTP_URL}/device-status`);
        setDeviceOnline(res.data.online);
      } catch (err) {
        console.error("Status check failed");
        setDeviceOnline(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => setConnected(true);
    ws.onmessage = (evt) => {
      setMessages((prev) => [evt.data, ...prev].slice(0, 20));
    };
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, []);

  const controlLED = async (state) => {
    try {
      await axios.post(`${HTTP_URL}/led`, { state });
    } catch (err) {
      console.error("Failed to control LED", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>IoT Dashboard (LED Control)</h2>
      <p>Device: {deviceOnline ? "🟢 Online" : "🔴 Offline"}</p>

      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => controlLED("on")} style={{ marginRight: 10 }}>
          Turn LED ON
        </button>
        <button onClick={() => controlLED("off")}>Turn LED OFF</button>
      </div>

      <h3 style={{ marginTop: 20 }}>Messages</h3>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
