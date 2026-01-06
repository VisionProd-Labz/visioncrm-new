#!/bin/bash

# Stripe Webhooks Test Script
# This script tests all Stripe webhook events locally

echo "🎯 VisionCRM - Stripe Webhooks Test"
echo "===================================="
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed!"
    echo "Please install it first:"
    echo "  - Mac: brew install stripe/stripe-cli/stripe"
    echo "  - Windows: scoop install stripe"
    echo "  - Linux: https://github.com/stripe/stripe-cli/releases"
    exit 1
fi

echo "✅ Stripe CLI is installed"
echo ""

# Check if logged in
if ! stripe config --list &> /dev/null; then
    echo "⚠️  You need to login to Stripe CLI"
    echo "Run: stripe login"
    exit 1
fi

echo "✅ Logged in to Stripe"
echo ""

echo "📋 Testing Webhook Events..."
echo "----------------------------"
echo ""

# Test 1: Checkout Session Completed
echo "1️⃣  Testing checkout.session.completed..."
stripe trigger checkout.session.completed
if [ $? -eq 0 ]; then
    echo "   ✅ Checkout session completed event sent"
else
    echo "   ❌ Failed to send checkout session event"
fi
echo ""
sleep 2

# Test 2: Subscription Created
echo "2️⃣  Testing customer.subscription.created..."
stripe trigger customer.subscription.created
if [ $? -eq 0 ]; then
    echo "   ✅ Subscription created event sent"
else
    echo "   ❌ Failed to send subscription created event"
fi
echo ""
sleep 2

# Test 3: Subscription Updated
echo "3️⃣  Testing customer.subscription.updated..."
stripe trigger customer.subscription.updated
if [ $? -eq 0 ]; then
    echo "   ✅ Subscription updated event sent"
else
    echo "   ❌ Failed to send subscription updated event"
fi
echo ""
sleep 2

# Test 4: Subscription Deleted
echo "4️⃣  Testing customer.subscription.deleted..."
stripe trigger customer.subscription.deleted
if [ $? -eq 0 ]; then
    echo "   ✅ Subscription deleted event sent"
else
    echo "   ❌ Failed to send subscription deleted event"
fi
echo ""
sleep 2

# Test 5: Invoice Payment Succeeded
echo "5️⃣  Testing invoice.payment_succeeded..."
stripe trigger invoice.payment_succeeded
if [ $? -eq 0 ]; then
    echo "   ✅ Invoice payment succeeded event sent"
else
    echo "   ❌ Failed to send invoice payment succeeded event"
fi
echo ""
sleep 2

# Test 6: Invoice Payment Failed
echo "6️⃣  Testing invoice.payment_failed..."
stripe trigger invoice.payment_failed
if [ $? -eq 0 ]; then
    echo "   ✅ Invoice payment failed event sent"
else
    echo "   ❌ Failed to send invoice payment failed event"
fi
echo ""

echo "===================================="
echo "✨ All webhook events tested!"
echo ""
echo "📊 Check your Next.js console for webhook processing logs"
echo "📝 Verify database updates in your Prisma Studio or database"
echo ""
echo "Next steps:"
echo "  1. Check your terminal where 'pnpm dev' is running"
echo "  2. Look for webhook event logs"
echo "  3. Verify tenant plan updates in database"
echo "  4. Review STRIPE_WEBHOOKS_SETUP.md for production setup"
echo ""
