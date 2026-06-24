const now = Date.now();

let productClass = declare("DeviceID.ProductClass", {value: 1}).value[0];

if (productClass === "MR70X") {
    declare("Device.DeviceInfo.*", {path: now});
    declare("Device.WiFi.SSID.*.SSID", {path: now});
    declare("Device.Hosts.Host.*.HostName", {path: now});
    declare("Device.Hosts.Host.*.IPAddress", {path: now});
    declare("Device.Hosts.Host.*.MACAddress", {path: now});
} else if (productClass === "XX530v") {
    declare("Device.DeviceInfo.HardwareVersion", {path: now});
    declare("Device.DeviceInfo.SoftwareVersion", {path: now});
    declare("Device.DeviceInfo.SerialNumber", {path: now});
    declare("Device.Optical.*", {path: now});
    
    declare("Device.WiFi.SSID.1.SSID", {path: now});
    declare("Device.WiFi.SSID.5.SSID", {path: now});
    declare("Device.WiFi.AccessPoint.1.Security.KeyPassphrase", {path: now});
    declare("Device.WiFi.AccessPoint.5.Security.KeyPassphrase", {path: now});

    declare("Device.IP.Interface.1.IPv4Address.1.IPAddress", {path: now});
    declare("Device.IP.Interface.2.IPv4Address.1.IPAddress", {path: now});
    
    declare("Device.Hosts.Host.*.*", {path: now});
} else {
    declare("Device.DeviceInfo.*", {path: now});
    declare("Device.WiFi.SSID.*.SSID", {path: now});
}
