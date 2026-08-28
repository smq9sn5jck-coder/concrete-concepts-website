import { describe, expect, it, vi } from "vitest";
import {
  getCanonicalDeploymentId,
  rollbackDeployment,
  runGuardedRelease,
} from "../scripts/cloudflarePagesRelease";

describe("Cloudflare Pages guarded release helpers", () => {
  it("reads the canonical deployment from the configured Pages project", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          result: { canonical_deployment: { id: "working-deployment" } },
        }),
        { status: 200 }
      )
    );

    await expect(
      getCanonicalDeploymentId({
        accountId: "account",
        projectName: "project",
        apiToken: "secret",
        fetchImpl,
      })
    ).resolves.toBe("working-deployment");

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account/pages/projects/project",
      expect.objectContaining({
        headers: { Authorization: "Bearer secret" },
      })
    );
  });

  it("rolls back only the explicitly captured prior deployment", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, result: { id: "working-deployment" } }), {
        status: 200,
      })
    );

    await rollbackDeployment({
      accountId: "account",
      projectName: "project",
      apiToken: "secret",
      deploymentId: "working-deployment",
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account/pages/projects/project/deployments/working-deployment/rollback",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer secret" },
      })
    );
  });

  it("fails closed when Cloudflare does not confirm the operation", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: false, errors: [{ message: "Denied" }] }), {
        status: 403,
      })
    );

    await expect(
      getCanonicalDeploymentId({
        accountId: "account",
        projectName: "project",
        apiToken: "secret",
        fetchImpl,
      })
    ).rejects.toThrow("Cloudflare Pages request failed");
  });

  it("automatically restores the captured deployment when live verification fails", async () => {
    const getPriorDeploymentId = vi.fn(async () => "working-deployment");
    const deploy = vi.fn(async () => undefined);
    const verifyLive = vi.fn(async () => ({ ok: false, errors: ["Missing wizard"] }));
    const rollback = vi.fn(async () => undefined);

    await expect(
      runGuardedRelease({ getPriorDeploymentId, deploy, verifyLive, rollback })
    ).rejects.toThrow("Live quote-route verification failed");

    expect(deploy).toHaveBeenCalledOnce();
    expect(rollback).toHaveBeenCalledWith("working-deployment");
  });

  it("does not rollback a release that passes live verification", async () => {
    const getPriorDeploymentId = vi.fn(async () => "working-deployment");
    const deploy = vi.fn(async () => undefined);
    const verifyLive = vi.fn(async () => ({ ok: true, errors: [] }));
    const rollback = vi.fn(async () => undefined);

    await expect(
      runGuardedRelease({ getPriorDeploymentId, deploy, verifyLive, rollback })
    ).resolves.toEqual({ priorDeploymentId: "working-deployment" });

    expect(rollback).not.toHaveBeenCalled();
  });
});
