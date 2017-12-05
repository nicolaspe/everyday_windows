
#include <SPI.h>
#include <WiFi101.h>
#include <ArduinoHttpClient.h>
#include "wifi_config.h"
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <Adafruit_MPR121.h>


/* ===========================
 * ===== INITIALIZATIONS =====
 * =========================== */

// internet connection initialization
const char server[] = "138.197.122.214";  // server address
int port = 8090;                          // port number
WiFiClient wifiClient;                    // wifi client
WebSocketClient webSocket = WebSocketClient(wifiClient, server, port);  // websocket


// cap sensor initialization
#ifndef _BV
  #define _BV(bit) (1<<(bit))
#endif
Adafruit_MPR121 cap = Adafruit_MPR121();
// pin tracking
uint16_t lasttouched = 0;
uint16_t currtouched = 0;


// neopixels initialization
#define NEOPIN    7   // pin of neopixels
#define NUMPIXELS 29  // # of neopixels attached
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIN, NEO_GRB + NEO_KHZ800);
int delayval = 500; // delay for half a second

int window_pixels[7][3] = {{4, 5,6},        // w0
                          {7, 8, 9},        // w1
                          {10, 11, 12},     // w2
                          {19, 20, 21},     // w3
                          {16, 17, 18},     // w4
                          {13, 14, 15},     // w5
                          {1, 2, 3}};       // vr        
int window_colors[7][3] = {{255, 0, 102},   // w0: pink
                          {102, 102, 255},  // w1: violet
                          {255, 204, 0},    // w2: yellorange
                          {0, 0, 153},      // w3: dark blue
                          {0, 255, 153},    // w4: light green
                          {204, 0, 0},      // w5: dark red
                          {255, 255, 255}}; // vr: white

int selected = 0;

/* ===========================
 * ========== SETUP ==========
 * =========================== */
void setup() {
  Serial.begin(9600);
  
  while (!Serial) { // needed to keep leonardo/micro from starting too fast!
    delay(100);
  }
  Serial.println("Initializing...");


  // find the cap sensor
  if (!cap.begin(0x5A)) {
    Serial.println("MPR121 not found, check wiring?");
    while (1);
  }
  Serial.println("MPR121 found!");


  // initialize neopixel library
  pixels.begin(); // This initializes the NeoPixel library.
  colorWipe();
  windowLight(0);
  windowLight(6);

  // internet connection
  connectWiFi();
}


/* ===========================
 * ========== LOOP ===========
 * =========================== */
void loop() {
  // Get the currently touched pads
  currtouched = cap.touched();
  
  for (uint8_t i=0; i<12; i++) {
    // only act ON touch
    if ((currtouched & _BV(i)) && !(lasttouched & _BV(i)) ) {
      selected = i;
      Serial.print(selected);
      Serial.println(" touched");
      colorWipe();
      windowLight(selected);
      windowLight(6);
    }
  }
  
  sendWindow(selected);

  // reset our state
  lasttouched = currtouched;
}




/* ===========================
 * ==== INTERNET FUNCTIONS ===
 * =========================== */
void connectWiFi(){
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(_SSID);           // print the network name (SSID)
    WiFi.begin(_SSID, _PASS);     // try to connect
    delay(500);
  }
}

void connectToServer() {
  Serial.println("attempting to connect");
  webSocket.begin();
  
  Serial.println(webSocket.connected());
  if (!webSocket.connected()) {
    Serial.println("failed to connect");
  } else {
    Serial.println("connected");
  }
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
}


/* ===========================
 * ==== NEOPIXEL FUNCTIONS ===
 * =========================== */
void windowLight(int num){
  // window variables
  int r = window_colors[num][0];
  int g = window_colors[num][1];
  int b = window_colors[num][2];
  // individual random pixels
//  int index = window_pixels[num][0] + random(2);
//  pixels.setPixelColor(index, pixels.Color(r, g, b));
//  pixels.show();
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

