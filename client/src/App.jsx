import { useEffect, useState } from "react";
import axios from "axios";

const HOST = "adeyemi-iot.onrender.com";
const WS_URL = `wss://${HOST}`;
const HTTP_URL = `https://${HOST}`;

function App() {
  const [connected, setConnected] = useState(false);
  const [deviceOnline, setDeviceOnline] = useState(false);

  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  const [messages, setMessages] = useState([]);

  // ================================
  // REST Poll: Check Device Status
  // ================================
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${HTTP_URL}/device-status`);
        setDeviceOnline(res.data.online);
        setTemperature(res.data.temperature);
        setHumidity(res.data.humidity);
      } catch (err) {
        console.error("Status fetch failed");
        setDeviceOnline(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ================================
  // WEBSOCKET: Real-time Data
  // ================================
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => setConnected(true);

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);

        // Sensor update message
        if (data.type === "sensor_update") {
          setTemperature(data.temperature);
          setHumidity(data.humidity);
        }
      } catch (err) {
        // Non-JSON → just add to log
      }

      setMessages((prev) => [evt.data, ...prev].slice(0, 20));
    };

    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, []);

  // ================================
  // LED CONTROL
  // ================================
  const controlLED = async (state) => {
    try {
      await axios.post(`${HTTP_URL}/led`, { state });
    } catch (err) {
      console.error("LED control failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>IoT Dashboard (LED + Sensor Monitor)</h2>

      <p>Device Status: {deviceOnline ? "🟢 Online" : "🔴 Offline"}</p>
      <p>WebSocket: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      <h3>Current Sensor Readings</h3>
      <p>🌡 Temperature: {temperature ?? "--"} °C</p>
      <p>💧 Humidity: {humidity ?? "--"} %</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => controlLED("on")} style={{ marginRight: 10 }}>
          Turn LED ON
        </button>
        <button onClick={() => controlLED("off")}>Turn LED OFF</button>
      </div>

      <h3 style={{ marginTop: 20 }}>Messages Log</h3>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
