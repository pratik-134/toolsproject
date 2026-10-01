import Module from "module";
import path from "path";

// Workaround for Node 24 strict exports in @react-pdf/hyphenate for CLI test environments
const origResolve = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (
  request: string,
  parent: any,
  isMain: boolean,
  options: any
) {
  if (typeof request === "string" && request.startsWith("@react-pdf/hyphenate/")) {
    const subpath = request.replace("@react-pdf/hyphenate/", "");
    return path.resolve(
      process.cwd(),
      "node_modules/@react-pdf/hyphenate/lib",
      `${subpath}.js`
    );
  }
  return origResolve.apply(this, arguments);
};
