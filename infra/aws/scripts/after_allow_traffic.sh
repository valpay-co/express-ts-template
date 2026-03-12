#!/bin/bash
# after_allow_traffic.sh - Script to run after traffic is allowed to the new deployment

echo "AfterAllowTraffic hook started"

DEPLOYMENT_ID=$DEPLOYMENT_ID
LIFECYCLE_EVENT=$LIFECYCLE_EVENT
DEPLOYMENT_GROUP_NAME=$DEPLOYMENT_GROUP_NAME
DEPLOYMENT_GROUP_ID=$DEPLOYMENT_GROUP_ID

echo "Deployment ID: $DEPLOYMENT_ID"
echo "Lifecycle Event: $LIFECYCLE_EVENT"

# Use environment variables with fallback defaults
CLUSTER_NAME="${CLUSTER_NAME:-my-app-cluster}"
SERVICE_NAME="${SERVICE_NAME:-my-app-service}"

echo "Updating ECS service desired count..."
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --desired-count 1

if [ $? -eq 0 ]; then
  echo "Successfully updated ECS service desired count to 1"
  exit 0
else
  echo "Failed to update ECS service desired count"
  exit 1
fi
