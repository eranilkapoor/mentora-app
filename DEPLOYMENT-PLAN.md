
# Recommended AWS architecture For arround (**10K monthly users**)

| Need           | AWS Service                                   | Recommended start                         |
| -------------- | --------------------------------------------- | ----------------------------------------- |
| NestJS API     | **Elastic Beanstalk Docker / Node.js**        | 1–2 EC2 instances, `t3.small`/`t3.medium` |
| Load balancing | **Application Load Balancer**                 | Managed by Elastic Beanstalk              |
| MongoDB        | **MongoDB Atlas on AWS**                      | M10/M20, Mumbai/Singapore region          |
| Redis          | **ElastiCache Redis**                         | `cache.t4g.micro` or `cache.t4g.small`    |
| File uploads   | **S3**                                        | Profile images, documents, chat media     |
| CDN            | **CloudFront**                                | Serve S3 media faster                     |
| Email          | **Amazon SES**                                | OTP, verification, transactional email    |
| SMS            | **AWS End User Messaging / SNS SMS**          | OTP only, keep usage controlled           |
| Secrets        | **AWS Secrets Manager / SSM Parameter Store** | JWT, DB URI, Redis URI                    |
| Logs           | **CloudWatch Logs**                           | App logs + metrics                        |
| Domain/SSL     | **Route 53 + ACM**                            | `matchmate.webnza.com`                      |
| CI/CD          | **GitHub Actions**                            | Build + deploy API                        |

Elastic Beanstalk is a good fit because it provisions EC2, load balancing, health monitoring, and autoscaling for you. ([AWS Documentation][1]) SES is pay-as-you-go and currently charges around **$0.10 per 1,000 emails** for standard outbound email. ([Amazon Web Services, Inc.][2]) AWS SMS pricing depends on destination/carrier and AWS says SMS cost includes transport plus carrier fees, so keep SMS mostly for OTP and important alerts. ([Amazon Web Services, Inc.][3])

## Recommended starting plan

For your current stage:

```txt
API:
- Elastic Beanstalk
- Single instance first: t3.small
- Later: Load-balanced auto scaling with 2 × t3.small/t3.medium

MongoDB:
- MongoDB Atlas M10 or M20
- Avoid AWS DocumentDB initially unless you specifically need AWS-native DB

Redis:
- ElastiCache Redis cache.t4g.micro/small

Storage:
- S3 + CloudFront

Email:
- Amazon SES

SMS:
- AWS End User Messaging / SNS SMS

Region:
- ap-south-1 Mumbai if most users are in India
```

## Approx monthly cost estimate

Very rough starting range:

```txt
Elastic Beanstalk EC2:    $15–$70
Load Balancer:            $18–$25
Redis:                    $12–$35
MongoDB Atlas:            $60–$150
S3 + CloudFront:          $5–$30
CloudWatch:               $5–$20
SES email:                usually very low
SMS OTP:                  depends on OTP volume/country

Expected early total:     ~$120–$300/month
```

Use **email OTP first** and SMS only where necessary, because SMS costs vary by carrier/country. SES is much cheaper and predictable. ([Amazon Web Services, Inc.][2])

---

# Deployment process

## 1. Prepare NestJS app

Install production dependencies:

```bash
npm install compression helmet cookie-parser
npm install --save-dev @types/compression @types/cookie-parser
```

Your `main.ts` should listen on AWS port:

```ts
const port = Number(process.env.PORT) || 3000;

await app.listen(port, '0.0.0.0');
```

## 2. Add Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

## 3. Add `.dockerignore`

```txt
node_modules
dist
.git
.github
.env
npm-debug.log
coverage
```

## 4. Elastic Beanstalk option

Create:

```txt
Dockerrun.aws.json
```

```json
{
  "AWSEBDockerrunVersion": "1",
  "Ports": [
    {
      "ContainerPort": 3000
    }
  ]
}
```

## 5. Environment variables in Elastic Beanstalk

Set these from EB console:

```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://...
REDIS_HOST=...
REDIS_PORT=6379
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=...
AWS_SES_FROM_EMAIL=no-reply@yourdomain.com
```

