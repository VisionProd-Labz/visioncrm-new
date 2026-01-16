/**
 * Script to scan for sensitive data in console.log statements
 *
 * Usage:
 *   pnpm tsx scripts/scan-sensitive-logs.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Patterns qui indiquent des données sensibles
const SENSITIVE_PATTERNS = [
  /console\.log\([^)]*email/i,
  /console\.log\([^)]*password/i,
  /console\.log\([^)]*token/i,
  /console\.log\([^)]*secret/i,
  /console\.log\([^)]*credential/i,
  /console\.log\([^)]*api[_-]?key/i,
  /console\.log\([^)]*iban/i,
  /console\.log\([^)]*bic/i,
  /console\.log\([^)]*card/i,
  /console\.log\([^)]*ssn/i,
  /console\.log\([^)]*phone/i,
  /console\.log\([^)]*address/i,
];

// Patterns de logs sécurisés (OK en production)
const SAFE_PATTERNS = [
  /process\.env\.NODE_ENV === ['"]development['"]/,
  /if \(process\.env\.NODE_ENV === ['"]development['"]\)/,
];

interface Finding {
  file: string;
  line: number;
  content: string;
  pattern: string;
  severity: 'high' | 'medium' | 'low';
  isSafe: boolean;
}

function checkSafety(lineContent: string, fullContent: string, lineNumber: number): boolean {
  // Vérifier si le log est dans un bloc if (NODE_ENV === 'development')
  const lines = fullContent.split('\n');

  // Regarder les 5 lignes précédentes
  for (let i = Math.max(0, lineNumber - 5); i < lineNumber; i++) {
    const prevLine = lines[i];
    if (SAFE_PATTERNS.some(pattern => pattern.test(prevLine))) {
      return true;
    }
  }

  return false;
}

function getSeverity(content: string): 'high' | 'medium' | 'low' {
  if (/email|password|token|secret|credential|api[_-]?key/i.test(content)) {
    return 'high';
  }
  if (/iban|bic|card|ssn/i.test(content)) {
    return 'high';
  }
  if (/phone|address/i.test(content)) {
    return 'medium';
  }
  return 'low';
}

async function scanFile(filePath: string): Promise<Finding[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const findings: Finding[] = [];

  lines.forEach((line, index) => {
    SENSITIVE_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        const isSafe = checkSafety(line, content, index);
        findings.push({
          file: filePath,
          line: index + 1,
          content: line.trim(),
          pattern: pattern.source,
          severity: getSeverity(line),
          isSafe,
        });
      }
    });
  });

  return findings;
}

async function scanProject(): Promise<Finding[]> {
  const extensions = ['ts', 'tsx', 'js', 'jsx'];
  const allFindings: Finding[] = [];

  for (const ext of extensions) {
    const files = await glob(`**/*.${ext}`, {
      cwd: process.cwd(),
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/*.bak*',
        '**/*.backup*',
        '**/scripts/scan-sensitive-logs.ts', // Ignore self
      ],
    });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const findings = await scanFile(fullPath);
      allFindings.push(...findings);
    }
  }

  return allFindings;
}

function generateReport(findings: Finding[]) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔍 SENSITIVE DATA LOGGING SCAN');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const high = findings.filter(f => f.severity === 'high' && !f.isSafe);
  const medium = findings.filter(f => f.severity === 'medium' && !f.isSafe);
  const low = findings.filter(f => f.severity === 'low' && !f.isSafe);
  const safe = findings.filter(f => f.isSafe);

  console.log(`Total findings: ${findings.length}`);
  console.log(`🔴 High risk (unprotected): ${high.length}`);
  console.log(`🟡 Medium risk (unprotected): ${medium.length}`);
  console.log(`⚪ Low risk (unprotected): ${low.length}`);
  console.log(`✅ Protected (dev only): ${safe.length}\n`);

  if (high.length > 0) {
    console.log('🔴 HIGH RISK FINDINGS (PRODUCTION LOGS):\n');
    high.forEach(f => {
      const relPath = f.file.replace(process.cwd(), '.');
      console.log(`  File: ${relPath}:${f.line}`);
      console.log(`  Code: ${f.content.substring(0, 100)}...`);
      console.log('');
    });
  }

  if (medium.length > 0) {
    console.log('\n🟡 MEDIUM RISK FINDINGS:\n');
    medium.forEach(f => {
      const relPath = f.file.replace(process.cwd(), '.');
      console.log(`  File: ${relPath}:${f.line}`);
      console.log(`  Code: ${f.content.substring(0, 100)}...`);
      console.log('');
    });
  }

  if (safe.length > 0) {
    console.log('\n✅ PROTECTED LOGS (Development only):\n');
    console.log(`  ${safe.length} logs found that are protected by NODE_ENV checks`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');

  if (high.length === 0 && medium.length === 0 && low.length === 0) {
    console.log('🎉 No unprotected sensitive logs found!');
    console.log('Your application is safe for production logging.');
  } else {
    console.log('⚠️  ACTION REQUIRED:');
    console.log(`   - ${high.length + medium.length + low.length} unprotected logs found`);
    console.log('   - Wrap sensitive logs with: if (process.env.NODE_ENV === "development")');
    console.log('   - Or remove them completely for production');
  }

  console.log('═══════════════════════════════════════════════════════════════\n');

  // Security score
  const totalRisky = high.length + medium.length + low.length;
  const score = totalRisky === 0 ? 100 : Math.max(0, 100 - (totalRisky * 5));
  console.log(`Security Score: ${score}/100`);

  if (score < 70) {
    console.log('Status: 🔴 CRITICAL - Fix before production');
  } else if (score < 90) {
    console.log('Status: 🟡 WARNING - Review and fix');
  } else {
    console.log('Status: 🟢 GOOD - Safe for production');
  }

  console.log('');
}

async function main() {
  console.log('🔍 Scanning project for sensitive data in logs...\n');

  const findings = await scanProject();
  generateReport(findings);

  // Exit with error code if high-risk findings
  const highRisk = findings.filter(f => f.severity === 'high' && !f.isSafe);
  if (highRisk.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
