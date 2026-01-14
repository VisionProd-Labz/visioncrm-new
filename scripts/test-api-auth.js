const http = require('http');

// Test API endpoints to verify Auth.js v5 migration
const endpoints = [
  '/api/auth/session',
  '/api/team',
  '/api/projects',
  '/api/contacts',
  '/api/accounting/expenses',
  '/api/communications/conversations',
];

console.log('🔍 Test des endpoints API après migration Auth.js v5...\n');

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const status = res.statusCode;
        let icon;
        if (status === 200) icon = '✅';
        else if (status === 401) icon = '🔐';
        else if (status === 500) icon = '❌';
        else icon = '⚠️';

        console.log(`${icon} ${path.padEnd(40)} → ${status}`);
        resolve({ path, status, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${path.padEnd(40)} → ERROR: ${err.message}`);
      resolve({ path, status: 'ERROR', error: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏱️  ${path.padEnd(40)} → TIMEOUT`);
      resolve({ path, status: 'TIMEOUT' });
    });

    req.end();
  });
}

async function runTests() {
  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n📊 Résultats:');
  console.log('✅ = 200 OK');
  console.log('🔐 = 401 Unauthorized (normal sans session)');
  console.log('❌ = 500 Internal Server Error');
  console.log('⚠️  = Autre erreur');
  console.log('\n🎯 Tous les endpoints devraient retourner 200 ou 401');
  console.log('   Les 500 indiquent un problème avec la migration Auth.js v5\n');

  const errors = results.filter((r) => r.status === 500 || r.status === 'ERROR');
  if (errors.length === 0) {
    console.log('✅ Migration Auth.js v5 réussie - Aucune erreur 500 détectée\n');
  } else {
    console.log('❌ Migration incomplète - Erreurs détectées:\n');
    errors.forEach((e) => {
      console.log(`   ${e.path}: ${e.status}`);
    });
  }
}

runTests();
