import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature header found');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  console.log(`Received Stripe webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const tenantId = session.metadata?.tenant_id || session.client_reference_id;

  if (!tenantId) {
    console.error('No tenant_id found in checkout session');
    return;
  }

  // Update tenant with customer ID
  if (session.customer) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripe_customer_id: session.customer as string,
      },
    });

    console.log(`Updated tenant ${tenantId} with customer ID: ${session.customer}`);
  }

  // If subscription was created, it will be handled by subscription.created event
  console.log(`Checkout session completed for tenant: ${tenantId}`);
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find tenant by customer ID
  const tenant = await prisma.tenant.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!tenant) {
    console.error(`No tenant found for customer: ${customerId}`);
    return;
  }

  // Map Stripe product to plan
  const plan = getPlannFromSubscription(subscription);

  // Update tenant with subscription info
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stripe_subscription_id: subscription.id,
      plan: plan,
    },
  });

  console.log(`Subscription created for tenant ${tenant.id}: ${subscription.id} (${plan})`);
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find tenant by customer ID
  const tenant = await prisma.tenant.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!tenant) {
    console.error(`No tenant found for customer: ${customerId}`);
    return;
  }

  // Map Stripe product to plan
  const plan = getPlannFromSubscription(subscription);

  // Handle subscription cancellation (at period end)
  if (subscription.cancel_at_period_end) {
    console.log(`Subscription will cancel at period end for tenant ${tenant.id}`);
  }

  // Handle subscription status changes
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    // Downgrade to FREE plan
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        plan: 'FREE',
        stripe_subscription_id: null,
      },
    });

    console.log(`Subscription canceled/unpaid - tenant ${tenant.id} downgraded to FREE`);
  } else {
    // Update subscription and plan
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        stripe_subscription_id: subscription.id,
        plan: plan,
      },
    });

    console.log(`Subscription updated for tenant ${tenant.id}: ${subscription.id} (${plan})`);
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find tenant by customer ID
  const tenant = await prisma.tenant.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!tenant) {
    console.error(`No tenant found for customer: ${customerId}`);
    return;
  }

  // Downgrade to FREE plan
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      plan: 'FREE',
      stripe_subscription_id: null,
    },
  });

  console.log(`Subscription deleted - tenant ${tenant.id} downgraded to FREE`);
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  console.log(`Payment succeeded for customer ${customerId}, subscription ${subscriptionId}`);

  // Optional: Send receipt email, update payment history, etc.
  // For now, just log it - the subscription events handle plan updates
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  console.log(`Payment failed for customer ${customerId}, subscription ${subscriptionId}`);

  // Find tenant
  const tenant = await prisma.tenant.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!tenant) {
    console.error(`No tenant found for customer: ${customerId}`);
    return;
  }

  // Optional: Send payment failure email, notify admins, etc.
  console.warn(`Payment failed for tenant ${tenant.id} - Stripe will retry automatically`);
}

/**
 * Map Stripe subscription to VisionCRM plan
 */
function getPlannFromSubscription(subscription: Stripe.Subscription): 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' {
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    return 'FREE';
  }

  // Map price IDs to plans
  switch (priceId) {
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER:
      return 'STARTER';
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO:
      return 'PRO';
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE:
      return 'ENTERPRISE';
    default:
      console.warn(`Unknown price ID: ${priceId}, defaulting to FREE`);
      return 'FREE';
  }
}
