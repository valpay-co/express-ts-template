#!/bin/bash

set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Default values
STACK_NAME="my-app-pipeline"
REGION="us-east-1"
GITHUB_OWNER="your-org"
GITHUB_REPO="your-repo"
GITHUB_BRANCH="main"
APPLICATION_STACK_NAME="my-app"
ECS_CLUSTER_NAME="my-app-cluster"
ECS_SERVICE_NAME="my-app-service"
GITHUB_CONNECTION_ARN=""
SKIP_ECR="true"
CREATE_CLOUDFRONT="true"
CREATE_UI_BUCKET="false"
KEEP_EXISTING_CLOUDFRONT="true"

while [[ $# -gt 0 ]]; do
  case $1 in
    --stack-name)
      STACK_NAME="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --github-owner)
      GITHUB_OWNER="$2"
      shift 2
      ;;
    --github-repo)
      GITHUB_REPO="$2"
      shift 2
      ;;
    --github-branch)
      GITHUB_BRANCH="$2"
      shift 2
      ;;
    --github-connection-arn)
      GITHUB_CONNECTION_ARN="$2"
      shift 2
      ;;
    --app-stack-name)
      APPLICATION_STACK_NAME="$2"
      shift 2
      ;;
    --ecs-cluster-name)
      ECS_CLUSTER_NAME="$2"
      shift 2
      ;;
    --ecs-service-name)
      ECS_SERVICE_NAME="$2"
      shift 2
      ;;
    --skip-cloudfront)
      CREATE_CLOUDFRONT="false"
      shift
      ;;
    --keep-existing-cloudfront)
      KEEP_EXISTING_CLOUDFRONT="$2"
      shift 2
      ;;
    --create-ui-bucket)
      CREATE_UI_BUCKET="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check required parameters
if [ -z "$GITHUB_CONNECTION_ARN" ]; then
  echo "Error: --github-connection-arn parameter is required"
  echo "Usage: $0 --github-connection-arn YOUR_GITHUB_CONNECTION_ARN [--stack-name STACK_NAME] [--region REGION] [--github-owner GITHUB_OWNER] [--github-repo GITHUB_REPO] [--github-branch GITHUB_BRANCH] [--app-stack-name APP_STACK_NAME] [--ecs-cluster-name ECS_CLUSTER_NAME] [--ecs-service-name ECS_SERVICE_NAME] [--skip-cloudfront] [--keep-existing-cloudfront VALUE] [--create-ui-bucket VALUE]"
  exit 1
fi

echo "Deploying CI/CD Pipeline..."
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "GitHub Owner: $GITHUB_OWNER"
echo "GitHub Repo: $GITHUB_REPO"
echo "GitHub Branch: $GITHUB_BRANCH"
echo "Application Stack Name: $APPLICATION_STACK_NAME"
echo "ECS Cluster Name: $ECS_CLUSTER_NAME"
echo "ECS Service Name: $ECS_SERVICE_NAME"
echo "Create CloudFront Distributions: $CREATE_CLOUDFRONT"
echo "Keep Existing CloudFront: $KEEP_EXISTING_CLOUDFRONT"
echo "Create UI Bucket: $CREATE_UI_BUCKET"

# Deploy CloudFormation stack
aws cloudformation deploy \
  --template-file "${SCRIPT_DIR}/pipeline.yaml" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
    GitHubOwner="$GITHUB_OWNER" \
    GitHubRepo="$GITHUB_REPO" \
    GitHubBranch="$GITHUB_BRANCH" \
    GitHubConnectionArn="$GITHUB_CONNECTION_ARN" \
    ApplicationStackName="$APPLICATION_STACK_NAME" \
    ECSClusterName="$ECS_CLUSTER_NAME" \
    ECSServiceName="$ECS_SERVICE_NAME" \
    SkipECRCreation="$SKIP_ECR" \
    CreateCloudFrontDistributions="$CREATE_CLOUDFRONT" \
    KeepExistingCloudFront="$KEEP_EXISTING_CLOUDFRONT" \
    CreateUIBucket="$CREATE_UI_BUCKET" \
  --region "$REGION"

# Get stack outputs
echo "Deployment completed. Fetching outputs..."
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" \
  --region "$REGION"

echo "Pipeline deployment completed successfully!"
echo "The pipeline will automatically start when you push code to the $GITHUB_BRANCH branch of the $GITHUB_OWNER/$GITHUB_REPO repository."
