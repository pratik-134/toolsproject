import { convertCase } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard input "qwertygen privacy tools"
  const res = convertCase("qwertygen privacy tools");
  if (res.camelCase !== "qwertygenPrivacyTools") throw new Error(`camelCase failed: ${res.camelCase}`);
  if (res.pascalCase !== "QwertygenPrivacyTools") throw new Error(`pascalCase failed: ${res.pascalCase}`);
  if (res.snakeCase !== "qwertygen_privacy_tools") throw new Error(`snakeCase failed: ${res.snakeCase}`);
  if (res.kebabCase !== "qwertygen-privacy-tools") throw new Error(`kebabCase failed: ${res.kebabCase}`);
  if (res.constantCase !== "QWERTYGEN_PRIVACY_TOOLS") throw new Error(`constantCase failed: ${res.constantCase}`);
  if (res.titleCase !== "Qwertygen Privacy Tools") throw new Error(`titleCase failed: ${res.titleCase}`);

  // Test 2: camelCase input "helloWorldFoo"
  const res2 = convertCase("helloWorldFoo");
  if (res2.kebabCase !== "hello-world-foo") throw new Error(`kebabCase from camelCase failed: ${res2.kebabCase}`);

  return true;
}
