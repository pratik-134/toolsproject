"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";

export interface TextTransformEngineProps {
  preset: ConverterPreset;
}

function jsonToTypeScript(jsonStr: string, rootName: string = "RootObject"): string {
  const parsed = JSON.parse(jsonStr);

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const interfaces: string[] = [];

  function getType(val: unknown, keyName: string): string {
    if (val === null) return "null";
    if (val === undefined) return "undefined";
    const type = typeof val;

    if (type === "boolean" || type === "number" || type === "string") {
      return type;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return "any[]";
      const itemTypes = Array.from(new Set(val.map((item) => getType(item, keyName))));
      if (itemTypes.length === 1) return `${itemTypes[0]}[]`;
      return `(${itemTypes.join(" | ")})[]`;
    }

    if (type === "object") {
      const interfaceName = capitalize(keyName);
      buildInterface(val as Record<string, unknown>, interfaceName);
      return interfaceName;
    }

    return "any";
  }

  function buildInterface(obj: Record<string, unknown>, name: string): void {
    let lines = `export interface ${name} {\n`;
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const propType = getType(value, key);
      lines += `  ${cleanKey}: ${propType};\n`;
    }
    lines += `}`;
    interfaces.push(lines);
  }

  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    buildInterface(parsed as Record<string, unknown>, rootName);
  } else if (Array.isArray(parsed)) {
    const itemType = getType(parsed[0], "Item");
    interfaces.push(`export type ${rootName} = ${itemType}[];`);
  } else {
    interfaces.push(`export type ${rootName} = ${typeof parsed};`);
  }

  return interfaces.join("\n\n");
}

function textToBinary(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

function binaryToText(binary: string): string {
  const clean = binary.trim().split(/\s+/);
  return clean
    .map((bin) => String.fromCharCode(parseInt(bin, 2)))
    .join("");
}

function numberToRoman(num: number): string {
  if (num < 1 || num > 3999) throw new Error("Number must be between 1 and 3999.");
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (const i in lookup) {
    while (num >= lookup[i]!) {
      roman += i;
      num -= lookup[i]!;
    }
  }
  return roman;
}

function romanToNumber(roman: string): number {
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  const upper = roman.toUpperCase().trim();
  let num = 0;
  for (let i = 0; i < upper.length; i++) {
    const current = map[upper[i]!] || 0;
    const next = map[upper[i + 1]!] || 0;
    if (current < next) {
      num -= current;
    } else {
      num += current;
    }
  }
  return num;
}

function numberToWords(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return "negative " + numberToWords(Math.abs(n));

  const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const scales = ["", "thousand", "million", "billion", "trillion"];

  function convertGroup(num: number): string {
    let str = "";
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + " hundred ";
      num %= 100;
    }
    if (num >= 10 && num < 20) {
      str += teens[num - 10] + " ";
    } else {
      if (num >= 20) {
        str += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      }
      if (num > 0) {
        str += units[num] + " ";
      }
    }
    return str.trim();
  }

  let words = "";
  let scaleIndex = 0;

  while (n > 0) {
    const group = n % 1000;
    if (group !== 0) {
      const groupWords = convertGroup(group);
      const scaleStr = scales[scaleIndex] ? " " + scales[scaleIndex] : "";
      words = groupWords + scaleStr + (words ? " " + words : "");
    }
    n = Math.floor(n / 1000);
    scaleIndex++;
  }

  return words.trim();
}

export function TextTransformEngine({ preset }: TextTransformEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [outputResult, setOutputResult] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    let sourceText = textInput;
    let baseFilename = "converted";

    if (files.length > 0 && files[0]) {
      const file = files[0];
      sourceText = await file.text();
      baseFilename = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    }

    if (!sourceText.trim()) {
      setErrorMessage("Please enter text or upload a file to convert.");
      return;
    }

    setIsProcessing(true);
    setProgressPercent(50);
    setErrorMessage(null);

    try {
      let resultText = "";
      const targetExt = preset.downloadFilenameExtension;

      if (preset.slug === "json-to-typescript") {
        resultText = jsonToTypeScript(sourceText);
      } else if (preset.slug === "text-to-binary") {
        resultText = textToBinary(sourceText);
      } else if (preset.slug === "roman-numeral-converter") {
        const trimmed = sourceText.trim();
        if (/^\d+$/.test(trimmed)) {
          resultText = numberToRoman(parseInt(trimmed, 10));
        } else {
          resultText = String(romanToNumber(trimmed));
        }
      } else if (preset.slug === "number-to-words") {
        const num = parseInt(sourceText.trim().replace(/,/g, ""), 10);
        if (isNaN(num)) throw new Error("Invalid integer number.");
        resultText = numberToWords(num);
      } else {
        throw new Error(`Unsupported text transform slug: ${preset.slug}`);
      }

      setOutputResult(resultText);
      const outputBlob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(outputBlob);
      setDownloadUrl(url);
      setDownloadFilename(`${baseFilename}${targetExt}`);
      setProgressPercent(100);
    } catch (err: unknown) {
      console.error("[TextTransformEngine Error]:", err);
      const msg = err instanceof Error ? err.message : "Failed to transform text.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setTextInput("");
    setOutputResult(null);
    setDownloadUrl(null);
    setDownloadFilename(null);
    setProgressPercent(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <ToolWorkbenchShell
        acceptTypes={preset.inputFormats}
        maxFileSizeMB={preset.maxFileSizeMB}
        multipleFiles={preset.multiFile}
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        actionLabel={preset.actionLabel}
        onAction={handleProcess}
        isProcessing={isProcessing}
        progressPercent={progressPercent}
        downloadUrl={downloadUrl}
        downloadFilename={downloadFilename}
        errorMessage={errorMessage}
        onReset={handleReset}
      >
        {files.length === 0 && (
          <div className="mt-4 space-y-2 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Enter input text or number:
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type or paste content here..."
              rows={4}
              className="w-full p-3 font-mono text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {outputResult && (
          <div className="mt-6 text-left space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Conversion Result:
            </label>
            <pre className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg overflow-x-auto text-sm font-mono border border-slate-200 dark:border-slate-700 max-h-80">
              {outputResult}
            </pre>
          </div>
        )}
      </ToolWorkbenchShell>
    </div>
  );
}
