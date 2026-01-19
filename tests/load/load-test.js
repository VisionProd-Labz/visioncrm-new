import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up to 10 users
    { duration: '1m', target: 50 },   // Ramp-up to 50 users
    { duration: '2m', target: 100 },  // Ramp-up to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    errors: ['rate<0.05'],             // Error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUser = {
  email: `loadtest-${Date.now()}@example.com`,
  password: 'LoadTest123!@#',
  name: 'Load Test User',
  tenantName: 'Load Test Garage',
  subdomain: `loadtest-${Date.now()}`,
};

export function setup() {
  console.log(`🚀 Starting load test against ${BASE_URL}`);
  console.log(`📊 Target: 100 concurrent users`);
  console.log(`⏱️  Duration: 6 minutes\n`);

  // Register test user (run once before load test)
  const registerPayload = JSON.stringify({
    name: testUser.name,
    email: testUser.email,
    password: testUser.password,
    tenantName: testUser.tenantName,
    subdomain: testUser.subdomain,
  });

  const registerRes = http.post(`${BASE_URL}/api/register`, registerPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const registered = check(registerRes, {
    'user registered successfully': (r) => r.status === 200 || r.status === 201,
  });

  if (!registered) {
    console.error(`❌ Registration failed: ${registerRes.status} - ${registerRes.body}`);
    // Try to proceed anyway - user might already exist
  } else {
    console.log(`✅ Test user registered: ${testUser.email}`);
  }

  return {
    email: testUser.email,
    password: testUser.password,
    baseUrl: BASE_URL,
  };
}

export default function (data) {
  // Simulate different user behaviors
  const scenarios = [
    browseDashboard,
    browseContacts,
    browseQuotes,
    browseInvoices,
    browseTasks,
  ];

  // Pick a random scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario(data);
}

function browseDashboard(data) {
  // 1. Login
  const loginRes = login(data);
  if (!loginRes) return;

  sleep(1);

  // 2. Load dashboard
  const dashboardRes = http.get(`${data.baseUrl}/dashboard`, {
    headers: { Cookie: loginRes.cookie },
  });

  check(dashboardRes, {
    'dashboard loaded': (r) => r.status === 200,
    'dashboard response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(2);

  // 3. Load dashboard stats
  const statsRes = http.get(`${data.baseUrl}/api/dashboard/stats`, {
    headers: { Cookie: loginRes.cookie },
  });

  check(statsRes, {
    'stats loaded': (r) => r.status === 200,
    'stats response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}

function browseContacts(data) {
  const loginRes = login(data);
  if (!loginRes) return;

  sleep(1);

  // Load contacts list with pagination
  const contactsRes = http.get(
    `${data.baseUrl}/api/contacts?limit=20&offset=0`,
    { headers: { Cookie: loginRes.cookie } }
  );

  const contactsOk = check(contactsRes, {
    'contacts loaded': (r) => r.status === 200,
    'contacts response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!contactsOk);

  sleep(2);

  // Try to parse contacts and load a specific contact
  try {
    const contacts = JSON.parse(contactsRes.body);
    if (contacts.data && contacts.data.length > 0) {
      const contactId = contacts.data[0].id;

      const contactDetailRes = http.get(
        `${data.baseUrl}/api/contacts/${contactId}`,
        { headers: { Cookie: loginRes.cookie } }
      );

      check(contactDetailRes, {
        'contact detail loaded': (r) => r.status === 200,
      });
    }
  } catch (e) {
    // Ignore parsing errors
  }

  sleep(1);
}

function browseQuotes(data) {
  const loginRes = login(data);
  if (!loginRes) return;

  sleep(1);

  // Load quotes list with pagination
  const quotesRes = http.get(
    `${data.baseUrl}/api/quotes?limit=20&offset=0`,
    { headers: { Cookie: loginRes.cookie } }
  );

  const quotesOk = check(quotesRes, {
    'quotes loaded': (r) => r.status === 200,
    'quotes response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!quotesOk);

  sleep(2);
}

function browseInvoices(data) {
  const loginRes = login(data);
  if (!loginRes) return;

  sleep(1);

  // Load invoices list with pagination
  const invoicesRes = http.get(
    `${data.baseUrl}/api/invoices?limit=20&offset=0`,
    { headers: { Cookie: loginRes.cookie } }
  );

  const invoicesOk = check(invoicesRes, {
    'invoices loaded': (r) => r.status === 200,
    'invoices response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!invoicesOk);

  sleep(2);
}

function browseTasks(data) {
  const loginRes = login(data);
  if (!loginRes) return;

  sleep(1);

  // Load tasks list with pagination
  const tasksRes = http.get(
    `${data.baseUrl}/api/tasks?limit=20&offset=0`,
    { headers: { Cookie: loginRes.cookie } }
  );

  const tasksOk = check(tasksRes, {
    'tasks loaded': (r) => r.status === 200,
    'tasks response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!tasksOk);

  sleep(2);
}

// Helper function to login and extract cookie
function login(data) {
  const loginPayload = JSON.stringify({
    email: data.email,
    password: data.password,
  });

  const loginRes = http.post(
    `${data.baseUrl}/api/auth/callback/credentials`,
    loginPayload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      redirects: 0, // Don't follow redirects
    }
  );

  const loginSuccess = check(loginRes, {
    'login status ok': (r) => r.status === 200 || r.status === 302,
  });

  if (!loginSuccess) {
    errorRate.add(true);
    return null;
  }

  // Extract session cookie
  let cookie = '';
  if (loginRes.cookies && loginRes.cookies['next-auth.session-token']) {
    cookie = `next-auth.session-token=${loginRes.cookies['next-auth.session-token'][0].value}`;
  } else if (loginRes.cookies && loginRes.cookies['__Secure-next-auth.session-token']) {
    cookie = `__Secure-next-auth.session-token=${loginRes.cookies['__Secure-next-auth.session-token'][0].value}`;
  }

  return { cookie };
}

export function teardown(data) {
  console.log('\n📊 Load test completed!');
  console.log('Check the results above for detailed metrics.\n');
}
