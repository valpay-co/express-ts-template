Watch a GitHub PR for CI checks and comments until ready.

**Usage:** `/watch-pr <PR_NUMBER> [REPO]`

- `PR_NUMBER` — required, the PR number to watch
- `REPO` — optional, defaults to `valpay-co/valpay-recon`

**Steps to execute:**

1. Parse arguments: `$ARGUMENTS`. Extract PR number (first arg) and optional repo (second arg).

2. Run the watcher script in the background using /loop with a cron checking every 3 minutes
   ```
   ./scripts/watch-pr-comments.sh <PR_NUMBER> [REPO]
   ```
   Run this via Bash tool with `run_in_background: true`.

3. When the script completes, read its output and present the results:
   - Display the final CI check status
   - Display any new comments that arrived during polling
   - Report the verdict: **READY**, **CHECKS FAILED**, or **ACTION REQUIRED**

4. If verdict is **CHECKS FAILED** or comments contain actionable feedback (code change requests, bug reports from Devin/Cursor/Gemini), summarize what needs fixing.

5. If verdict is **READY**, confirm to the user that it's safe to proceed with the next step in the deploy chain.
