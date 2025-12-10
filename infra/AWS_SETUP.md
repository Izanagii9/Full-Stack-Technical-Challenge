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

### 2.4 Update EC2 Role for SSM and Secrets Manager

The EC2 instance needs SSM permissions for CodeBuild to deploy to it, and Secrets Manager permissions to fetch secrets:

```bash
# Attach SSM policy to EC2 role (for deployment)
aws iam attach-role-policy \
    --role-name AutoblogEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Attach Secrets Manager read policy to EC2 role (for fetching secrets)
aws iam attach-role-policy \
    --role-name AutoblogEC2Role \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

**Why these permissions?**
- **SSM**: Allows CodeBuild to deploy to EC2 via AWS Systems Manager
- **Secrets Manager**: Allows EC2 to fetch secrets (HuggingFace API key, database passwords) securely

## Step 3: Create Secrets in AWS Secrets Manager

### 3.1 Why Use Secrets Manager?

Instead of manually creating a `.env` file on EC2 (which is insecure and error-prone), we store all secrets in **AWS Secrets Manager**. The deployment script automatically:
1. Fetches secrets from Secrets Manager
2. Converts them to `.env` format
3. Creates the `.env` file on EC2

**Benefits:**
- ✅ Secrets never stored in Git
- ✅ Centralized secret management
- ✅ Automatic rotation support
- ✅ Audit logging of secret access
- ✅ No manual `.env` file creation needed

### 3.2 Create the Secret

Create a secret named `autoblog/production` with all required environment variables:

```bash
aws secretsmanager create-secret \
    --name autoblog/production \
    --description "Production secrets for Auto-Generated Blog" \
    --secret-string '{
        "HUGGINGFACE_API_KEY": "hf_YOUR_ACTUAL_KEY_HERE",
        "POSTGRES_DB": "autoblog_db",
        "POSTGRES_USER": "autoblog",
        "POSTGRES_PASSWORD": "YOUR_SECURE_PASSWORD_123",
        "DB_HOST": "database",
        "DB_PORT": "5432",
        "DB_NAME": "autoblog_db",
        "DB_USER": "autoblog",
        "DB_PASSWORD": "YOUR_SECURE_PASSWORD_123",
        "PORT": "3001",
        "NODE_ENV": "production",
        "FRONTEND_URL": "http://YOUR_EC2_PUBLIC_IP",
        "HUGGINGFACE_API_URL": "https://router.huggingface.co/v1/chat/completions"
    }' \
    --region us-east-1
```

**⚠️ IMPORTANT - Replace These Values:**
- `hf_YOUR_ACTUAL_KEY_HERE` - Your HuggingFace API key from https://huggingface.co/settings/tokens
- `YOUR_SECURE_PASSWORD_123` - Choose a strong password (used in both `POSTGRES_PASSWORD` and `DB_PASSWORD`)
- `YOUR_EC2_PUBLIC_IP` - Your EC2 instance public IP (you'll get this after launching EC2)

**Note:** `DB_PASSWORD` must match `POSTGRES_PASSWORD` - they're the same database password.

### 3.3 Verify Secret Creation

```bash
# List secrets
aws secretsmanager list-secrets --region us-east-1

# View secret (to verify it was created correctly)
aws secretsmanager get-secret-value \
    --secret-id autoblog/production \
    --region us-east-1 \
    --query SecretString \
    --output text
```

### 3.4 Update Secret (If Needed Later)

If you need to update any secret value (e.g., change password, update EC2 IP):

```bash
aws secretsmanager update-secret \
    --secret-id autoblog/production \
    --secret-string '{
        "HUGGINGFACE_API_KEY": "hf_YOUR_KEY",
        "POSTGRES_DB": "autoblog_db",
        "POSTGRES_USER": "autoblog",
        "POSTGRES_PASSWORD": "NEW_PASSWORD",
        "DB_HOST": "database",
        "DB_PORT": "5432",
        "DB_NAME": "autoblog_db",
        "DB_USER": "autoblog",
        "DB_PASSWORD": "NEW_PASSWORD",
        "PORT": "3001",
        "NODE_ENV": "production",
        "FRONTEND_URL": "http://NEW_EC2_IP",
        "HUGGINGFACE_API_URL": "https://router.huggingface.co/v1/chat/completions"
    }' \
    --region us-east-1
