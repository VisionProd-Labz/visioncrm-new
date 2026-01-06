# VisionCRM Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be in a Git repository
3. **Supabase Database** - Already configured in `.env`
4. **Third-party Services** - API keys for:
   - Stripe (payments)
   - Resend (emails)
   - Gemini AI (optional)
   - Upstash Redis (optional, for rate limiting)

## Environment Variables

Your `.env` file is already configured with the following required variables:

### Required Variables
- `DATABASE_URL` - PostgreSQL connection (Supabase)
- `NEXTAUTH_URL` - Your production URL (e.g., https://visioncrm.app)
- `NEXTAUTH_SECRET` - Auth encryption secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `RESEND_API_KEY` - Resend email API key

### Optional Variables
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GEMINI_API_KEY` - AI features
- `UPSTASH_REDIS_REST_URL` - Rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Rate limiting
- `SENTRY_DSN` - Error tracking

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add all required variables from your `.env` file:
     - `DATABASE_URL`
     - `NEXTAUTH_URL` (use your Vercel domain)
     - `NEXTAUTH_SECRET`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `RESEND_API_KEY`
     - `RESEND_FROM_EMAIL`
     - `GEMINI_API_KEY` (optional)
     - Add any other optional variables

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   # Add all other required variables
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Setup

### 1. Update NEXTAUTH_URL

In Vercel environment variables, update:
```
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

### 2. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### 3. Run Database Migrations

```bash
# Connect to your production database
pnpm prisma migrate deploy
```

### 4. Seed Initial Data (Optional)

```bash
# Run seed script against production database
pnpm prisma:seed
```

### 5. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to use custom domain

### 6. Configure Resend Email Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add and verify your domain
3. Update `RESEND_FROM_EMAIL` with your verified domain

## Environment-Specific Configuration

### Development
```env
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Production
```env
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

## Monitoring

### Enable Vercel Analytics
The app already includes `@vercel/analytics`. It will automatically work in production.

### Enable Sentry (Optional)
1. Create a Sentry project
2. Add Sentry environment variables to Vercel
3. Redeploy

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify database connection string

### Database Connection Issues
- Ensure `DATABASE_URL` uses the pooler connection
- Check Supabase connection limits
- Verify IP allowlist settings

### Authentication Issues
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Ensure OAuth redirect URIs are configured

### Stripe Webhook Issues
- Verify webhook URL is correct
- Check webhook signing secret matches
- Review Stripe webhook logs

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run build checks before deployment

## Security Checklist

- [ ] All environment variables are stored in Vercel (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] Database uses SSL connections
- [ ] Stripe webhook secret is configured
- [ ] OAuth redirect URIs are whitelisted
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (Redis)

## Performance Optimization

- [ ] Enable Vercel Edge Network
- [ ] Configure ISR for static pages
- [ ] Set up Redis caching (Upstash)
- [ ] Enable image optimization
- [ ] Configure CDN for static assets

## Backup Strategy

1. **Database Backups** - Supabase provides automatic backups
2. **Code Backups** - GitHub serves as version control
3. **Environment Variables** - Document in secure location

## Support

For deployment issues, contact:
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Documentation: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**Last Updated:** 2026-01-06
