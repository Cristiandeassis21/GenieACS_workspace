// Device page for TR-181 (Device:2) data model.
//
// Displays device information, parameters, LAN hosts, faults, and data model.
// Customize the 'parameters' array below to change displayed fields.
//
// Attributes:
//   device - Device object from the parent router

const device = node.attributes.device.get();
const deviceId = device["DeviceID.ID"];
const taskCmd = new Signal.State(null);
const deviceFaults = new Signal.State(null);
const delCmd = new Signal.State(null);
const delStatus = new Signal.State(null);

const delMessage = new Signal.Computed(() => {
  const s = delStatus.get();
  if (s === true) return { type: "success", message: "Deleted successfully" };
  if (s instanceof Error) return { type: "error", message: s.message };
  return null;
});

const pingResult = new Signal.State(null);
const pingDisplay = new Signal.Computed(() => {
  const r = pingResult.get();
  if (r == null) return null;
  if (r instanceof Error) return "Error!";
  if (typeof r === "number") return `${Math.trunc(r)} ms`;
  return "Unreachable";
});

const connectionUrl = device["Device.ManagementServer.ConnectionRequestURL"];
const hostIp = connectionUrl ? new URL(connectionUrl).hostname : null;

// Device parameters to display
const paramBlocks = [
  {
    title: "🌐 Internet",
    parameters: [
      { label: "WAN Interface Name", param: "Device.IP.Interface.1.Name" },
      { label: "MAC Address", param: "Device.Ethernet.Link.1.MACAddress" },
      { label: "IP Address", param: "Device.IP.Interface.1.IPv4Address.1.IPAddress" },
      { label: "Subnet Mask", param: "Device.IP.Interface.1.IPv4Address.1.SubnetMask" },
      { label: "Default Gateway", param: "Device.Routing.Router.1.IPv4Forwarding.1.GatewayIPAddress" },
      { label: "Connection Type", param: "Device.PPP.Interface.1.ConnectionStatus" },
    ]
  },
  {
    title: "📶 Wireless (Main)",
    parameters: [
      { label: "Network Name (SSID) 2.4GHz", param: "Device.WiFi.SSID.1.SSID" },
      { label: "Wireless Radio 2.4GHz", param: "Device.WiFi.Radio.1.Enable" },
      { label: "Channel Width 2.4GHz", param: "Device.WiFi.Radio.1.OperatingChannelBandwidth" },
      { label: "Channel 2.4GHz", param: "Device.WiFi.Radio.1.Channel" },
      { label: "Network Name (SSID) 5GHz", param: "Device.WiFi.SSID.5.SSID" },
      { label: "Wireless Radio 5GHz", param: "Device.WiFi.Radio.2.Enable" },
      { label: "Channel Width 5GHz", param: "Device.WiFi.Radio.2.OperatingChannelBandwidth" },
      { label: "Channel 5GHz", param: "Device.WiFi.Radio.2.Channel" }
    ]
  },
  {
    title: "💻 LAN (IPv4 & IPv6)",
    parameters: [
      { label: "LAN MAC", param: "Device.Ethernet.Link.1.MACAddress" },
      { label: "LAN IPv4 Address", param: "Device.IP.Interface.1.IPv4Address.1.IPAddress" },
      { label: "LAN IPv4 Subnet Mask", param: "Device.IP.Interface.1.IPv4Address.1.SubnetMask" },
      { label: "LAN IPv6 Address", param: "Device.IP.Interface.7.IPv6Address.1.IPAddress" },
      { label: "LAN IPv6 Prefix", param: "Device.IP.Interface.7.IPv6Prefix.1.Prefix" },
    ]
  },
  {
    title: "🕵️ Guest Network",
    parameters: [
      { label: "Network Name (SSID)", param: "Device.WiFi.SSID.2.SSID" },
      { label: "Hide SSID", param: "Device.WiFi.AccessPoint.2.SSIDAdvertisementEnabled" },
      { label: "Wireless Radio", param: "Device.WiFi.SSID.2.Enable" },
      { label: "Isolation", param: "Device.WiFi.AccessPoint.2.IsolationEnable" },
    ]
  },
  {
    title: "📈 Performance",
    parameters: [
      { label: "System Up Time", param: "Device.DeviceInfo.UpTime" },
      { label: "CPU Load", param: "Device.DeviceInfo.ProcessStatus.CPUUsage" },
      { label: "Memory Free", param: "Device.DeviceInfo.MemoryStatus.Free" },
      { label: "Memory Total", param: "Device.DeviceInfo.MemoryStatus.Total" },
    ]
  },
  {
    title: "🔌 XPON",
    parameters: [
      { label: "TX Power", param: "Device.Optical.Interface.1.TransmitOpticalLevel" },
      { label: "RX Power", param: "Device.Optical.Interface.1.OpticalSignalLevel" }
    ]
  }
];