Never commit `.env`.

---

# GitHub Actions deployment

Create:

```txt
.github/workflows/deploy-api.yml
```

```yaml
name: Deploy API to Elastic Beanstalk

on:
  push:
    branches:
      - main

env:
  AWS_REGION: ap-south-1
  EB_APPLICATION_NAME: matchmate-api
  EB_ENVIRONMENT_NAME: matchmate-api-prod
  DEPLOY_PACKAGE: api-${{ github.sha }}.zip

jobs:
  deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint --if-present

      - name: Run tests
        run: npm test --if-present

      - name: Build project
        run: npm run build

      - name: Create deployment package
        run: |
          zip -r $DEPLOY_PACKAGE . \
            -x "node_modules/*" \
            -x ".git/*" \
            -x ".github/*" \
            -x ".env" \
            -x "coverage/*"

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Upload package to S3
        run: |
          aws s3 cp $DEPLOY_PACKAGE s3://${{ secrets.EB_DEPLOY_BUCKET }}/$DEPLOY_PACKAGE

      - name: Create Elastic Beanstalk application version
        run: |
          aws elasticbeanstalk create-application-version \
            --application-name $EB_APPLICATION_NAME \
            --version-label ${{ github.sha }} \
            --source-bundle S3Bucket=${{ secrets.EB_DEPLOY_BUCKET }},S3Key=$DEPLOY_PACKAGE

      - name: Deploy to Elastic Beanstalk
        run: |
          aws elasticbeanstalk update-environment \
            --environment-name $EB_ENVIRONMENT_NAME \
            --version-label ${{ github.sha }}
```

## GitHub secrets required

```txt
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
EB_DEPLOY_BUCKET
```

---

# SES setup

1. Verify your domain in SES.
2. Add DKIM records in Route 53.
3. Move SES out of sandbox.
4. Use SES only for:

   * email verification
   * password reset
   * login alert
   * subscription/payment receipts
   * match alerts

SES is cheap, but protect IAM credentials carefully because stolen SES credentials are commonly abused for phishing; use least privilege IAM and avoid long-lived exposed keys. ([TechRadar][5])

Recommended IAM permission for app:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

---

# SMS setup

Use SMS only for:

```txt
OTP
critical security alerts
payment alerts
```

Avoid marketing SMS initially.

For India, also check DLT compliance before sending transactional/promotional SMS at scale.

---

# Production checklist

Before launch:

```txt
✅ Use HTTPS only
✅ Use ACM SSL certificate
✅ Put API behind ALB
✅ Use S3 pre-signed uploads
✅ Use CloudFront for media
✅ Store secrets in SSM/Secrets Manager
✅ Enable CloudWatch logs
✅ Enable EB health checks
✅ Enable MongoDB Atlas IP allowlist/VPC peering later
✅ Enable Redis AUTH/TLS if available
✅ Add rate limiting for login/OTP APIs
✅ Add backup policy for MongoDB
✅ Add WAF later when traffic grows
```

Best first deployment: **Elastic Beanstalk + MongoDB Atlas + ElastiCache Redis + S3 + CloudFront + SES + SNS/End User Messaging**.

## Cheapest practical launch setup

```txt
Backend API:     1 EC2 instance
Database:        MongoDB Atlas Free/Flex/M2/M5
Redis:           Skip for now
Sockets:         Local in-memory socket map
Images:          Prefer S3, but local is possible only for very early testing
Email:           Your Hostinger SMTP
SMS:             Skip initially or use only paid OTP vendor when needed
Deployment:      GitHub Actions → EC2 SSH deploy
```

## My recommended low-cost AWS services

| Purpose       | Use now                                               | Skip now                     |
| ------------- | ----------------------------------------------------- | ---------------------------- |
| API hosting   | EC2 `t3.micro`, `t4g.micro`, `t3.small`, or Lightsail | ECS, EKS                     |
| Database      | MongoDB Atlas free/Flex/M2/M5                         | DocumentDB                   |
| Cache         | In-memory cache                                       | ElastiCache Redis            |
| Socket users  | Local memory map                                      | Redis adapter                |
| Images        | S3 if possible                                        | Local only for temporary MVP |
| Email         | Hostinger SMTP                                        | SES initially                |
| SMS           | Only OTP vendor if required                           | Marketing SMS                |
| CDN           | Skip                                                  | CloudFront                   |
| Load balancer | Skip                                                  | ALB                          |

