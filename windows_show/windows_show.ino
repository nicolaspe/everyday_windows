
#include <Adafruit_NeoPixel.h>
#include "wifi_config.h"
#include <ArduinoHttpClient.h>
#include <WiFi101.h>

/* ===========================
 * ===== INITIALIZATIONS =====
 * =========================== */

// internet connection initialization
const char server[] = "138.197.122.214";  // server address
int port = 8090;                          // port number
WiFiClient wifiClient;                    // wifi client
WebSocketClient webSocket = WebSocketClient(wifiClient, server, port);  // websocket

// buttons initialization
int buttonLast[] = {1, 1, 1, 1, 1, 1};
int buttons[] = {7, 8, 9, 10, 4, 3};
int buttonLED = 5;

// neopixels initialization
#define NEOPIN    6   // pin of neopixels
#define NUMPIXELS 29  // # of neopixels attached
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIN, NEO_GRB + NEO_KHZ800);

int window_pixels[7][3] = {{4, 4, 4},       // w0
                          {5, 5, 5},        // w1
                          {6, 6, 6},        // w2
                          {9, 9, 9},        // w3
                          {8, 8, 8},        // w4
                          {7, 7, 7},        // w5
                          {1, 2, 3}};       // vr        
int window_colors[7][3] = {{255, 0, 152},   // w0: pink
                          {152, 102, 255},  // w1: violet
                          {255, 204, 0},    // w2: yellorange
                          {50, 50, 230},    // w3: dark blue
                          {20, 255, 173},   // w4: light green
                          {255, 40, 40},    // w5: dark red
                          {255, 255, 255}}; // vr: white
                          
// control variables
int selected = 0;
unsigned long prevTime = 0; // time keeping variable
int socket_interval = 1000;  // interval to send socket information



/* ===========================
 * ========== SETUP ==========
 * =========================== */
void setup() {
  for(int i=0; i<6; i++){
    pinMode(buttons[i], INPUT);
  }
  
  pinMode(buttonLED, OUTPUT);
  // initialize neopixel library
  pixels.begin(); // This initializes the NeoPixel library.
  colorWipe();
  allLights();

  // internet connection
  connectWiFi();
}



/* ===========================
 * ========== LOOP ===========
 * =========================== */
void loop() {
  unsigned long currTime = millis();

  // check buttons
  for (int i=0; i<6; i++) {
    int buttonCurr = digitalRead(buttons[i]);
    // only act ON touch
    if (buttonLast[i]==0 && buttonLast[i]!=buttonCurr) {
      selected = i;
      // change lights
      colorWipe();
      windowLight(selected);
      windowLight(6);
      // send msg to server
      sendWindow(selected);
    }
    buttonLast[i] = buttonCurr;
  }
  
  // pulsating button led
  float pulseVal = (sin( ((currTime/100)%180)/PI )+1)/2 *255;
  analogWrite(buttonLED, pulseVal);
}



/* ===========================
 * ==== NEOPIXEL FUNCTIONS ===
 * =========================== */
void windowLight(int num){
  // window variables
  int r = window_colors[num][0];
  int g = window_colors[num][1];
  int b = window_colors[num][2];
  //  group window pixels
  for(int i=0; i<3; i++){
    int index = window_pixels[num][i];
    pixels.setPixelColor(index, pixels.Color(r, g, b));
    pixels.show();
  }
}

void allLights(){
  for(int num=0; num<7; num++){
    // window variables
    int r = window_colors[num][0];
    int g = window_colors[num][1];
    int b = window_colors[num][2];
    for(int i=0; i<3; i++){
      int index = window_pixels[num][i];
      pixels.setPixelColor(index, pixels.Color(r, g, b));
      pixels.show();
    }
  }
}

void colorWipe() {
  for(int i=0; i<NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(0, 0, 0, 255)); 
  }
}



/* ===========================
 * ==== INTERNET FUNCTIONS ===
 * =========================== */
void connectWiFi(){
  while ( WiFi.status() != WL_CONNECTED) {
//    Serial.print("Attempting to connect to Network named: ");
//    Serial.println(_SSID);           // print the network name (SSID)
    WiFi.begin(_SSID, _PASS);     // try to connect
    delay(200);
  }
  Serial.println("connected!");
}

void connectToServer() {
//  Serial.println("attempting to connect to server");
  webSocket.begin();
  
//  Serial.println(webSocket.connected());
//  if (!webSocket.connected()) {
//    Serial.println("failed to connect to server");
//  } else {
//    Serial.println("connected to server");
//  }
}

void sendWindow(int num){
  // check wifi connection
  if(WiFi.status() != WL_CONNECTED){
    connectWiFi();
  }
  // check server connection
  while(!webSocket.connected()){
    connectToServer();
  }
  // send the message!
  webSocket.beginMessage(TYPE_TEXT);  // message type: text
  webSocket.print(num);               // send the value
  webSocket.endMessage();             // close message
//  Serial.print("window ");
//  Serial.print(num);
//  Serial.println(" sent");
}

