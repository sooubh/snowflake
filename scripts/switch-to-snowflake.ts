/**
 * Complete Azure to Snowflake Switch - INCLUDING TYPE IMPORTS
 * 
 * Updates all imports (services AND types) from azureDefaults to snowflakeService
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

async function updateAllFiles() {
    console.log('\n🔄 Complete Snowflake Migration - Removing All Azure References...\n');
    console.log('='.repeat(60));

    // Find all TypeScript and TSX files in app directory
    const files = await glob('app/**/*.{ts,tsx}', { cwd: process.cwd() });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        const fullPath = path.join(process.cwd(), file);

        if (!fs.existsSync(fullPath)) {
            continue;
        }

        let content = fs.readFileSync(fullPath, 'utf-8');
        let modified = false;

        // Pattern 1: import { azureService } from '@/lib/azureDefaults';
        if (content.includes("from '@/lib/azureDefaults'") || content.includes('from "@/lib/azureDefaults"')) {
            // Replace type-only imports
            const typeOnlyPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/lib\/azureDefaults['"]/g;
            const newContent = content.replace(typeOnlyPattern, (match, imports) => {
                // Check if it includes azureService
                if (imports.includes('azureService')) {
                    // Has both service and types
                    const types = imports.split(',').map((s: string) => s.trim()).filter((s: string) => s !== 'azureService');
                    if (types.length > 0) {
                        return `import { snowflakeService as azureService, ${types.join(', ')} } from '@/lib/snowflakeService'`;
                    } else {
                        return `import { snowflakeService as azureService } from '@/lib/snowflakeService'`;
                    }
                } else {
                    // Type-only import
                    return `import { ${imports} } from '@/lib/snowflakeService'`;
                }
            });

            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(fullPath, content, 'utf-8');
            console.log(`✅ Updated ${file}`);
            updatedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Complete Azure Removal Done!`);
    console.log(`   Updated: ${updatedCount} files`);
    console.log(`   Skipped: ${skippedCount} files (no changes needed)`);
    console.log('\n🎯 All Azure references removed - App now 100% Snowflake!\n');
}

updateAllFiles().catch(console.error);