## EC2 vs Lightsail

For lowest mental overhead, use **AWS Lightsail** first.

### Option A: Cheapest/simple

```txt
AWS Lightsail
2 GB RAM instance
Ubuntu
PM2 + Nginx + SSL
MongoDB Atlas
S3 optional
```

### Option B: More AWS-standard

```txt
EC2 t3.micro / t3.small
Ubuntu
PM2 + Nginx + SSL
MongoDB Atlas
S3 optional
```

---

# Hostinger email vs SES

You can use Hostinger SMTP initially.

```env
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=no-reply@yourdomain.com
MAIL_PASS=your_password
MAIL_FROM=no-reply@yourdomain.com
```

Later switch to SES when:

```txt
emails go to spam
you need better deliverability
you send many notifications
you need bounce/complaint tracking
```

SES remains very cheap for large transactional email; AWS lists standard outbound email pricing at about $0.10 per 1,000 emails in many regions. ([Amazon Web Services, Inc.][3])

---

# Minimum-cost architecture I recommend

```txt
Frontend mobile app:
- Expo / Play Store / App Store

Backend:
- Single EC2 or Lightsail Ubuntu server
- Nginx reverse proxy
- PM2 process manager
- NestJS app
- Local Socket.IO memory store
- Local cache where needed

Database:
- MongoDB Atlas M0/M2/M5
- Start M0 only for testing
- Use M2/M5 for real launch

Files:
- S3 bucket for profile images
- No CloudFront initially

Email:
- Hostinger SMTP

SMS:
- Skip unless mandatory
```

## Estimated monthly cost

```txt
EC2/Lightsail:        $5–$20
MongoDB Atlas:        $0–$25 initially
S3:                   $1–$5 initially
Email Hostinger:      already included
Redis:                $0
CloudFront:           $0
Load Balancer:        $0

Total early cost:     ~$10–$50/month
```

This is the best lean setup.

---

# Deployment method: GitHub Actions to EC2

## Server setup

Install Node, PM2, Nginx:

```bash
sudo apt update
sudo apt install -y nginx git curl unzip

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2
```

Create app folder:

```bash
sudo mkdir -p /var/www/matchmate-api
sudo chown -R ubuntu:ubuntu /var/www/matchmate-api
```

Create uploads folder if using local uploads:

```bash
sudo mkdir -p /var/www/matchmate/uploads
sudo chown -R ubuntu:ubuntu /var/www/matchmate/uploads
```

---

# PM2 ecosystem file

