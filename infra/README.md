# Application Infrastructure

This directory contains the infrastructure setup for the application.

## Directory Structure

- **[aws/](./aws/)**: AWS infrastructure setup including CloudFormation templates and deployment scripts
  - CloudFormation templates for ECS, CodePipeline, and other AWS resources
  - Deployment scripts for the application and CI/CD pipeline
  - Detailed deployment instructions

## Deployment Overview

The application uses a two-step deployment process:

1. **Application Infrastructure**: First, deploy the core application infrastructure (ECS, ALB, etc.)
2. **CI/CD Pipeline**: Then, deploy the CI/CD pipeline that references the application infrastructure

For detailed deployment instructions, please see the [AWS README](./aws/README.md).

## Infrastructure as Code

All infrastructure is defined as code using AWS CloudFormation templates:

- **cloudformation.yaml**: Defines the application infrastructure (ECS, ALB, etc.)
- **pipeline.yaml**: Defines the CI/CD pipeline (CodePipeline, CodeBuild, etc.)

## CI/CD Pipeline

The CI/CD pipeline automatically deploys changes to the application when code is pushed to the main branch. It includes:

- Source stage that pulls from GitHub
- Build stage that builds the Docker image and deploys the UI to S3
- Deploy stage that uses CodeDeploy for blue-green deployment to ECS

## Blue-Green Deployment

The application uses a blue-green deployment strategy to ensure zero-downtime updates:

- Two identical environments (blue and green)
- Traffic is gradually shifted from the active to the inactive environment
- If issues are detected, traffic can be immediately shifted back to the original environment
