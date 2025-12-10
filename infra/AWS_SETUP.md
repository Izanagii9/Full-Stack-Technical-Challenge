# AWS Deployment Guide

Complete guide for deploying the Auto-Generated Blog to AWS EC2 with CodeBuild and ECR.

## Prerequisites

- AWS Account (Free Tier eligible)
- AWS CLI installed and configured
- Git repository pushed to GitHub
- HuggingFace API key

## ⚠️ Security Note

**IMPORTANT:** This project uses a `.env` file for secrets management. The `.env` file is in `.gitignore` and will NOT be pushed to GitHub. You will need to create it manually on your EC2 instance (covered in Step 5.3).

## Architecture Overview

```
GitHub → CodeBuild → ECR → EC2
  │         │         │      │
  │         │         │      ├─ Frontend (nginx:80)
  │         │         │      ├─ Backend (node:3001)
  │         │         │      └─ Database (postgres:5432)
  │         │         │
  │         │         └─ Docker Images Storage
  │         └─ Build & Push Docker Images
  └─ Source Code
```

## Step 1: Create ECR Repositories

### 1.1 Frontend Repository

```bash
aws ecr create-repository \
    --repository-name autoblog-frontend \
    --region us-east-1 \
    --image-scanning-configuration scanOnPush=true
```

### 1.2 Backend Repository

```bash
aws ecr create-repository \
    --repository-name autoblog-backend \
    --region us-east-1 \
    --image-scanning-configuration scanOnPush=true
```

### 1.3 Note Repository URIs

Save the `repositoryUri` from both outputs:
```
ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/autoblog-frontend
ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/autoblog-backend
```

## Step 2: Create IAM Role for CodeBuild

### 2.1 Create Trust Policy

Create `codebuild-trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### 2.2 Create Role

```bash
aws iam create-role \
    --role-name AutoblogCodeBuildRole \
    --assume-role-policy-document file://codebuild-trust-policy.json
```

### 2.3 Attach Policies

```bash
# ECR permissions
aws iam attach-role-policy \
    --role-name AutoblogCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

# CloudWatch logs
aws iam attach-role-policy \
    --role-name AutoblogCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# S3 (for build artifacts)
aws iam attach-role-policy \
    --role-name AutoblogCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# SSM permissions (for EC2 deployment)
aws iam attach-role-policy \
    --role-name AutoblogCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
```

### 2.4 Update EC2 Role for SSM

The EC2 instance needs SSM permissions for CodeBuild to deploy to it:

```bash
# Attach SSM policy to EC2 role
aws iam attach-role-policy \
    --role-name AutoblogEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
```

## Step 3: Create CodeBuild Project

### 3.1 Verify buildspec.yml

Your `infra/buildspec.yml` is already configured and ready to use:
- ✅ AWS Account ID is auto-detected at runtime (no hardcoding needed)
- ✅ Region defaults to `us-east-1` (change in buildspec if using different region)
- ✅ No secrets required during build (loaded at runtime on EC2)

### 3.2 Create CodeBuild Project via Console

1. Go to AWS CodeBuild → Create build project
2. **Project name**: `autoblog-build`
3. **Source**:
   - Provider: GitHub
   - Repository: Connect to your GitHub repo
   - Source version: `release-0.1` (or your main branch)
   - Webhook: ❌ **UNCHECK** "Rebuild every time a code change is pushed" (manual builds only to save free tier)
4. **Environment**:
   - Environment image: Managed image
   - Operating system: Amazon Linux
   - Runtime: Standard
   - Image: `aws/codebuild/amazonlinux-x86_64-standard:5.0`
   - Image version: Always use the latest image
   - Service role: Existing service role
   - Role ARN: Select `AutoblogCodeBuildRole`
   - **Additional configuration** (expand this section):
     - Privileged: ✅ **ENABLE** (required for Docker)
     - Compute: 3 GB memory, 2 vCPUs
     - **Environment variables** (CRITICAL - Add these):
       - Name: `VITE_API_URL`, Value: `http://YOUR_EC2_PUBLIC_IP:3001/api`, Type: Plaintext
       - Name: `EC2_INSTANCE_ID`, Value: `i-xxxxxxxxxxxxx` (your EC2 instance ID), Type: Plaintext
