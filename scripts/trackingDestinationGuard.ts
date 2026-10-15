import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const APPROVED_DESTINATIONS = {
  QUOTE_SUBMISSION: "AW-18007005419/oPHGCJSGt44cEOuxtIpD",
  PHONE_CALL: "AW-18007005419/KuCJCPSeyo4cEOuxtIpD",
} as const;
type DestinationKey = keyof typeof APPROVED_DESTINATIONS;
const isDestinationKey = (name: string): name is DestinationKey => Object.hasOwn(APPROVED_DESTINATIONS, name);

function staticName(node: ts.Node | undefined): string | undefined {
  return node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
}

/** Parse generated syntax; comments/string contents can never count as property mappings. */
export function verifyTrackingDestinations(parts: readonly string[]): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const mappings: Record<DestinationKey, (string | undefined)[]> = { QUOTE_SUBMISSION: [], PHONE_CALL: [] };
  for (const [index, source] of parts.entries()) {
    const file = ts.createSourceFile(`chunk-${index}.js`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS) as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] };
    if (file.parseDiagnostics.length) {
      errors.push("Generated JavaScript has a syntax error; destination verification refused.");
      continue;
    }
    const visit = (node: ts.Node): void => {
      if (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node) || ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) {
        const computed = ts.isComputedPropertyName(node.name);
        const name = staticName(computed ? node.name.expression : node.name);
        if (name && isDestinationKey(name)) {
          const value = ts.isPropertyAssignment(node) && !computed && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) ? node.initializer.text : undefined;
          mappings[name].push(value);
          if (ts.isObjectLiteralExpression(node.parent) && node.parent.properties.some(property => ts.isSpreadAssignment(property) || (property.name && ts.isComputedPropertyName(property.name)))) {
            errors.push(`${name} is in an object with dynamic/overwrite-capable properties.`);
          }
        }
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
        const target = node.left;
        const name = ts.isPropertyAccessExpression(target) ? target.name.text : ts.isElementAccessExpression(target) ? staticName(target.argumentExpression) : undefined;
        if (name && isDestinationKey(name)) errors.push(`${name} is assigned after object creation; verification refused.`);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  for (const [key, expected] of Object.entries(APPROVED_DESTINATIONS)) {
    const values = mappings[key as DestinationKey];
    if (values.length !== 1 || values[0] !== expected) {
      errors.push(`${key} must map exactly once to the approved CCG action; missing, ambiguous or unapproved mapping.`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function collectJavaScript(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScript(path);
    return entry.isFile() && entry.name.endsWith(".js") ? [readFileSync(path, "utf8")] : [];
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const result = verifyTrackingDestinations(collectJavaScript(resolve(process.argv[2] ?? "dist/public/assets")));
    if (!result.ok) {
      console.error(`Tracking destination guard failed:\n${result.errors.join("\n")}`);
      process.exitCode = 1;
    } else {
      console.log("Tracking destination guard passed: exact approved quote and secondary call mappings.");
    }
  } catch {
    console.error("Tracking destination guard failed: generated JavaScript is missing or unreadable.");
    process.exitCode = 1;
  }
}
