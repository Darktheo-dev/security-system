// Kevin Varghese – IR Sensor + LED + Buzzer (instant reaction + backend latch fix)
// Board: Arduino UNO R4 WiFi

#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <Arduino_JSON.h>
#include "secrets.h"

// === WiFi & Server Setup ===
const char* ssid          = WIFI_SSID;
const char* password      = WIFI_PASSWORD;
const char* serverAddress = SERVER_HOST;
int         serverPort    = SERVER_PORT;

const int LED_PIN    = 10;
const int BUZZER_PIN = 6;
const int IR_PIN     = 7;

WiFiClient wifi;
HttpClient client(wifi, serverAddress, serverPort);

// === Alarm State ===
bool alarmLatched = false;
unsigned long lastPollTime = 0;
const unsigned long pollInterval = 300; // ms

// === Alarm Status Polling ===
bool checkAlarmStatus() {
  client.get("/alarm-status");
  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  if (statusCode == 200) {
    Serial.print("Alarm status response: ");
    Serial.println(response);

    JSONVar json = JSON.parse(response);
    if (JSON.typeof(json) == "undefined") {
      Serial.println(" JSON parse failed");
      return alarmLatched;
    }

    bool isActive = (bool)json["active"];
    return isActive;
  }

  return alarmLatched;  // fallback
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(IR_PIN, INPUT);

  Serial.print("Connecting to WiFi");
  while (WiFi.begin(ssid, password) != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\n Connected to WiFi");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  int motion = digitalRead(IR_PIN);
  bool objectDetected = (motion == LOW);

  // === Trigger Alarm ===
  if (objectDetected && !alarmLatched) {
    alarmLatched = true;
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("🚨 Motion detected!");

    // Send to backend
    client.beginRequest();
    client.post("/motion");
    client.sendHeader("Content-Type", "application/json");
    client.sendHeader("Content-Length", 2);
    client.beginBody();
    client.print("{}");
    client.endRequest();

    int statusCode = client.responseStatusCode();
    String response = client.responseBody();
    Serial.print("Motion log status: ");
    Serial.println(statusCode);
    Serial.print("Response: ");
    Serial.println(response);
  }

  // === While alarm active, check backend for disarm ===
  if (alarmLatched) {
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);

    // Poll every 300ms
    if (millis() - lastPollTime > pollInterval) {
      lastPollTime = millis();
      bool stillActive = checkAlarmStatus();
      if (!stillActive) {
        alarmLatched = false;
        digitalWrite(LED_PIN, LOW);
        digitalWrite(BUZZER_PIN, LOW);
        Serial.println("Disarmed from backend");
      }
    }
  } else {
    // Alarm is not latched
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
  }
}