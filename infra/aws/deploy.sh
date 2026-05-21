#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

DEFAULT_PROJECT_NAME="my-app"

function show_help {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Deploy ECS infrastructure to AWS CloudFormation"
  echo ""
  echo "Options:"
  echo "  -h, --help                   Show this help message and exit"
  echo "  -p, --project-name NAME      Project name (default: $DEFAULT_PROJECT_NAME)"
  echo "  -s, --stack-name NAME        Stack name (default: same as project name)"
  echo "  -f, --force                  Don't ask for confirmation before deploying (bypass all prompts)"
  echo "  --skip-ecr                   Skip ECR repository creation"
  echo "  --skip-codedeploy-app        Skip creating CodeDeploy app"
  echo "  --skip-cloudfront            Skip creating CloudFront distributions"
  echo "  --keep-existing-cloudfront   Keep existing CloudFront distributions"
  echo "  --certificate-arn ARN        ACM certificate ARN for CloudFront HTTPS"
  echo "  --create-ui-bucket           Create S3 bucket for UI assets"
  echo "  --create-scheduled-task      Create EventBridge scheduled task infrastructure"
  echo ""
}

PROJECT_NAME=$DEFAULT_PROJECT_NAME
STACK_NAME=""
FORCE=false
SKIP_ECR=false
CREATE_CODEDEPLOY_APP=true
CREATE_CLOUDFRONT=true
CREATE_UI_BUCKET=false
KEEP_EXISTING_CLOUDFRONT=true
CERTIFICATE_ARN=""
CREATE_SCHEDULED_TASK=false

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
    --keep-existing-cloudfront)
      KEEP_EXISTING_CLOUDFRONT="$2"
      shift 2
      ;;
    --create-ui-bucket)
      CREATE_UI_BUCKET=true
      shift
      ;;
    --certificate-arn)
      CERTIFICATE_ARN="$2"
      shift 2
      ;;
    --create-scheduled-task)
      CREATE_SCHEDULED_TASK=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

if [ -z "$STACK_NAME" ]; then
  STACK_NAME=$PROJECT_NAME
fi

if [ "$FORCE" != true ]; then
  echo "You are about to deploy the $STACK_NAME stack to AWS CloudFormation."
  echo "Type 'yes' to continue or anything else to abort."
  read -r CONFIRMATION
  if [ "$CONFIRMATION" != "yes" ]; then
    echo "Deployment aborted."
    exit 0
  fi
fi

echo "Deployment type: ECS"
echo "Project name: $PROJECT_NAME"
echo "Stack name: $STACK_NAME"
echo "Skip ECR: $SKIP_ECR"
echo "Create CodeDeploy App: $CREATE_CODEDEPLOY_APP"
echo "Create CloudFront Distributions: $CREATE_CLOUDFRONT"
echo "Keep Existing CloudFront: $KEEP_EXISTING_CLOUDFRONT"
echo "Create UI Bucket: $CREATE_UI_BUCKET"
echo "Create Scheduled Task: $CREATE_SCHEDULED_TASK"

echo "Deploying $STACK_NAME stack to AWS CloudFormation..."

aws cloudformation deploy \
  --template-file "${SCRIPT_DIR}/cloudformation.yaml" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
    ProjectName="$PROJECT_NAME" \
    SkipECRCreation="$SKIP_ECR" \
    CreateCodeDeployApp="$CREATE_CODEDEPLOY_APP" \
    CreateCloudFrontDistributions="$CREATE_CLOUDFRONT" \
    KeepExistingCloudFront="$KEEP_EXISTING_CLOUDFRONT" \
    CreateUIBucket="$CREATE_UI_BUCKET" \
    CertificateArn="$CERTIFICATE_ARN" \
    CreateScheduledTask="$CREATE_SCHEDULED_TASK"

if [ $? -eq 0 ]; then
  echo ""
  echo "Stack outputs:"
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs" \
    --output table

  echo ""
  echo "ECS infrastructure has been deployed successfully."
  echo "To push an image to ECR and update the ECS service, follow these steps:"
  echo ""
  echo "1. Get the ECR repository URI from the outputs above"
  echo "2. Log in to ECR:"
  echo "   aws ecr get-login-password | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com"
  echo "3. Build and tag your Docker image:"
  echo "   docker build -t <ECR_REPO_URI>:latest ."
  echo "4. Push the image to ECR:"
  echo "   docker push <ECR_REPO_URI>:latest"
  echo "5. The ECS service will deploy the new image via CodeDeploy"
  echo ""
else
  echo "Deployment failed."
  exit 1
fi
