#!/usr/bin/env tsx

/**
 * Fix Next.js 15 async params in API routes
 * Automatically converts synchronous params to async params
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function printSuccess(text: string) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printInfo(text: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${text}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

function getAllRouteFiles(dir: string, files: string[] = []): string[] {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Recurse into all directories
      getAllRouteFiles(fullPath, files);
    } else if (item === 'route.ts') {
      // Check if path contains dynamic segment [...]
      if (fullPath.includes('[')) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function fixParamsInFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Pattern 1: Fix function signature - { params }: { params: { ... } }
    // Convert to: { params }: { params: Promise<{ ... }> }
    const signatureRegex = /(\{[\s]*params[\s]*\}[\s]*:[\s]*\{[\s]*params[\s]*:[\s]*)(\{[^}]+\})/g;

    if (content.match(signatureRegex)) {
      content = content.replace(signatureRegex, '$1Promise<$2>');
      modified = true;
      printInfo(`  Fixed signature in: ${filePath}`);
    }

    // Pattern 2: Add await for params access
    // Find function bodies and add await for params
    const functionRegex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\([^)]*\{[\s]*params[\s]*\}[\s]*:[^)]+\)\s*\{/g;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const functionStart = match.index + match[0].length;

      // Check if params is already awaited in the first few lines
      const nextLines = content.substring(functionStart, functionStart + 500);

      if (!nextLines.includes('await params') && nextLines.includes('params.')) {
        // Need to add await
        // Find first params.xxx usage
        const paramsUsageMatch = nextLines.match(/params\.(\w+)/);

        if (paramsUsageMatch) {
          const paramName = paramsUsageMatch[1];

          // Insert await destructuring right after function opening brace
          const beforeInsert = content.substring(0, functionStart);
          const afterInsert = content.substring(functionStart);

          // Add the await destructuring line
          const indent = '  ';
          const awaitLine = `\n${indent}const { ${paramName} } = await params;\n`;

          content = beforeInsert + awaitLine + afterInsert;
          modified = true;

          // Now replace all params.paramName with just paramName
          content = content.replace(new RegExp(`params\\.${paramName}`, 'g'), paramName);

          printInfo(`  Added await for params.${paramName}`);
        }
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    printWarning(`  Failed to process ${filePath}: ${error}`);
    return false;
  }
}

// Main execution
function main() {
  console.log('\n' + colors.bold + colors.cyan + '🔧 Fixing Next.js 15 Async Params' + colors.reset);
  console.log('='.repeat(50) + '\n');

  const apiDir = join(process.cwd(), 'app', 'api');
  printInfo(`Scanning ${apiDir} for route files...`);

  const routeFiles = getAllRouteFiles(apiDir);
  printInfo(`Found ${routeFiles.length} route files with dynamic params\n`);

  let fixed = 0;
  let skipped = 0;

  for (const file of routeFiles) {
    const relativePath = file.replace(process.cwd(), '').replace(/\\/g, '/');
    printInfo(`Processing: ${relativePath}`);

    if (fixParamsInFile(file)) {
      fixed++;
      printSuccess(`  Fixed: ${relativePath}`);
    } else {
      skipped++;
      printInfo(`  Skipped (already fixed or no changes): ${relativePath}`);
    }
  }

  console.log('\n' + colors.bold + '📊 Summary' + colors.reset);
  console.log('='.repeat(50));
  console.log(`Total files: ${routeFiles.length}`);
  console.log(`${colors.green}Fixed: ${fixed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${skipped}${colors.reset}`);

  if (fixed > 0) {
    console.log('\n' + colors.green + '✅ Migration complete!' + colors.reset);
    console.log('Run ' + colors.cyan + 'pnpm build' + colors.reset + ' to test the changes.');
  } else {
    console.log('\n' + colors.yellow + '⚠️  No files needed fixing' + colors.reset);
  }
}

main();
