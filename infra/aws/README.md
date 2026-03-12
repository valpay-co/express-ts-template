# AWS Deployment

This directory contains the AWS infrastructure setup for the application, including CloudFormation templates and deployment scripts.

## Architecture Overview

- **Backend API**: Containerized Node.js application running on Amazon ECS
- **Frontend UI**: React application deployed to Amazon S3 static website
- **Content Delivery**: CloudFront distribution for global content delivery
- **CI/CD Pipeline**: AWS CodePipeline with blue-green deployment strategy

## Prerequisites

- AWS CLI installed and configured
- Docker installed locally
- GitHub repository for the application code
- AWS CodeStar connection to GitHub

## Deployment

### Step 1: Deploy the Application Infrastructure

```bash
./deploy.sh --force
```

### Step 2: Deploy the CI/CD Pipeline

```bash
./pipeline-deploy.sh --github-connection-arn YOUR_GITHUB_CONNECTION_ARN
```

## Files

- `cloudformation.yaml` - ECS infrastructure (ALB, ECS Service, Security Groups, IAM)
- `pipeline.yaml` - CI/CD pipeline (CodePipeline, CodeBuild, CodeDeploy)
- `deploy.sh` - Script to deploy the application infrastructure
- `pipeline-deploy.sh` - Script to deploy the CI/CD pipeline
- `appspec.yaml` - CodeDeploy application specification
- `taskdef.json` - ECS task definition template
- `scripts/after_allow_traffic.sh` - Post-deployment hook

## Customization

Before deploying, update the following:

1. Replace `my-app` with your project name in all files
2. Update `taskdef.json` with your container environment variables
3. Update `pipeline-deploy.sh` defaults with your GitHub org/repo
4. Update `deploy.sh` with your desired stack name
