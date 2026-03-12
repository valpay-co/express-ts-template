#!/bin/bash

# Exit on error
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Default values
DEFAULT_PROJECT_NAME="my-app"

# Help function
function show_help {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Deploy ECS infrastructure to AWS CloudFormation"
  echo ""
  echo "Options:"
  echo "  -h, --help               Show this help message and exit"
  echo "  -p, --project-name NAME  Project name (default: $DEFAULT_PROJECT_NAME)"
  echo "  -s, --stack-name NAME    Stack name (default: same as project name)"
  echo "  -f, --force              Don't ask for confirmation before deploying"
  echo "  --skip-ecr               Skip ECR repository creation"
  echo "  --skip-codedeploy-app    Skip creating CodeDeploy app"
  echo "  --skip-cloudfront        Skip creating CloudFront distributions"
  echo ""
}

# Parse command line arguments
PROJECT_NAME=$DEFAULT_PROJECT_NAME
STACK_NAME=""
FORCE=false
SKIP_ECR=false
CREATE_CODEDEPLOY_APP=true
CREATE_CLOUDFRONT=true

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -h|--help)
      show_help
      exit 0
      ;;
    -p|--project-name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    -s|--stack-name)
      STACK_NAME="$2"
      shift 2
      ;;
    -f|--force)
      FORCE=true
      shift
      ;;
    --skip-ecr)
      SKIP_ECR=true
      shift
      ;;
    --skip-codedeploy-app)
      CREATE_CODEDEPLOY_APP=false
      shift
      ;;
    --skip-cloudfront)
      CREATE_CLOUDFRONT=false
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# If stack name is not provided, use project name
if [ -z "$STACK_NAME" ]; then
  STACK_NAME=$PROJECT_NAME
fi

# Confirm deployment
if [ "$FORCE" != true ]; then
  echo "You are about to deploy the $STACK_NAME stack to AWS CloudFormation."
  echo "Type 'yes' to continue or anything else to abort."
  read -r CONFIRMATION
  if [ "$CONFIRMATION" != "yes" ]; then
    echo "Deployment aborted."
    exit 0
  fi
fi

# Deploy CloudFormation stack
echo "Deploying $STACK_NAME stack to AWS CloudFormation..."

PARAM_OVERRIDES="ProjectName=$PROJECT_NAME"
PARAM_OVERRIDES="$PARAM_OVERRIDES SkipECRCreation=$SKIP_ECR"
PARAM_OVERRIDES="$PARAM_OVERRIDES CreateCodeDeployApp=$CREATE_CODEDEPLOY_APP"
PARAM_OVERRIDES="$PARAM_OVERRIDES CreateCloudFrontDistributions=$CREATE_CLOUDFRONT"

aws cloudformation deploy \
  --template-file cloudformation.yaml \
  --stack-name "$STACK_NAME" \
  --parameter-overrides $PARAM_OVERRIDES \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
  echo "Deployment successful!"
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs" \
    --output table
else
  echo "Deployment failed."
  exit 1
fi
