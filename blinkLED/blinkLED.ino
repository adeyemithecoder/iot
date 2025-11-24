#include <WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "Developer 1";
const char* password = "111133334";

const char* host = "adeyemi-iot.onrender.com";
const uint16_t port = 443;

WebSocketsClient webSocket;

#define LED_PIN 5  

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

      // Handle LED commands
      if (strcmp((char*)payload, "LED_ON") == 0) {
        digitalWrite(LED_PIN, HIGH);
        Serial.println("LED turned ON");
      } else if (strcmp((char*)payload, "LED_OFF") == 0) {
        digitalWrite(LED_PIN, LOW);
        Serial.println("LED turned OFF");
      }

      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  WiFi.begin(ssid, password);
  Serial.printf("Connecting to WiFi %s", ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: ");
  Serial.println(WiFi.localIP());

  webSocket.beginSSL(host, port, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
}
