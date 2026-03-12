# CI/CD Pipeline

This document describes how to set up and troubleshoot the CI/CD pipeline.

## Pipeline Overview

The CI/CD pipeline automates the following steps:
1. Source - Pull code from the GitHub repository
2. Build - Build the application and Docker image using CodeBuild
3. Deploy - Deploy the application to AWS ECS using CodeDeploy

## Critical Configuration Requirements

### Artifact File Requirements

1. **Blue/Green Deployment Files**:
   - For ECS blue/green deployments, the image detail file MUST be named `imageDetail.json`
   - AWS CodeDeploy specifically looks for this exact filename
   - The format must be: `{"ImageURI":"<image-uri>"}`

2. **Container Name and Placeholder Format**:
   - The container name MUST be consistent across all configuration files
   - Default: `my-app` as the container name
   - The Image1ContainerName parameter in the CodeDeploy action must be set to `IMAGE1_NAME`
   - The image placeholder in taskdef.json must be `<IMAGE1_NAME>` (single angle brackets)

## Setup

1. Deploy application infrastructure first: `./deploy.sh --force`
2. Deploy pipeline: `./pipeline-deploy.sh --github-connection-arn YOUR_ARN`

## Troubleshooting

- If deployment fails with artifact access errors, check CodeDeploy IAM S3 permissions
- If container name mismatch errors occur, verify consistency across taskdef.json, appspec.yaml, and pipeline.yaml
- If stack is in ROLLBACK_COMPLETE state, delete it first: `aws cloudformation delete-stack --stack-name STACK_NAME`
