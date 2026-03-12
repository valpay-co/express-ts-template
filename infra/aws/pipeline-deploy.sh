#!/bin/bash

# Exit on error
set -e

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
CONTAINER_NAME="my-app"
TASK_DEF_FAMILY="my-app"
LOG_GROUP_NAME="/ecs/my-app"

# Parse command line arguments
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
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ -z "$GITHUB_CONNECTION_ARN" ]; then
  echo "Error: --github-connection-arn is required"
  exit 1
fi

echo "Deploying pipeline stack: $STACK_NAME"
echo "GitHub: $GITHUB_OWNER/$GITHUB_REPO ($GITHUB_BRANCH)"

aws cloudformation deploy \
  --template-file pipeline.yaml \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
    GitHubOwner="$GITHUB_OWNER" \
    GitHubRepo="$GITHUB_REPO" \
    GitHubBranch="$GITHUB_BRANCH" \
    GitHubConnectionArn="$GITHUB_CONNECTION_ARN" \
    ApplicationStackName="$APPLICATION_STACK_NAME" \
    ECSClusterName="$ECS_CLUSTER_NAME" \
    ECSServiceName="$ECS_SERVICE_NAME" \
    ContainerName="$CONTAINER_NAME" \
    TaskDefFamily="$TASK_DEF_FAMILY" \
    LogGroupName="$LOG_GROUP_NAME" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --region "$REGION" \
  --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
  echo "Pipeline deployment successful!"
else
  echo "Pipeline deployment failed."
  exit 1
fi
