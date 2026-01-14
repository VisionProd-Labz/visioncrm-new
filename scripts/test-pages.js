const http = require('http');

const pages = [
  { path: '/', name: 'Homepage' },
  { path: '/login', name: 'Login' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/contacts', name: 'Contacts' },
  { path: '/quotes', name: 'Quotes' },
  { path: '/invoices', name: 'Invoices' },
  { path: '/catalog', name: 'Catalog' },
  { path: '/vehicles', name: 'Vehicles' },
  { path: '/planning', name: 'Planning' },
  { path: '/projects', name: 'Projects' },
  { path: '/accounting/expenses', name: 'Accounting' },
  { path: '/communication', name: 'Communication' },
  { path: '/email', name: 'Email' },
  { path: '/team', name: 'Team' },
  { path: '/settings', name: 'Settings' },
];

async function testPage(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3010,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const hasHtml = data.includes('<!DOCTYPE') || data.includes('<html');
        const hasError = data.includes('Error:') || data.includes('Module not found');
        resolve({
          status: res.statusCode,
          hasHtml,
          hasError,
          redirected: res.statusCode === 307 || res.statusCode === 302,
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 0, error: 'Timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 TEST DES PAGES VISIONCRM\n');
  console.log('URL: http://localhost:3010\n');

  let passed = 0;
  let failed = 0;

  for (const page of pages) {
    const result = await testPage(page.path);

    let status = '';
    if (result.error) {
      status = `❌ Error: ${result.error}`;
      failed++;
    } else if (result.status === 0) {
      status = '❌ Timeout';
      failed++;
    } else if (result.redirected) {
      status = `↗️  Redirect (${result.status})`;
      passed++;
    } else if (result.status === 200 && result.hasHtml && !result.hasError) {
      status = `✅ OK (${result.status})`;
      passed++;
    } else if (result.status === 200 && result.hasError) {
      status = `⚠️  Loads but has errors (${result.status})`;
      failed++;
    } else {
      status = `⚠️  Status ${result.status}`;
      failed++;
    }

    console.log(`${page.name.padEnd(20)} ${page.path.padEnd(30)} ${status}`);

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n========================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  console.log('========================\n');
}

runTests().catch(console.error);
