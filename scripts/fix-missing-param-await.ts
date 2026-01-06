#!/usr/bin/env tsx

/**
 * Fix missing 'const { id } = await params;' in route handlers
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function getAllRouteFiles(dir: string, files: string[] = []): string[] {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getAllRouteFiles(fullPath, files);
    } else if (item === 'route.ts' && fullPath.includes('[')) {
      files.push(fullPath);
    }
  }

  return files;
}

function fixMissingParamAwait(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Find all function declarations
    const functionRegex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\([^)]*\{[\s]*params[\s]*\}[^)]*\)\s*\{/g;

    let match;
    const functions: Array<{ method: string; start: number; end: number }> = [];

    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        method: match[1],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // Process functions in reverse order to avoid offset issues
    for (let i = functions.length - 1; i >= 0; i--) {
      const fn = functions[i];
      const fnStart = fn.end;
      const nextLines = content.substring(fnStart, fnStart + 500);

      // Check if already has await params
      if (nextLines.includes('await params')) {
        continue;
      }

      // Check if uses 'id' variable
      if (nextLines.includes('id:') || nextLines.includes('id,')) {
        // Insert await line
        const beforeInsert = content.substring(0, fnStart);
        const afterInsert = content.substring(fnStart);

        const awaitLine = `\n  const { id } = await params;\n`;

        content = beforeInsert + awaitLine + afterInsert;
        modified = true;

        console.log(`  ${colors.green}✓${colors.reset} Fixed ${fn.method} function`);
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error}`);
    return false;
  }
}

// Main
const apiDir = join(process.cwd(), 'app', 'api');
console.log(`\n${colors.bold}${colors.cyan}🔧 Fixing Missing Param Await${colors.reset}\n`);

const files = getAllRouteFiles(apiDir);
console.log(`${colors.blue}Found ${files.length} route files${colors.reset}\n`);

let fixed = 0;

for (const file of files) {
  const relativePath = file.replace(process.cwd(), '').replace(/\\/g, '/');
  console.log(`${colors.blue}Processing:${colors.reset} ${relativePath}`);

  if (fixMissingParamAwait(file)) {
    fixed++;
  }
}

console.log(`\n${colors.green}✅ Fixed ${fixed} files${colors.reset}\n`);
