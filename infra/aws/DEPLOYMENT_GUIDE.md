# Deployment Guide

This guide provides step-by-step instructions for deploying the application to AWS using the two-stack deployment pattern.

## Overview

The infrastructure uses a two-stack deployment architecture:

1. **Application Stack** (`my-app`): Runtime infrastructure (ECS, Load Balancer, optional Scheduled Tasks)
2. **Pipeline Stack** (`my-app-pipeline`): CI/CD infrastructure (CodePipeline, CodeBuild, IAM roles)

This separation allows for independent management of deployment infrastructure and application resources.

## Prerequisites

### AWS Account Setup
- AWS CLI installed and configured with appropriate permissions
- AWS account with sufficient permissions for ECS, CloudFormation, CodePipeline, etc.
- VPC with public subnets available for ECS tasks

### Required AWS Resources
- **CodeStar Connection**: GitHub connection for source code access
- **VPC and Subnets**: Network infrastructure for ECS deployment
- **ACM Certificate** (optional): For HTTPS/SSL termination

## Phase 1: Application Stack Deployment

Deploy the core application infrastructure first, as the pipeline stack depends on these resources.

### Step 1: Configure Parameters

Update `cloudformation.yaml` with your VPC details:
- `VpcId`: Your VPC ID
- `SubnetIds`: Comma-separated list of subnet IDs
- `ContainerPort`: Port your container listens on (default: 3000)

### Step 2: Deploy Application Stack

```bash
cd infra/aws
chmod +x deploy.sh

# Initial deployment (creates all resources)
./deploy.sh --force

# If ECR repository already exists
./deploy.sh --force --skip-ecr

# If CodeDeploy application already exists
./deploy.sh --force --skip-codedeploy-app

# If both ECR and CodeDeploy already exist
./deploy.sh --force --skip-ecr --skip-codedeploy-app

# With HTTPS certificate
./deploy.sh --force --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID

# With scheduled task infrastructure
./deploy.sh --force --create-scheduled-task
```

### Step 3: Verify Application Stack

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name my-app --query 'Stacks[0].StackStatus'

# Get stack outputs
aws cloudformation describe-stacks --stack-name my-app --query 'Stacks[0].Outputs'
```

Expected outputs:
- **ECSCluster**: The ECS cluster name
- **ECSService**: The ECS service ARN
- **LoadBalancerDNS**: The load balancer DNS name
- **ECRRepositoryUri**: The ECR repository URI
- **TaskDefinition**: The task definition ARN

## Phase 2: Pipeline Stack Deployment

Deploy the CI/CD pipeline after the application stack is fully deployed.

### Step 1: Get GitHub Connection ARN

Create a CodeStar connection via the AWS Console:
1. Go to **Developer Tools > Settings > Connections**
2. Create a connection to GitHub
3. Copy the connection ARN

### Step 2: Deploy Pipeline Stack

```bash
cd infra/aws
chmod +x pipeline-deploy.sh

# Basic deployment
./pipeline-deploy.sh --github-connection-arn arn:aws:codestar-connections:us-east-1:ACCOUNT:connection/CONNECTION_ID

# With custom options
./pipeline-deploy.sh \
  --github-connection-arn arn:aws:codestar-connections:us-east-1:ACCOUNT:connection/CONNECTION_ID \
  --github-owner your-org \
  --github-repo your-repo \
  --github-branch main \
  --app-stack-name my-app \
  --ecs-cluster-name my-app-cluster \
  --ecs-service-name my-app-service
```

### Step 3: Verify Pipeline Stack

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name my-app-pipeline --query 'Stacks[0].StackStatus'

# Check pipeline status
aws codepipeline get-pipeline-state --name my-app-pipeline
```

## Phase 3: Initial Image Push

After the pipeline is deployed, push your first Docker image to trigger a deployment.

```bash
# Get ECR URI from stack outputs
ECR_URI=$(aws cloudformation describe-stacks --stack-name my-app --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryUri`].OutputValue' --output text)

# Log in to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI

# Build and push
docker build -t $ECR_URI:latest .
docker push $ECR_URI:latest
```

## Updating Infrastructure

### Updating Application Stack
```bash
# Direct update
./deploy.sh --force --skip-ecr --skip-codedeploy-app

# Or push code and let the pipeline update it
git add infra/aws/cloudformation.yaml && git commit -m "Update infra" && git push
```

### Updating Pipeline Stack
```bash
# Get current connection ARN
GITHUB_ARN=$(aws cloudformation describe-stacks --stack-name my-app-pipeline \
  --query 'Stacks[0].Parameters[?ParameterKey==`GitHubConnectionArn`].ParameterValue' \
  --output text)

./pipeline-deploy.sh --github-connection-arn $GITHUB_ARN
```

## Rollback Procedures

### Application Rollback via CodeDeploy
```bash
# List recent deployments
aws deploy list-deployments --app-name my-app-app --deployment-group-name my-app-dg

# Rollback a specific deployment
aws deploy stop-deployment --deployment-id d-XXXXXXXXX --auto-rollback-enabled
```

### Stack Recovery (ROLLBACK_COMPLETE state)
```bash
# Delete the failed stack
aws cloudformation delete-stack --stack-name my-app

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name my-app

# Redeploy
./deploy.sh --force
```

## Secrets Management

Store sensitive configuration in SSM Parameter Store:
```bash
# Store a secret
aws ssm put-parameter \
  --name "/my-app/database-url" \
  --value "your-connection-string" \
  --type SecureString \
  --region us-east-1

# Verify
aws ssm get-parameter --name "/my-app/database-url" --with-decryption
```

Reference secrets in `taskdef.json`:
```json
"secrets": [
  {
    "name": "DATABASE_URL",
    "valueFrom": "/my-app/database-url"
  }
]
```

## Monitoring and Verification

### Check ECS Service Health
```bash
aws ecs describe-services \
  --cluster my-app-cluster \
  --services my-app-service \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

### Check Load Balancer Target Health
```bash
# Get target group ARN
TG_ARN=$(aws cloudformation describe-stacks --stack-name my-app \
  --query 'Stacks[0].Outputs[?OutputKey==`ProdTargetGroup`].OutputValue' --output text)

# Check health
aws elbv2 describe-target-health --target-group-arn $TG_ARN
```

### Check Pipeline Execution
```bash
aws codepipeline list-pipeline-executions --pipeline-name my-app-pipeline \
  --query 'pipelineExecutionSummaries[0]'
```
