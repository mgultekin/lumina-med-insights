# Deployment Guide

This guide covers different deployment options for the Lumina Medical AI Platform.

## Overview

The Lumina platform is a React-based single-page application that can be deployed to various hosting platforms. The backend is powered by Supabase, which handles the database, authentication, and serverless functions.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project
- Domain name (for production)

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file for production deployment:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### Supabase Edge Functions Environment

Configure these in your Supabase project settings:

```env
GENERATE_ARTICLE_WEBHOOK_URL=https://your-ai-service.com/generate-article
GENERATE_REPORT_WEBHOOK_URL=https://your-ai-service.com/generate-report
PUBLISH_ARTICLE_WEBHOOK_URL=https://your-ai-service.com/publish-article
WEBHOOK_AUTH_TOKEN=your_webhook_auth_token
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the best developer experience with automatic deployments from GitHub.

#### Setup

1. **Connect GitHub Repository**
   ```bash
   # Push your code to GitHub
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   ```bash
   # In Vercel dashboard, go to Settings > Environment Variables
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Custom domain can be configured in Settings > Domains

#### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 2. Netlify

Netlify offers similar features to Vercel with great CI/CD integration.

#### Setup

1. **Build Configuration**
   
   Create `netlify.toml`:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
   ```

2. **Deploy**
   - Connect GitHub repository in Netlify dashboard
   - Configure environment variables
   - Deploy automatically on push

### 3. AWS S3 + CloudFront

For enterprise deployments with full AWS integration.

#### Setup

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://lumina-medical-app
   aws s3 website s3://lumina-medical-app --index-document index.html
   ```

2. **Build and Upload**
   ```bash
   npm run build
   aws s3 sync dist/ s3://lumina-medical-app --delete
   ```

3. **CloudFront Distribution**
   - Create CloudFront distribution pointing to S3 bucket
   - Configure custom error pages for SPA routing
   - Add SSL certificate

4. **Deployment Script**
   ```bash
   #!/bin/bash
   npm run build
   aws s3 sync dist/ s3://lumina-medical-app --delete
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

### 4. Docker Deployment

For containerized deployments on any platform.

#### Build Docker Image

```bash
# Build the image
docker build -t lumina-medical-ai .

# Run locally
docker run -p 80:80 lumina-medical-ai
```

#### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

#### Deploy to Container Registry

```bash
# Tag for registry
docker tag lumina-medical-ai your-registry.com/lumina-medical-ai:latest

# Push to registry
docker push your-registry.com/lumina-medical-ai:latest
```

### 5. GitHub Pages

For simple static hosting (development/demo purposes).

#### Setup

1. **Build for GitHub Pages**
   ```bash
   npm run build
   ```

2. **Deploy with GitHub Actions**
   
   Create `.github/workflows/deploy-pages.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install and Build
           run: |
             npm ci
             npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

## Supabase Configuration

### Database Setup

1. **Run Migrations**
   ```bash
   npx supabase db push
   ```

2. **Set up Row Level Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view own analyses" ON analyses
     FOR SELECT USING (auth.uid() = user_id);
   ```

3. **Configure Storage Buckets**
   ```sql
   -- Create storage bucket for medical images
   INSERT INTO storage.buckets (id, name, public) VALUES ('medical-images', 'medical-images', false);
   
   -- Set up storage policies
   CREATE POLICY "Users can upload own images" ON storage.objects
     FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Edge Functions Deployment

```bash
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy analyze-medical-image
```

## Domain and SSL Configuration

### Custom Domain Setup

1. **Vercel/Netlify**
   - Add domain in dashboard
   - Configure DNS records
   - SSL certificates are automatically provisioned

2. **CloudFront**
   - Request SSL certificate in AWS Certificate Manager
   - Configure alternate domain names in CloudFront
   - Update DNS to point to CloudFront distribution

3. **DNS Configuration**
   ```
   # For root domain
   A record: @ -> your-deployment-ip

   # For www subdomain
   CNAME record: www -> your-deployment-domain.com
   ```

## Performance Optimization

### Build Optimization

```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets
```

### CDN Configuration

1. **Static Assets**
   - Configure long cache headers for assets with hashes
   - Use CDN for image optimization
   - Enable Brotli/Gzip compression

2. **Image Optimization**
   ```javascript
   // Implement responsive images
   const ImageOptimized = ({ src, alt, ...props }) => (
     <img 
       src={src}
       srcSet={`${src}?w=400 400w, ${src}?w=800 800w, ${src}?w=1200 1200w`}
       sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
       alt={alt}
       loading="lazy"
       {...props}
     />
   );
   ```

## Monitoring and Analytics

### Error Monitoring

1. **Sentry Integration**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

   ```javascript
   // src/main.tsx
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: import.meta.env.VITE_APP_ENV,
   });
   ```

2. **Performance Monitoring**
   ```javascript
   // Monitor Core Web Vitals
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

### Health Checks

Create health check endpoints:

```javascript
// Health check API endpoint
export const healthCheck = async () => {
  const checks = {
    database: await checkDatabase(),
    storage: await checkStorage(),
    ai_services: await checkAIServices(),
  };
  
  return {
    status: Object.values(checks).every(check => check.healthy) ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
};
```

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co;">
```

### Security Headers

```javascript
// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

## Backup and Disaster Recovery

### Database Backups

```bash
# Automated daily backups with Supabase
# Configured in Supabase dashboard

# Manual backup
npx supabase db dump --file backup-$(date +%Y%m%d).sql
```

### Deployment Rollback

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Manual rollback
git revert <commit-hash>
git push origin main
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify variables are set
   echo $VITE_SUPABASE_URL
   
   # Check build output for variable substitution
   npm run build -- --debug
   ```

3. **Routing Issues (404 on Refresh)**
   - Ensure SPA routing is configured
   - Add catch-all redirect to index.html

4. **CORS Issues**
   - Verify Supabase URL configuration
   - Check allowed origins in Supabase dashboard

### Performance Issues

1. **Slow Load Times**
   ```bash
   # Analyze bundle size
   npm run build -- --analyze
   
   # Check for large dependencies
   npm ls --depth=0 --long
   ```

2. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

For additional support, see the [Contributing Guide](../CONTRIBUTING.md) or create an issue in the GitHub repository.