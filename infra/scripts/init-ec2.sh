#!/bin/bash

# EC2 Initialization Script for Auto-Generated Blog
# Run this script on a fresh Amazon Linux 2023 EC2 instance

set -e

echo "================================================"
echo "Auto-Generated Blog - EC2 Initialization"
echo "================================================"

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install Docker
echo "Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
echo "Verifying installations..."
docker --version
docker-compose --version

# Install AWS CLI (usually pre-installed on Amazon Linux 2023)
echo "Verifying AWS CLI..."
aws --version

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/autoblog
sudo chown ec2-user:ec2-user /opt/autoblog
cd /opt/autoblog

# Configure AWS ECR login helper
echo "Configuring ECR authentication..."
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-YOUR_ACCOUNT_ID}

# Add Docker auto-login to ECR on system boot
sudo tee /etc/cron.d/ecr-login > /dev/null <<EOF
0 */6 * * * ec2-user aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
EOF

# Initial ECR login
echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "================================================"
echo "EC2 initialization complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Set environment variables in /opt/autoblog/.env"
echo "2. Run deploy.sh to pull and start containers"
echo ""
