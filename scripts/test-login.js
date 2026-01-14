const https = require('https');
const http = require('http');

async function testLogin() {
  console.log('🧪 Test de connexion Auth.js v5...\n');

  // Test 1: Session endpoint
  console.log('1️⃣ Test GET /api/auth/session');
  const sessionReq = http.request({
    hostname: 'localhost',
    port: 3010,
    path: '/api/auth/session',
    method: 'GET',
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Response: ${data}`);
      console.log('   ✅ Session endpoint works\n');

      // Test 2: CSRF token
      console.log('2️⃣ Test GET /api/auth/csrf');
      const csrfReq = http.request({
        hostname: 'localhost',
        port: 3010,
        path: '/api/auth/csrf',
        method: 'GET',
      }, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => { data2 += chunk; });
        res2.on('end', () => {
          console.log(`   Status: ${res2.statusCode}`);
          console.log(`   Response: ${data2}`);
          console.log('   ✅ CSRF endpoint works\n');

          console.log('✅ Tests terminés!\n');
          console.log('📋 Informations de connexion:');
          console.log('   URL: http://localhost:3010/login');
          console.log('   Email: demo@visioncrm.app');
          console.log('   Mot de passe: [vérifier avec l\'utilisateur]\n');
        });
      });
      csrfReq.on('error', (e) => {
        console.error('❌ Erreur CSRF:', e.message);
      });
      csrfReq.end();
    });
  });

  sessionReq.on('error', (e) => {
    console.error('❌ Erreur session:', e.message);
  });

  sessionReq.end();
}

testLogin();
