import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

async function testRedisConnection() {
  console.log('🧪 Testing Redis Connection...\n');

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('🔴 ERROR: Missing environment variables');
    console.error('Please set:');
    console.error('  - UPSTASH_REDIS_REST_URL');
    console.error('  - UPSTASH_REDIS_REST_TOKEN');
    process.exit(1);
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    // Test 1: PING
    console.log('Test 1: PING...');
    const pingResult = await redis.ping();
    console.log(`  Result: ${pingResult}`);
    if (pingResult !== 'PONG') {
      throw new Error('PING failed');
    }
    console.log('  ✅ PASS\n');

    // Test 2: SET/GET
    console.log('Test 2: SET/GET...');
    await redis.set('test:key', 'test-value', { ex: 60 });
    const value = await redis.get('test:key');
    console.log(`  Stored: "test-value"`);
    console.log(`  Retrieved: "${value}"`);
    if (value !== 'test-value') {
      throw new Error('SET/GET failed');
    }
    console.log('  ✅ PASS\n');

    // Test 3: Sorted Set (utilisé pour rate limiting)
    console.log('Test 3: ZADD/ZCARD (rate limiting structure)...');
    const key = 'test:ratelimit:test-user';
    const now = Date.now();

    await redis.zadd(key, { score: now, member: `${now}-1` });
    await redis.zadd(key, { score: now + 1, member: `${now}-2` });
    await redis.zadd(key, { score: now + 2, member: `${now}-3` });

    const count = await redis.zcard(key);
    console.log(`  Added: 3 entries`);
    console.log(`  Count: ${count}`);
    if (count !== 3) {
      throw new Error('ZADD/ZCARD failed');
    }
    console.log('  ✅ PASS\n');

    // Test 4: ZCOUNT (compter dans une fenêtre)
    console.log('Test 4: ZCOUNT (count in window)...');
    const windowStart = now - 1000;
    const windowEnd = now + 1000;
    const inWindow = await redis.zcount(key, windowStart, windowEnd);
    console.log(`  Window: ${windowStart} to ${windowEnd}`);
    console.log(`  Count in window: ${inWindow}`);
    if (inWindow !== 3) {
      throw new Error('ZCOUNT failed');
    }
    console.log('  ✅ PASS\n');

    // Test 5: EXPIRE
    console.log('Test 5: EXPIRE (TTL)...');
    await redis.expire(key, 30);
    const ttl = await redis.ttl(key);
    console.log(`  TTL set: 30 seconds`);
    console.log(`  TTL remaining: ${ttl} seconds`);
    if (ttl <= 0 || ttl > 30) {
      throw new Error('EXPIRE failed');
    }
    console.log('  ✅ PASS\n');

    // Nettoyer
    console.log('Cleaning up test data...');
    await redis.del('test:key');
    await redis.del(key);
    console.log('  ✅ Cleaned\n');

    // Résumé
    console.log('═══════════════════════════════════════');
    console.log('🎉 All Redis tests passed!');
    console.log('═══════════════════════════════════════');
    console.log(`URL: ${process.env.UPSTASH_REDIS_REST_URL}`);
    console.log('Status: ✅ Connected and functional');
    console.log('\nRedis is ready for rate limiting! 🚀');

  } catch (error) {
    console.error('\n═══════════════════════════════════════');
    console.error('🔴 Redis connection failed!');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error);
    console.error('\nPlease check:');
    console.error('1. UPSTASH_REDIS_REST_URL is correct');
    console.error('2. UPSTASH_REDIS_REST_TOKEN is correct');
    console.error('3. Redis database is active in Upstash dashboard');
    console.error('4. Network connection is stable');
    process.exit(1);
  }
}

testRedisConnection();
