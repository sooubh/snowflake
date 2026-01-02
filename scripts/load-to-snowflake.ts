/**
 * Load Data into Snowflake
 * 
 * This script loads exported JSON data from export/ directory into Snowflake
 * 
 * PREREQUISITES:
 * 1. Snowflake account created
 * 2. Database and tables created (run SQL from migration guide Phase 2)
 * 3. Environment variables configured in .env.local
 * 4. Data exported from Cosmos DB (run export-cosmos-data.ts)
 */

import { snowflakeService } from '../lib/snowflakeService';
import * as fs from 'fs';
import * as path from 'path';

const EXPORT_DIR = path.join(__dirname, '..', 'export');

interface LoadStats {
    collection: string;
    attempted: number;
    succeeded: number;
    failed: number;
}

async function loadData() {
    console.log('\n🚀 Starting Snowflake Data Import...\n');
    console.log('='.repeat(60));

    const stats: LoadStats[] = [];

    try {
        // Load Stores first (referenced by Items)
        console.log('\n🏪 Loading Stores...');
        const storesPath = path.join(EXPORT_DIR, 'stores.json');
        if (fs.existsSync(storesPath)) {
            const stores = JSON.parse(fs.readFileSync(storesPath, 'utf-8'));
            const storeStats: LoadStats = { collection: 'Stores', attempted: stores.length, succeeded: 0, failed: 0 };

            for (const store of stores) {
                try {
                    await snowflakeService.addStore(store.name, store.section);
                    storeStats.succeeded++;
                } catch (error) {
                    console.error(`   ❌ Failed to load store ${store.name}:`, error);
                    storeStats.failed++;
                }
            }
            stats.push(storeStats);
            console.log(`   ✅ Loaded ${storeStats.succeeded}/${storeStats.attempted} stores`);
        } else {
            console.log('   ⚠️ stores.json not found, skipping...');
        }

        // Load Items
        console.log('\n📦 Loading Items...');
        const itemsPath = path.join(EXPORT_DIR, 'items.json');
        if (fs.existsSync(itemsPath)) {
            const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
            const itemStats: LoadStats = { collection: 'Items', attempted: items.length, succeeded: 0, failed: 0 };

            for (const item of items) {
                try {
                    // Remove id and lastUpdated as they'll be regenerated
                    const { id, lastUpdated, ...itemData } = item;
                    await snowflakeService.addItem(itemData);
                    itemStats.succeeded++;

                    if (itemStats.succeeded % 10 === 0) {
                        process.stdout.write(`\r   Progress: ${itemStats.succeeded}/${itemStats.attempted}`);
                    }
                } catch (error) {
                    console.error(`\n   ❌ Failed to load item ${item.name}:`, error);
                    itemStats.failed++;
                }
            }
            stats.push(itemStats);
            console.log(`\n   ✅ Loaded ${itemStats.succeeded}/${itemStats.attempted} items`);
        } else {
            console.log('   ⚠️ items.json not found, skipping...');
        }

        // Load Transactions
        console.log('\n💳 Loading Transactions...');
        const transactionsPath = path.join(EXPORT_DIR, 'transactions.json');
        if (fs.existsSync(transactionsPath)) {
            const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf-8'));
            const txStats: LoadStats = { collection: 'Transactions', attempted: transactions.length, succeeded: 0, failed: 0 };

            for (const transaction of transactions) {
                try {
                    const { id, ...txData } = transaction;
                    await snowflakeService.createTransaction(txData);
                    txStats.succeeded++;

                    if (txStats.succeeded % 10 === 0) {
                        process.stdout.write(`\r   Progress: ${txStats.succeeded}/${txStats.attempted}`);
                    }
                } catch (error) {
                    console.error(`\n   ❌ Failed to load transaction ${transaction.invoiceNumber}:`, error);
                    txStats.failed++;
                }
            }
            stats.push(txStats);
            console.log(`\n   ✅ Loaded ${txStats.succeeded}/${txStats.attempted} transactions`);
        } else {
            console.log('   ⚠️ transactions.json not found, skipping...');
        }

        // Load Activities
        console.log('\n📋 Loading Activities...');
        const activitiesPath = path.join(EXPORT_DIR, 'activities.json');
        if (fs.existsSync(activitiesPath)) {
            const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'));
            const actStats: LoadStats = { collection: 'Activities', attempted: activities.length, succeeded: 0, failed: 0 };

            for (const activity of activities) {
                try {
                    await snowflakeService.logActivity(
                        activity.user,
                        activity.action,
                        activity.target,
                        activity.type,
                        activity.section
                    );
                    actStats.succeeded++;

                    if (actStats.succeeded % 50 === 0) {
                        process.stdout.write(`\r   Progress: ${actStats.succeeded}/${actStats.attempted}`);
                    }
                } catch (error) {
                    console.error(`\n   ❌ Failed to load activity:`, error);
                    actStats.failed++;
                }
            }
            stats.push(actStats);
            console.log(`\n   ✅ Loaded ${actStats.succeeded}/${actStats.attempted} activities`);
        } else {
            console.log('   ⚠️ activities.json not found, skipping...');
        }

        // Load Purchase Orders
        console.log('\n📝 Loading Purchase Orders...');
        const ordersPath = path.join(EXPORT_DIR, 'orders.json');
        if (fs.existsSync(ordersPath)) {
            const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
            const poStats: LoadStats = { collection: 'Purchase Orders', attempted: orders.length, succeeded: 0, failed: 0 };

            for (const order of orders) {
                try {
                    const { id, ...orderData } = order;
                    await snowflakeService.createOrder(orderData);
                    poStats.succeeded++;
                } catch (error) {
                    console.error(`   ❌ Failed to load order ${order.poNumber}:`, error);
                    poStats.failed++;
                }
            }
            stats.push(poStats);
            console.log(`   ✅ Loaded ${poStats.succeeded}/${poStats.attempted} purchase orders`);
        } else {
            console.log('   ⚠️ orders.json not found, skipping...');
        }

        // Print Summary
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ IMPORT COMPLETE!\n');
        console.log('Summary:');
        console.log('-'.repeat(60));

        let totalAttempted = 0;
        let totalSucceeded = 0;
        let totalFailed = 0;

        for (const stat of stats) {
            totalAttempted += stat.attempted;
            totalSucceeded += stat.succeeded;
            totalFailed += stat.failed;

            const status = stat.failed > 0 ? '⚠️' : '✅';
            console.log(`${status} ${stat.collection.padEnd(20)} ${stat.succeeded}/${stat.attempted} (${stat.failed} failed)`);
        }

        console.log('-'.repeat(60));
        console.log(`Total: ${totalSucceeded}/${totalAttempted} records (${totalFailed} failed)`);

        if (totalFailed > 0) {
            console.log('\n⚠️  Some records failed to import. Check error messages above.');
        }

        console.log('\n🎯 Next Step: Verify data in Snowflake and test your application\n');

    } catch (error) {
        console.error('\n❌ Import failed with error:', error);
        process.exit(1);
    }
}

// Check prerequisites
console.log('Checking prerequisites...');

if (!process.env.SNOWFLAKE_ACCOUNT) {
    console.error('❌ SNOWFLAKE_ACCOUNT environment variable not set!');
    console.error('   Please configure .env.local with your Snowflake credentials.');
    process.exit(1);
}

if (!fs.existsSync(EXPORT_DIR)) {
    console.error(`❌ Export directory not found: ${EXPORT_DIR}`);
    console.error('   Please run export-cosmos-data.ts first!');
    process.exit(1);
}

console.log('✅ Prerequisites check passed\n');

// Run the import
loadData().catch(console.error);
