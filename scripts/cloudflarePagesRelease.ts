import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export interface CloudflarePagesConfig {
  accountId: string;
  projectName: string;
  apiToken: string;
  fetchImpl?: FetchLike;
}

async function cloudflareRequest<T>(
  config: CloudflarePagesConfig,
  path: string,
  init?: RequestInit
): Promise<T> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const response = await fetchImpl(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/pages/projects/${config.projectName}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        ...(init?.headers ?? {}),
      },
    }
  );
  const body = (await response.json()) as {
    success?: boolean;
    result?: T;
    errors?: Array<{ message?: string }>;
  };
  if (!response.ok || body.success !== true || body.result === undefined) {
    const detail = body.errors?.map((error) => error.message).filter(Boolean).join(", ");
    throw new Error(`Cloudflare Pages request failed${detail ? `: ${detail}` : ""}`);
  }
  return body.result;
}

export async function getCanonicalDeploymentId(config: CloudflarePagesConfig) {
  const project = await cloudflareRequest<{ canonical_deployment?: { id?: string } }>(
    config,
    ""
  );
  const deploymentId = project.canonical_deployment?.id;
  if (!deploymentId) throw new Error("Cloudflare Pages returned no canonical deployment ID");
  return deploymentId;
}

export async function rollbackDeployment(
  config: CloudflarePagesConfig & { deploymentId: string }
) {
  await cloudflareRequest<{ id: string }>(
    config,
    `/deployments/${config.deploymentId}/rollback`,
    { method: "POST" }
  );
}

export interface GuardedReleaseDependencies {
  getPriorDeploymentId: () => Promise<string>;
  deploy: () => Promise<void>;
  verifyLive: () => Promise<{ ok: boolean; errors: string[] }>;
  rollback: (deploymentId: string) => Promise<void>;
}

export async function runGuardedRelease(dependencies: GuardedReleaseDependencies) {
  const priorDeploymentId = await dependencies.getPriorDeploymentId();
  await dependencies.deploy();
  const verification = await dependencies.verifyLive();
  if (!verification.ok) {
    await dependencies.rollback(priorDeploymentId);
    throw new Error(
      `Live quote-route verification failed; restored ${priorDeploymentId}: ${verification.errors.join("; ")}`
    );
  }
  return { priorDeploymentId };
}

function getEnvironmentConfig(): CloudflarePagesConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const projectName = process.env.CLOUDFLARE_PAGES_PROJECT;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !projectName || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_PAGES_PROJECT and CLOUDFLARE_API_TOKEN are required"
    );
  }
  return { accountId, projectName, apiToken };
}

async function runCli() {
  const mode = process.argv[2];
  const config = getEnvironmentConfig();
  if (mode === "canonical") {
    console.log(await getCanonicalDeploymentId(config));
    return;
  }
  if (mode === "rollback") {
    const deploymentId = process.argv[3];
    if (!deploymentId) throw new Error("A deployment ID is required for rollback");
    await rollbackDeployment({ ...config, deploymentId });
    console.log(`Rolled back Cloudflare Pages to ${deploymentId}.`);
    return;
  }
  throw new Error(`Unknown Cloudflare release command: ${mode || "missing"}`);
}

const isMain = process.argv[1]
  ? fileURLToPath(import.meta.url) === resolve(process.argv[1])
  : false;

if (isMain) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
