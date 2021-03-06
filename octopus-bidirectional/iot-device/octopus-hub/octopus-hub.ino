#include <PubSubClient.h>

/*
 * Bosch SI Example Code License Version 1.0, January 2016
 *
 * Copyright 2017 Bosch Software Innovations GmbH ("Bosch SI"). All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 * following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 * disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
 * following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * BOSCH SI PROVIDES THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK AS TO THE
 * QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU. SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL
 * NECESSARY SERVICING, REPAIR OR CORRECTION. THIS SHALL NOT APPLY TO MATERIAL DEFECTS AND DEFECTS OF TITLE WHICH BOSCH
 * SI HAS FRAUDULENTLY CONCEALED. APART FROM THE CASES STIPULATED ABOVE, BOSCH SI SHALL BE LIABLE WITHOUT LIMITATION FOR
 * INTENT OR GROSS NEGLIGENCE, FOR INJURIES TO LIFE, BODY OR HEALTH AND ACCORDING TO THE PROVISIONS OF THE GERMAN
 * PRODUCT LIABILITY ACT (PRODUKTHAFTUNGSGESETZ). THE SCOPE OF A GUARANTEE GRANTED BY BOSCH SI SHALL REMAIN UNAFFECTED
 * BY LIMITATIONS OF LIABILITY. IN ALL OTHER CASES, LIABILITY OF BOSCH SI IS EXCLUDED. THESE LIMITATIONS OF LIABILITY
 * ALSO APPLY IN REGARD TO THE FAULT OF VICARIOUS AGENTS OF BOSCH SI AND THE PERSONAL LIABILITY OF BOSCH SI'S EMPLOYEES,
 * REPRESENTATIVES AND ORGANS.
 */
#include "settings.h"
#include "printer.h"
#include "octopus.h"
#include "boschIotHub.h"

ADC_MODE(ADC_VCC); // enable reading in VCC of ESP8266

Octopus octopus;
BoschIotHub hub(MQTT_BROKER, MQTT_PORT, mqtt_server_ca, mqtt_server_ca_len);

unsigned long lastSensorUpdateMillis = 0;
unsigned int sensorUpdateRate = SENSOR_UPDATE_RATE_MS;

void setup()
{
  Serial.begin(SERIAL_BAUD);
  while (!Serial)
    ;
  Serial.println("                             "); // print some spaces to let the Serial Monitor catch up
  Serial.println();
  
  Serial.println();   Serial.println();
  Serial.println("[settings.h]");
  Serial.print("SERIAL_BAUD           "); Serial.println(SERIAL_BAUD);
  Serial.print("WIFI_SSID             "); Serial.println(WIFI_SSID);
  Serial.print("WIFI_PASSWORD         "); Serial.println(WIFI_PASSWORD);
  Serial.print("THINGS_NAMESPACE      "); Serial.println(THINGS_NAMESPACE);
  Serial.print("THING_NAME            "); Serial.println(THING_NAME);
  Serial.print("HUB_TENANT            "); Serial.println(HUB_TENANT);
  Serial.print("HUB_DEVICE_ID         "); Serial.println(HUB_DEVICE_ID);
  Serial.print("HUB_DEVICE_AUTH_ID    "); Serial.println(HUB_DEVICE_AUTH_ID);
  Serial.print("HUB_DEVICE_PASSWORD   "); Serial.println(HUB_DEVICE_PASSWORD);
  Serial.print("SENSOR_UPDATE_RATE_MS "); Serial.println(SENSOR_UPDATE_RATE_MS);
  Serial.print("MQTT_BROKER           "); Serial.println(MQTT_BROKER );
  Serial.print("MQTT_PORT             "); Serial.println(MQTT_PORT);
  Serial.print("MQTT_MAX_PACKET_SIZE  "); Serial.println(MQTT_MAX_PACKET_SIZE);
      
  Serial.println();

  Printer::printlnMsg("Reset reason", ESP.getResetReason());

  octopus.begin();
  octopus.connectToWifi(WIFI_SSID, WIFI_PASSWORD);

  if (!hub.connect())
  {
    Printer::printlnMsg("Error", "Could not connect to Hub. Restarting octopus");
    ESP.restart();
  }

  Serial.println();
}

void customMessageHandler(JsonObject &root, String command, String replyTopic)
{
  const char *dittoTopic = root["topic"];
  JsonObject &headers = root["headers"];
  const char* path = root["path"];

  String switchLedPath = "/features/led/inbox/messages/setColor";

  Serial.println(command);

  if (command.equals("switch_led") || (command.equals("setColor") && switchLedPath.equals(path)))
  {
    JsonObject &value = root["value"];
    const char red = value["r"];
    const char green = value["g"];
    const char blue = value["b"];
    const char white = value["w"];
    octopus.showColor(0, red, green, blue, white);
    octopus.showColor(1, red, green, blue, white);

    root["value"] = "\"Command '" + command + "' executed\"";
    root["status"] = 200;
  }
  else if (command.equals("change_update_rate"))
  {
    sensorUpdateRate = root["value"];

    root["value"] = "\"Command '" + command + "' executed\"";
    root["status"] = 200;
  }
  else
  {
    root["value"] = "\"Command unknown: '" + command + "'\"";
    root["status"] = 404;
  }

  String output;
  root.printTo(output);
  String replyTopicAndStatusCode = replyTopic + "200";
  hub.publish(replyTopicAndStatusCode.c_str(), output);
}

void loop()
{
  if (!hub.deviceIsConnected())
  {
    octopus.showColor(1, 0x80, 0, 0, 0); // red
    hub.connectDevice(HUB_DEVICE_ID, HUB_DEVICE_AUTH_ID "@" HUB_TENANT, HUB_DEVICE_PASSWORD);
    octopus.showColor(1, 0, 0x80, 0, 0); // green
    hub.subscribe("command///req/#");
    hub.registerOnDittoProtocolMessage(customMessageHandler);
  }

  if (millis() - lastSensorUpdateMillis > sensorUpdateRate)
  {
    lastSensorUpdateMillis = millis();
    static Bme680Values bme680Values;
    static Bno055Values bno055Values;
    static LedValues ledValues;
    memset(&bme680Values, 0, sizeof(bme680Values));
    memset(&bno055Values, 0, sizeof(bno055Values));
    memset(&ledValues, 0, sizeof(ledValues));
    octopus.readBno055(bno055Values);
#ifdef BME280
    octopus.readBme280(bme680Values);
#else
    octopus.readBme680(bme680Values);
#endif
    float vcc = octopus.getVcc();

    octopus.readLed(ledValues);

    publishSensorData(vcc, bme680Values, bno055Values, ledValues);
  }
  hub.loop();
  delay(LOOP_DELAY);
}
