#include <WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "Developer 1";
const char* password = "11113333";

// Your PC / server LAN IP
// const char* host = "10.103.123.107"; 
// const uint16_t port = 8000;

const char* host = "iot-5mu7.onrender.com";
const uint16_t port = 443;


WebSocketsClient webSocket;  // Declare object first

// Event handler
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("[WSc] Connected to server");
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] Received text: %s\n", payload);
      break;
    case WStype_BIN:
      Serial.println("[WSc] Binary message");
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  WiFi.begin(ssid, password);
  Serial.printf("Connecting to WiFi %s", ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());

  // Initialize WebSocket inside setup()
  // webSocket.begin(host, port, "/");
  webSocket.beginSSL(host, port, "/");  // Use SSL for wss://

  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000); // try reconnect every 5 seconds
}

void loop() {
  webSocket.loop();
  // Add sensors or other logic here
}
