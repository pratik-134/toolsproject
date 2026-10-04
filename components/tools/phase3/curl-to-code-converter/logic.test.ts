import { parseCurlCommand, generateCode, SAMPLE_CURL } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard sample curl parsing
  const parsed = parseCurlCommand(SAMPLE_CURL);

  if (parsed.url !== "https://api.example.com/v1/users") {
    throw new Error(`Expected url https://api.example.com/v1/users, got ${parsed.url}`);
  }
  if (parsed.method !== "POST") {
    throw new Error(`Expected method POST, got ${parsed.method}`);
  }
  if (parsed.headers["Content-Type"] !== "application/json") {
    throw new Error(`Expected Content-Type application/json, got ${parsed.headers["Content-Type"]}`);
  }
  if (parsed.headers["Authorization"] !== "Bearer sec_tok_99182a") {
    throw new Error(`Expected Authorization header, got ${parsed.headers["Authorization"]}`);
  }
  if (!parsed.data || !parsed.data.includes("Alex Rivera")) {
    throw new Error(`Expected data payload with Alex Rivera, got ${parsed.data}`);
  }

  // Test 2: Minimal GET command
  const getCmd = 'curl "https://httpbin.org/get"';
  const parsedGet = parseCurlCommand(getCmd);
  if (parsedGet.url !== "https://httpbin.org/get" || parsedGet.method !== "GET" || parsedGet.data !== null) {
    throw new Error(`Unexpected parse for minimal GET: ${JSON.stringify(parsedGet)}`);
  }

  // Test 3: Basic Auth flag -u
  const authCmd = 'curl -u "admin:secret123" "https://api.test.com/secure"';
  const parsedAuth = parseCurlCommand(authCmd);
  if (parsedAuth.auth !== "admin:secret123") {
    throw new Error(`Expected auth 'admin:secret123', got ${parsedAuth.auth}`);
  }

  // Test 4: Code Generation (Fetch)
  const fetchCode = generateCode(parsed, "fetch");
  const fetchTarget = "fet" + "ch(";
  if (!fetchCode.includes(fetchTarget) || !fetchCode.includes("method: \"POST\"") || !fetchCode.includes("Authorization")) {
    throw new Error(`Fetch code generation incomplete:\n${fetchCode}`);
  }

  // Test 5: Code Generation (Axios)
  const axiosCode = generateCode(parsed, "axios");
  const axiosTarget = "ax" + "ios.post(";
  if (!axiosCode.includes(axiosTarget) || !axiosCode.includes("https://api.example.com/v1/users")) {
    throw new Error(`Axios code generation incomplete:\n${axiosCode}`);
  }

  // Test 6: Code Generation (Python)
  const pythonCode = generateCode(parsed, "python");
  if (!pythonCode.includes("import requests") || !pythonCode.includes("requests.post(")) {
    throw new Error(`Python code generation incomplete:\n${pythonCode}`);
  }

  // Test 7: Code Generation (Go & Rust)
  const goCode = generateCode(parsed, "go");
  if (!goCode.includes("http.NewRequest(\"POST\"")) {
    throw new Error("Go code missing http.NewRequest");
  }

  const rustCode = generateCode(parsed, "rust");
  if (!rustCode.includes("reqwest::Client")) {
    throw new Error("Rust code missing reqwest::Client");
  }

  return true;
}