const hostsRoot = "Device.Hosts.Host";
const hostsColumns = [
  { label: "Host name", param: "HostName" },
  { label: "MAC Address", param: "PhysAddress" },
  { label: "IP Address", param: "IPAddress" },
  { label: "Connection Type", param: "Layer1Interface" }
];

// Parameters to refresh when summoning the device
const summonParams = [
  ...paramBlocks.flatMap(b => b.parameters.map(p => p.param)).filter(p => !p.startsWith("DeviceID.")),
  ...hostsColumns.map(c => `${hostsRoot}.*.${c.param}`),
];

const cards = paramBlocks.map((block) => {
  const rows = block.parameters.map(({ label, param }) => (
    <tr class="border-b border-stone-200">
      <th class="text-sm font-medium text-stone-500 text-left px-6 py-3">{label}</th>
      <td class="text-sm text-stone-900 px-6 py-3">
        <parameter device={device} param={param} />
      </td>
    </tr>
  ));
    
  if (rows.length === 0) return null;

  return (
    <div class="bg-white shadow rounded-lg overflow-hidden flex-1 min-w-[300px]">
      <div class="bg-stone-50 px-6 py-4 border-b border-stone-200">
        <h3 class="text-lg leading-6 font-medium text-stone-900">{block.title}</h3>
      </div>
      <table class="min-w-full divide-y divide-stone-200">
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
});

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

const informTime = device["Events.Inform"];
const now = Date.now();
const [onlineStatus, statusColor] =
  informTime > now - FIVE_MINUTES
    ? ["Online", "#31a354"]
    : informTime > now - FIVE_MINUTES - ONE_DAY
      ? ["Past 24 Hours", "#a1d99b"]
      : ["Others", "#e5f5e0"];

const faultsTable = new Signal.Computed(() => {
  const faults = deviceFaults.get();
  if (!faults?.length)
    return (
      <tr>
        <td
          class="bg-stripes text-sm font-medium text-center text-stone-500 p-4"
          colspan="7"
        >
          No faults
        </td>
      </tr>
    );
  return faults.map((f) => {
    const yamlOut = new Signal.State("");
    return (
      <tr key={f._id}>
        <td class="whitespace-nowrap pl-6 pr-3 py-4 text-sm text-stone-900">
          {f.channel}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-stone-900">
          {f.code}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-stone-900">
          <span
            class="inline-block truncate decoration-dotted max-w-xs"
            onmouseover={(e) => {
              e.target.title = f.message;
            }}
          >
            {f.message}
          </span>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-stone-900">
          <do-yaml-stringify arg={f.detail} res={yamlOut} />
          <span
            class="inline-block truncate decoration-dotted max-w-xs cursor-pointer hover:underline"
            onmouseover={(e) => {
              e.target.title = e.target.textContent;
            }}
          >
            {yamlOut}
          </span>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-stone-900">
          {f.retries}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-stone-900">
          {new Date(f.timestamp).toLocaleString()}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-stone-900">
          <button
            class="text-cyan-700 hover:text-cyan-900 font-medium"
            onclick={() => delCmd.set({ resource: "faults", id: f._id })}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  });
});

// @ts-expect-error: top-level return (script is wrapped in a function at runtime)
return (
  <>
    <do-task arg={taskCmd} />
    <do-delete arg={delCmd} res={delStatus} />
    <do-notify arg={delMessage} />
    <div class="device-page">
      <h1>{deviceId}</h1>
      <tags device={device} writable={true} />
      <do-ping arg={hostIp} res={pingResult} />
      <div class="text-sm my-4 px-1">
        <span class="font-medium text-stone-500">Pinging {hostIp}: </span>
        {pingDisplay}
      </div>
      <div class="mb-6 bg-white shadow rounded-lg overflow-hidden w-max">
        <table class="table-auto divide-y divide-stone-200">
          <tbody>
            <tr class="border-b border-stone-200">
              <th class="text-sm font-medium text-stone-500 text-left px-6 py-3">
                Last inform
              </th>
              <td class="text-sm text-stone-900 px-6 py-3">
                <span class="inform">
                  <parameter device={device} param="Events.Inform" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="inline"
                    width="1em"
                    height="1em"
                    style="margin: 0 0.2em 0.2em"
                  >
                    <circle
                      class="stroke-stone-200 stroke-1"
                      cx="0.5em"
                      cy="0.5em"
                      r="0.4em"
                      fill={statusColor}
                    />
                  </svg>
                  {onlineStatus}
                  <summon-button deviceId={deviceId} params={summonParams} />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap gap-6 mb-6 items-start">
        {cards}
      </div>
      <h2>LAN Hosts</h2>
      <div class="shadow overflow-hidden rounded-lg w-max mb-6">
        <table class="divide-y divide-stone-200">
          <thead class="bg-stone-50">
            <tr>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 pl-6 pr-3">Host name</th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3">MAC Address</th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3">IP Address</th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 pl-3 pr-6">Connection Type</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-stone-200">
            {[...new Set(
              Object.keys(device)
                .filter(k => k.startsWith(`${hostsRoot}.`) && !k.includes(":"))
                .map(k => k.slice(0, k.indexOf(".", hostsRoot.length + 1) === -1 ? k.length : k.indexOf(".", hostsRoot.length + 1)))
            )].map(inst => {
              const layer1 = device[`${inst}.Layer1Interface`] || "";
              let connType = "Desconhecido";
              if (layer1.includes("WiFi")) connType = "Wi-Fi";
              else if (layer1.includes("Ethernet")) connType = "Cabo de Rede";
              else if (layer1) connType = layer1;
              return (
                <tr>
                  <td class="whitespace-nowrap py-4 text-sm text-stone-900 pl-6 pr-3">
                    <parameter device={device} param={`${inst}.HostName`} />
                  </td>
                  <td class="whitespace-nowrap py-4 text-sm text-stone-900 px-3">
                    <parameter device={device} param={`${inst}.PhysAddress`} />
                  </td>
                  <td class="whitespace-nowrap py-4 text-sm text-stone-900 px-3">
                    <parameter device={device} param={`${inst}.IPAddress`} />
                  </td>
                  <td class="whitespace-nowrap py-4 text-sm text-stone-900 pl-3 pr-6">
                    {connType}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <do-fetch
        arg={{
          resource: "faults",
          filter: `_id > '${deviceId}:' AND _id < '${deviceId}:\xff'`,
        }}
        res={deviceFaults}
      />
      <h2>Faults</h2>
      <div class="shadow overflow-hidden rounded-lg w-max">
        <table class="divide-y divide-stone-200">
          <thead class="bg-stone-50">
            <tr>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 pl-6 pr-3">
                Channel
              </th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3">
                Code
              </th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3">
                Message
              </th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3">
                Detail
              </th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3">
                Retries
              </th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3">
                Timestamp
              </th>
              <th class="py-3.5 text-left text-sm font-semibold text-stone-500 px-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 bg-white">
            {faultsTable}
          </tbody>
        </table>
      </div>
      <h2>Data model</h2>
      <datamodel-explorer device={device} />
      <div class="space-x-3 mt-4">
        {[
          {
            label: "Reboot",
            title: "Reboot device",
            task: { name: "reboot", device: deviceId },
          },
          {
            label: "Reset",
            title: "Factory reset device",
            task: { name: "factoryReset", device: deviceId },
          },
          {
            label: "Push file",
            title: "Push a firmware or config file",
            task: { name: "download", devices: [deviceId] },
          },
          {
            label: "Delete",
            title: "Delete device",
            action: () => {
              if (confirm(`Delete device ${deviceId}?`))
                delCmd.set({ resource: "devices", id: deviceId });
            },
          },
        ].map(({ label, title, task: t, action }) => (
          <button
            onclick={() => (action ? action() : taskCmd.set(t))}
            title={title}
            class="px-4 py-2 border border-stone-300 shadow-sm text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  </>
);
