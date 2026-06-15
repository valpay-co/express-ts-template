# AWS Deployment

This directory contains the AWS infrastructure setup for the application, including CloudFormation templates, deployment scripts, and CI/CD pipeline configuration.

## Architecture Overview

- **Backend API**: Containerized Node.js application running on Amazon ECS Fargate
- **Frontend UI**: React application deployed to Amazon S3 static website
- **Content Delivery**: CloudFront distribution for global content delivery
- **CI/CD Pipeline**: AWS CodePipeline with blue-green deployment strategy
- **Monitoring**: CloudWatch alarms and SNS notifications for failure alerts (optional)

## Two-Stack Deployment Pattern

The infrastructure uses a two-stack pattern for better separation of concerns:

### 1. Pipeline Stack (`my-app-pipeline`)
Contains the CI/CD infrastructure and deployment automation:
- **CodePipeline**: Automated build and deployment pipeline
- **CodeBuild**: Docker image building and CloudFormation deployment
- **IAM Roles**: Service roles with permissions for resource management
- **S3 Bucket**: Artifact storage for pipeline builds
- **GitHub Integration**: CodeStar connection for source code access

### 2. Application Stack (`my-app`)
Contains the runtime application infrastructure:
- **ECS Cluster & Service**: Main application hosting on Fargate
- **Load Balancer**: Application Load Balancer with health checks
- **Security Groups**: Network access control for ECS tasks and ALB
- **EventBridge Rule**: Optional scheduled task trigger (weekly by default)
- **CloudWatch Alarms**: Monitoring and alerting (when scheduled tasks enabled)
- **SNS Topics**: Failure notifications (when scheduled tasks enabled)

## Blue-Green Deployment Strategy

The application uses AWS CodeDeploy ECS blue-green deployment for zero-downtime updates:

1. **Dual Environments**: Blue (current) and Green (new) task sets
2. **Traffic Shifting**: Gradual traffic migration from blue to green
3. **Health Monitoring**: Continuous health checks during deployment
4. **Automatic Rollback**: Immediate rollback on failure detection
5. **Target Groups**: Separate production and test target groups

Benefits:
- Zero-downtime deployments
- Instant rollback capability
- Production validation before full traffic switch
- Reduced deployment risk

## Prerequisites

### AWS Resources
- AWS CLI installed and configured with appropriate permissions
- VPC with public subnets for ECS tasks
- CodeStar connection to GitHub repository
- ACM certificate (optional, for HTTPS)

### Local Development
- Docker installed for local testing
- Node.js 18+ for local development
- Git for version control

## Deployment Instructions

### Initial Setup (Two-Phase Deployment)

The deployment must be done in two phases due to resource dependencies:

#### Phase 1: Deploy Application Infrastructure
```bash
# Deploy the main application stack
./deploy.sh --force

# Skip existing resources if they already exist
./deploy.sh --force --skip-ecr --skip-codedeploy-app
```

Wait for this deployment to complete before proceeding to Phase 2.

#### Phase 2: Deploy CI/CD Pipeline
```bash
# Deploy the pipeline stack (replace with your GitHub connection ARN)
./pipeline-deploy.sh --github-connection-arn arn:aws:codestar-connections:us-east-1:ACCOUNT:connection/CONNECTION_ID
```

### Optional: Enable Scheduled Tasks

To create the EventBridge scheduled task infrastructure:
```bash
./deploy.sh --force --skip-ecr --skip-codedeploy-app --create-scheduled-task
```

See [SCHEDULED_TASKS.md](SCHEDULED_TASKS.md) for details.

### Updating Infrastructure

#### Updating Application Stack
When you modify `cloudformation.yaml`:
```bash
# Update via direct CloudFormation deployment
./deploy.sh --force --skip-ecr --skip-codedeploy-app

# Or commit changes and let the pipeline handle it
git add infra/aws/cloudformation.yaml
git commit -m "Update infrastructure"
git push origin main
```

#### Updating Pipeline Stack
When you modify `pipeline.yaml`:
```bash
# Get the current GitHub connection ARN
GITHUB_ARN=$(aws cloudformation describe-stacks --stack-name my-app-pipeline --query 'Stacks[0].Parameters[?ParameterKey==`GitHubConnectionArn`].ParameterValue' --output text)

# Update the pipeline stack
./pipeline-deploy.sh --github-connection-arn $GITHUB_ARN
```

