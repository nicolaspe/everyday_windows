
#include <Adafruit_NeoPixel.h>

//#ifdef __AVR__
//  #include <avr/power.h>
//#endif

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

