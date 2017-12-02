#include <SPI.h>
#include <WiFi101.h>

# define button 8
# define led 7

// Arduino MKR1000 MAC address: F8:F0:5:F5:D6:19

//const char ssid[] = "itpsandbox";
//const char pass[] = "NYU+s0a!P?";
const char ssid[] = "npe_WiFi";
const char pass[] = "npescarpentier.1990";

int status = WL_IDLE_STATUS;
int port = 31542;
WiFiSSLClient client;
char server[] = "everyday-windows.herokuapp.com";

void setup() {
  Serial.begin(9600);

  while(!Serial){
    ; // wait for serial port to connect
  }

  pinMode(button, INPUT);
  pinMode(led, OUTPUT);
  
  connectWiFi();
}


/* ===========================
 * ===== SETUP FUNCTIONS =====
 * =========================== */

void connectWiFi(){
  // check for WiFi shield
  if(WiFi.status() == WL_NO_SHIELD){
    Serial.println("NO WIFI SHIELD! D:");
    while(true);  // don't continue
  }

  // print MAC address
  Serial.print("MAC address: ");
  printMacAddress();

  // attempt to connect
  while(status != WL_CONNECTED){
    Serial.println();
    
    listNetworks();
    Serial.println();
    
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);

    // wait 5 seconds to verify connection
    delay(5000);
    Serial.print("status: ");
    Serial.println(status);
  }
}

void printMacAddress() {
  // the MAC address of your Wifi shield
  byte mac[6];

  // print your MAC address:
  WiFi.macAddress(mac);
  Serial.print("MAC: ");
  Serial.print(mac[5], HEX);
  Serial.print(":");
  Serial.print(mac[4], HEX);
  Serial.print(":");
  Serial.print(mac[3], HEX);
  Serial.print(":");
  Serial.print(mac[2], HEX);
  Serial.print(":");
  Serial.print(mac[1], HEX);
  Serial.print(":");
  Serial.println(mac[0], HEX);
}

void listNetworks() {
  // scan for nearby networks:
  int numSsid = WiFi.scanNetworks();
  if (numSsid == -1) {
    Serial.println("Couldn't get a wifi connection");
    while (true);
  }

  // print the list of networks seen:
  Serial.print("number of available networks:");
  Serial.println(numSsid);

  // print the network number and name for each network found:
  for (int i = 0; i < numSsid; i++) {
    Serial.print(i);
    Serial.print(") ");
    Serial.print(WiFi.SSID(i));
    Serial.print("\tSignal: ");
    Serial.print(WiFi.RSSI(i));
    Serial.print(" dBm");
    Serial.println();
    Serial.flush();
  }
}



/* ===========================
 * ========== LOOP  ==========
 * =========================== */
 
void loop() {
  // recheck connection and attempt to reconnect
  if(status != WL_CONNECTED){
    Serial.print("WiFi disconnected! D:");
    connectWiFi();
  } 
//  else {
//    Serial.println("connected, no probs :D");
//  }

  int butt = digitalRead(button);
  if(butt == HIGH){
    digitalWrite(led, HIGH);
    postMessage(2);
  } else {
    digitalWrite(led, LOW);
  }
  //  Serial.print("Button: ");
  //  Serial.println(butt);
}



/* ===========================
 * ===== LOOP FUNCTIONS ======
 * =========================== */

void postMessage(int msg){
  Serial.println("\nStarting connection to server...");
  // if you get a connection, report back via serial:
  if (client.connect(server, port)) {
    Serial.println("connected to server");
    // POST message
    switch(msg){
      case 0:
        client.println("POST /scene 0");
        break;
      case 1:
        client.println("POST /scene 1");
        break;
      case 2:
        client.println("POST /scene 2");
        break;
      case 3:
//        client.println("POST /scene 3");
        break;
      case 4:
//        client.println("POST /scene 4");
        break;
      case 5:
//        client.println("POST /scene 5");
        break;
      case 6:
//        client.println("POST /scene 6");
        break;
    }
    client.println("Connection: close");
    client.println();
  }
  delay(500);
}

