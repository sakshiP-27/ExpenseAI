# 🏴‍☠️ Strawhats — ECS Deployment Guide
### Deploying Zoro (Go, port 3000) & Sanji (Python/FastAPI, port 4000) on AWS ECS Fargate

---

## Architecture

```
Nami (Vercel) ──► Zoro (ECS, public) ◄──► Sanji (ECS, private)
```

- **Nami → Zoro**: Nami is the only external caller, so Zoro needs a public IP with port 3000 open to the internet.
- **Zoro → Sanji**: Sanji is an internal service — only Zoro calls it. Sanji gets **no public IP** and port 4000 is open only to Zoro's security group.
- **Sanji URL in Zoro**: Zoro reaches Sanji via Sanji's **private IP**, passed as an environment variable at deploy time (see Step 10).

---

## Before You Start

Make sure you have:
- [ ] AWS CLI installed and configured (`aws configure` — needs Access Key ID, Secret, and region)
- [ ] Docker running locally
- [ ] Your monorepo folder structure ready (with `/backend` and `/genAI` folders)
- [ ] Your `.env` file ready with all the secrets/API keys your services need

Set your region (Mumbai). Run this once at the start of every terminal session:
```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=ap-south-1
export ECR_BASE=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Verify — should print your account ID
echo $AWS_ACCOUNT_ID
```

---

## Step 1 — Create ECR Repositories

ECR is AWS's container registry — like Docker Hub but private. You need one repo per service.

```bash
aws ecr create-repository --repository-name zoro-backend --region $AWS_REGION
aws ecr create-repository --repository-name sanji-genai --region $AWS_REGION
```

✅ You should see a JSON response for each with `"repositoryName"` in it.

---

## Step 2 — Build & Push Images to ECR

```bash
# Authenticate Docker to ECR (token expires in 12 hours, re-run if you get auth errors)
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_BASE

# Build images (run from your monorepo root)
docker build -f Dockerfile-Zoro -t zoro-backend ./backend
docker build -f Dockerfile-Sanji -t sanji-genai ./genAI

# Tag for ECR
docker tag zoro-backend:latest $ECR_BASE/zoro-backend:latest
docker tag sanji-genai:latest $ECR_BASE/sanji-genai:latest

# Push
docker push $ECR_BASE/zoro-backend:latest
docker push $ECR_BASE/sanji-genai:latest
```

✅ Both pushes should complete with layer digests printed. You can verify in the AWS Console under ECR.

---

## Step 3 — Create the IAM Task Execution Role

This is a one-time setup. It gives ECS permission to pull your images from ECR, write logs to CloudWatch, and read secrets from SSM.

```bash
# Create the role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach the standard ECS policy (ECR pull + CloudWatch logs)
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Attach SSM read policy (needed to read your secrets)
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess
```

✅ No output means success for the `attach-role-policy` commands. That's normal.

---

## Step 4 — Create the ECS Cluster

```bash
aws ecs create-cluster --cluster-name strawhats --region $AWS_REGION
```

✅ You should see `"clusterName": "strawhats"` in the response.

---

## Step 5 — Create CloudWatch Log Groups

This is where your container logs will appear.

```bash
aws logs create-log-group --log-group-name /ecs/zoro-backend --region $AWS_REGION
aws logs create-log-group --log-group-name /ecs/sanji-genai --region $AWS_REGION
```

✅ No output = success.

---

## Step 6 — Store Secrets in SSM Parameter Store

**Do not skip this.** Never put API keys directly in the task definition JSON.

Look at your `.env` file and store each secret individually. The pattern is:

```bash
aws ssm put-parameter \
  --name "/strawhats/<service>/<KEY_NAME>" \
  --value "your-actual-value-here" \
  --type SecureString \
  --region $AWS_REGION
```

**Examples — replace values with your real ones:**

```bash
# Example: if Sanji needs an OpenAI key
aws ssm put-parameter \
  --name "/strawhats/sanji/OPENAI_API_KEY" \
  --value "sk-your-key-here" \
  --type SecureString \
  --region $AWS_REGION

# Example: if Zoro needs a database URL
aws ssm put-parameter \
  --name "/strawhats/zoro/DATABASE_URL" \
  --value "postgres://user:pass@host:5432/db" \
  --type SecureString \
  --region $AWS_REGION

# Add one command per secret in your .env file
```

> 💡 **Naming convention:** `/strawhats/sanji/KEY_NAME` keeps things organized.
> You'll need the full parameter ARN in Step 7. The ARN format is:
> `arn:aws:ssm:ap-south-1:<YOUR_ACCOUNT_ID>:parameter/strawhats/sanji/OPENAI_API_KEY`

✅ Each command should return `"Version": 1`.

---

## Step 7 — Create Task Definitions

A task definition tells ECS what container to run, how much CPU/RAM to give it, what ports to open, and where to get secrets.

> ⚠️ **Note on `SANJI_URL` in Zoro's task definition:** Zoro needs to know Sanji's address. Since Sanji has no public IP, Zoro will use Sanji's **private IP**. You'll get that IP in Step 10 and update Zoro's service then. For now, leave `SANJI_URL` as a placeholder — it'll be filled in after Sanji is running.