Create `ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: 'matchmate-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

Use `fork`, not cluster, if you are storing sockets locally. Cluster mode creates multiple processes and breaks local socket maps.

---

# Nginx config with WebSocket support

```nginx
server {
    listen 80;
    server_name matchmate.webnza.com;

    client_max_body_size 20M;

    location /uploads/ {
        alias /var/www/matchmate/uploads/;
        access_log off;
        expires 30d;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/matchmate-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Add SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d matchmate.webnza.com
```

---

# GitHub Actions deploy to EC2

Create:

```txt
.github/workflows/deploy-api.yml
```

```yaml
name: Deploy API to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy NestJS API
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Create deployment archive
        run: |
          tar \
            --exclude='.git' \
            --exclude='.github' \
            --exclude='node_modules' \
            --exclude='.env' \
            -czf app.tar.gz .

      - name: Upload to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: app.tar.gz
          target: /var/www/matchmate-api

      - name: Deploy on server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/matchmate-api

            tar -xzf app.tar.gz
            rm app.tar.gz

            npm ci --omit=dev

            pm2 startOrReload ecosystem.config.js --env production
            pm2 save
```

GitHub secrets:

```txt
EC2_HOST
EC2_USER
EC2_SSH_KEY
```

---

# Cost-saving checklist

Do this now:

```txt
✅ Use one EC2/Lightsail server
✅ Use PM2 fork mode
✅ Skip Redis
✅ Skip ALB
✅ Skip CloudFront initially
✅ Use Hostinger SMTP
✅ Use MongoDB Atlas free/shared initially
✅ Use S3 for images if possible
✅ Keep image max size low
✅ Compress images before upload
✅ Store thumbnails
✅ Add AWS budget alert
✅ Use one AWS region
✅ Avoid NAT Gateway
✅ Avoid DocumentDB
✅ Avoid ECS/EKS initially
```

Avoid these now:

```txt
❌ Load Balancer
❌ Multi-AZ Redis
❌ CloudFront
❌ ECS Fargate
❌ EKS
❌ DocumentDB
❌ NAT Gateway
❌ OpenSearch
❌ Paid SMS marketing
```

---

# Final recommendation

For your current launch:

```txt
Use:
- 1 EC2 or Lightsail instance
- MongoDB Atlas M2/M5 or free for testing
- S3 for images
- Hostinger SMTP
- Local sockets
- PM2 + Nginx
- GitHub Actions SSH deploy

Skip:
- Redis
- Load balancer
- CloudFront
- SES
- ECS
- Kubernetes
```

---

# Deployment Setup of the Project

---

## 1. AWS EC2 setup

Create EC2:

```txt
AMI: Ubuntu 22.04 or 24.04 LTS
Instance: t3.micro / t3.small
Storage: 20–30 GB gp3
Region: closest to users, ap-south-1 if India
```

Security Group inbound:

```txt
22    SSH      Your IP only
80    HTTP     0.0.0.0/0
443   HTTPS    0.0.0.0/0
```

AWS security groups work like a virtual firewall for EC2; AWS recommends restricting SSH to your own IP instead of opening it publicly. ([AWS Documentation][1])

Allocate **Elastic IP** and attach it to EC2.

---

## 2. Cloudflare DNS

In Cloudflare DNS add:

```txt
Type: A
Name: api
Value: YOUR_EC2_ELASTIC_IP
Proxy: DNS only initially
```

So your API becomes:

```txt
https://matchmate.webnza.com
```

Initially keep Cloudflare proxy **DNS only** until SSL + API are working. Later you can turn orange cloud on.

---

## 3. Server initial setup

SSH:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

Install dependencies:

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y nginx git curl unzip build-essential

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2
```

PM2 is a production process manager for Node.js that keeps your app running continuously. ([PM2][2])

Create folders:

```bash
sudo mkdir -p /var/www/matchmate-api
sudo chown -R ubuntu:ubuntu /var/www/matchmate-api
```

---

## 4. NestJS production changes

In `main.ts`, make sure:

```ts
const port = Number(process.env.PORT) || 3000;

await app.listen(port, '0.0.0.0');
```

Because Nginx will proxy to:

```txt
127.0.0.1:3000
```

Use this for CORS:

```ts
app.enableCors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:8081',
    'http://localhost:3000',
  ],
  credentials: true,
});
```

For sockets, keep **single PM2 instance only**:

```txt
instances: 1
exec_mode: fork
```

Do not use PM2 cluster mode while sockets are local.

---

## 5. Environment variables

Create production env file on server:

```bash
nano /var/www/matchmate-api/.env
```

Example:

```env
NODE_ENV=production
PORT=3000

APP_URL=https://matchmate.webnza.com
WEB_URL=https://yourdomain.com

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/matchmate

JWT_ACCESS_SECRET=change_this
JWT_REFRESH_SECRET=change_this
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

COOKIE_DOMAIN=.yourdomain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@yourdomain.com
SMTP_PASS=your_hostinger_email_password
SMTP_FROM=no-reply@yourdomain.com

AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

UPLOAD_DRIVER=s3
```

Generate secrets:

```bash
openssl rand -base64 64
```

---

## 6. MongoDB Atlas setup

In MongoDB Atlas:

```txt
Create cluster
Create DB user
Network Access:
  Add EC2 Elastic IP
```

Do not use `0.0.0.0/0` permanently. Use it only temporarily for testing.

---

## 7. S3 setup

Create S3 bucket:

```txt
your-app-prod-media
Region: ap-south-1
Block public access: ON
```

Recommended approach:

```txt
Private bucket
Backend uploads to S3
Return signed/private URLs or public CDN later
```

S3 presigned URLs allow temporary access to private objects without making the bucket public. ([AWS Documentation][3])

IAM user policy for S3:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-app-prod-media/*"
    }
  ]
}
```

---

## 8. PM2 ecosystem file

Add this to your project root:

```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'matchmate-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

Again: `instances: 1` is important because you are using local sockets.

---

## 9. Nginx config with socket support

Create:

```bash
sudo nano /etc/nginx/sites-available/matchmate-api
```

Paste:

```nginx
server {
    listen 80;
    server_name matchmate.webnza.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

Nginx needs the `Upgrade` and `Connection` headers to proxy WebSocket connections correctly. ([nginx.org][4])

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/matchmate-api /etc/nginx/sites-enabled/matchmate-api
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. SSL on EC2

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Run:

```bash
sudo certbot --nginx -d matchmate.webnza.com
```

After success:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If you use Cloudflare orange cloud later, set Cloudflare SSL mode to:

```txt
Full strict
```

---

## 11. Manual first deployment

On local or server:

```bash
cd /var/www/matchmate-api
git clone YOUR_REPO_URL .
npm ci
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

Then check:

```bash
pm2 status
pm2 logs matchmate-api
curl http://127.0.0.1:3000/health
curl https://matchmate.webnza.com/health
```

---

## 12. GitHub Actions deployment

Create:

```txt
.github/workflows/deploy-api.yml
```

```yaml
name: Deploy API to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy NestJS API
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build API
        run: npm run build

      - name: Create deploy archive
        run: |
          tar \
            --exclude='.git' \
            --exclude='.github' \
            --exclude='node_modules' \
            --exclude='.env' \
            -czf api.tar.gz .

      - name: Upload archive to EC2
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: api.tar.gz
          target: /var/www/matchmate-api

      - name: Deploy on EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e

            cd /var/www/matchmate-api

            tar -xzf api.tar.gz
            rm api.tar.gz

            npm ci --omit=dev

            npm run build

            pm2 startOrReload ecosystem.config.js --env production
            pm2 save

            pm2 status
```

GitHub secrets:

```txt
EC2_HOST=your elastic ip or api domain
EC2_USER=ubuntu
EC2_SSH_KEY=private ssh key content
```

---

## 13. Recommended backend health endpoint

Add:

```ts
@Get('health')
health() {
  return {
    success: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}
```

Then test:

```bash
curl https://matchmate.webnza.com/health
```

---

## 14. Cloudflare settings

Recommended initially:

```txt
DNS:
  api A record -> Elastic IP

SSL/TLS:
  Full strict after Certbot SSL works

Proxy:
  DNS only while testing
  Proxied later if needed

Caching:
  Do not cache API routes

WebSockets:
  Cloudflare supports WebSockets, but keep proxy off first while debugging
```

---

## 15. What not to do now

Avoid:

```txt
Redis
Load balancer
CloudFront
ECS
Kubernetes
DocumentDB
NAT Gateway
PM2 cluster mode
Local image storage
Opening SSH to 0.0.0.0/0
Public S3 bucket
```

---

## Final launch checklist

```txt
✅ EC2 created
✅ Elastic IP attached
✅ Security group ports 22, 80, 443 configured
✅ Cloudflare A record api -> Elastic IP
✅ MongoDB Atlas allows EC2 IP
✅ S3 bucket private
✅ IAM S3 user created
✅ Nginx reverse proxy configured
✅ WebSocket proxy headers added
✅ Certbot SSL installed
✅ .env added on server
✅ PM2 ecosystem configured
✅ GitHub Actions deploy configured
✅ /health endpoint working
✅ Mobile app API URL updated to https://matchmate.webnza.com
```
