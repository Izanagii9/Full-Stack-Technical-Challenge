#!/bin/bash

# Deployment Script for Auto-Generated Blog on EC2
# Pulls latest Docker images from ECR and restarts containers

set -e

echo "================================================"
echo "Auto-Generated Blog - Deployment"
echo "================================================"

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-YOUR_ACCOUNT_ID}
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
FRONTEND_IMAGE="$ECR_REGISTRY/autoblog-frontend:latest"
BACKEND_IMAGE="$ECR_REGISTRY/autoblog-backend:latest"
APP_DIR="/opt/autoblog"

# Navigate to application directory
cd $APP_DIR

# Login to ECR
echo "Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Pull latest images
echo "Pulling latest Docker images..."
docker pull $FRONTEND_IMAGE
docker pull $BACKEND_IMAGE

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Create docker-compose.override.yml for ECR images
echo "Creating docker-compose override for ECR images..."
cat > docker-compose.override.yml <<EOF
version: '3.8'

services:
  frontend:
    image: $FRONTEND_IMAGE

  backend:
    image: $BACKEND_IMAGE
EOF

# Start containers
echo "Starting containers..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check container status
echo "Checking container status..."
docker-compose ps

# Show logs
echo "Recent logs:"
docker-compose logs --tail=50

echo "================================================"
echo "Deployment complete!"
echo "================================================"
echo ""
echo "Services:"
echo "  Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "  Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001"
echo ""
echo "To view logs: docker-compose logs -f"
echo ""