5. **Buildspec**:
   - Use a buildspec file
   - Buildspec name: `infra/buildspec.yml`
6. **Artifacts**:
   - Type: No artifacts
7. **Logs** (optional but recommended):
   - CloudWatch logs: ✅ Enable
   - Group name: `/aws/codebuild/autoblog-build` (default)
8. Create build project

**⚠️ CRITICAL:** The environment variables are required for deployment:
- `VITE_API_URL`: Frontend will be built with this API URL (must point to your EC2 instance)
- `EC2_INSTANCE_ID`: CodeBuild needs this to deploy via SSM to your EC2 instance

### 3.3 Or Create via AWS CLI

Replace placeholders with your actual values:

```bash
aws codebuild create-project \
    --name autoblog-build \
    --source '{
        "type": "GITHUB",
        "location": "https://github.com/YOUR_USERNAME/YOUR_REPO.git",
        "buildspec": "infra/buildspec.yml"
    }' \
    --artifacts '{"type": "NO_ARTIFACTS"}' \
    --environment '{
        "type": "LINUX_CONTAINER",
        "image": "aws/codebuild/amazonlinux-x86_64-standard:5.0",
        "computeType": "BUILD_GENERAL1_SMALL",
        "privilegedMode": true,
        "environmentVariables": [
            {
                "name": "VITE_API_URL",
                "value": "http://YOUR_EC2_PUBLIC_IP:3001/api",
                "type": "PLAINTEXT"
            },
            {
                "name": "EC2_INSTANCE_ID",
                "value": "i-xxxxxxxxxxxxx",
                "type": "PLAINTEXT"
            }
        ]
    }' \
    --service-role arn:aws:iam::YOUR_ACCOUNT_ID:role/AutoblogCodeBuildRole \
    --region us-east-1
```

**Important Notes:**
- Replace `YOUR_USERNAME/YOUR_REPO` with your GitHub repository
- Replace `YOUR_EC2_PUBLIC_IP` with your EC2 instance's public IP
- Replace `i-xxxxxxxxxxxxx` with your EC2 instance ID
- Replace `YOUR_ACCOUNT_ID` with your AWS account ID
- Using `amazonlinux-x86_64-standard:5.0` (latest) with Docker 26
- AWS Account ID in buildspec is auto-detected at build time

### 3.4 Update Environment Variables (After Creating)

If you need to update environment variables later (e.g., if EC2 IP changes):

```bash
aws codebuild update-project \
    --name autoblog-build \
    --environment '{
        "type": "LINUX_CONTAINER",
        "image": "aws/codebuild/amazonlinux-x86_64-standard:5.0",
        "computeType": "BUILD_GENERAL1_SMALL",
        "privilegedMode": true,
        "environmentVariables": [
            {
                "name": "VITE_API_URL",
                "value": "http://NEW_EC2_IP:3001/api",
                "type": "PLAINTEXT"
            },
            {
                "name": "EC2_INSTANCE_ID",
                "value": "i-xxxxxxxxxxxxx",
                "type": "PLAINTEXT"
            }
        ]
    }' \
    --region us-east-1
```

## Step 4: Launch EC2 Instance

### 4.1 Create Security Group

```bash
aws ec2 create-security-group \
    --group-name autoblog-sg \
    --description "Security group for Auto-Generated Blog" \
    --region us-east-1
```

### 4.2 Add Inbound Rules

```bash
# Get security group ID
SG_ID=$(aws ec2 describe-security-groups --group-names autoblog-sg --query 'SecurityGroups[0].GroupId' --output text)

# Allow HTTP (port 80)
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Allow Backend API (port 3001)
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3001 \
    --cidr 0.0.0.0/0

# Allow SSH (port 22)
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0
```

### 4.3 Create IAM Role for EC2

Create `ec2-trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```bash
# Create role
aws iam create-role \
    --role-name AutoblogEC2Role \
    --assume-role-policy-document file://ec2-trust-policy.json

# Attach ECR read policy
aws iam attach-role-policy \
    --role-name AutoblogEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

# Create instance profile
aws iam create-instance-profile \
    --instance-profile-name AutoblogEC2Profile

