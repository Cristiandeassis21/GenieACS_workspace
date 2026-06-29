const hourly = Date.now(3600000);

// Refresh basic parameters hourly
declare("InternetGatewayDevice.DeviceInfo.HardwareVersion", {
  path: hourly,
  value: hourly,
});
declare("InternetGatewayDevice.DeviceInfo.SoftwareVersion", {
  path: hourly,
  value: hourly,
});
declare(
  "InternetGatewayDevice.WANDevice.*.WANConnectionDevice.*.WANIPConnection.*.MACAddress",
  { path: hourly, value: hourly },
);
declare(
  "InternetGatewayDevice.WANDevice.*.WANConnectionDevice.*.WANIPConnection.*.ExternalIPAddress",
  { path: hourly, value: hourly },
);
declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.*.SSID", {
  path: hourly,
  value: hourly,
});
// Don't refresh password field periodically because CPEs always report blank passowrds for security reasons
declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.*.KeyPassphrase", {
  path: hourly,
  value: 1,
});
declare("InternetGatewayDevice.LANDevice.*.Hosts.Host.*.HostName", {
  path: hourly,
  value: hourly,
});
declare("InternetGatewayDevice.LANDevice.*.Hosts.Host.*.IPAddress", {
  path: hourly,
  value: hourly,
});
declare("InternetGatewayDevice.LANDevice.*.Hosts.Host.*.MACAddress", {
  path: hourly,
  value: hourly,
});

// TR-181 (Device.) - Polling explícito nas folhas para contornar bloqueio de TP-Link/ZTE
declare("Device.DeviceInfo.HardwareVersion", { path: hourly, value: hourly });
declare("Device.DeviceInfo.SoftwareVersion", { path: hourly, value: hourly });
declare("Device.DeviceInfo.UpTime", { path: hourly, value: hourly });
declare("Device.DeviceInfo.ProcessStatus.CPUUsage", { path: hourly, value: hourly });
declare("Device.DeviceInfo.MemoryStatus.Free", { path: hourly, value: hourly });
declare("Device.DeviceInfo.MemoryStatus.Total", { path: hourly, value: hourly });

declare("Device.Ethernet.Link.*.MACAddress", { path: hourly, value: hourly });
declare("Device.IP.Interface.*.Name", { path: hourly, value: hourly });
declare("Device.IP.Interface.*.IPv4Address.*.IPAddress", { path: hourly, value: hourly });
declare("Device.IP.Interface.*.IPv4Address.*.SubnetMask", { path: hourly, value: hourly });
declare("Device.IP.Interface.*.IPv6Address.*.IPAddress", { path: hourly, value: hourly });
declare("Device.IP.Interface.*.IPv6Prefix.*.Prefix", { path: hourly, value: hourly });
declare("Device.PPP.Interface.*.ConnectionStatus", { path: hourly, value: hourly });
declare("Device.Routing.Router.*.IPv4Forwarding.*.GatewayIPAddress", { path: hourly, value: hourly });
declare("Device.DNS.Client.Server.*.DNSServer", { path: hourly, value: hourly });

declare("Device.WiFi.SSID.*.SSID", { path: hourly, value: hourly });
declare("Device.WiFi.SSID.*.MACAddress", { path: hourly, value: hourly });
declare("Device.WiFi.SSID.*.Enable", { path: hourly, value: hourly });
declare("Device.WiFi.Radio.*.Enable", { path: hourly, value: hourly });
declare("Device.WiFi.Radio.*.Channel", { path: hourly, value: hourly });
declare("Device.WiFi.Radio.*.OperatingChannelBandwidth", { path: hourly, value: hourly });
declare("Device.WiFi.AccessPoint.*.SSIDAdvertisementEnabled", { path: hourly, value: hourly });
declare("Device.WiFi.AccessPoint.*.IsolationEnable", { path: hourly, value: hourly });

declare("Device.Optical.Interface.*.TransmitOpticalLevel", { path: hourly, value: hourly });
declare("Device.Optical.Interface.*.OpticalSignalLevel", { path: hourly, value: hourly });
declare("Device.Optical.Interface.*.X_TP_OMCIStats.*", { path: hourly, value: hourly });

declare("Device.Hosts.Host.*.HostName", { path: hourly, value: hourly });
declare("Device.Hosts.Host.*.PhysAddress", { path: hourly, value: hourly });
declare("Device.Hosts.Host.*.IPAddress", { path: hourly, value: hourly });
declare("Device.Hosts.Host.*.Layer1Interface", { path: hourly, value: hourly });
