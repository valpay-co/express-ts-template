# Claude Code Project Instructions

## Tech Stack
- **Backend**: Express.js + TypeScript + Mongoose (MongoDB)
- **Frontend**: React + Vite + MUI + TypeScript
- **Testing**: Jest (backend), Jest + React Testing Library (frontend)
- **Infrastructure**: AWS ECS + CodeDeploy (blue-green) + CloudFormation

## Key Commands
- `npm run dev` — Start backend in dev mode
- `npm run build` — Build TypeScript
- `npm test` — Run backend tests
- `cd client && npm run dev` — Start frontend in dev mode
- `cd client && npm run build` — Build frontend
- `cd client && npx jest` — Run frontend tests

## Architecture
- **Pattern**: DAO → Service → Controller → Routes
- **Response format**: `{ success: true, data }` or `{ success: false, error: { message } }`
- **Errors**: Use `AppError(message, statusCode)`, handled by error middleware
- **Logging**: Winston logger, log on entry and in catch blocks

## Git Permissions
- All read-only git commands (status, log, diff, branch, remote, show, etc.) are allowed without asking for confirmation.

## Testing Requirements
- All new code must have accompanying unit tests before being included in a PR.
- Backend controller tests go in `src/__tests__/controllers/` following the existing mock pattern (jest.mock dependencies, mockRequest/mockResponse/mockNext).
- Backend service tests go in `src/__tests__/services/`.
- Run `npx jest` to verify all tests pass before committing.
- Code coverage should attempt 100% coverage with possible and should blend unit, integration and e2e tests for UI and Backend

## Pull Request Target Branch
- Always target the latest `release/rc-*` branch when creating PRs.
- Check remote branches with `git branch -r | grep release` and use the highest version.
- If no release branch exists or it's ambiguous, ask the user before creating the PR.

## Infrastructure Notes
- CloudFormation templates in `infra/aws/`
- Deploy with `./infra/aws/deploy.sh --force`
- Pipeline with `./infra/aws/pipeline-deploy.sh --github-connection-arn ARN`
- Blue-green deployments via CodeDeploy

## commit-deploy-with-manual-pr-approval: Partial Deploy with Manual Merge

1. `git add` the files that got modified in the prompts
2. Create a commit message based on the JIRA for this task, if not known prompt me
3. `git commit -m "<commit message>"`
4. `git push origin <branch>`
5. Create a PR targeting the latest release branch (`git branch -r | grep 'origin/release/' | sort -V | tail -1`) OR prompt user
6. Run `/watch-pr <PR_NUMBER>` — this polls until all CI checks pass and no new actionable comments. **Do NOT proceed until /watch-pr reports READY.** If checks fail or actionable comments arrive, address them first (fix code, push, re-run `/watch-pr`).
7. **Prompt the user** to review and merge the PR manually. Do NOT merge with `--admin`. Wait for the user to confirm the PR is merged.
8. Once confirmed merged, poll pipeline status every 30s until Succeeded/Failed:
   `aws codepipeline get-pipeline-execution --pipeline-name valpay-recon-feature-pipeline --pipeline-execution-id <EXECUTION_ID> --query 'pipelineExecution.status' --output text`
