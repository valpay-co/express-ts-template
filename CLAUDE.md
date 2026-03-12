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

## Pull Request Target Branch
- Always target the latest `release/rc-*` branch when creating PRs.
- Check remote branches with `git branch -r | grep release` and use the highest version.
- If no release branch exists or it's ambiguous, ask the user before creating the PR.

## Infrastructure Notes
- CloudFormation templates in `infra/aws/`
- Deploy with `./infra/aws/deploy.sh --force`
- Pipeline with `./infra/aws/pipeline-deploy.sh --github-connection-arn ARN`
- Blue-green deployments via CodeDeploy
