/**
 * Interactive JSON/YAML Graph & Tree Visualizer — Pure Domain Logic
 * 100% In-Browser Hierarchical Parsing, Tree Traversal & SVG Graph Generation
 * Zero Server Uploads (Qwertygen Invariant #1)
 */

export type JsonValueType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null";

export interface TreeNode {
  id: string;
  key: string;
  value: string;
  type: JsonValueType;
  depth: number;
  path: string;
  childrenCount: number;
  children: TreeNode[];
}

export interface TreeStats {
  totalNodes: number;
  maxDepth: number;
  objectsCount: number;
  arraysCount: number;
  primitivesCount: number;
}

export const SAMPLE_JSON = `{
  "platform": "Qwertygen Studio",
  "version": 2.4,
  "isPrivate": true,
  "encryption": {
    "algorithm": "AES-256-GCM",
    "keySize": 256,
    "zeroKnowledge": true
  },
  "modules": [
    {
      "id": "pdf-editor",
      "name": "PDF Studio",
      "active": true,
      "features": ["AcroForms", "Redaction", "Vector Text"]
    },
    {
      "id": "code-snapshot",
      "name": "Code Snapshot",
      "active": true,
      "features": ["Retina PNG", "SVG Export", "10 Languages"]
    },
    {
      "id": "pattern-studio",
      "name": "SVG Waves",
      "active": true,
      "features": ["Bezier Curves", "Organic Blobs", "CSS Data-URI"]
    }
  ],
  "telemetry": null
}`;

/**
 * Determines semantic JSON value type.
 */
export function getValueType(val: unknown): JsonValueType {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  if (typeof val === "object") return "object";
  if (typeof val === "string") return "string";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";
  return "string";
}

/**
 * Builds a hierarchical tree node recursively.
 */
function buildNode(
  key: string,
  val: unknown,
  depth: number,
  path: string,
  idPrefix: string
): TreeNode {
  const type = getValueType(val);
  const id = `${idPrefix}.${key}`;

  if (type === "object" && val !== null) {
    const entries = Object.entries(val as Record<string, unknown>);
    const children = entries.map(([childKey, childVal]) =>
      buildNode(childKey, childVal, depth + 1, `${path}.${childKey}`, id)
    );
    return {
      id,
      key,
      value: `{ ${entries.length} keys }`,
      type: "object",
      depth,
      path,
      childrenCount: entries.length,
      children,
    };
  }

  if (type === "array" && Array.isArray(val)) {
    const children = val.map((item, index) =>
      buildNode(`[${index}]`, item, depth + 1, `${path}[${index}]`, id)
    );
    return {
      id,
      key,
      value: `[ ${val.length} items ]`,
      type: "array",
      depth,
      path,
      childrenCount: val.length,
      children,
    };
  }

  return {
    id,
    key,
    value: String(val),
    type,
    depth,
    path,
    childrenCount: 0,
    children: [],
  };
}

/**
 * Parses raw JSON string into a structured TreeNode hierarchy.
 */
export function parseJsonToTree(jsonStr: string): {
  root: TreeNode | null;
  error: string | null;
} {
  if (!jsonStr.trim()) {
    return { root: null, error: null };
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const root = buildNode("root", parsed, 0, "$", "0");
    return { root, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid JSON syntax";
    return { root: null, error: message };
  }
}

/**
 * Traverses and calculates tree metrics.
 */
export function calculateTreeStats(root: TreeNode): TreeStats {
  let totalNodes = 0;
  let maxDepth = 0;
  let objectsCount = 0;
  let arraysCount = 0;
  let primitivesCount = 0;

  function traverse(node: TreeNode) {
    totalNodes++;
    if (node.depth > maxDepth) maxDepth = node.depth;

    if (node.type === "object") objectsCount++;
    else if (node.type === "array") arraysCount++;
    else primitivesCount++;

    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(root);
  return {
    totalNodes,
    maxDepth,
    objectsCount,
    arraysCount,
    primitivesCount,
  };
}

/**
 * Filters a tree node and its descendants matching a search query string.
 */
export function filterTreeNodes(
  node: TreeNode,
  query: string
): TreeNode | null {
  const cleanQ = query.toLowerCase().trim();
  if (!cleanQ) return node;

  const matchesSelf =
    node.key.toLowerCase().includes(cleanQ) ||
    node.value.toLowerCase().includes(cleanQ) ||
    node.path.toLowerCase().includes(cleanQ);

  const filteredChildren: TreeNode[] = [];
  for (const child of node.children) {
    const filteredChild = filterTreeNodes(child, query);
    if (filteredChild) {
      filteredChildren.push(filteredChild);
    }
  }

  if (matchesSelf || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
      childrenCount: filteredChildren.length,
    };
  }

  return null;
}

/**
 * Generates a clean standalone SVG visualization of the tree.
 */
export function generateTreeSvg(root: TreeNode, isDark = true): string {
  const rows: { node: TreeNode; x: number; y: number }[] = [];
  const rowHeight = 36;
  const colWidth = 32;

  let currentY = 20;

  function layout(node: TreeNode) {
    rows.push({ node, x: 20 + node.depth * colWidth, y: currentY });
    currentY += rowHeight;
    for (const child of node.children) {
      layout(child);
    }
  }

  layout(root);

  const width = Math.max(800, rows.reduce((max, r) => Math.max(max, r.x + 350), 0) + 40);
  const height = currentY + 40;

  const bgColor = isDark ? "#090d16" : "#f8fafc";
  const cardBg = isDark ? "#131b2e" : "#ffffff";
  const cardBorder = isDark ? "#1e293b" : "#e2e8f0";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";

  let nodesSvg = "";
  for (const row of rows) {
    const { node, x, y } = row;

    let typeColor = "#3b82f6";
    if (node.type === "string") typeColor = "#10b981";
    if (node.type === "number") typeColor = "#f59e0b";
    if (node.type === "boolean") typeColor = "#8b5cf6";
    if (node.type === "null") typeColor = "#ef4444";

    const escapedKey = node.key.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escapedVal = node.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 35);

    nodesSvg += `
      <g transform="translate(${x}, ${y})">
        <rect width="280" height="28" rx="6" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1" />
        <circle cx="12" cy="14" r="4" fill="${typeColor}" />
        <text x="24" y="18" fill="${textColor}" font-family="monospace" font-size="11" font-weight="600">${escapedKey}</text>
        <text x="140" y="18" fill="${mutedColor}" font-family="monospace" font-size="11">${escapedVal}</text>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <g>${nodesSvg}</g>
</svg>`;
}
