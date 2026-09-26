import { calculateSubnet, ipToLong, longToIp } from "./logic";

export function runTests(): boolean {
  // 1. IP conversion roundtrip
  const testIp = "192.168.1.100";
  const longVal = ipToLong(testIp);
  if (longToIp(longVal) !== testIp) {
    throw new Error(`IP roundtrip failed: got ${longToIp(longVal)}`);
  }

  // 2. Standard /24 subnet (192.168.1.55/24)
  const res24 = calculateSubnet("192.168.1.55", 24);
  if (res24.networkAddress !== "192.168.1.0") {
    throw new Error(`Network address mismatch: ${res24.networkAddress}`);
  }
  if (res24.broadcastAddress !== "192.168.1.255") {
    throw new Error(`Broadcast address mismatch: ${res24.broadcastAddress}`);
  }
  if (res24.firstUsableIp !== "192.168.1.1") {
    throw new Error(`First usable IP mismatch: ${res24.firstUsableIp}`);
  }
  if (res24.lastUsableIp !== "192.168.1.254") {
    throw new Error(`Last usable IP mismatch: ${res24.lastUsableIp}`);
  }
  if (res24.usableHosts !== 254 || res24.totalHosts !== 256) {
    throw new Error(`Host counts mismatch: usable=${res24.usableHosts}, total=${res24.totalHosts}`);
  }
  if (res24.subnetMask !== "255.255.255.0") {
    throw new Error(`Subnet mask mismatch: ${res24.subnetMask}`);
  }
  if (res24.wildcardMask !== "0.0.0.255") {
    throw new Error(`Wildcard mask mismatch: ${res24.wildcardMask}`);
  }
  if (res24.scope !== "RFC 1918 Private") {
    throw new Error(`Scope mismatch: ${res24.scope}`);
  }
  if (res24.ipClass !== "Class C") {
    throw new Error(`Class mismatch: ${res24.ipClass}`);
  }

  // 3. /30 point-to-point subnet (10.0.0.5/30)
  // network: 10.0.0.4, first: 10.0.0.5, last: 10.0.0.6, broadcast: 10.0.0.7
  const res30 = calculateSubnet("10.0.0.5", 30);
  if (res30.networkAddress !== "10.0.0.4" || res30.broadcastAddress !== "10.0.0.7") {
    throw new Error(`/30 network/broadcast mismatch: ${JSON.stringify(res30)}`);
  }
  if (res30.usableHosts !== 2) {
    throw new Error(`/30 usable hosts mismatch: ${res30.usableHosts}`);
  }

  // 4. /32 host route
  const res32 = calculateSubnet("8.8.8.8", 32);
  if (res32.usableHosts !== 1 || res32.firstUsableIp !== "8.8.8.8") {
    throw new Error(`/32 calculation mismatch: ${JSON.stringify(res32)}`);
  }
  if (res32.scope !== "Public Internet") {
    throw new Error(`/32 scope mismatch: ${res32.scope}`);
  }

  return true;
}
