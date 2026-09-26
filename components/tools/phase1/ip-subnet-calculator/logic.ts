export interface SubnetResult {
  ip: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  scope: string;
  binaryIp: string;
  binaryMask: string;
}

export function ipToLong(ip: string): number {
  const parts = ip.trim().split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error("Invalid IPv4 address format. Expected four octets (0-255).");
  }
  const p0 = parts[0] ?? 0;
  const p1 = parts[1] ?? 0;
  const p2 = parts[2] ?? 0;
  const p3 = parts[3] ?? 0;
  return ((p0 << 24) | (p1 << 16) | (p2 << 8) | p3) >>> 0;
}

export function longToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

export function cidrToMaskLong(cidr: number): number {
  if (cidr === 0) return 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

export function toBinaryDotted(num: number): string {
  const b = (num >>> 0).toString(2).padStart(32, "0");
  return `${b.slice(0, 8)}.${b.slice(8, 16)}.${b.slice(16, 24)}.${b.slice(24, 32)}`;
}

export function getIpClass(firstOctet: number): string {
  if (firstOctet >= 1 && firstOctet <= 126) return "Class A";
  if (firstOctet === 127) return "Class A (Loopback)";
  if (firstOctet >= 128 && firstOctet <= 191) return "Class B";
  if (firstOctet >= 192 && firstOctet <= 223) return "Class C";
  if (firstOctet >= 224 && firstOctet <= 239) return "Class D (Multicast)";
  return "Class E (Experimental)";
}

export function getIpScope(ipLong: number): string {
  const p1 = (ipLong >>> 24) & 255;
  const p2 = (ipLong >>> 16) & 255;

  if (p1 === 10) return "RFC 1918 Private";
  if (p1 === 172 && p2 >= 16 && p2 <= 31) return "RFC 1918 Private";
  if (p1 === 192 && p2 === 168) return "RFC 1918 Private";
  if (p1 === 127) return "Loopback";
  if (p1 === 169 && p2 === 254) return "Link-Local (APIPA)";
  if (p1 >= 224 && p1 <= 239) return "Multicast";
  return "Public Internet";
}

export function calculateSubnet(ipStr: string, cidr: number): SubnetResult {
  if (cidr < 0 || cidr > 32) {
    throw new Error("CIDR prefix must be between 0 and 32.");
  }

  const ipLong = ipToLong(ipStr);
  const maskLong = cidrToMaskLong(cidr);
  const wildcardLong = (~maskLong) >>> 0;

  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  let firstUsableLong = networkLong;
  let lastUsableLong = broadcastLong;
  let usableHosts = 0;
  const totalHosts = Math.pow(2, 32 - cidr);

  if (cidr === 32) {
    firstUsableLong = ipLong;
    lastUsableLong = ipLong;
    usableHosts = 1;
  } else if (cidr === 31) {
    firstUsableLong = networkLong;
    lastUsableLong = broadcastLong;
    usableHosts = 2; // RFC 3021 point-to-point links
  } else {
    firstUsableLong = (networkLong + 1) >>> 0;
    lastUsableLong = (broadcastLong - 1) >>> 0;
    usableHosts = Math.max(0, totalHosts - 2);
  }

  const firstOctet = (ipLong >>> 24) & 255;

  return {
    ip: longToIp(ipLong),
    cidr,
    subnetMask: longToIp(maskLong),
    wildcardMask: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsableIp: longToIp(firstUsableLong),
    lastUsableIp: longToIp(lastUsableLong),
    totalHosts,
    usableHosts,
    ipClass: getIpClass(firstOctet),
    scope: getIpScope(ipLong),
    binaryIp: toBinaryDotted(ipLong),
    binaryMask: toBinaryDotted(maskLong),
  };
}
