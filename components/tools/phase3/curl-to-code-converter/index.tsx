"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Terminal, Code2, Sparkles, RefreshCw } from "lucide-react";
import { SendToPipelineButton } from "@/components/pipeline/SendToPipelineButton";

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  data: string | null;
  auth: string | null;
}

const SAMPLE_CURL = `curl -X POST "https://api.example.com/v1/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sec_tok_99182a" \\
  -d '{"name": "Alex Rivera", "role": "Senior Engineer", "active": true}'`;

function parseCurlCommand(input: string): ParsedCurl {
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

export default function CurlToCodeConverter() {
  const [curlInput, setCurlInput] = useState(SAMPLE_CURL);
  const [activeLang, setActiveLang] = useState<"fetch" | "axios" | "python" | "go" | "rust">("fetch");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseCurlCommand(curlInput), [curlInput]);

  // Generate target code
  const generatedCode = useMemo(() => {
    const { url, method, headers, data } = parsed;

    if (activeLang === "fetch") {
      const hasHeaders = Object.keys(headers).length > 0;
      const opts: string[] = [`  method: "${method}",`];
      if (hasHeaders) {
        opts.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},`);
      }
      if (data && method !== "GET") {
        opts.push(`  body: ${data.startsWith("{") ? data : JSON.stringify(data)},`);
      }

      return `const response = await fetch("${url}", {
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
        return `import axios from "axios";

const response = await axios.${method.toLowerCase()}("${url}", ${data.startsWith("{") ? data : JSON.stringify(data)}${
          axiosConfig.length > 0 ? `, {\n${axiosConfig.join(",\n")}\n}` : ""
        });

console.log(response.data);`;
      }

      return `import axios from "axios";

const response = await axios({
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
  }, [parsed, activeLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100">
      {/* Privacy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium">
          <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% In-Browser Transpiler:</strong> API keys, bearer tokens, and confidential request payloads never leave your computer.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCurlInput(SAMPLE_CURL)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Load Sample cURL</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input cURL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-500" />
              <span>Paste Raw cURL Command</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Method: <strong>{parsed.method}</strong>
            </span>
          </div>
          <textarea
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            rows={14}
            placeholder="curl -X POST https://api.example.com -H 'Content-Type: application/json' -d '{...}'"
            className="w-full font-mono text-xs sm:text-sm p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y shadow-xs"
          />
        </div>

        {/* Right: Generated Output */}
        <div className="space-y-2 flex flex-col">
          {/* Target Language Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[
                { id: "fetch", label: "Fetch (JS)" },
                { id: "axios", label: "Axios" },
                { id: "python", label: "Python" },
                { id: "go", label: "Go" },
                { id: "rust", label: "Rust" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setActiveLang(lang.id as any)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activeLang === lang.id
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>

              <SendToPipelineButton
                sourceSlug="curl-to-code-converter"
                sourceToolName="cURL to Code Converter"
                dataType="text"
                textData={generatedCode}
                title={`Generated ${activeLang.toUpperCase()} Code`}
              />
            </div>
          </div>

          {/* Generated Code Window */}
          <div className="flex-1 relative rounded-xl bg-slate-950 border border-slate-800 p-4 overflow-auto">
            <pre className="font-mono text-xs text-blue-300 leading-relaxed whitespace-pre">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