# Add role to profile
aws iam add-role-to-instance-profile \
    --instance-profile-name AutoblogEC2Profile \
    --role-name AutoblogEC2Role
```

### 4.4 Launch Instance

```bash
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --instance-type t2.micro \
    --key-name YOUR_KEY_PAIR \
    --security-group-ids $SG_ID \
    --iam-instance-profile Name=AutoblogEC2Profile \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=autoblog-server}]' \
    --region us-east-1
```

**Note**: Replace `YOUR_KEY_PAIR` with your EC2 key pair name. Use Amazon Linux 2023 AMI for your region.

## Step 5: Configure EC2 Instance

### 5.1 Connect to EC2

```bash
ssh -i YOUR_KEY_PAIR.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### 5.2 Run Initialization Script

```bash
# Set your AWS account details
export AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID
export AWS_REGION=us-east-1

# Download and run init script
curl -o init-ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/infra/scripts/init-ec2.sh
chmod +x init-ec2.sh
./init-ec2.sh
```

### 5.3 Create Environment File

**IMPORTANT:** The `.env` file contains your secrets and is NOT in the GitHub repository (it's in `.gitignore`). You must create it manually on the EC2 instance.

```bash
cd /opt/autoblog

# Download the .env.example template
curl -o .env.example https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/.env.example

# Create .env file with your actual values
cat > .env <<EOF
# HuggingFace API (REQUIRED - Get from https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=hf_your_actual_key_here  # ⚠️ REPLACE WITH YOUR KEY

# Database Configuration
POSTGRES_DB=autoblog_db
POSTGRES_USER=autoblog
POSTGRES_PASSWORD=your_secure_password_123  # ⚠️ CHANGE THIS

# Backend Configuration
DB_HOST=database
DB_PORT=5432
DB_NAME=autoblog_db
DB_USER=autoblog
DB_PASSWORD=your_secure_password_123  # ⚠️ Must match POSTGRES_PASSWORD
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP  # ⚠️ Replace with your EC2 public IP
HUGGINGFACE_API_URL=https://router.huggingface.co/v1/chat/completions
EOF

# Verify the file was created
cat .env
```

**Security Notes:**
- Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP address
- Use a strong password for `POSTGRES_PASSWORD`
- Keep your `.env` file secure - it contains sensitive credentials
- The `.env` file stays on the EC2 instance and is never committed to git

### 5.4 Download docker-compose.yml

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml
```

## Step 6: Deploy Application

### 6.1 Run Deployment Script

```bash
# Set environment variables
export AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID
export AWS_REGION=us-east-1

# Download and run deploy script
curl -o deploy.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/infra/scripts/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### 6.2 Verify Deployment

```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost/
curl http://localhost:3001/health
```

## Step 7: Test from Public IP

Open in browser:
- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- Backend: `http://YOUR_EC2_PUBLIC_IP:3001/health`
- Cache Dashboard: `http://YOUR_EC2_PUBLIC_IP:3001/cache-stats`

## Step 8: Set Up CI/CD

### 8.1 Trigger Build Manually

```bash
aws codebuild start-build \
    --project-name autoblog-build \
    --region us-east-1
```

### 8.2 Watch Build Progress

```bash
aws codebuild batch-get-builds \
    --ids YOUR_BUILD_ID \
    --region us-east-1
```

### 8.3 Deploy After Build

After CodeBuild completes, SSH to EC2 and run:
```bash
cd /opt/autoblog
./deploy.sh
```

### 8.4 (Optional) Automate Deployment

Add webhook to GitHub or use AWS CodePipeline for automatic deployments.

## Cost Estimate

### Free Tier (First 12 Months)
- **EC2 t2.micro**: 750 hours/month (FREE)
- **ECR**: 500 MB storage (FREE)
- **CodeBuild**: 100 build minutes/month (FREE)
- **Data Transfer**: 15 GB/month (FREE)

### After Free Tier
- **EC2 t2.micro**: ~$8-10/month
- **ECR**: ~$0.10/GB/month
- **CodeBuild**: $0.005/build minute
- **Total**: ~$10-15/month

## Troubleshooting

### CodeBuild: Missing Environment Variables

**Error**: Frontend built with `localhost:3001` instead of EC2 IP

**Solution**: Add environment variables to CodeBuild project:
```bash
aws codebuild update-project \
    --name autoblog-build \
    --environment '{
        "type": "LINUX_CONTAINER",
        "image": "aws/codebuild/amazonlinux-x86_64-standard:5.0",
        "computeType": "BUILD_GENERAL1_SMALL",
        "privilegedMode": true,
        "environmentVariables": [
            {
                "name": "VITE_API_URL",
                "value": "http://54.237.240.161:3001/api",
                "type": "PLAINTEXT"
            },
            {
                "name": "EC2_INSTANCE_ID",
                "value": "i-0fcc7cfea1674063f",
                "type": "PLAINTEXT"
            }
        ]
    }' \
    --region us-east-1
```

### CodeBuild: SSM Deployment Fails

**Error**: `An error occurred (AccessDeniedException) when calling the SendCommand operation`

**Solution**: Both CodeBuild and EC2 need SSM permissions:
```bash
# Add SSM to CodeBuild role
aws iam attach-role-policy \
    --role-name AutoblogCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Add SSM to EC2 role
aws iam attach-role-policy \
    --role-name AutoblogEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Restart SSM agent on EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
sudo systemctl restart amazon-ssm-agent
```

### CodeBuild: Backend Tag Doesn't Exist

**Error**: `tag does not exist: 995554323651.dkr.ecr.us-east-1.amazonaws.com/autoblog-backend:61be3d8`

**Solution**: This was a bug in buildspec.yml line 47 (already fixed in latest version). Update your code:
```bash
git pull origin release-0.1
aws codebuild start-build --project-name autoblog-build --region us-east-1
```

### Build Fails
```bash
# Check CodeBuild logs
aws logs tail /aws/codebuild/autoblog-build --follow

# Get build details
aws codebuild batch-get-builds --ids YOUR_BUILD_ID --region us-east-1
```

### ECR Login Fails
```bash
# Re-login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Frontend Shows Localhost API Error

**Problem**: Frontend trying to connect to `http://localhost:3001/api`

**Root Cause**: CodeBuild environment variable `VITE_API_URL` not set

**Solution**:
1. Update CodeBuild environment variables (see above)
2. Rebuild: `aws codebuild start-build --project-name autoblog-build --region us-east-1`
3. Verify in build logs: Look for `VITE_API_URL=http://YOUR_IP:3001/api`

### Container Fails to Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Verify environment variables
cat .env
```

### Database Connection Error
```bash
# Check database is running
docker-compose ps database

# Check healthcheck
docker inspect autoblog-db | grep -A 10 Health
```

### EC2 Not Showing in SSM

**Problem**: CodeBuild can't deploy to EC2 via SSM

**Solution**:
```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Install SSM agent (if not present)
sudo yum install -y amazon-ssm-agent

# Start SSM agent
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent

# Check status
sudo systemctl status amazon-ssm-agent

# Verify instance appears in SSM (run on your local machine)
aws ssm describe-instance-information --region us-east-1
```

## Cleanup (When Done)

```bash
# Stop containers
docker-compose down -v

# Delete EC2 instance
aws ec2 terminate-instances --instance-ids INSTANCE_ID

# Delete ECR repositories
aws ecr delete-repository --repository-name autoblog-frontend --force
aws ecr delete-repository --repository-name autoblog-backend --force

# Delete CodeBuild project
aws codebuild delete-project --name autoblog-build

# Delete IAM roles and policies
aws iam remove-role-from-instance-profile --instance-profile-name AutoblogEC2Profile --role-name AutoblogEC2Role
aws iam delete-instance-profile --instance-profile-name AutoblogEC2Profile
aws iam delete-role --role-name AutoblogEC2Role
aws iam delete-role --role-name AutoblogCodeBuildRole

# Delete security group
aws ec2 delete-security-group --group-id $SG_ID
```

## Next Steps

1. ✅ Application running on EC2
2. ✅ Images stored in ECR
3. ✅ CodeBuild configured
4. 📝 Record demo video (30-120 seconds)
5. 📧 Submit to hiring@assimetria.com

Good luck!
