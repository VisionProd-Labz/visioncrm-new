import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp-up to 20 users
    { duration: '1m', target: 50 },    // Ramp-up to 50 users
    { duration: '1m', target: 100 },   // Ramp-up to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.05'],    // Error rate < 5%
    errors: ['rate<0.05'],             // Custom error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  console.log(`\n🚀 Simple Load Test`);
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`👥 Users: Ramp up to 100 concurrent`);
  console.log(`⏱️  Duration: 5 minutes\n`);
}

export default function () {
  // Test homepage load
  const homeRes = http.get(`${BASE_URL}/`);

  const homeOk = check(homeRes, {
    'homepage status 200': (r) => r.status === 200,
    'homepage response < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!homeOk);

  sleep(1);

  // Test login page
  const loginRes = http.get(`${BASE_URL}/login`);

  const loginPageOk = check(loginRes, {
    'login page status 200': (r) => r.status === 200,
    'login page response < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!loginPageOk);

  sleep(1);

  // Test register page
  const registerRes = http.get(`${BASE_URL}/register`);

  const registerPageOk = check(registerRes, {
    'register page status 200': (r) => r.status === 200,
    'register page response < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!registerPageOk);

  sleep(2);
}

export function teardown() {
  console.log('\n✅ Simple load test completed!\n');
}