### 7a. Create `task-def-zoro.json`

Create this file in your monorepo root. Replace `<YOUR_ACCOUNT_ID>` throughout.

```json
{
  "family": "zoro-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "zoro-backend",
      "image": "<YOUR_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/zoro-backend:latest",
      "portMappings": [
        { "containerPort": 3000, "protocol": "tcp" }
      ],
      "environment": [
        { "name": "GO_ENV", "value": "production" },
        { "name": "SANJI_URL", "value": "PLACEHOLDER" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:ap-south-1:<YOUR_ACCOUNT_ID>:parameter/strawhats/zoro/DATABASE_URL"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/zoro-backend",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

> Remove the `"secrets"` block if Zoro has no secrets. Add one entry per secret if it has more.
> `SANJI_URL` will be something like `http://10.0.x.x:4000` — you'll update this in Step 10 after Sanji is up.
> Make sure your Go code reads this as an environment variable (e.g. `os.Getenv("SANJI_URL")`).

### 7b. Create `task-def-sanji.json`

```json
{
  "family": "sanji-genai",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "sanji-genai",
      "image": "<YOUR_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/sanji-genai:latest",
      "portMappings": [
        { "containerPort": 4000, "protocol": "tcp" }
      ],
      "environment": [
        { "name": "ENVIRONMENT", "value": "production" }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:ssm:ap-south-1:<YOUR_ACCOUNT_ID>:parameter/strawhats/sanji/OPENAI_API_KEY"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sanji-genai",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

> ⚠️ Add one `secrets` entry per secret you stored in SSM in Step 6.

### 7c. Auto-replace your account ID

```bash
sed -i "s/<YOUR_ACCOUNT_ID>/$AWS_ACCOUNT_ID/g" task-def-zoro.json task-def-sanji.json
```

### 7d. Register the task definitions

```bash
aws ecs register-task-definition --cli-input-json file://task-def-zoro.json --region $AWS_REGION
aws ecs register-task-definition --cli-input-json file://task-def-sanji.json --region $AWS_REGION
```

✅ You should see a large JSON response with `"taskDefinitionArn"` in it for each.

---

## Step 8 — Networking Setup

This creates **two separate security groups** — one for each service — to enforce that Sanji is only reachable by Zoro, not the open internet.

```bash
# Get your default VPC ID
export VPC_ID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text)

# Get subnet IDs in that VPC
export SUBNETS=$(aws ec2 describe-subnets \
  --filters Name=defaultForAz,Values=true \
  --query 'Subnets[*].SubnetId' --output text | tr '\t' ',')

# --- Zoro's security group (public-facing) ---
export ZORO_SG_ID=$(aws ec2 create-security-group \
  --group-name zoro-sg \
  --description "Zoro ECS service — public on port 3000" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow Nami (and anyone) to call Zoro on port 3000
aws ec2 authorize-security-group-ingress \
  --group-id $ZORO_SG_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0

# --- Sanji's security group (internal only) ---
export SANJI_SG_ID=$(aws ec2 create-security-group \
  --group-name sanji-sg \
  --description "Sanji ECS service — only reachable by Zoro" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow ONLY Zoro's security group to reach Sanji on port 4000
aws ec2 authorize-security-group-ingress \
  --group-id $SANJI_SG_ID \
  --protocol tcp \
  --port 4000 \
  --source-group $ZORO_SG_ID

# Print for verification
echo "VPC: $VPC_ID"
echo "Subnets: $SUBNETS"
echo "Zoro SG: $ZORO_SG_ID"
echo "Sanji SG: $SANJI_SG_ID"
```

✅ Note down both Security Group IDs — you'll need them in Step 9.

---

## Step 9 — Create ECS Services

Zoro gets a public IP (so Nami can reach it). Sanji gets **no public IP** — it lives on the private network and is only reachable from within the VPC by Zoro.

```bash
# Sanji — deploy first so we can get its private IP for Zoro
aws ecs create-service \
  --cluster strawhats \
  --service-name sanji-genai \
  --task-definition sanji-genai \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SANJI_SG_ID],assignPublicIp=DISABLED}" \
  --region $AWS_REGION

# Zoro — public IP enabled so Nami can reach it
aws ecs create-service \
  --cluster strawhats \
  --service-name zoro-backend \
  --task-definition zoro-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$ZORO_SG_ID],assignPublicIp=ENABLED}" \
  --region $AWS_REGION
```

Now wait about 60–90 seconds for tasks to start. Then check:

```bash
aws ecs list-tasks --cluster strawhats --region $AWS_REGION
```

✅ You should see two task ARNs listed.

---

## Step 10 — Get IPs, Wire Zoro → Sanji, Run Health Checks

### Get Sanji's private IP

```bash
SANJI_TASK=$(aws ecs list-tasks --cluster strawhats --service-name sanji-genai \
  --region $AWS_REGION --query 'taskArns[0]' --output text)