```

After updating, redeploy to EC2 to fetch the new secrets.

## Step 4: Create CodeBuild Project

### 4.1 Verify buildspec.yml

Your `infra/buildspec.yml` is already configured and ready to use:
- ✅ AWS Account ID is auto-detected at runtime (no hardcoding needed)
- ✅ Region defaults to `us-east-1` (change in buildspec if using different region)
- ✅ No secrets required during build (secrets fetched from Secrets Manager at deployment time)

### 4.2 Create CodeBuild Project via Console

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

### 4.3 Or Create via AWS CLI

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

### 4.4 Update Environment Variables (After Creating)

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

## Step 5: Launch EC2 Instance

### 5.1 Create Security Group

```bash
aws ec2 create-security-group \
    --group-name autoblog-sg \
    --description "Security group for Auto-Generated Blog" \
    --region us-east-1
```

### 5.2 Add Inbound Rules

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

### 5.3 Create IAM Role for EC2 (Already Done in Step 2.4)

**Note:** We already created the `AutoblogEC2Role` in Step 2.4 with SSM and Secrets Manager permissions. If you skipped that step, go back and complete it now.

The role should have these policies attached:
- `AmazonEC2ContainerRegistryReadOnly` - To pull Docker images from ECR
- `AmazonSSMManagedInstanceCore` - For CodeBuild deployment via SSM
- `SecretsManagerReadWrite` - To fetch secrets from Secrets Manager

### 5.4 Verify IAM Role and Instance Profile

If you need to create the instance profile (if not done in Step 2):

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

### 5.5 Launch Instance

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

## Step 6: Configure EC2 Instance

### 6.1 Connect to EC2

```bash
ssh -i YOUR_KEY_PAIR.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### 6.2 Run Initialization Script (Optional - Manual Setup)

**Note:** The deployment script (Step 7) will automatically clone the repo and set everything up. This step is only if you want to manually initialize the EC2 instance first.

```bash
# Set your AWS account details
export AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID
export AWS_REGION=us-east-1

# Download and run init script
curl -o init-ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/release-0.1/infra/scripts/init-ec2.sh
chmod +x init-ec2.sh
./init-ec2.sh
```

### 6.3 Verify Secrets Manager Access

**IMPORTANT:** The `.env` file is NO LONGER created manually. Instead, it's automatically fetched from AWS Secrets Manager during deployment.

Verify that your EC2 instance can access Secrets Manager:

```bash
# Test fetching the secret
aws secretsmanager get-secret-value \
    --secret-id autoblog/production \
    --region us-east-1 \
    --query SecretString \
    --output text
```

**Expected Output:** You should see the JSON with all your environment variables.

**If it fails:**
- Check that the EC2 role has `SecretsManagerReadWrite` policy attached (see Step 2.4)
- Verify the secret exists: `aws secretsmanager list-secrets --region us-east-1`
- Check IAM role is attached to EC2 instance

### 6.4 How the Deployment Works

When you deploy (Step 7), the deployment script automatically:
1. **Clones/updates** the GitHub repository to `/home/ec2-user/Full-Stack-Technical-Challenge`
2. **Fetches secrets** from AWS Secrets Manager (`autoblog/production`)
3. **Creates `.env` file** by converting the JSON secrets to `.env` format
4. **Pulls Docker images** from ECR
5. **Starts containers** using `docker-compose-prod.yml`

**No manual `.env` creation needed!** Everything is automated.

## Step 7: Deploy Application

### 7.1 Run Deployment Script

```bash
# Set environment variables
export AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID
export AWS_REGION=us-east-1

# Download and run deploy script
curl -o deploy.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/infra/scripts/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### 7.2 Verify Deployment

```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost/
curl http://localhost:3001/health
```

## Step 8: Test from Public IP

Open in browser:
- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- Backend: `http://YOUR_EC2_PUBLIC_IP:3001/health`
- Cache Dashboard: `http://YOUR_EC2_PUBLIC_IP:3001/cache-stats`