## Permission Model

The pipeline uses a comprehensive permission model:

### CodeBuild Service Role
- **CloudFormation**: Full stack management capabilities
- **ECS**: Task and service management
- **ECR**: Container image management
- **SNS/EventBridge/CloudWatch**: When `CreateScheduledTask=true`
- **IAM**: Role management for service accounts

### CodeDeploy Service Role
- `AWSCodeDeployRoleForECS` managed policy
- S3 read access to pipeline artifact bucket

### ECS Task Execution Role
- `AmazonECSTaskExecutionRolePolicy` managed policy
- SSM Parameter Store read access for `/${ProjectName}/*` paths

## Secrets Management

Store sensitive values in SSM Parameter Store under the `/${ProjectName}/` prefix:
```bash
aws ssm put-parameter \
  --name "/${PROJECT_NAME}/my-secret" \
  --value "secret-value" \
  --type SecureString
```

Reference them in `taskdef.json`:
```json
"secrets": [
  {
    "name": "MY_SECRET",
    "valueFrom": "/my-app/my-secret"
  }
]
```

## Health Checks and Monitoring

### Application Health Endpoints
- **Health**: `GET /health` — overall system health (used by ALB health checks)

### Infrastructure Monitoring
- **ECS Service**: Task health and resource utilization
- **Load Balancer**: Target health and request metrics
- **Auto Scaling**: CPU-based scaling (target 70%, min 1, max 4 tasks)

## Security Considerations

### Network Security
- **Security Groups**: Restrictive inbound rules per component
- **Load Balancer**: Public internet access on port 80/443
- **ECS Tasks**: Inbound only from container port

### Secrets Management
- **SSM Parameter Store**: Encrypted storage for API keys and credentials
- **IAM Roles**: Least privilege access principles
- **Task Roles**: Separate task vs. execution roles

## Troubleshooting

### Common Issues

#### Pipeline Failures
**Symptom**: Pipeline fails in Build stage with CloudFormation errors
**Solution**: Check CodeBuild service role permissions and ensure all required AWS services are accessible

#### Blue-Green Deployment Issues
**Symptom**: Deployment hangs or fails during traffic shifting
**Solution**:
1. Check target group health checks (endpoint: `/health`)
2. Verify application starts within health check timeout
3. Review CodeDeploy deployment logs
4. Ensure task definition is valid

#### Resource Already Exists Errors
**Symptom**: CloudFormation fails with "Resource already exists"
**Solution**: Use skip flags in deployment scripts:
```bash
./deploy.sh --force --skip-ecr --skip-codedeploy-app
```

### Stack Recovery

#### Rollback Complete State
If CloudFormation stack is in `ROLLBACK_COMPLETE`:
```bash
# Delete the failed stack
aws cloudformation delete-stack --stack-name my-app

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name my-app

# Redeploy
./deploy.sh --force
```

## Files

- `cloudformation.yaml` — ECS infrastructure (ALB, ECS Service, Security Groups, IAM, optional scheduled tasks)
- `pipeline.yaml` — CI/CD pipeline (CodePipeline, CodeBuild, CodeDeploy)
- `deploy.sh` — Script to deploy the application infrastructure
- `pipeline-deploy.sh` — Script to deploy the CI/CD pipeline
- `appspec.yaml` — CodeDeploy application specification
- `taskdef.json` — ECS task definition template
- `scripts/after_allow_traffic.sh` — Post-deployment hook
- `PIPELINE.md` — Pipeline technical reference
- `DEPLOYMENT_GUIDE.md` — Step-by-step deployment guide
- `SCHEDULED_TASKS.md` — Scheduled tasks architecture

## Customization

Before deploying to a new project:

1. Replace `my-app` default in `deploy.sh` and `pipeline-deploy.sh`
2. Update `taskdef.json` with your container environment variables
3. Update `pipeline-deploy.sh` with your GitHub org/repo defaults
4. Update `VpcId` and `SubnetIds` parameters for your VPC
