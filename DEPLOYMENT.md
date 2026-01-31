# Deployment Guide

This guide covers deploying the Voice AI & SMS Booking Management Platform to various hosting providers.

## Prerequisites

Before deploying, ensure you have:

- ✅ Completed local development and testing
- ✅ Set up Supabase database with all tables
- ✅ Configured environment variables
- ✅ Run `npm run build` successfully
- ✅ Tested all features locally

## Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_account_sid
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

## Vercel Deployment (Recommended)

Vercel is the recommended platform as it's built by the Next.js team.

### Step 1: Prepare Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure `.gitignore` includes:
   ```
   .env.local
   .env*.local
   .next/
   node_modules/
   ```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables

1. In project settings, go to "Environment Variables"
2. Add all required variables
3. Set for Production, Preview, and Development

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployment URL

### Step 5: Custom Domain (Optional)

1. Go to project settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Netlify Deployment

### Step 1: Build Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Step 2: Deploy

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables
6. Click "Deploy site"

### Netlify CLI Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

## AWS Amplify Deployment

### Step 1: Create Amplify App

1. Go to AWS Amplify Console
2. Click "New app" > "Host web app"
3. Connect your Git repository
4. Amplify auto-detects Next.js

### Step 2: Build Settings

Amplify will auto-generate build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 3: Environment Variables

1. Go to App settings > Environment variables
2. Add all required variables
3. Save and redeploy

## Railway Deployment

### Step 1: Create Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"

### Step 2: Configure

1. Railway auto-detects Next.js
2. Add environment variables in Variables tab
3. Deploy automatically starts

### Step 3: Custom Domain

1. Go to Settings > Domains
2. Add custom domain
3. Configure DNS

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

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
      - NEXT_PUBLIC_VAPI_API_KEY=${NEXT_PUBLIC_VAPI_API_KEY}
      - NEXT_PUBLIC_TWILIO_ACCOUNT_SID=${NEXT_PUBLIC_TWILIO_ACCOUNT_SID}
      - NEXT_PUBLIC_TWILIO_AUTH_TOKEN=${NEXT_PUBLIC_TWILIO_AUTH_TOKEN}
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t voice-ai-dashboard .

# Run container
docker run -p 3000:3000 --env-file .env.local voice-ai-dashboard

# Or use docker-compose
docker-compose up -d
```

## Self-Hosted (VPS/Dedicated Server)

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- Nginx
- PM2 (process manager)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Deploy Application

```bash
# Clone repository
git clone <your-repo-url> /var/www/voice-ai-dashboard
cd /var/www/voice-ai-dashboard

# Install dependencies
npm ci

# Create .env.local with your variables
nano .env.local

# Build application
npm run build

# Start with PM2
pm2 start npm --name "voice-ai-dashboard" -- start
pm2 save
pm2 startup
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/voice-ai-dashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/voice-ai-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Check database connections
- [ ] Verify API integrations (VAPI, Twilio)
- [ ] Test all CRUD operations
- [ ] Check error handling
- [ ] Verify environment variables
- [ ] Test on mobile devices
- [ ] Set up monitoring (optional)
- [ ] Configure backups (Supabase)
- [ ] Set up analytics (optional)

## Monitoring & Maintenance

### Vercel Analytics

Enable in project settings for:
- Page views
- Performance metrics
- Error tracking

### Custom Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user analytics

### Database Backups

Supabase provides automatic backups:
- Daily backups (retained for 7 days on free tier)
- Point-in-time recovery (paid plans)

### Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Restart (if using PM2)
pm2 restart voice-ai-dashboard

# Or redeploy on platform
vercel --prod
```

## Troubleshooting

### Build Failures

1. Check Node.js version (18+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check environment variables
4. Review build logs

### Runtime Errors

1. Check browser console
2. Review server logs
3. Verify database connection
4. Check API keys and credentials

### Performance Issues

1. Enable Next.js caching
2. Optimize images
3. Use CDN for static assets
4. Enable compression in Nginx

## Security Best Practices

- ✅ Use HTTPS only
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets
- ✅ Enable Supabase RLS policies
- ✅ Implement rate limiting
- ✅ Regular security audits
- ✅ Monitor for suspicious activity

## Support

For deployment issues:
- Check platform documentation
- Review error logs
- Contact platform support
- Create GitHub issue
