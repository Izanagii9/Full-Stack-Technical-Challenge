#!/bin/bash
set -e

echo "=== Starting EC2 Deployment ==="

# Configuration
EC2_INSTANCE_ID="${EC2_INSTANCE_ID}"
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
REPO_DIR="/home/ec2-user/Full-Stack-Technical-Challenge"

echo "Instance ID: $EC2_INSTANCE_ID"
echo "Region: $AWS_REGION"

# Commands to run on EC2
COMMANDS=$(cat <<'EOF'
#!/bin/bash
set -e

echo "=== Deployment started on EC2 ==="

# Navigate to repo directory
cd /home/ec2-user/Full-Stack-Technical-Challenge

# Pull latest code
echo "Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/release-0.1

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 995554323651.dkr.ecr.us-east-1.amazonaws.com

# Pull latest images using production compose file
echo "Pulling latest Docker images from ECR..."
docker-compose -f docker-compose.prod.yml pull

# Restart containers
echo "Restarting containers with new images..."
docker-compose -f docker-compose.prod.yml up -d

# Show status
echo "=== Container Status ==="
docker-compose -f docker-compose.prod.yml ps

echo "=== Deployment completed successfully ==="
EOF
)

# Send command to EC2 via SSM
echo "Sending deployment command to EC2..."
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"$COMMANDS\"]" \
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

echo "=== EC2 Deployment Complete ==="
