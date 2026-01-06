# Stripe Webhooks Setup Guide

Complete guide for setting up and testing Stripe webhooks in VisionCRM.

## Overview

The Stripe webhook endpoint handles subscription and payment events automatically, updating tenant plans and subscription status in real-time.

## Webhook Endpoint

**URL:** `POST /api/webhooks/stripe`

**Location:** `app/api/webhooks/stripe/route.ts`

## Events Handled

### 1. checkout.session.completed
- **Trigger:** Customer completes checkout
- **Action:** Updates tenant with Stripe customer ID
- **Use case:** Initial subscription setup

### 2. customer.subscription.created
- **Trigger:** New subscription created
- **Action:** Updates tenant plan (STARTER, PRO, or ENTERPRISE)
- **Use case:** User upgrades from FREE plan

### 3. customer.subscription.updated
- **Trigger:** Subscription changes (upgrade, downgrade, renewal)
- **Action:** Updates tenant plan based on new subscription
- **Special cases:**
  - `cancel_at_period_end`: Subscription scheduled for cancellation
  - `status: canceled/unpaid`: Downgrades to FREE plan

### 4. customer.subscription.deleted
- **Trigger:** Subscription permanently deleted
- **Action:** Downgrades tenant to FREE plan, clears subscription ID
- **Use case:** User cancels subscription or payment fails multiple times

### 5. invoice.payment_succeeded
- **Trigger:** Payment successful
- **Action:** Logs success (subscription events handle plan updates)
- **Use case:** Monthly/annual billing success

### 6. invoice.payment_failed
- **Trigger:** Payment fails
- **Action:** Logs failure and warnings
- **Note:** Stripe retries automatically, subscription.updated handles final failures

## Setup for Local Development

### 1. Install Stripe CLI

**Windows:**
```powershell
# Using Scoop
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download latest release
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### 2. Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate with your Stripe account.

### 3. Forward Webhooks to Local Server

Start your Next.js dev server:
```bash
pnpm dev
```

In a separate terminal, forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Important:** Copy this webhook signing secret and update your `.env` file:
```env
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

Then restart your dev server for the new secret to take effect.

## Testing Webhooks

### Test Checkout Session

```bash
stripe trigger checkout.session.completed
```

This simulates a successful checkout. You should see:
- Tenant updated with `stripe_customer_id`
- Logs in your Next.js console

### Test Subscription Creation

```bash
stripe trigger customer.subscription.created
```

Expected behavior:
- Tenant `plan` updated (STARTER, PRO, or ENTERPRISE)
- `stripe_subscription_id` saved
- Logs showing plan upgrade

### Test Subscription Update

```bash
stripe trigger customer.subscription.updated
```

Expected behavior:
- Tenant plan updated if price changed
- Handles cancellation scheduling

### Test Subscription Deletion

```bash
stripe trigger customer.subscription.deleted
```

Expected behavior:
- Tenant downgraded to FREE plan
- `stripe_subscription_id` cleared
- Logs showing downgrade

### Test Payment Success

```bash
stripe trigger invoice.payment_succeeded
```

### Test Payment Failure

```bash
stripe trigger invoice.payment_failed
```

## Manual Testing with Real Events

### 1. Create Test Products and Prices

Go to: https://dashboard.stripe.com/test/products

Create 3 products:
- **VisionCRM Starter** - Monthly subscription
- **VisionCRM Pro** - Monthly subscription
- **VisionCRM Enterprise** - Monthly subscription

Copy the price IDs and update your `.env`:
```env
NEXT_PUBLIC_STRIPE_PRICE_STARTER="price_xxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO="price_xxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE="price_xxxxxxxxxxxxx"
```

### 2. Create Test Checkout Session

Use the Stripe Dashboard or create programmatically:

```typescript
// Example: app/api/stripe/create-checkout/route.ts
import { stripe } from '@/lib/stripe';
import { getCurrentTenantId } from '@/lib/tenant';

export async function POST(req: Request) {
  const tenantId = await getCurrentTenantId();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    client_reference_id: tenantId,
    metadata: {
      tenant_id: tenantId,
    },
  });

  return Response.json({ url: session.url });
}
```

