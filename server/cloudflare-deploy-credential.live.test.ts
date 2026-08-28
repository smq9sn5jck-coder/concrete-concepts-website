import { describe, expect, it } from "vitest";

const runLiveCheck = process.env.RUN_LIVE_CLOUDFLARE_TEST === "1";
const accountId = "2eaf301b3a7fc5d8ffc6c02d18aa2d94";
const projectName = "concrete-concepts-group";

describe.runIf(runLiveCheck)("Cloudflare deployment credential", () => {
  it("can read the existing Pages project", async () => {
    const token = process.env.CLOUDFLARE_API_TOKEN_DEPLOY;
    expect(token, "CLOUDFLARE_API_TOKEN_DEPLOY must be available").toBeTruthy();

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = (await response.json()) as {
      success?: boolean;
      result?: { name?: string };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.result?.name).toBe(projectName);
  }, 15_000);
});
