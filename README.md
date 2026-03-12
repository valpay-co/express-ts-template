# Express + TypeScript + React Template

Production-ready full-stack template with Express.js backend, React frontend, AWS ECS infrastructure, and Claude Code integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express.js, TypeScript, Mongoose, Bull (queues), Winston (logging) |
| Frontend | React, Vite, MUI, Axios, React Router |
| Database | MongoDB (via Mongoose) |
| Cache/Queue | Redis (via ioredis/Bull) |
| Infrastructure | AWS ECS (Fargate), CloudFormation, CodeDeploy (blue-green) |
| Testing | Jest, React Testing Library |
| CI/CD | AWS CodePipeline + CodeBuild + CodeDeploy |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/express-ts-template.git my-app
cd my-app

# Backend setup
cp .env.example .env.local    # Edit with your values
npm install
npm run dev                     # http://localhost:3000

# Frontend setup (in another terminal)
cd client
npm install
npm run dev                     # http://localhost:5173
```

## Project Structure

```
├── src/
│   ├── config/              # Environment config, DB connection, Swagger
│   ├── controllers/         # Request handlers
│   ├── daos/                # Data access objects (Mongoose queries)
│   ├── middlewares/          # Error handler, CORS, rate limiting, correlation ID
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express route definitions
│   ├── services/            # Business logic
│   ├── utils/               # Logger, AppError, response helpers
│   ├── __tests__/           # Backend tests
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── client/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # React Router config
│   │   ├── services/        # API client and service modules
│   │   ├── types/           # TypeScript type definitions
│   │   └── tests/           # Frontend tests
│   └── index.html           # Vite entry
├── infra/aws/               # CloudFormation templates and deploy scripts
├── docs/code/               # Coding guidelines
├── .claude/                 # Claude Code agents, skills, and settings
├── CLAUDE.md                # Claude Code project instructions
└── Dockerfile               # Production Docker build
```

## Architecture Pattern

The backend follows **DAO → Service → Controller → Routes**:

- **DAO**: Pure data access (Mongoose queries, pagination)
- **Service**: Business logic, validation, orchestration
- **Controller**: HTTP request/response handling
- **Routes**: Express router with validation middleware

## How to Customize

1. **Rename the project**: Update `package.json` name, `ecosystem.config.js`, and infra files
2. **Add a new entity**: Copy the Item example (model → dao → service → controller → routes → tests)
3. **Add authentication**: Create auth middleware, user model, and auth routes
4. **Configure infrastructure**: Update `infra/aws/` templates with your VPC, subnets, and domain

## Testing

```bash
# Backend tests
npm test
npm run test:coverage

# Frontend tests
cd client && npx jest
```

## Deployment

See [infra/aws/README.md](./infra/aws/README.md) for AWS deployment instructions.

```bash
# Deploy infrastructure
cd infra/aws && ./deploy.sh --force

# Deploy CI/CD pipeline
./pipeline-deploy.sh --github-connection-arn YOUR_ARN
```

## Claude Code Integration

This template includes Claude Code configuration:

- **`.claude/settings.json`**: Plugin configuration (GitHub, Atlassian, Notion)
- **`.claude/agents/`**: Specialized agents (test-runner, api-doc-generator, domain-validator)
- **`.claude/skills/`**: PR review checklist and epic tracker
- **`CLAUDE.md`**: Project-specific instructions for Claude Code

## License

ISC
