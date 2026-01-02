"use server";

import { snowflakeService as azureService } from "@/lib/snowflakeService";
import { FDC_SEED_DATA } from "@/lib/seedData";

// Simplified: Use same 50 items repeated across stores with different quantities/batches
const generateVariation = (baseItem: any, storeIndex: number) => {
    const randomVariation = Math.floor(Math.random() * 500);
    return {
        ...baseItem,
        quantity: baseItem.quantity + randomVariation - 250,
        batchNumber: `${baseItem.batchNumber}-S${storeIndex}`,
    };
};

/**
 * Server action to clear old data and seed fresh realistic data
 *
 * IMPORTANT: Admins DO NOT have inventory - they only manage sub-stores
 * Only retailer stores get seeded with items
 *
 * 50 items per retailer store × 3 stores per section = 150 items per section
 * Total: 450 items (across 9 retailer stores)
 *
 * Store IDs are RETAILER user IDs from lib/auth.ts:
 * - FDC: psd-r1, psd-r2, psd-r3 (Central Store A, B, C)
 * - Hospital: hosp-r1, hosp-r2, hosp-r3 (City General, Rural PHC 1, 2)
 * - NGO: ngo-r1, ngo-r2, ngo-r3 (Relief Camp Alpha, Beta, Mobile Unit 1)
 */
export async function seedFreshData() {
    try {
        console.log("🌱 Starting fresh data seeding...");

        // Define ONLY retailer stores - Admins don't have inventory!
        const storesBySection = {
            FDC: [
                "psd-r1",     // Central Store A
                "psd-r2",     // Central Store B
                "psd-r3"      // Central Store C
            ],
            Hospital: [
                "hosp-r1",    // City General
                "hosp-r2",    // Rural PHC 1
                "hosp-r3"     // Rural PHC 2
            ],
            NGO: [
                "ngo-r1",     // Relief Camp Alpha
                "ngo-r2",     // Relief Camp Beta
                "ngo-r3"      // Mobile Unit 1
            ]
        };

        // Step 1: Clear ALL old data from all sections
        console.log("🗑️ Clearing ALL old data from database...");

        const sections: ('FDC' | 'Hospital' | 'NGO')[] = ['FDC', 'Hospital', 'NGO'];
        let deletedCount = 0;

        for (const section of sections) {
            console.log(`📊 Fetching items from ${section}...`);
            const oldItems = await azureService.getAllItems(section);

            if (Array.isArray(oldItems)) {
                console.log(`  Found ${oldItems.length} items in ${section}`);

                for (const item of oldItems) {
                    try {
                        await azureService.deleteItem(item.id, section);
                        deletedCount++;
                    } catch (error) {
                        console.error(`  ❌ Failed to delete item ${item.id}:`, error);
                    }
                }
                console.log(`  ✅ Cleared ${oldItems.length} items from ${section}`);
            }
        }

        console.log(`✅ Total deleted: ${deletedCount} items\n`);

        // Step 2: Seed fresh data - 50 items per RETAILER store (admins don't get inventory)
        console.log("🌱 Seeding fresh data to RETAILER stores only...\n");

        let totalItems = 0;

        // Seed FDC (Food Distribution Center) data - 20 items × 3 stores = 60
        console.log("📦 Seeding FDC/Food Distribution Center data...");
        for (let storeIndex = 0; storeIndex < storesBySection.FDC.length; storeIndex++) {
            const storeId = storesBySection.FDC[storeIndex];
            console.log(`  Adding 20 items for store: ${storeId}`);

            // Use only first 20 items
            for (const item of FDC_SEED_DATA.slice(0, 20)) {
                await azureService.addItem({
                    ...generateVariation(item, storeIndex),
                    ownerId: storeId,
                    section: "FDC",
                    lastUpdated: new Date().toISOString()
                });
                totalItems++;
            }
        }
        console.log(`✅ Added ${storesBySection.FDC.length * FDC_SEED_DATA.length} items to FDC\n`);

        // Seed Hospital data - 20 items × 3 stores = 60
        console.log("🏥 Seeding Hospital data...");
        for (let storeIndex = 0; storeIndex < storesBySection.Hospital.length; storeIndex++) {
            const storeId = storesBySection.Hospital[storeIndex];
            console.log(`  Adding 20 items for store: ${storeId}`);

            // Use only first 20 items
            for (const item of FDC_SEED_DATA.slice(0, 20)) { // Reusing FDC items as template
                await azureService.addItem({
                    ...generateVariation(item, storeIndex),
                    name: `Medical ${item.name}`, // Prefix to differentiate
                    ownerId: storeId,
                    section: "Hospital",
                    lastUpdated: new Date().toISOString()
                });
                totalItems++;
            }
        }
        console.log(`✅ Added ${storesBySection.Hospital.length * 20} items to Hospital\n`);

        // Seed NGO data - 20 items × 3 stores = 60
        console.log("🤝 Seeding NGO data...");
        for (let storeIndex = 0; storeIndex < storesBySection.NGO.length; storeIndex++) {
            const storeId = storesBySection.NGO[storeIndex];
            console.log(`  Adding 20 items for store: ${storeId}`);

            // Use only first 20 items
            for (const item of FDC_SEED_DATA.slice(0, 20)) { // Reusing FDC items as template
                await azureService.addItem({
                    ...generateVariation(item, storeIndex),
                    name: `Relief ${item.name}`, // Prefix to differentiate
                    ownerId: storeId,
                    section: "NGO",
                    lastUpdated: new Date().toISOString()
                });
                totalItems++;
            }
        }
        console.log(`✅ Added ${storesBySection.NGO.length * 20} items to NGO\n`);

        console.log(`🎉 Data seeding completed! Total items: ${totalItems}`);
        console.log(`📊 Deleted: ${deletedCount} old items, Created: ${totalItems} new items`);

        return {
            success: true,
            message: `Successfully seeded ${totalItems} items to retailer stores (20 items × 3 stores × 3 sections). Admins can now manage these stores.`,
            stats: {
                deleted: deletedCount,
                FDC: storesBySection.FDC.length * 20,
                Hospital: storesBySection.Hospital.length * 20,
                NGO: storesBySection.NGO.length * 20,
                total: totalItems
            }
        };

    } catch (error) {
        console.error("❌ Error seeding data:", error);
        return {
            success: false,
            message: `Failed to seed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            stats: null
        };
    }
}
