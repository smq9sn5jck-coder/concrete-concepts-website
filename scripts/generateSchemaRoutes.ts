import ts from "typescript";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import { BATCH_ONE_LOCALITIES } from "../shared/localityContent";
import { SOUTHSIDE_LOCALITIES } from "../shared/southsideLocalityContent";
import { getSouthsideLocalityRouteAccess } from "../shared/southsidePublication";
import { isBatchOneLocalityAvailable } from "../shared/batchOnePublication";
import type { SchemaRouteRecord } from "../shared/routeStructuredData.types";

const root = resolve(import.meta.dirname, "..");
const origin = "https://concreteconceptsgroup.com";
const sitemap = await readFile(
  resolve(root, "client/public/sitemap.xml"),
  "utf8"
);
const publishedPaths = new Set(
  [
    ...sitemap.matchAll(
      /<loc>https:\/\/concreteconceptsgroup\.com([^<]*)<\/loc>/g
    ),
  ].map(match => match[1] || "/")
);
type RecordData = SchemaRouteRecord;
const routes: Record<string, RecordData> = {};

// Inspect literals, never execute/import TSX. Only the named public text fields are read.
async function literals(file: string, variable: string, fields: string[]) {
  const source = ts.createSourceFile(
    file,
    await readFile(resolve(root, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  let object: ts.ObjectLiteralExpression | undefined;
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variable &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    )
      object = node.initializer;
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!object) throw new Error(`Missing ${variable} literal in ${file}`);
  const result: Record<string, Record<string, string>> = {};
  for (const member of object.properties) {
    if (
      !ts.isPropertyAssignment(member) ||
      !ts.isObjectLiteralExpression(member.initializer)
    )
      throw new Error(`Unsupported record in ${file}`);
    const key = member.name.getText(source).replace(/^["']|["']$/g, "");
    result[key] = {};
    for (const field of fields) {
      const prop = member.initializer.properties.find(
        p =>
          ts.isPropertyAssignment(p) &&
          p.name.getText(source).replace(/^["']|["']$/g, "") === field
      );
      if (
        !prop ||
        !ts.isPropertyAssignment(prop) ||
        !ts.isStringLiteralLike(prop.initializer)
      )
        throw new Error(
          `Missing plain public text ${variable}.${key}.${field}`
        );
      result[key][field] = prop.initializer.text;
    }
  }
  return result;
}
function put(path: string, data: RecordData) {
  if (publishedPaths.has(path)) routes[path] = data;
}
async function visibleHeading(file: string): Promise<string> {
  const source = ts.createSourceFile(
    file,
    await readFile(resolve(root, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  let heading: string | undefined;
  function text(node: ts.Node): string {
    if (ts.isJsxText(node)) return node.text;
    if (ts.isJsxExpression(node)) {
      if (!node.expression) return "";
      if (ts.isStringLiteralLike(node.expression)) return node.expression.text;
      throw new Error(
        `Dynamic H1 needs explicit review before schema publication: ${file}`
      );
    }
    if (ts.isJsxSelfClosingElement(node)) return " ";
    if (ts.isJsxElement(node)) return node.children.map(text).join("");
    return "";
  }
  function visit(node: ts.Node) {
    if (
      ts.isJsxElement(node) &&
      ["h1", "motion.h1"].includes(node.openingElement.tagName.getText(source))
    ) {
      if (heading) throw new Error(`Multiple H1 elements in ${file}`);
      heading = text(node).replace(/\s+/g, " ").trim();
    } else ts.forEachChild(node, visit);
  }
  visit(source);
  if (!heading) throw new Error(`Missing visible H1 in ${file}`);
  return heading;
}
const services = await literals(
  "client/src/pages/ServicePage.tsx",
  "SERVICES",
  ["h1", "title", "intro"]
);
for (const [slug, service] of Object.entries(services)) {
  put(`/services/${slug}`, {
    kind: "service",
    name: service.h1,
    description: service.intro,
    breadcrumbName: service.title,
    serviceTypes: [service.title],
    breadcrumbs: [{ name: "Services", path: "/#services" }],
  });
}
const serviceCount = Object.values(routes).filter(
  r => r.kind === "service"
).length;
if (serviceCount !== 9)
  throw new Error(
    `Expected nine current published services, found ${serviceCount}; review service publication before generating`
  );

const legacyFiles = [
  ["client/src/pages/SuburbPage.tsx", "SUBURBS"],
  ["client/src/data/newSuburbs.ts", "NEW_SUBURBS"],
  ["client/src/data/moreSuburbs.ts", "MORE_SUBURBS"],
];
for (const [file, variable] of legacyFiles) {
  for (const [slug, locality] of Object.entries(
    await literals(file, variable, ["h1", "name"])
  )) {
    // R2 editorial review is pending: page identity only, no detailed service/place claims.
    put(`/areas/${slug}`, {
      kind: "page",
      name: locality.h1,
      description: "",
      breadcrumbName: locality.name,
      breadcrumbs: [{ name: "Service Areas", path: "/#service-area" }],
    });
  }
}
for (const record of BATCH_ONE_LOCALITIES) {
  if (
    isBatchOneLocalityAvailable(record.slug, {
      customerHost: true,
      previewEnabled: false,
    })
  ) {
    put(`/areas/${record.slug}`, {
      kind: "locality",
      name: record.h1,
      description: record.intro,
      locality: record.locality,
      serviceTypes: record.services.map(s => s.name),
      breadcrumbs: [{ name: "Service Areas", path: "/areas" }],
    });
  }
}
for (const record of SOUTHSIDE_LOCALITIES) {
  if (
    getSouthsideLocalityRouteAccess(record.slug, {
      customerHost: true,
      southsidePreviewEnabled: false,
    }) === "public"
  ) {
    put(`/areas/${record.slug}`, {
      kind: "locality",
      name: record.h1,
      description: record.intro,
      locality: record.locality,
      serviceTypes: record.services.map(s => s.name),
      breadcrumbs: [{ name: "Service Areas", path: "/areas" }],
    });
  }
}
put("/", {
  kind: "home",
  name: await visibleHeading("client/src/components/HeroSection.tsx"),
  description:
    "Driveways, slabs, patios and more — serving Brisbane and surrounding South East Queensland areas.",
});
put("/get-quote", {
  kind: "contact",
  name: await visibleHeading("client/src/pages/GetQuote.tsx"),
  description:
    "Tell us what you need, where the job is and anything important about access. Measurements and photos help, but they are not compulsory.",
});
const core: [string, string, RecordData["kind"]][] = [
  ["/areas", "ServiceAreasPage", "collection"],
  ["/blog", "Blog", "collection"],
  ["/projects", "ProjectsPage", "collection"],
  ["/gallery/before-after", "BeforeAfterGallery", "collection"],
  ["/finishes", "FinishesVisualizer", "page"],
  ["/calculator", "CostCalculator", "page"],
  ["/faq", "FAQPage", "page"],
  ["/guide", "GuidePage", "page"],
  ["/privacy", "PrivacyPolicy", "page"],
  ["/terms", "TermsOfService", "page"],
  ["/reviews", "ReviewsPage", "page"],
  ["/visualiser", "Visualiser", "page"],
];
for (const [path, file, kind] of core)
  put(path, {
    name: await visibleHeading(`client/src/pages/${file}.tsx`),
    kind,
    description: "",
  });
// Referral's H1 interpolates an unverified monetary offer. Do not snapshot it.
// No blog detail records: no authoritative published feed has been verified.
const sorted = Object.fromEntries(
  Object.entries(routes).sort(([a], [b]) => a.localeCompare(b))
);
await mkdir(resolve(root, "shared/generated"), { recursive: true });
await writeFile(
  resolve(root, "shared/generated/schemaRoutes.ts"),
  `// GENERATED by pnpm schema:generate. Public display fields only.\nimport type { SchemaRouteRecord } from "../routeStructuredData.types";\nexport const SCHEMA_ROUTES: Record<string, SchemaRouteRecord> = ${JSON.stringify(sorted, null, 2)};\n`
);
await build({
  entryPoints: [resolve(root, "shared/routeStructuredData.ts")],
  outfile: resolve(root, "client/public/route-schema.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  banner: { js: "// GENERATED by pnpm schema:generate. Do not edit by hand." },
});
console.log(
  `Generated ${Object.keys(routes).length} allowlisted schema routes (${serviceCount} services); no private, price, review or unpublished article data.`
);