## Step 9: Set Up CI/CD

### 9.1 Trigger Build Manually

```bash
aws codebuild start-build \
    --project-name autoblog-build \
    --region us-east-1
```

### 9.2 Watch Build Progress

```bash
aws codebuild batch-get-builds \
    --ids YOUR_BUILD_ID \
    --region us-east-1
```

### 9.3 Automatic Deployment

**Good news:** Deployment is already automatic! The buildspec.yml (Step 4) includes a post-build step that:
1. Builds and pushes Docker images to ECR
2. Automatically deploys to EC2 via SSM using the `deploy-to-ec2.sh` script
3. EC2 fetches secrets from Secrets Manager
4. EC2 pulls latest images and restarts containers

**No manual deployment needed after CodeBuild completes!**

### 9.4 (Optional) Automate Builds with GitHub Webhook

To trigger builds automatically on git push:

1. Go to CodeBuild project → Edit → Source
2. Check "Rebuild every time a code change is pushed to this repository"
3. Select event types (e.g., PUSH, PULL_REQUEST)
4. CodeBuild will create a webhook in your GitHub repo

**Note:** This uses more free tier minutes. For cost savings, stick with manual builds.

## Cost Estimate

### Free Tier (First 12 Months)
- **EC2 t2.micro**: 750 hours/month (FREE)
- **ECR**: 500 MB storage (FREE)
- **CodeBuild**: 100 build minutes/month (FREE)
- **Secrets Manager**: $0.40/secret/month + $0.05 per 10,000 API calls
- **Data Transfer**: 15 GB/month (FREE)

### After Free Tier
- **EC2 t2.micro**: ~$8-10/month
- **ECR**: ~$0.10/GB/month
- **CodeBuild**: $0.005/build minute
- **Secrets Manager**: ~$0.40/month (1 secret with minimal API calls)
- **Total**: ~$10-18/month

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

### Secrets Manager: Access Denied

**Error**: `An error occurred (AccessDeniedException) when calling the GetSecretValue operation`

**Problem**: EC2 instance can't read secrets from Secrets Manager

**Solution**:
```bash
# Verify EC2 role has Secrets Manager permissions
aws iam list-attached-role-policies --role-name AutoblogEC2Role

# If SecretsManagerReadWrite is missing, add it:
aws iam attach-role-policy \
    --role-name AutoblogEC2Role \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

# Restart docker containers to retry
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
cd /home/ec2-user/Full-Stack-Technical-Challenge
docker-compose -f docker-compose.prod.yml restart
```

### Secrets Manager: Secret Not Found

**Error**: `Secrets Manager can't find the specified secret`

**Problem**: The secret `autoblog/production` doesn't exist or is in wrong region

**Solution**:
```bash
# List all secrets to verify
aws secretsmanager list-secrets --region us-east-1

# If missing, create it (see Step 3.2)
# Make sure to use EXACT name: autoblog/production
```

### Deployment: .env File Empty or Missing Variables

**Problem**: Containers fail because `.env` has missing or malformed values

**Solution**:
```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Check if .env file exists and has content
cd /home/ec2-user/Full-Stack-Technical-Challenge
cat .env

# If .env is missing or malformed, manually fetch secrets
aws secretsmanager get-secret-value \
    --secret-id autoblog/production \
    --region us-east-1 \
    --query SecretString \
    --output text | jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' > .env

# Verify .env content
cat .env

# Restart containers
docker-compose -f docker-compose.prod.yml up -d
```

### Backend: Can't Connect to Database

**Problem**: Backend logs show `ECONNREFUSED` connecting to database

**Root Cause**: Database password mismatch or database container not running

**Solution**:
```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# If database container is missing, check .env
cat .env | grep -E "POSTGRES_|DB_"

# Ensure these match:
# POSTGRES_PASSWORD=<same_password>
# DB_PASSWORD=<same_password>

# If they don't match, update secret in Secrets Manager (Step 3.4)
# Then redeploy
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
