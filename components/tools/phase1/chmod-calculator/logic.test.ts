import { calculateChmod, parseOctalInput } from "./logic";

export function runTests(): boolean {
  // 1. Standard 755 executable/dir
  const state755 = {
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: true },
    special: { setuid: false, setgid: false, sticky: false },
    isDirectory: false,
  };
  const res755 = calculateChmod(state755);
  if (res755.octal !== "755" || res755.symbolic !== "-rwxr-xr-x") {
    throw new Error(`755 calculation failed: ${JSON.stringify(res755)}`);
  }

  // 2. Standard 644 file
  const state644 = {
    owner: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    others: { read: true, write: false, execute: false },
    special: { setuid: false, setgid: false, sticky: false },
    isDirectory: false,
  };
  const res644 = calculateChmod(state644);
  if (res644.octal !== "644" || res644.symbolic !== "-rw-r--r--") {
    throw new Error(`644 calculation failed: ${JSON.stringify(res644)}`);
  }

  // 3. Directory flag
  const stateDir = { ...state755, isDirectory: true };
  const resDir = calculateChmod(stateDir);
  if (!resDir.symbolic.startsWith("d")) {
    throw new Error(`Directory symbolic prefix failed: ${resDir.symbolic}`);
  }

  // 4. Special bits: setuid (4755)
  const state4755 = {
    ...state755,
    special: { setuid: true, setgid: false, sticky: false },
  };
  const res4755 = calculateChmod(state4755);
  if (res4755.octal4 !== "4755" || !res4755.symbolic.includes("rwsr-xr-x")) {
    throw new Error(`4755 setuid calculation failed: ${JSON.stringify(res4755)}`);
  }

  // 5. Parse octal
  const parsed = parseOctalInput("755");
  if (!parsed || !parsed.owner?.read || !parsed.owner?.write || !parsed.owner?.execute) {
    throw new Error(`Octal parse failed: ${JSON.stringify(parsed)}`);
  }

  return true;
}
