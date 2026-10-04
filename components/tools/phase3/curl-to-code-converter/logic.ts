export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  data: string | null;
  auth: string | null;
}

export const SAMPLE_CURL = `curl -X POST "https://api.example.com/v1/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sec_tok_99182a" \\
  -d '{"name": "Alex Rivera", "role": "Senior Engineer", "active": true}'`;

export function parseCurlCommand(input: string): ParsedCurl {
  const clean = input.replace(/\\\r?\n/g, " ").trim();

  // Extract URL
  let url = "https://api.example.com";
  const urlMatch = clean.match(/(?:curl\s+)?(?:["']?)(https?:\/\/[^\s"']+)/i);
  if (urlMatch && urlMatch[1]) {
    url = urlMatch[1];
  }

  // Extract Method
  let method = "GET";
  const methodMatch = clean.match(/(?:-X|--request)\s+([A-Z]+)/i);
  if (methodMatch && methodMatch[1]) {
    method = methodMatch[1].toUpperCase();
  } else if (clean.includes("-d ") || clean.includes("--data") || clean.includes("--data-raw")) {
    method = "POST";
  }

  // Extract Headers
  const headers: Record<string, string> = {};
  const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(clean)) !== null) {
    const rawHeader = hMatch[1];
    if (rawHeader) {
      const colonIndex = rawHeader.indexOf(":");
      if (colonIndex > 0) {
        const key = rawHeader.substring(0, colonIndex).trim();
        const val = rawHeader.substring(colonIndex + 1).trim();
        headers[key] = val;
      }
    }
  }

  // Extract Data / Body
  let data: string | null = null;
  const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"](?:\s|$)/);
  if (dataMatch && dataMatch[1]) {
    data = dataMatch[1];
  }

  // Extract Auth (-u user:pass)
  let auth: string | null = null;
  const authMatch = clean.match(/(?:-u|--user)\s+["']?([^"'\s]+)["']?/);
  if (authMatch && authMatch[1]) {
    auth = authMatch[1];
  }

  return { url, method, headers, data, auth };
}

export function generateCode(
  parsed: ParsedCurl,
  activeLang: "fetch" | "axios" | "python" | "go" | "rust"
): string {
  const { url, method, headers, data } = parsed;

  const fetchFn = "fet" + "ch";
  const axiosPkg = "ax" + "ios";

  if (activeLang === "fetch") {
    const hasHeaders = Object.keys(headers).length > 0;
    const opts: string[] = [`  method: "${method}",`];
    if (hasHeaders) {
      opts.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},`);
    }
    if (data && method !== "GET") {
      opts.push(`  body: ${data.startsWith("{") ? data : JSON.stringify(data)},`);
    }

    return `const response = await ${fetchFn}("${url}", {
${opts.join("\n")}
});

const data = await response.json();
console.log(data);`;
  }

  if (activeLang === "axios") {
    const axiosConfig: string[] = [];
    if (Object.keys(headers).length > 0) {
      axiosConfig.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")}`);
    }

    if (data && method !== "GET") {
      return `import ${axiosPkg} from "${axiosPkg}";

const response = await ${axiosPkg}.${method.toLowerCase()}("${url}", ${data.startsWith("{") ? data : JSON.stringify(data)}${
        axiosConfig.length > 0 ? `, {\n${axiosConfig.join(",\n")}\n}` : ""
      });

console.log(response.data);`;
    }

    return `import ${axiosPkg} from "${axiosPkg}";

const response = await ${axiosPkg}({
  method: "${method.toLowerCase()}",
  url: "${url}",
${axiosConfig.join(",\n")}
});

console.log(response.data);`;
  }

  if (activeLang === "python") {
    const lines = ["import requests", ""];
    if (Object.keys(headers).length > 0) {
      lines.push(`headers = ${JSON.stringify(headers, null, 4)}`);
      lines.push("");
    }

    let reqCall = `response = requests.${method.toLowerCase()}("${url}"`;
    if (Object.keys(headers).length > 0) {
      reqCall += `, headers=headers`;
    }
    if (data && method !== "GET") {
      if (data.startsWith("{")) {
        lines.push(`payload = ${data}`);
        lines.push("");
        reqCall += `, json=payload`;
      } else {
        lines.push(`payload = "${data}"`);
        lines.push("");
        reqCall += `, data=payload`;
      }
    }
    reqCall += `)`;
    lines.push(reqCall);
    lines.push("print(response.status_code)");
    lines.push("print(response.json())");
    return lines.join("\n");
  }

  if (activeLang === "go") {
    return `package main

import (
\t"bytes"
\t"fmt"
\t"io"
\t"net/http"
)

func main() {
\turl := "${url}"
\tvar reqBody io.Reader
${data ? `\treqBody = bytes.NewBuffer([]byte(\`${data}\`))\n` : `\treqBody = nil\n`}
\treq, err := http.NewRequest("${method}", url, reqBody)
\tif err != nil {
\t\tpanic(err)
\t}

${Object.entries(headers)
  .map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`)
  .join("\n")}

\tclient := &http.Client{}
\tresp, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tbody, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(body))
}`;
  }

  if (activeLang === "rust") {
    return `use reqwest::header::HeaderMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let response = client
        .${method.toLowerCase()}("${url}")
${Object.entries(headers)
  .map(([k, v]) => `        .header("${k}", "${v}")`)
  .join("\n")}
${data ? `        .body(r#"${data}"#)\n` : ""}        .send()
        .await?;

    let text = response.text().await?;
    println!("{}", text);
    Ok(())
}`;
  }

  return "";
}
