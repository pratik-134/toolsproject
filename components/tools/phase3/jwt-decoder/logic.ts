export const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InYxLXByaXZhdGUifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggUml2ZXJhIiwiZW1haWwiOiJhbGV4LnJpdmVyYUBleGFtcGxlLmNvbSIsInJvbGUiOiJzdGFmZi1lbmdpbmVlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDgwMDAwMDAwLCJpc3MiOiJodHRwczovL2F1dGguY2xlYXJ0cml4LmNvbSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export function base64UrlDecode(str: string): string {
  try {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw new Error("Illegal base64url string");
    }
    const binary = atob(output);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  } catch {
    throw new Error("Unable to decode Base64Url segment");
  }
}

export interface DecodedJwtResult {
  header: Record<string, any> | null;
  payload: Record<string, any> | null;
  signature: string;
  error: string | null;
  expStatus: {
    exp?: number;
    iat?: number;
    nbf?: number;
    isExpired?: boolean;
    timeLeftStr?: string;
  };
}

export function decodeJwt(tokenInput: string, referenceTimeSec?: number): DecodedJwtResult {
  const raw = tokenInput.trim();
  if (!raw) {
    return {
      header: null,
      payload: null,
      signature: "",
      error: null,
      expStatus: {},
    };
  }

  const parts = raw.split(".");
  if (parts.length < 2) {
    return {
      header: null,
      payload: null,
      signature: "",
      error: "Invalid JWT structure: A valid token must have at least 2 dot-separated parts (Header.Payload).",
      expStatus: {},
    };
  }

  try {
    const decodedHeader = base64UrlDecode(parts[0] || "");
    const parsedHeader = JSON.parse(decodedHeader);

    const decodedPayload = base64UrlDecode(parts[1] || "");
    const parsedPayload = JSON.parse(decodedPayload);

    const signature = parts[2] || "";

    const now = referenceTimeSec ?? Math.floor(Date.now() / 1000);
    const exp = typeof parsedPayload.exp === "number" ? parsedPayload.exp : undefined;
    const iat = typeof parsedPayload.iat === "number" ? parsedPayload.iat : undefined;
    const nbf = typeof parsedPayload.nbf === "number" ? parsedPayload.nbf : undefined;

    let expStatus: DecodedJwtResult["expStatus"] = { exp, iat, nbf };

    if (exp) {
      const isExpired = now >= exp;
      const diffSeconds = Math.abs(exp - now);
      const days = Math.floor(diffSeconds / 86400);
      const hours = Math.floor((diffSeconds % 86400) / 3600);
      const mins = Math.floor((diffSeconds % 3600) / 60);

      let timeLeftStr = "";
      if (days > 0) timeLeftStr = `${days}d ${hours}h`;
      else if (hours > 0) timeLeftStr = `${hours}h ${mins}m`;
      else timeLeftStr = `${mins}m`;

      expStatus = { exp, iat, nbf, isExpired, timeLeftStr };
    }

    return {
      header: parsedHeader,
      payload: parsedPayload,
      signature,
      error: null,
      expStatus,
    };
  } catch (err: any) {
    return {
      header: null,
      payload: null,
      signature: "",
      error: `Failed to decode token: ${err.message || "Malformed token syntax"}`,
      expStatus: {},
    };
  }
}
