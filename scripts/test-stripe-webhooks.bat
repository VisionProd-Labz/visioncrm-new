@echo off
REM Stripe Webhooks Test Script for Windows
REM This script tests all Stripe webhook events locally

echo.
echo 🎯 VisionCRM - Stripe Webhooks Test
echo ====================================
echo.

REM Check if Stripe CLI is installed
where stripe >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Stripe CLI is not installed!
    echo Please install it first:
    echo   - Windows: scoop install stripe
    echo   - Or download from: https://github.com/stripe/stripe-cli/releases
    exit /b 1
)

echo ✅ Stripe CLI is installed
echo.

echo 📋 Testing Webhook Events...
echo ----------------------------
echo.

REM Test 1: Checkout Session Completed
echo 1️⃣  Testing checkout.session.completed...
stripe trigger checkout.session.completed
if %errorlevel% equ 0 (
    echo    ✅ Checkout session completed event sent
) else (
    echo    ❌ Failed to send checkout session event
)
echo.
timeout /t 2 /nobreak >nul

REM Test 2: Subscription Created
echo 2️⃣  Testing customer.subscription.created...
stripe trigger customer.subscription.created
if %errorlevel% equ 0 (
    echo    ✅ Subscription created event sent
) else (
    echo    ❌ Failed to send subscription created event
)
echo.
timeout /t 2 /nobreak >nul

REM Test 3: Subscription Updated
echo 3️⃣  Testing customer.subscription.updated...
stripe trigger customer.subscription.updated
if %errorlevel% equ 0 (
    echo    ✅ Subscription updated event sent
) else (
    echo    ❌ Failed to send subscription updated event
)
echo.
timeout /t 2 /nobreak >nul

REM Test 4: Subscription Deleted
echo 4️⃣  Testing customer.subscription.deleted...
stripe trigger customer.subscription.deleted
if %errorlevel% equ 0 (
    echo    ✅ Subscription deleted event sent
) else (
    echo    ❌ Failed to send subscription deleted event
)
echo.
timeout /t 2 /nobreak >nul

REM Test 5: Invoice Payment Succeeded
echo 5️⃣  Testing invoice.payment_succeeded...
stripe trigger invoice.payment_succeeded
if %errorlevel% equ 0 (
    echo    ✅ Invoice payment succeeded event sent
) else (
    echo    ❌ Failed to send invoice payment succeeded event
)
echo.
timeout /t 2 /nobreak >nul

REM Test 6: Invoice Payment Failed
echo 6️⃣  Testing invoice.payment_failed...
stripe trigger invoice.payment_failed
if %errorlevel% equ 0 (
    echo    ✅ Invoice payment failed event sent
) else (
    echo    ❌ Failed to send invoice payment failed event
)
echo.

echo ====================================
echo ✨ All webhook events tested!
echo.
echo 📊 Check your Next.js console for webhook processing logs
echo 📝 Verify database updates in your Prisma Studio or database
echo.
echo Next steps:
echo   1. Check your terminal where 'pnpm dev' is running
echo   2. Look for webhook event logs
echo   3. Verify tenant plan updates in database
echo   4. Review STRIPE_WEBHOOKS_SETUP.md for production setup
echo.

pause
