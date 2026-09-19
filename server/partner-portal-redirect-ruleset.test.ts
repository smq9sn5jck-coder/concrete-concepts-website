import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "..");
const ruleset = JSON.parse(
  readFileSync(resolve(ROOT, "cloudflare/rulesets/partner-portal-redirects.json"), "utf8"),
) as {
  description: string;
  kind: string;
  name: string;
  phase: string;
  rules: Array<{
    action: string;
    action_parameters: {
      from_value: {
        preserve_query_string: boolean;
        status_code: number;
        target_url: { value: string };
      };
    };
    enabled: boolean;
    expression: string;
    ref: string;
  }>;
};

const PORTAL = "https://partners.concreteconceptsgroup.com/partners";

describe("CCG partner portal redirect ruleset", () => {
  it("contains only the two method-safe redirects to the retained portal", () => {
    expect(ruleset.name).toBe("CCG retired Trade Partner Network redirects");
    expect(ruleset.kind).toBe("zone");
    expect(ruleset.phase).toBe("http_request_dynamic_redirect");
    expect(ruleset.rules).toHaveLength(2);
    expect(ruleset.rules.map(rule => rule.action)).toEqual(["redirect", "redirect"]);
    expect(ruleset.rules.every(rule => rule.enabled)).toBe(true);
    expect(ruleset.rules.every(rule => rule.action_parameters.from_value.target_url.value === PORTAL)).toBe(true);
    expect(ruleset.rules.every(rule => rule.action_parameters.from_value.preserve_query_string === false)).toBe(true);
    expect(ruleset.rules.map(rule => rule.action_parameters.from_value.status_code)).toEqual([308, 302]);
  });

  it("covers apex and www partner shorthands plus the retired trade host without touching customer routes", () => {
    const expression = ruleset.rules.map(rule => rule.expression).join("\n");
    expect(expression).toContain('http.host in {"concreteconceptsgroup.com" "www.concreteconceptsgroup.com"}');
    expect(expression).toContain('http.request.uri.path eq "/partners"');
    expect(expression).toContain('starts_with(http.request.uri.path, "/partners/")');
    expect(expression).toContain('http.request.uri.path eq "/trade-partners"');
    expect(expression).toContain('starts_with(http.request.uri.path, "/trade-partners/")');
    expect(expression).toContain('http.host eq "trade.concreteconceptsgroup.com"');
    expect(expression).not.toContain("/get-quote");
    expect(expression).not.toContain("/lp/");
    expect(expression).not.toContain("/areas/");
  });

  it("uses permanent redirects only for GET and HEAD and never replays form bodies", () => {
    const permanent = ruleset.rules.find(rule => rule.action_parameters.from_value.status_code === 308);
    const nonReplay = ruleset.rules.find(rule => rule.action_parameters.from_value.status_code === 302);
    expect(permanent?.expression).toContain('http.request.method in {"GET" "HEAD"}');
    expect(nonReplay?.expression).toContain('http.request.method ne "GET"');
    expect(nonReplay?.expression).toContain('http.request.method ne "HEAD"');
  });
});
