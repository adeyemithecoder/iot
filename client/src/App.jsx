import React, { useEffect, useState } from "react";
import axios from "axios";

// const HOST = window.location.hostname; // your PC LAN IP if needed
// const WS_URL = `ws://${HOST}:8000`;
// const HTTP_URL = `http://${HOST}:8000`;

const HOST = "iot-5mu7.onrender.com";
const WS_URL = `wss://${HOST}`; // Secure WebSocket
const HTTP_URL = `https://${HOST}`;

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WS open");
      setConnected(true);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        setMessages((prev) => [data, ...prev].slice(0, 100));
      } catch (e) {
        setMessages((prev) => [{ raw: evt.data }, ...prev]);
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.error("WS error", err);

    return () => ws.close();
  }, []);

  const sendUpdate = async () => {
    const body = { message: input || `manual update ${Date.now()}` };
    try {
      await axios.post(`${HTTP_URL}/update`, body);
      setInput("");
    } catch (err) {
      console.error("Failed to POST /update", err);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>IoT Dashboard (WebSocket)</h2>
      <div>
        Status: <strong>{connected ? "Connected" : "Disconnected"}</strong>
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="message to broadcast via /update"
        />
        <button onClick={sendUpdate} style={{ marginLeft: 8 }}>
          Broadcast
        </button>
      </div>

      <h3 style={{ marginTop: 20 }}>Recent messages</h3>
      <ul>
        {messages.map((m, i) => (
          <li
            key={i}
            style={{ marginBottom: 8, background: "#fafafa", padding: 8 }}
          >
            <pre style={{ margin: 0 }}>{JSON.stringify(m, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
