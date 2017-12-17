
#include <Adafruit_NeoPixel.h>

//#ifdef __AVR__
//  #include <avr/power.h>
//#endif

// neopixels initialization
#define NEOPIN    6   // pin of neopixels
#define NUMPIXELS 29  // # of neopixels attached
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIN, NEO_GRB + NEO_KHZ800);

int delayval = 100; // delay for half a second

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

void setup() {
  pixels.begin(); // This initializes the NeoPixel library.
}



void loop() {
  allLights();
//  for(int w=0; w<7; w++){
//    windowLight(w);
//    delay(delayval);
//  }
}



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

