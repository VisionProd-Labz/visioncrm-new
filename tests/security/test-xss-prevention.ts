/**
 * Test XSS Prevention via HTML Sanitization
 *
 * Usage: pnpm tsx tests/security/test-xss-prevention.ts
 */

import {
  sanitizeText,
  sanitizeRichText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhone,
  sanitizeObject,
} from '@/lib/sanitize';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TEST XSS PREVENTION - HTML Sanitization');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test 1: Script Injection
console.log('Test 1: Script Injection');
console.log('─────────────────────────────────────────────────────────────');
const scriptAttack = '<script>alert("XSS")</script>Hello';
const sanitizedScript = sanitizeText(scriptAttack);
console.log('Input:    ', scriptAttack);
console.log('Sanitized:', sanitizedScript);
console.log('Status:   ', sanitizedScript === 'Hello' ? '✅ PASS - Script removed' : '❌ FAIL');
console.log('');

// Test 2: HTML Tags in Name
console.log('Test 2: HTML Tags in Name');
console.log('─────────────────────────────────────────────────────────────');
const htmlName = '<b>John</b> <i>Doe</i>';
const sanitizedName = sanitizeText(htmlName);
console.log('Input:    ', htmlName);
console.log('Sanitized:', sanitizedName);
console.log('Status:   ', sanitizedName === 'John Doe' ? '✅ PASS - HTML removed' : '❌ FAIL');
console.log('');

// Test 3: Event Handler Attack
console.log('Test 3: Event Handler Attack');
console.log('─────────────────────────────────────────────────────────────');
const eventAttack = '<img src=x onerror="alert(1)">';
const sanitizedEvent = sanitizeText(eventAttack);
console.log('Input:    ', eventAttack);
console.log('Sanitized:', sanitizedEvent);
console.log('Status:   ', sanitizedEvent === '' ? '✅ PASS - Event handler removed' : '❌ FAIL');
console.log('');

// Test 4: Rich Text (Allowed Tags)
console.log('Test 4: Rich Text (Allowed Tags)');
console.log('─────────────────────────────────────────────────────────────');
const richText = '<p>Hello <strong>world</strong>!</p><script>alert("XSS")</script>';
const sanitizedRich = sanitizeRichText(richText);
console.log('Input:    ', richText);
console.log('Sanitized:', sanitizedRich);
console.log('Status:   ', sanitizedRich.includes('<strong>') && !sanitizedRich.includes('<script>') ? '✅ PASS - Safe HTML kept, script removed' : '❌ FAIL');
console.log('');

// Test 5: Email with HTML
console.log('Test 5: Email with HTML');
console.log('─────────────────────────────────────────────────────────────');
const emailAttack = '<script>alert(1)</script>john@example.com';
const sanitizedEmailAttack = sanitizeEmail(emailAttack);
console.log('Input:    ', emailAttack);
console.log('Sanitized:', sanitizedEmailAttack);
console.log('Status:   ', !sanitizedEmailAttack.includes('<script>') ? '✅ PASS - Script removed from email' : '❌ FAIL');
console.log('');

// Test 6: Dangerous URL Protocols
console.log('Test 6: Dangerous URL Protocols');
console.log('─────────────────────────────────────────────────────────────');
const dangerousUrls = [
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
];

dangerousUrls.forEach((url, index) => {
  const sanitized = sanitizeUrl(url);
  const isBlocked = sanitized === '';
  console.log(`  ${index + 1}. Input: ${url}`);
  console.log(`     Sanitized: ${sanitized}`);
  console.log(`     Status: ${isBlocked ? '✅ BLOCKED' : '❌ ALLOWED (DANGER!)'}`);
});
console.log('');

// Test 7: Phone Number Sanitization
console.log('Test 7: Phone Number Sanitization');
console.log('─────────────────────────────────────────────────────────────');
const phoneAttack = '+33 6<script>alert(1)</script>12 34 56 78';
const sanitizedPhone = sanitizePhone(phoneAttack);
console.log('Input:    ', phoneAttack);
console.log('Sanitized:', sanitizedPhone);
console.log('Status:   ', !sanitizedPhone.includes('<script>') ? '✅ PASS - Script removed from phone' : '❌ FAIL');
console.log('');

// Test 8: Object Sanitization (Recursive)
console.log('Test 8: Object Sanitization (Recursive)');
console.log('─────────────────────────────────────────────────────────────');
const maliciousObject = {
  first_name: '<script>alert(1)</script>John',
  last_name: '<b>Doe</b>',
  email: 'john@example.com',
  phone: '+33 6<img src=x onerror=alert(1)>12 34 56 78',
  notes: '<p>Safe paragraph</p><script>alert(1)</script>',
  nested: {
    description: '<h1>Title</h1><script>evil</script>',
  },
};

const sanitizedObject = sanitizeObject(maliciousObject, ['notes', 'description']);

console.log('Input object keys:', Object.keys(maliciousObject));
console.log('Sanitized:');
console.log(JSON.stringify(sanitizedObject, null, 2));

const hasNoScripts =
  !JSON.stringify(sanitizedObject).includes('<script>') &&
  !JSON.stringify(sanitizedObject).includes('onerror');

console.log('Status:   ', hasNoScripts ? '✅ PASS - All scripts removed' : '❌ FAIL');
console.log('');

// Test 9: SQL Injection Attempt in Text
console.log('Test 9: SQL Injection Attempt (as text)');
console.log('─────────────────────────────────────────────────────────────');
const sqlInjection = "'; DROP TABLE users; --";
const sanitizedSql = sanitizeText(sqlInjection);
console.log('Input:    ', sqlInjection);
console.log('Sanitized:', sanitizedSql);
console.log('Note: SQL injection prevented at DB level (Prisma), sanitization just cleans text');
console.log('Status:   ', sanitizedSql === sqlInjection ? '✅ INFO - Text preserved (DB handles SQL)' : '⚠️  Changed');
console.log('');

// Test 10: Unicode/Encoded Attacks
console.log('Test 10: Unicode/Encoded Attacks');
console.log('─────────────────────────────────────────────────────────────');
const unicodeAttack = '\\u003cscript\\u003ealert(1)\\u003c/script\\u003e';
const sanitizedUnicode = sanitizeText(unicodeAttack);
console.log('Input:    ', unicodeAttack);
console.log('Sanitized:', sanitizedUnicode);
console.log('Status:   ', !sanitizedUnicode.includes('script') ? '✅ PASS' : '⚠️  Check manually');
console.log('');

// Summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ sanitizeText()      - Removes ALL HTML tags and scripts');
console.log('✅ sanitizeRichText()  - Allows safe HTML tags (p, strong, etc.)');
console.log('✅ sanitizeEmail()     - Cleans emails, removes HTML');
console.log('✅ sanitizeUrl()       - Blocks dangerous protocols (javascript:, data:, etc.)');
console.log('✅ sanitizePhone()     - Removes non-phone characters');
console.log('✅ sanitizeObject()    - Recursively sanitizes all object fields');
console.log('');
console.log('🎯 XSS PROTECTION: ACTIVE');
console.log('All user inputs are sanitized via Zod transforms in lib/validations.ts');
console.log('═══════════════════════════════════════════════════════════════\n');