### 3. Complete Checkout with Test Card

Use Stripe test cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0027 6000 3184`

**Card details:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

## Production Setup

### 1. Configure Webhook Endpoint in Stripe Dashboard

Go to: https://dashboard.stripe.com/webhooks

Click **"Add endpoint"**:
- **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`
- **Description:** VisionCRM Subscription Webhooks
- **Events to send:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 2. Get Signing Secret

After creating the endpoint, Stripe will show the **Signing secret** (starts with `whsec_`).

Add this to your production environment variables:
```env
STRIPE_WEBHOOK_SECRET="whsec_production_secret_here"
```

### 3. Test Production Endpoint

In the Stripe Dashboard webhook page:
1. Click on your webhook endpoint
2. Click **"Send test webhook"**
3. Select an event type
4. Click **"Send test webhook"**

Check your application logs to verify the webhook was received and processed.

## Monitoring and Debugging

### View Webhook Logs in Stripe

https://dashboard.stripe.com/webhooks/[webhook_id]/logs

Shows:
- Request attempts
- Response status codes
- Response body
- Retry attempts

### Common Issues

#### 1. Signature Verification Failed
**Problem:** `Webhook signature verification failed`

**Solutions:**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure you're using the raw request body (not parsed JSON)
- Check that the secret matches your environment (test vs production)

#### 2. No Tenant Found
**Problem:** `No tenant found for customer: cus_xxxxx`

**Solutions:**
- Ensure checkout session includes `client_reference_id` or `metadata.tenant_id`
- Verify tenant's `stripe_customer_id` is saved correctly

#### 3. Plan Not Updating
**Problem:** Subscription created but plan stays FREE

**Solutions:**
- Check price IDs in `.env` match your Stripe dashboard
- Verify `getPlannFromSubscription()` function logic
- Check console logs for warnings

#### 4. Webhook Not Receiving Events
**Problem:** Local webhooks not working

**Solutions:**
- Ensure `stripe listen` is running
- Verify dev server is on port 3000
- Check webhook secret was copied correctly
- Restart dev server after updating `.env`

## Security Best Practices

### 1. Always Verify Signatures
The endpoint already does this:
```typescript
event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

**Never skip this step** - it prevents webhook spoofing.

### 2. Idempotency
Stripe may send the same webhook multiple times. Our handlers are idempotent:
- Tenant updates use `where` clauses to find specific records
- Updates are based on current state, not incremental changes

### 3. Rate Limiting
Consider adding rate limiting for webhook endpoints in production:
```typescript
// Example with Upstash
import { checkRateLimit } from '@/lib/rate-limit';

const { allowed } = await checkRateLimit('stripe-webhook', 'stripe_webhooks');
if (!allowed) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

### 4. Secret Management
- **Never** commit webhook secrets to Git
- Use environment variables in production
- Rotate secrets periodically
- Use different secrets for test/production

## Troubleshooting

### Enable Debug Logging

Add this to your webhook handler:
```typescript
console.log('Webhook event:', JSON.stringify(event, null, 2));
```

### Test Specific Scenarios

```bash
# Test subscription upgrade
stripe trigger customer.subscription.updated \
  --override customer.subscription.items.0.price.id=price_your_pro_price

# Test immediate cancellation
stripe trigger customer.subscription.deleted \
  --override customer.subscription.status=canceled

# Test payment retry
stripe trigger invoice.payment_failed \
  --override invoice.attempt_count=1
```

### Verify Database Updates

After triggering webhooks, check your database:
```sql
SELECT id, plan, stripe_customer_id, stripe_subscription_id
FROM tenants
WHERE stripe_customer_id IS NOT NULL;
```

## Next Steps

1. ✅ Create price IDs in Stripe Dashboard
2. ✅ Update `.env` with price IDs
3. ✅ Test webhooks locally with Stripe CLI
4. ✅ Implement subscription upgrade/downgrade UI
5. ✅ Add billing portal integration
6. ✅ Test full subscription flow end-to-end
7. ✅ Configure production webhook endpoint
8. ✅ Monitor webhook logs in production

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/webhooks)
