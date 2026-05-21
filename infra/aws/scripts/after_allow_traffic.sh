#!/bin/bash
# after_allow_traffic.sh - Script to run after traffic is allowed to the new deployment

# Log the start of the script
echo "AfterAllowTraffic hook started"

# Get the deployment details
DEPLOYMENT_ID=$DEPLOYMENT_ID
LIFECYCLE_EVENT=$LIFECYCLE_EVENT
DEPLOYMENT_GROUP_NAME=$DEPLOYMENT_GROUP_NAME
DEPLOYMENT_GROUP_ID=$DEPLOYMENT_GROUP_ID

# Log the deployment details
echo "Deployment ID: $DEPLOYMENT_ID"
echo "Lifecycle Event: $LIFECYCLE_EVENT"
echo "Deployment Group Name: $DEPLOYMENT_GROUP_NAME"
echo "Deployment Group ID: $DEPLOYMENT_GROUP_ID"

# Set the desired count for the ECS service
# Use environment variables with fallback defaults
CLUSTER_NAME="${CLUSTER_NAME:-my-app-cluster}"
SERVICE_NAME="${SERVICE_NAME:-my-app-service}"

echo "Updating ECS service desired count..."
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --desired-count 1

# Check if the update was successful
if [ $? -eq 0 ]; then
  echo "Successfully updated ECS service desired count to 1"
  # Return success to CodeDeploy
  exit 0
else
  echo "Failed to update ECS service desired count"
  # Return failure to CodeDeploy
  exit 1
fi
