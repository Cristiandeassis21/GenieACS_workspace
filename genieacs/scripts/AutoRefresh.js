const now = Date.now();

let productClass = declare("DeviceID.ProductClass", {value: 1}).value[0];

// 1. Informações Gerais e Hardware
declare("InternetGatewayDevice.DeviceInfo.*", {path: now});
declare("Device.DeviceInfo.*", {path: now});

// 2. Diagnóstico de WAN (Conectividade)
declare("InternetGatewayDevice.WANDevice.*.WANConnectionDevice.*.WANPPPConnection.*.*", {path: now});
declare("InternetGatewayDevice.WANDevice.*.WANConnectionDevice.*.WANIPConnection.*.*", {path: now});
declare("Device.IP.Interface.*.*", {path: now});
declare("Device.IP.Interface.*.IPv4Address.*.*", {path: now});
declare("Device.PPP.Interface.*.*", {path: now});
declare("Device.DNS.Client.Server.*.*", {path: now});

// 3. Diagnóstico Wi-Fi (2.4GHz e 5GHz)
declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.*.*", {path: now});
declare("Device.WiFi.SSID.*.*", {path: now});
declare("Device.WiFi.Radio.*.*", {path: now});
declare("Device.WiFi.AccessPoint.*.*", {path: now});
declare("Device.WiFi.AccessPoint.*.Security.*", {path: now});

// 4. Dispositivos Conectados (LAN Hosts e RSSI)
declare("InternetGatewayDevice.LANDevice.*.Hosts.Host.*.*", {path: now});
declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.*.AssociatedDevice.*.*", {path: now});
declare("Device.Hosts.Host.*.*", {path: now});
declare("Device.WiFi.AccessPoint.*.AssociatedDevice.*.*", {path: now});

// 5. Diagnóstico Óptico (ONTs)
declare("InternetGatewayDevice.WANDevice.*.WANDSLInterfaceConfig.*", {path: now});
declare("Device.Optical.Interface.*.*", {path: now});
