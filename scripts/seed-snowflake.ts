/**
 * Seed Snowflake Database with Demo Data
 * 
 * Populates Snowflake with sample stores, items, transactions, and activities
 * for testing and hackathon demonstration
 */

import { snowflakeService } from '../lib/snowflakeService';
import { FDC_SEED_DATA } from '../lib/seedData';

const SECTIONS = ['FDC', 'Hospital', 'NGO'] as const;
const STORES_PER_SECTION = 3;

// Store names for each section
const STORE_NAMES = {
    FDC: ['Central Store A', 'Central Store B', 'Central Store C'],
    Hospital: ['City General Hospital', 'Rural PHC 1', 'Rural PHC 2'],
    NGO: ['Relief Camp Alpha', 'Relief Camp Beta', 'Mobile Unit 1']
};

async function seedDatabase() {
    console.log('\n🌱 Seeding Snowflake Database with Demo Data...\n');
    console.log('='.repeat(60));

    try {
        // Step 1: Create Stores
        console.log('\n🏪 Creating Stores...');
        const storeMap: Record<string, string> = {};

        for (const section of SECTIONS) {
            for (const storeName of STORE_NAMES[section]) {
                const store = await snowflakeService.addStore(storeName, section);
                if (store) {
                    storeMap[storeName] = store.id;
                    console.log(`   ✅ Created store: ${storeName} (${section})`);
                }
            }
        }

        // Step 2: Add Items (15 items per store = 135 total)
        console.log('\n📦 Adding Inventory Items...');
        let itemCount = 0;

        for (const section of SECTIONS) {
            for (const storeName of STORE_NAMES[section]) {
                const storeId = storeMap[storeName];

                // Add first 15 items from seed data to each store
                for (let i = 0; i < 15; i++) {
                    const seedItem = FDC_SEED_DATA[i % FDC_SEED_DATA.length];

                    await snowflakeService.addItem({
                        ...seedItem,
                        ownerId: storeId,
                        section: section,
                        // Vary quantities slightly
                        quantity: seedItem.quantity + Math.floor(Math.random() * 100) - 50,
                    });

                    itemCount++;
                    if (itemCount % 20 === 0) {
                        process.stdout.write(`\r   Progress: ${itemCount} items added...`);
                    }
                }
            }
        }
        console.log(`\n   ✅ Added ${itemCount} items across all stores`);

        // Step 3: Create Sample Transactions
        console.log('\n💳 Creating Sample Transactions...');
        let txCount = 0;

        for (const section of SECTIONS) {
            for (const storeName of STORE_NAMES[section]) {
                const storeId = storeMap[storeName];

                // Create 5 transactions per store
                for (let i = 0; i < 5; i++) {
                    const daysAgo = Math.floor(Math.random() * 30);
                    const date = new Date();
                    date.setDate(date.getDate() - daysAgo);

                    const transaction = {
                        invoiceNumber: `INV-${section}-${String(txCount).padStart(4, '0')}`,
                        date: date.toISOString(),
                        type: 'SALE' as const,
                        items: [
                            {
                                itemId: 'dummy-' + i,
                                name: FDC_SEED_DATA[i % 15].name,
                                quantity: Math.floor(Math.random() * 10) + 1,
                                unitPrice: FDC_SEED_DATA[i % 15].price,
                                tax: 0,
                                subtotal: FDC_SEED_DATA[i % 15].price * (Math.floor(Math.random() * 10) + 1),
                            }
                        ],
                        totalAmount: Math.floor(Math.random() * 500) + 100,
                        paymentMethod: ['CASH', 'UPI', 'CARD'][Math.floor(Math.random() * 3)] as any,
                        customerName: `Customer ${txCount + 1}`,
                        performedBy: storeId,
                        section: section,
                    };

                    await snowflakeService.createTransaction(transaction);
                    txCount++;
                }
            }
        }
        console.log(`   ✅ Created ${txCount} transactions`);

        // Step 4: Log Activities
        console.log('\n📋 Logging Activities...');
        let actCount = 0;

        for (const section of SECTIONS) {
            for (const storeName of STORE_NAMES[section]) {
                const storeId = storeMap[storeName];

                // Create some activities
                await snowflakeService.logActivity(
                    storeId,
                    'initialized store',
                    storeName,
                    'create',
                    section
                );

                await snowflakeService.logActivity(
                    storeId,
                    'added inventory',
                    '15 items',
                    'create',
                    section
                );

                await snowflakeService.logActivity(
                    storeId,
                    'processed sales',
                    '5 transactions',
                    'create',
                    section
                );

                actCount += 3;
            }
        }
        console.log(`   ✅ Logged ${actCount} activities`);

        // Step 5: Create Sample Purchase Orders
        console.log('\n📝 Creating Purchase Orders...');
        let poCount = 0;

        for (const section of SECTIONS) {
            const storeId = storeMap[STORE_NAMES[section][0]];

            // Create 2 purchase orders per section
            for (let i = 0; i < 2; i++) {
                const po = {
                    poNumber: `PO-${section}-${String(poCount + 1).padStart(3, '0')}`,
                    dateCreated: new Date().toISOString(),
                    status: ['PENDING', 'APPROVED'][Math.floor(Math.random() * 2)] as any,
                    items: [
                        {
                            itemId: 'dummy-po-' + i,
                            name: FDC_SEED_DATA[i].name,
                            currentStock: 100,
                            requestedQuantity: 500,
                            unit: FDC_SEED_DATA[i].unit || 'kg',
                            section: section,
                            price: FDC_SEED_DATA[i].price,
                        }
                    ],
                    totalEstimatedCost: FDC_SEED_DATA[i].price * 500,
                    vendor: FDC_SEED_DATA[i].supplier || 'Default Supplier',
                    createdBy: storeId,
                    notes: 'Demo purchase order for testing',
                };

                await snowflakeService.createOrder(po);
                poCount++;
            }
        }
        console.log(`   ✅ Created ${poCount} purchase orders`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ DATABASE SEEDING COMPLETE!\n');
        console.log('Summary:');
        console.log(`   - Stores: ${Object.keys(storeMap).length}`);
        console.log(`   - Items: ${itemCount}`);
        console.log(`   - Transactions: ${txCount}`);
        console.log(`   - Activities: ${actCount}`);
        console.log(`   - Purchase Orders: ${poCount}`);
        console.log('\n🎯 Your Snowflake database is ready for the hackathon!');
        console.log('\n💡 Next: Run `npm run dev` to start your app\n');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeding
console.log('⚙️  Connecting to Snowflake...');
seedDatabase().catch(console.error);
