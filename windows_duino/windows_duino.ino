
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
//const char server[] = "everyday-windows.herokuapp.com";  // server address
//int port = 80;                          // port number
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
#define NUMPIXELS 10  // # of neopixels attached
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIN, NEO_GRB + NEO_KHZ800);
int delayval = 500;   // delay for half a second

int window_pixels[7][3] = {{4, 4, 4},       // w0
                          {5, 5, 5},        // w1
                          {6, 6, 6},        // w2
                          {9, 9, 9},        // w3
                          {8, 8, 8},        // w4
                          {7, 7, 7},        // w5
                          {1, 2, 3}};       // vr        
int window_colors[7][3] = {{255, 0, 102},   // w0: pink
                          {102, 102, 255},  // w1: violet
                          {255, 204, 0},    // w2: yellorange
                          {0, 0, 153},      // w3: dark blue
                          {0, 255, 153},    // w4: light green
                          {204, 0, 0},      // w5: dark red
                          {255, 255, 255}}; // vr: white

// control variables
int selected = 0;
unsigned long prevTime = 0; // time keeping variable
int socket_interval = 1000;  // interval to send socket information

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
  
  for (uint8_t i=0; i<6; i++) {
    // only act ON touch
    if ((currtouched & _BV(i)) && !(lasttouched & _BV(i)) ) {
      selected = i;
      Serial.print(selected);
      Serial.println(" touched");
      // change lights
      colorWipe();
      windowLight(selected);
      windowLight(6);
      // send msg to server
      for (int j=0; j<3; j++){
        sendWindow(selected);
      }
    }
    // if it *was* touched and now *isnt*, alert!
    if (!(currtouched & _BV(i)) && (lasttouched & _BV(i)) ) {
      Serial.print(i); Serial.println(" released");
    }
  } 
  // reset touched state
  lasttouched = currtouched;

  // send socket data according to the interval
  unsigned long currTime = millis();
  if(currTime - prevTime > socket_interval){
    prevTime = currTime;
    sendWindow(selected);
  }
}




/* ===========================
 * ==== INTERNET FUNCTIONS ===
 * =========================== */
void connectWiFi(){
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(_SSID);           // print the network name (SSID)
    WiFi.begin(_SSID, _PASS);     // try to connect
    delay(200);
  }
  Serial.println("connected!");
}

void connectToServer() {
  Serial.println("attempting to connect to server");
  webSocket.begin();
  
  Serial.println(webSocket.connected());
  if (!webSocket.connected()) {
    Serial.println("failed to connect to server");
  } else {
    Serial.println("connected to server");
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
  Serial.print("window ");
  Serial.print(num);
  Serial.println(" sent");
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

