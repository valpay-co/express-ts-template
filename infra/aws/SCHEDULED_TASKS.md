# Scheduled Tasks Architecture

This document explains the optional scheduled task architecture for running periodic jobs using AWS ECS Scheduled Tasks with EventBridge rules.

## Overview

The template includes opt-in scheduled task infrastructure that allows you to run periodic jobs (e.g., data ingestion, report generation, cleanup tasks) on a defined schedule without needing a separate service.

Enabled via: `./deploy.sh --force --create-scheduled-task`

## Architecture Components

### 1. EventBridge Scheduled Rule
- **Name**: `${ProjectName}-weekly-schedule`
- **Default Schedule**: `cron(0 6 ? * MON *)` — Every Monday at 6:00 AM UTC
- **State**: ENABLED
- **Target**: ECS Fargate task in the project cluster

### 2. Scheduled Task Definition
- **Family**: `${ProjectName}-scheduled`
- **Launch Type**: Fargate
- **CPU**: 512 units (0.5 vCPU)
- **Memory**: 1024 MB
- **Network Mode**: awsvpc
- **Default Command**: `npm run schedule` (customize in `cloudformation.yaml`)

### 3. Container Configuration
- **Image**: Same ECR image as the main application
- **Command Override**: Configurable via CloudFormation `Command` property
- **Roles**: Same `ECSTaskExecutionRole` and `ECSTaskRole` as the main service

### 4. Monitoring and Alerting
- **CloudWatch Log Group**: `/ecs/${ProjectName}-scheduled`
- **CloudWatch Alarm**: `${ProjectName}-scheduled-task-failure`
- **SNS Topic**: `${ProjectName}-scheduled-failures`
- **Log Retention**: 30 days

## Deployment

### Enable Scheduled Tasks
```bash
# During initial deployment
./deploy.sh --force --create-scheduled-task

# Updating existing stack to add scheduled tasks
./deploy.sh --force --skip-ecr --skip-codedeploy-app --create-scheduled-task
```

### Disable Scheduled Tasks
```bash
# Redeploy without the flag (removes EventBridge rule and related resources)
./deploy.sh --force --skip-ecr --skip-codedeploy-app
```

## Customization

### Changing the Schedule

Edit `cloudformation.yaml` under `WeeklyScheduledRule`:
```yaml
ScheduleExpression: 'cron(0 6 ? * MON *)'  # Every Monday 6 AM UTC
# Other examples:
# 'cron(0 0 * * ? *)'     — Daily at midnight UTC
# 'cron(0 12 ? * MON-FRI *)' — Weekdays at noon UTC
# 'rate(1 hour)'           — Every hour
```

### Changing the Task Command

Edit `cloudformation.yaml` under `ScheduledTaskDefinition`:
```yaml
Command:
  - npm
  - run
  - schedule   # Replace with your script name
```

### Passing Environment Variables

Add to the `ScheduledTaskDefinition` container definition:
```yaml
Environment:
  - Name: NODE_ENV
    Value: production
  - Name: MY_VAR
    Value: my-value
Secrets:
  - Name: MY_SECRET
    ValueFrom: !Sub 'arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/${ProjectName}/my-secret'
```

### Adjusting Resources

Edit CPU/Memory in `cloudformation.yaml`:
```yaml
ScheduledTaskDefinition:
  Properties:
    Cpu: 1024    # 1 vCPU
    Memory: 2048 # 2 GB
```

## Task Execution Flow

```
EventBridge Rule (schedule trigger)
    ↓
ECS Fargate Task Launch
    ↓
Container starts with custom command
    ↓
Task completes (exits 0 = success, non-zero = failure)
    ↓
CloudWatch Logs captured → /ecs/${ProjectName}-scheduled
    ↓
On failure: CloudWatch Alarm → SNS Topic
```

## Monitoring

### View Logs
```bash
# Recent log streams
aws logs describe-log-streams \
  --log-group-name /ecs/my-app-scheduled \
  --order-by LastEventTime \
  --descending

# Tail logs from latest run
aws logs tail /ecs/my-app-scheduled --follow
```

### Check Alarm Status
```bash
aws cloudwatch describe-alarms \
  --alarm-names my-app-scheduled-task-failure \
  --query 'MetricAlarms[0].{State:StateValue,Reason:StateReason}'
```

### Subscribe to Failure Notifications
```bash
# Get the SNS topic ARN
TOPIC_ARN=$(aws cloudformation describe-stacks --stack-name my-app \
  --query 'Stacks[0].Outputs[?OutputKey==`ScheduledTaskFailureTopic`].OutputValue' \
  --output text)

# Subscribe your email
aws sns subscribe \
  --topic-arn $TOPIC_ARN \
  --protocol email \
  --notification-endpoint your-email@example.com
```

## Running Manually

You can trigger a scheduled task run on demand:
```bash
# Get required values from stack outputs
CLUSTER=$(aws cloudformation describe-stacks --stack-name my-app \
  --query 'Stacks[0].Outputs[?OutputKey==`ECSCluster`].OutputValue' --output text)

TASK_DEF=$(aws cloudformation describe-stacks --stack-name my-app \
  --query 'Stacks[0].Outputs[?OutputKey==`ScheduledTaskDefinition`].OutputValue' --output text)

# Run the task
aws ecs run-task \
  --cluster "$CLUSTER" \
  --task-definition "$TASK_DEF" \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXXXXX],assignPublicIp=ENABLED}"
```

## Cost Considerations

Scheduled tasks only run when triggered — there is no idle cost. Fargate pricing applies per vCPU/memory second during execution. A typical 512 CPU / 1024 MB task running for 30 minutes costs approximately $0.02 per execution.

EventBridge rules, CloudWatch alarms, and SNS topics have minimal cost at low invocation rates.
