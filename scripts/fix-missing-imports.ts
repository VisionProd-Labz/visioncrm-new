/**
 * Fix missing requirePermission imports
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixFile(filePath: string): Promise<boolean> {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check if file uses requirePermission but doesn't import it
  if (content.includes('requirePermission') && !content.includes("from '@/lib/middleware/require-permission'")) {
    console.log(`Fixing: ${path.relative(process.cwd(), filePath)}`);

    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') && !lines[i].includes('type')) {
        lastImportIndex = i;
      }
      // Stop at first non-import line (after imports section)
      if (lastImportIndex !== -1 && !lines[i].startsWith('import') && lines[i].trim() !== '') {
        break;
      }
    }

    if (lastImportIndex !== -1) {
      // Insert the import after the last import
      lines.splice(lastImportIndex + 1, 0, "import { requirePermission } from '@/lib/middleware/require-permission';");
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
      return true;
    }
  }

  return false;
}

async function main() {
  console.log('🔧 Fixing missing requirePermission imports...\n');

  const apiDir = path.join(process.cwd(), 'app', 'api');
  const routeFiles = await glob('**/route.ts', {
    cwd: apiDir,
    absolute: true,
  });

  let fixedCount = 0;

  for (const file of routeFiles) {
    if (await fixFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} files`);
}

main().catch(console.error);