SANJI_ENI=$(aws ecs describe-tasks --cluster strawhats --tasks $SANJI_TASK \
  --region $AWS_REGION \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

SANJI_PRIVATE_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $SANJI_ENI \
  --query 'NetworkInterfaces[0].PrivateIpAddress' --output text)

echo "Sanji private IP: $SANJI_PRIVATE_IP"
```

### Update Zoro's task definition with Sanji's private IP

Now register a new revision of Zoro's task definition with the real `SANJI_URL`:

```bash
# Replace the PLACEHOLDER with Sanji's actual private IP
sed -i "s|PLACEHOLDER|http://$SANJI_PRIVATE_IP:4000|g" task-def-zoro.json

# Register the updated task definition
aws ecs register-task-definition --cli-input-json file://task-def-zoro.json --region $AWS_REGION

# Force Zoro to redeploy with the new task definition
aws ecs update-service \
  --cluster strawhats \
  --service zoro-backend \
  --task-definition zoro-backend \
  --force-new-deployment \
  --region $AWS_REGION
```

Wait ~60 seconds for Zoro to restart with the new config.

### Get Zoro's public IP

```bash
ZORO_TASK=$(aws ecs list-tasks --cluster strawhats --service-name zoro-backend \
  --region $AWS_REGION --query 'taskArns[0]' --output text)

ZORO_ENI=$(aws ecs describe-tasks --cluster strawhats --tasks $ZORO_TASK \
  --region $AWS_REGION \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

ZORO_PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ZORO_ENI \
  --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo "Zoro public IP: $ZORO_PUBLIC_IP"
```

### Health checks

```bash
# Zoro should respond (public)
curl http://$ZORO_PUBLIC_IP:3000/health

# Sanji has no public IP — test it via Zoro's internal network only.
# If Zoro exposes a proxy/debug route you can use that, otherwise check Sanji's logs:
aws logs tail /ecs/sanji-genai --since 5m --region $AWS_REGION
```

✅ Zoro's health check should respond. Sanji's logs should show it started successfully.

---

## Step 11 — Add Zoro's URL to Vercel

Only Zoro's URL goes to Vercel. Sanji is internal — Nami never talks to it directly.

In your Vercel project → Settings → Environment Variables, add:

```
VITE_ZORO_URL=http://<ZORO_PUBLIC_IP>:3000
```

Then redeploy Nami on Vercel so it picks up the new variable.

---

## How to Redeploy After Code Changes

Every time you push changes to Zoro or Sanji, run this:

```bash
# Set variables again if in a new terminal session
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=ap-south-1
export ECR_BASE=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Re-authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_BASE

# For Sanji
docker build -f Dockerfile-Sanji -t sanji-genai ./genAI
docker tag sanji-genai:latest $ECR_BASE/sanji-genai:latest
docker push $ECR_BASE/sanji-genai:latest
aws ecs update-service --cluster strawhats --service sanji-genai \
  --force-new-deployment --region $AWS_REGION

# For Zoro
docker build -f Dockerfile-Zoro -t zoro-backend ./backend
docker tag zoro-backend:latest $ECR_BASE/zoro-backend:latest
docker push $ECR_BASE/zoro-backend:latest
aws ecs update-service --cluster strawhats --service zoro-backend \
  --force-new-deployment --region $AWS_REGION
```

> ⚠️ **After every redeploy, private IPs change.** Re-run Step 10 to get Sanji's new private IP, update Zoro's task definition with it, and redeploy Zoro again. Also re-run to get Zoro's new public IP and update Vercel.

---

## Viewing Logs

```bash
# Zoro logs (last 30 minutes)
aws logs tail /ecs/zoro-backend --since 30m --region $AWS_REGION

# Sanji logs
aws logs tail /ecs/sanji-genai --since 30m --region $AWS_REGION

# Follow logs in real time (like docker logs -f)
aws logs tail /ecs/zoro-backend --follow --region $AWS_REGION
```

---

## Estimated Monthly Cost

| Resource | Cost |
|---|---|
| Zoro — Fargate (256 CPU / 512MB, always on) | ~$3–4 |
| Sanji — Fargate (256 CPU / 512MB, always on) | ~$3–4 |
| ECR storage | ~$0.10 |
| CloudWatch Logs | ~$0.50 |
| SSM Parameter Store | Free tier |
| **Total** | **~$7–9/month** |

Your $200 AWS credits will last **well over a year** at this rate.

---

## Quick Reference — Step Order

| # | Step | One-time? |
|---|------|-----------|
| 1 | Create ECR repositories | ✅ One-time |
| 2 | Build & push images | 🔁 Every deploy |
| 3 | Create IAM role | ✅ One-time |
| 4 | Create ECS cluster | ✅ One-time |
| 5 | Create CloudWatch log groups | ✅ One-time |
| 6 | Store secrets in SSM | ✅ One-time (update if secrets change) |
| 7 | Create task definitions | ✅ One-time (update if config changes) |
| 8 | Networking / security groups | ✅ One-time |
| 9 | Create ECS services | ✅ One-time |
| 10 | Get IPs, wire Zoro → Sanji, health check | 🔁 Every deploy |
| 11 | Update Vercel env var (Zoro URL only) | 🔁 Every deploy |