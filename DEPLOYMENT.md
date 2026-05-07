# Deployment Guide for Bola Na

Complete guide to deploy Bola Na to Vercel, with production-ready configurations.

## Prerequisites

- GitHub account with your repository
- Vercel account (free)
- Supabase project created and configured
- All environment variables ready

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Bola Na chat application"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/bola-na.git

# Create main branch and push
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub
3. Click **Add New...** → **Project**
4. Select **Import Git Repository**
5. Authorize Vercel to access your GitHub account
6. Select your `bola-na` repository
7. Click **Import**

### Step 3: Configure Build Settings

Vercel should auto-detect Next.js. Configure as follows:

- **Framework Preset**: Next.js ✓
- **Build Command**: `npm run build` ✓
- **Output Directory**: `.next` ✓
- **Install Command**: `npm install` ✓

Click **Deploy**

### Step 4: Add Environment Variables

1. After deployment, go to **Project Settings**
2. Click **Environment Variables**
3. Add each variable from your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Important**: 
- Variables starting with `NEXT_PUBLIC_` are available in browser (client-side)
- Other variables are only available server-side
- Don't include these in `.env` after deployment

### Step 5: Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **Redeploy**
4. Vercel will now use your environment variables

### Step 6: Update Supabase Settings

1. Go to Supabase dashboard
2. Settings → API → CORS
3. Add your Vercel URL to allowed origins:
```json
[
  {
    "origin": "https://your-app.vercel.app",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 86400
  }
]
```

### Step 7: Verify Deployment

1. Visit your Vercel URL
2. Test login functionality
3. Check console for errors
4. Send a test message

## Option 2: Deploy to Railway

### Prerequisites
- Railway account
- GitHub repository connected

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Authorize and select your repository

### Step 2: Add Service

1. Click **Add Service**
2. Select **Postgres** (for database if needed)
3. Railway will provision PostgreSQL

### Step 3: Configure Environment

1. Go to project settings
2. Click **Variables**
3. Add all environment variables from `.env.local`

### Step 4: Deploy

1. Railway auto-detects Next.js
2. Automatically builds and deploys
3. Monitor deployment in **Deployments** tab

### Step 5: Get URL

- Railway provides a URL: `https://your-app.railway.app`
- Update `NEXT_PUBLIC_APP_URL` if needed

## Option 3: Deploy to Self-Hosted Server

### Prerequisites
- VPS/Server (AWS EC2, DigitalOcean, Linode, etc.)
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy

### Step 1: Server Setup

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Clone Repository

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/bola-na.git
cd bola-na

# Install dependencies
npm install
```

### Step 3: Create Environment File

```bash
nano .env.local
```

Add all environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Step 4: Build Application

```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### Step 5: Configure PM2

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'bola-na',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
    },
  ],
}
```

Start PM2:
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Create startup script
pm2 startup

# Monitor
pm2 monit
```

### Step 6: Configure Nginx

Create `/etc/nginx/sites-available/bola-na`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static {
        proxy_cache_valid 30d;
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/bola-na /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Setup auto-renewal
sudo systemctl enable certbot.timer
```

## Option 4: Deploy with Docker

### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### Create Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Deploy:
```bash
docker-compose up -d
```

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled and working
- [ ] Security headers configured
- [ ] Environment variables not exposed
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### Performance
- [ ] Database optimized
- [ ] CDN enabled (Vercel does this automatically)
- [ ] Images optimized
- [ ] Caching headers set

### Monitoring
- [ ] Error logging enabled
- [ ] Performance monitoring set up
- [ ] Uptime monitoring configured
- [ ] Backup system in place

### Maintenance
- [ ] Database backups automated
- [ ] Updates scheduled
- [ ] Log rotation configured
- [ ] Documentation updated

## Useful Commands

### View Logs

**Vercel:**
- Automatic in dashboard

**PM2:**
```bash
pm2 logs bola-na
pm2 logs bola-na --err
```

**Docker:**
```bash
docker logs container_name -f
docker logs container_name --tail 100
```

### Update Application

**Vercel:**
- Auto-deploys on push to main

**Self-hosted:**
```bash
cd /path/to/bola-na
git pull origin main
npm install
npm run build
pm2 restart bola-na
```

### Scaling

**Vercel:**
- Automatic scaling

**Self-hosted:**
```bash
# Increase instances in ecosystem.config.js
pm2 restart bola-na
```

## Troubleshooting Deployment

### Issue: Build fails
```bash
# Check build logs
npm run build

# Clear cache
npm cache clean --force
rm -rf .next
npm install
npm run build
```

### Issue: Slow performance
```bash
# Check database queries
# Use Supabase monitoring

# Check bundle size
npm run build
# Look at .next/static
```

### Issue: Out of memory
```bash
# Increase memory limit
pm2 restart bola-na
# Or upgrade server
```

## Cost Estimates

### Vercel
- Hobby plan: Free ($0)
- Pro plan: $20/month
- Enterprise: Custom pricing

### Supabase
- Free tier: 500MB storage, some features limited
- Pro plan: $25/month per project
- Enterprise: Custom pricing

### Self-hosted VPS
- DigitalOcean: $5-40/month
- AWS: Variable, typically $10-50/month
- Linode: $5-30/month

---

**Your Bola Na application is now live and ready for users!**
