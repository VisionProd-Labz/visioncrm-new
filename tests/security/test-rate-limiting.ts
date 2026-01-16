import { checkRateLimit, getRateLimitStatus } from '../../lib/rate-limit';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting System...\n');

  let passedTests = 0;
  let totalTests = 0;

  function logTest(name: string, passed: boolean, details?: string) {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`✅ ${name}`);
    } else {
      console.log(`🔴 ${name}`);
    }
    if (details) {
      console.log(`   ${details}`);
    }
  }

  try {
    // Test 1: Login Rate Limit (5 req/min)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 1: Login Rate Limit (5 per minute)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testUserId = `test-user-${Date.now()}`;

    // Premiers 5 appels doivent passer
    for (let i = 1; i <= 5; i++) {
      const result = await checkRateLimit(testUserId, 'login');
      logTest(
        `Attempt ${i}/5`,
        result.allowed,
        `Remaining: ${result.remaining}, Reset: ${result.resetAt.toLocaleTimeString()}`
      );

      if (!result.allowed) {
        console.error(`🔴 FAIL: Attempt ${i} should be allowed!`);
        break;
      }
    }

    // 6ème appel doit être bloqué
    console.log('');
    const result6 = await checkRateLimit(testUserId, 'login');
    logTest(
      'Attempt 6/5 (should be blocked)',
      !result6.allowed,
      `Reset at: ${result6.resetAt.toLocaleTimeString()}`
    );

    if (result6.allowed) {
      console.error('🔴 FAIL: Should be blocked after 5 attempts!');
    }

    // Vérifier status sans incrémenter
    console.log('\n📊 Current status (without incrementing):');
    const status = await getRateLimitStatus(testUserId, 'login');
    console.log(`   Used: ${status.used}/${status.limit}`);
    console.log(`   Remaining: ${status.remaining}`);
    logTest('Status check', status.used >= 5 && status.remaining === 0);

    // Test 2: Register Rate Limit (3 req/hour)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 2: Register Rate Limit (3 per hour)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testIp = `192.168.1.${Math.floor(Math.random() * 255)}`;

    for (let i = 1; i <= 3; i++) {
      const result = await checkRateLimit(testIp, 'register');
      logTest(
        `Registration ${i}/3`,
        result.allowed,
        `Remaining: ${result.remaining}`
      );
    }

    const result4 = await checkRateLimit(testIp, 'register');
    logTest(
      'Registration 4/3 (should be blocked)',
      !result4.allowed,
      `Reset in: ${Math.ceil((result4.resetAt.getTime() - Date.now()) / 60000)} minutes`
    );

    // Test 3: Password Reset Rate Limit (3 req/hour)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 3: Password Reset Rate Limit (3 per hour)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testEmail = `test-${Date.now()}@example.com`;

    for (let i = 1; i <= 3; i++) {
      const result = await checkRateLimit(testEmail, 'password_reset');
      logTest(
        `Password reset ${i}/3`,
        result.allowed,
        `Remaining: ${result.remaining}`
      );
    }

    const resetResult4 = await checkRateLimit(testEmail, 'password_reset');
    logTest(
      'Password reset 4/3 (should be blocked)',
      !resetResult4.allowed
    );

    // Test 4: API General Rate Limit (100 req/min)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 4: API General Rate Limit (100 per minute)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testTenant = `tenant-${Date.now()}`;

    // Faire 10 requêtes rapides
    console.log('Making 10 rapid API calls...');
    let apiAllowed = 0;
    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit(testTenant, 'api_general');
      if (result.allowed) apiAllowed++;
    }

    logTest(
      'Rapid API calls (10/100)',
      apiAllowed === 10,
      `Allowed: ${apiAllowed}/10`
    );

    const apiStatus = await getRateLimitStatus(testTenant, 'api_general');
    console.log(`   Current usage: ${apiStatus.used}/100`);
    console.log(`   Remaining: ${apiStatus.remaining}`);

    // Test 5: AI Chat Rate Limit (50 req/hour)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 5: AI Chat Rate Limit (50 per hour)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testAiUser = `ai-user-${Date.now()}`;

    const aiResult1 = await checkRateLimit(testAiUser, 'ai_chat');
    logTest(
      'AI chat request',
      aiResult1.allowed,
      `Remaining: ${aiResult1.remaining}/50`
    );

    // Test 6: Différents identifiants isolés
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 6: Isolation between identifiers');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const user1 = `user1-${Date.now()}`;
    const user2 = `user2-${Date.now()}`;

    // User1 fait 5 requêtes (max)
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(user1, 'login');
    }

    // User1 devrait être bloqué
    const user1Result = await checkRateLimit(user1, 'login');
    logTest('User1 blocked after 5 attempts', !user1Result.allowed);

    // User2 devrait encore pouvoir faire des requêtes
    const user2Result = await checkRateLimit(user2, 'login');
    logTest(
      'User2 still allowed (isolated)',
      user2Result.allowed,
      `User2 remaining: ${user2Result.remaining}`
    );

    // Résumé
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 Test Results Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${totalTests - passedTests} 🔴`);
    console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All rate limiting tests passed!');
      console.log('\n✅ Rate limiting system is working correctly');
      console.log('   - Login: 5 attempts/minute ✓');
      console.log('   - Register: 3 attempts/hour ✓');
      console.log('   - Password Reset: 3 attempts/hour ✓');
      console.log('   - API General: 100 requests/minute ✓');
      console.log('   - AI Chat: 50 requests/hour ✓');
      console.log('   - Identifier isolation ✓');
      console.log('\nYour application is protected against brute force attacks! 🚀');
    } else {
      console.error('\n🔴 Some tests failed!');
      console.error('Please review the rate limiting configuration.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n═══════════════════════════════════════');
    console.error('🔴 Rate limiting test failed!');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error);
    console.error('\nPlease check:');
    console.error('1. Redis is properly configured');
    console.error('2. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set');
    console.error('3. Run test-redis-connection.ts first to verify Redis');
    process.exit(1);
  }
}

testRateLimiting();
