# Cloudflare Deployment Findings

- The approved production source repository is `smq9sn5jck-coder/concrete-concepts-website`, default branch `main`.
- The local Manus repository and GitHub repository have unrelated histories. A safe synchronization requires a GitHub backup branch before replacing `main` with the verified Manus source.
- The selected GitHub repository currently has no GitHub Actions workflow, deployment records, GitHub Pages configuration, or protected `main` branch visible through the available GitHub integration.
- The available GitHub integration can read and push repository content but cannot administer Actions secrets (`403 Resource not accessible by integration`).
- The injected Cloudflare token values currently return `Invalid format for Authorization header`; their real account/project scope could not be verified from the sandbox.
- The sandbox Cloudflare dashboard remained on a loading screen and exposed no interactive account elements after two checks. No production setting was changed.
- The codebase now contains the same Cloudflare Worker quote validation, photo upload, complete email, database, Jotform, and Google Sheets fallback behavior as the server implementation.

## Safe release path

1. Finish deterministic and visual verification of the new quote flow.
2. Save a Manus checkpoint.
3. Create a dated backup branch from the current GitHub `main`.
4. Push the verified Manus source to GitHub `main` using force-with-lease because the histories are unrelated.
5. Connect that repository and branch to the existing Cloudflare Pages project through Cloudflare's Git integration. This last account-authorized step must be completed in an authenticated Cloudflare session.
6. Verify the deployment version, production quote page, upload endpoint, and one controlled test lead.
