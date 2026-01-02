/**
 * Export Data from Azure Cosmos DB
 * 
 * This script exports all data from Cosmos DB to JSON files in the export/ directory
 */

import { azureService } from '../lib/azureDefaults';
import * as fs from 'fs';
import * as path from 'path';

const EXPORT_DIR = path.join(__dirname, '..', 'export');

async function exportData() {
    console.log('\n📦 Starting Cosmos DB Data Export...\n');
    console.log('='  .repeat(60));

    // Ensure export directory exists
    if (!fs.existsSync(EXPORT_DIR)) {
        fs.mkdirSync(EXPORT_DIR, { recursive: true });
        console.log(`✅ Created export directory: ${EXPORT_DIR}`);
    }

    try {
        // Export Items
        console.log('\n📄 Exporting Items...');
        const items = await azureService.getGlobalItems();
        const itemsPath = path.join(EXPORT_DIR, 'items.json');
        fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));
        console.log(`   ✅ Exported ${items.length} items to items.json`);

        // Export Transactions
        console.log('\n💳 Exporting Transactions...');
        const transactions = await azureService.getAllTransactions();
        const transactionsPath = path.join(EXPORT_DIR, 'transactions.json');
        fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));
        console.log(`   ✅ Exported ${transactions.length} transactions to transactions.json`);

        // Export Activities
        console.log('\n📋 Exporting Activities...');
        const activities = await azureService.getAllActivities();
        const activitiesPath = path.join(EXPORT_DIR, 'activities.json');
        fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2));
        console.log(`   ✅ Exported ${activities.length} activities to activities.json`);

        // Export Purchase Orders
        console.log('\n📝 Exporting Purchase Orders...');
        const orders = await azureService.getOrders();
        const ordersPath = path.join(EXPORT_DIR, 'orders.json');
        fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
        console.log(`   ✅ Exported ${orders.length} purchase orders to orders.json`);

        // Export Stores
        console.log('\n🏪 Exporting Stores...');
        const stores = await azureService.getSystemStores();
        const storesPath = path.join(EXPORT_DIR, 'stores.json');
        fs.writeFileSync(storesPath, JSON.stringify(stores, null, 2));
        console.log(`   ✅ Exported ${stores.length} stores to stores.json`);

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ EXPORT COMPLETE!\n');
        console.log(`📁 All data saved to: ${EXPORT_DIR}`);
        console.log('\nFiles created:');
        console.log(`   - items.json (${items.length} records)`);
        console.log(`   - transactions.json (${transactions.length} records)`);
        console.log(`   - activities.json (${activities.length} records)`);
        console.log(`   - orders.json (${orders.length} records)`);
        console.log(`   - stores.json (${stores.length} records)`);
        console.log('\n🎯 Next Step: Upload these files to Snowflake or run the load script\n');

    } catch (error) {
        console.error('\n❌ Export failed:', error);
        process.exit(1);
    }
}

// Run the export
exportData().catch(console.error);
