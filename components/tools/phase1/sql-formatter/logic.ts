/**
 * Pure Client-Side SQL Formatter & Minifier Logic
 * Zero external libraries, lexical clause parser and formatter.
 */

export interface SqlFormatOptions {
  indentSize?: 2 | 4 | "tab";
  uppercaseKeywords?: boolean;
}

const MAJOR_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "OUTER JOIN",
  "CROSS JOIN",
  "FULL JOIN",
  "JOIN",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "CREATE TABLE",
  "DROP TABLE",
  "ALTER TABLE",
  "UNION ALL",
  "UNION",
  "EXCEPT",
  "INTERSECT",
];

const SUB_KEYWORDS = [
  "AND",
  "OR",
  "ON",
  "AS",
  "IN",
  "NOT IN",
  "IS NULL",
  "IS NOT NULL",
  "BETWEEN",
  "LIKE",
  "ILIKE",
  "DISTINCT",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "ASC",
  "DESC",
];

export function formatSql(sql: string, options: SqlFormatOptions = {}): string {
  const { indentSize = 2, uppercaseKeywords = true } = options;
  const indent = indentSize === "tab" ? "\t" : " ".repeat(indentSize);

  let cleaned = sql
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  // Split string literals and comments to avoid formatting inside them
  const tokens: string[] = [];
  const regex = /('(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`|--[^\n]*|\/\*[\s\S]*?\*\/|[a-zA-Z0-9_]+|[^\s\w])/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(cleaned)) !== null) {
    tokens.push(match[0]);
  }

  const allKeywords = [...MAJOR_KEYWORDS, ...SUB_KEYWORDS];
  const keywordMap = new Map<string, string>();
  for (const kw of allKeywords) {
    keywordMap.set(kw.toLowerCase(), kw);
  }

  let formatted = "";
  let currentIndentLevel = 0;
  let newlinePending = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    const lowerToken = token.toLowerCase();

    // Check two-word keywords like 'GROUP BY', 'ORDER BY', 'LEFT JOIN', etc.
    const nextToken = tokens[i + 1]?.toLowerCase() ?? "";
    const twoWordCandidate = `${lowerToken} ${nextToken}`;

    let matchedKeyword: string | null = null;
    let isTwoWord = false;

    if (keywordMap.has(twoWordCandidate)) {
      matchedKeyword = keywordMap.get(twoWordCandidate)!;
      isTwoWord = true;
    } else if (keywordMap.has(lowerToken)) {
      matchedKeyword = keywordMap.get(lowerToken)!;
    }

    if (matchedKeyword) {
      const isMajor = MAJOR_KEYWORDS.includes(matchedKeyword);
      const isAndOr = ["AND", "OR"].includes(matchedKeyword);

      if (isMajor) {
        if (formatted.length > 0) {
          formatted += "\n";
        }
        formatted += indent.repeat(Math.max(0, currentIndentLevel));
      } else if (isAndOr) {
        formatted += "\n" + indent.repeat(Math.max(0, currentIndentLevel + 1));
      } else if (formatted.length > 0 && !formatted.endsWith(" ") && !formatted.endsWith("\n") && !formatted.endsWith("(")) {
        formatted += " ";
      }

      formatted += uppercaseKeywords ? matchedKeyword : matchedKeyword.toLowerCase();

      if (isTwoWord) {
        i++; // skip next word
      }
      continue;
    }

    // Punctuation & parentheses handling
    if (token === ",") {
      formatted += ",\n" + indent.repeat(Math.max(0, currentIndentLevel + 1));
      continue;
    }

    if (token === "(") {
      currentIndentLevel++;
      formatted += " (";
      continue;
    }

    if (token === ")") {
      currentIndentLevel = Math.max(0, currentIndentLevel - 1);
      formatted += ")";
      continue;
    }

    if (token === ";") {
      formatted += ";\n";
      continue;
    }

    // Normal identifiers / literals
    if (formatted.length > 0 && !formatted.endsWith(" ") && !formatted.endsWith("\n") && !formatted.endsWith("(")) {
      formatted += " ";
    }
    formatted += token;
  }

  return formatted.trim();
}

export function minifySql(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, "") // remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments
    .replace(/\s+/g, " ")
    .replace(/\s*([,;()=<>+])\s*/g, "$1")
    .trim();
}
