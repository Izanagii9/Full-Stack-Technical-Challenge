#!/bin/bash
set -e

echo "=== Starting EC2 Deployment ==="

# Configuration
EC2_INSTANCE_ID="${EC2_INSTANCE_ID}"
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "Instance ID: $EC2_INSTANCE_ID"
echo "Region: $AWS_REGION"

# Send command to EC2 via SSM
echo "Sending deployment command to EC2..."

COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters '{"commands":["#!/bin/bash","set -ex","echo \"=== EC2 Deployment Started ===\"","# Clone repo if it doesnt exist","if [ ! -d /home/ec2-user/Full-Stack-Technical-Challenge ]; then","  echo \"Cloning repository...\"","  cd /home/ec2-user","  git clone https://github.com/Izanagii9/Full-Stack-Technical-Challenge.git","  cd Full-Stack-Technical-Challenge","  git checkout release-0.1","else","  echo \"Repository exists, updating...\"","  cd /home/ec2-user/Full-Stack-Technical-Challenge","  git fetch origin","  git reset --hard origin/release-0.1","fi","# Fetch secrets from AWS Secrets Manager and create .env","echo \"Fetching secrets from AWS Secrets Manager...\"","SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id autoblog/production --region us-east-1 --query SecretString --output text)","echo \"Secret fetched, parsing to .env format...\"","echo \"$SECRET_JSON\" | jq -r \"to_entries|map(\\\"\\(.key)=\\(.value|tostring)\\\")|.[]\" > .env","echo \"Contents of .env file:\"","cat .env","echo \"Secrets fetched and .env created\"","# Login to ECR","echo \"Logging in to ECR...\"","aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 995554323651.dkr.ecr.us-east-1.amazonaws.com","# Pull latest images","echo \"Pulling latest Docker images...\"","docker-compose -f docker-compose.prod.yml pull","# Start containers","echo \"Starting containers...\"","docker-compose -f docker-compose.prod.yml up -d","# Show status","echo \"=== Container Status ===\"","docker-compose -f docker-compose.prod.yml ps","echo \"=== Deployment Complete ===\""]}' \
  --region "$AWS_REGION" \
  --query 'Command.CommandId' \
  --output text)

echo "SSM Command ID: $COMMAND_ID"

# Wait for command to complete
echo "Waiting for deployment to complete..."
aws ssm wait command-executed \
  --command-id "$COMMAND_ID" \
  --instance-id "$EC2_INSTANCE_ID" \
  --region "$AWS_REGION"

# Get command output
echo "=== Deployment Output ==="
aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id "$EC2_INSTANCE_ID" \
  --region "$AWS_REGION" \
  --query 'StandardOutputContent' \
  --output text

# Get error output if any
echo "=== Deployment Errors (if any) ==="
aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id "$EC2_INSTANCE_ID" \
  --region "$AWS_REGION" \
  --query 'StandardErrorContent' \
  --output text

# Get command status
COMMAND_STATUS=$(aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id "$EC2_INSTANCE_ID" \
  --region "$AWS_REGION" \
  --query 'Status' \
  --output text)

echo "=== Command Status: $COMMAND_STATUS ==="

if [ "$COMMAND_STATUS" != "Success" ]; then
  echo "ERROR: Deployment failed with status: $COMMAND_STATUS"
  exit 1
fi

echo "=== EC2 Deployment Complete ==="
