export interface PermissionSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface ChmodState {
  owner: PermissionSet;
  group: PermissionSet;
  others: PermissionSet;
  special: {
    setuid: boolean;
    setgid: boolean;
    sticky: boolean;
  };
  isDirectory: boolean;
}

export interface ChmodResult {
  octal: string;
  octal4: string;
  symbolic: string;
  commandNumeric: string;
  commandSymbolic: string;
  umask: string;
  description: string;
}

export function calculateOctalDigit(perm: PermissionSet): number {
  return (perm.read ? 4 : 0) + (perm.write ? 2 : 0) + (perm.execute ? 1 : 0);
}

export function calculateSpecialDigit(special: { setuid: boolean; setgid: boolean; sticky: boolean }): number {
  return (special.setuid ? 4 : 0) + (special.setgid ? 2 : 0) + (special.sticky ? 1 : 0);
}

export function digitToPermissions(digit: number): PermissionSet {
  return {
    read: (digit & 4) !== 0,
    write: (digit & 2) !== 0,
    execute: (digit & 1) !== 0,
  };
}

export function formatSymbolicTriad(
  perm: PermissionSet,
  specialBit: boolean,
  specialCharLower: string,
  specialCharUpper: string
): string {
  const r = perm.read ? "r" : "-";
  const w = perm.write ? "w" : "-";
  let x = perm.execute ? "x" : "-";

  if (specialBit) {
    x = perm.execute ? specialCharLower : specialCharUpper;
  }

  return `${r}${w}${x}`;
}

export function calculateChmod(state: ChmodState): ChmodResult {
  const ownerDigit = calculateOctalDigit(state.owner);
  const groupDigit = calculateOctalDigit(state.group);
  const othersDigit = calculateOctalDigit(state.others);
  const specialDigit = calculateSpecialDigit(state.special);

  const octal = `${ownerDigit}${groupDigit}${othersDigit}`;
  const octal4 = `${specialDigit}${octal}`;

  const prefix = state.isDirectory ? "d" : "-";
  const ownerSym = formatSymbolicTriad(state.owner, state.special.setuid, "s", "S");
  const groupSym = formatSymbolicTriad(state.group, state.special.setgid, "s", "S");
  const othersSym = formatSymbolicTriad(state.others, state.special.sticky, "t", "T");

  const symbolic = `${prefix}${ownerSym}${groupSym}${othersSym}`;

  const formatTriadClause = (target: string, perm: PermissionSet): string => {
    let s = "";
    if (perm.read) s += "r";
    if (perm.write) s += "w";
    if (perm.execute) s += "x";
    return s ? `${target}=${s}` : `${target}-rwx`;
  };

  const commandNumeric = `chmod ${specialDigit > 0 ? octal4 : octal} myfile`;
  const commandSymbolic = `chmod ${formatTriadClause("u", state.owner)},${formatTriadClause(
    "g",
    state.group
  )},${formatTriadClause("o", state.others)} myfile`;

  // Standard umask is inverted from 777 or 666
  const baseMask = state.isDirectory ? 777 : 666;
  const numOct = parseInt(octal, 8);
  const umaskNum = Math.max(0, 0o777 - numOct);
  const umask = `00${umaskNum.toString(8).padStart(2, "0")}`.slice(-4);

  let description = "Custom permission set";
  if (octal === "755") description = "Standard for executable scripts and directories (Owner: Full, Group/Others: Read & Execute)";
  else if (octal === "644") description = "Standard for readable files and documents (Owner: Read & Write, Group/Others: Read only)";
  else if (octal === "777") description = "Full public access (Warning: highly insecure for production)";
  else if (octal === "600") description = "Private confidential file (Owner: Read & Write, Group/Others: No access)";
  else if (octal === "700") description = "Private executable or directory (Owner: Full access, Group/Others: No access)";
  else if (octal === "400") description = "Strict read-only for owner (Owner: Read, Group/Others: No access)";

  return {
    octal,
    octal4,
    symbolic,
    commandNumeric,
    commandSymbolic,
    umask,
    description,
  };
}

export function parseOctalInput(input: string): Partial<ChmodState> | null {
  const clean = input.trim();
  if (!/^[0-7]{3,4}$/.test(clean)) return null;

  let specialDigit = 0;
  let o1 = 0;
  let o2 = 0;
  let o3 = 0;

  if (clean.length === 4) {
    specialDigit = parseInt(clean.charAt(0), 10);
    o1 = parseInt(clean.charAt(1), 10);
    o2 = parseInt(clean.charAt(2), 10);
    o3 = parseInt(clean.charAt(3), 10);
  } else {
    o1 = parseInt(clean.charAt(0), 10);
    o2 = parseInt(clean.charAt(1), 10);
    o3 = parseInt(clean.charAt(2), 10);
  }

  return {
    owner: digitToPermissions(o1),
    group: digitToPermissions(o2),
    others: digitToPermissions(o3),
    special: {
      setuid: (specialDigit & 4) !== 0,
      setgid: (specialDigit & 2) !== 0,
      sticky: (specialDigit & 1) !== 0,
    },
  };
}
