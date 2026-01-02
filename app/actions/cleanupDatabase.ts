"use server";

import { CosmosClient } from "@azure/cosmos";

const ENDPOINT = process.env.AZURE_COSMOS_ENDPOINT;
const KEY = process.env.AZURE_COSMOS_KEY;
const DATABASE_NAME = "InventoryDB";

// Containers to DELETE (unused/obsolete)
const UNUSED_CONTAINERS = [
    "Items_PSD",              // Old name before FDC rename
    "Items_CentralStoreA",    // Store-specific (not used)
    "Items_CentralStoreB",
    "Items_CentralStoreC",
    "Items_City.General",
    "Items_MobileUnit1",
    "Items_ReliefCampAlpha",
    "Items_ReliefCampBeta",
    "Items_RuralPHC1",
    "Items_RuralPHC2",
    "Inventory",              // Duplicate
    "ActivityLogs",           // Duplicate
    "Stores"                  // Not populated
];

export async function cleanupDatabaseContainers() {
    if (!ENDPOINT || !KEY) {
        return {
            success: false,
            message: "Database configuration missing",
            deleted: []
        };
    }

    try {
        const client = new CosmosClient({ endpoint: ENDPOINT, key: KEY });
        const database = client.database(DATABASE_NAME);

        const deleted: string[] = [];
        const errors: string[] = [];

        console.log("🗑️ Starting database cleanup...");

        for (const containerName of UNUSED_CONTAINERS) {
            try {
                const container = database.container(containerName);
                await container.delete();
                deleted.push(containerName);
                console.log(`✅ Deleted: ${containerName}`);
            } catch (error: any) {
                if (error.code === 404) {
                    console.log(`ℹ️ Already deleted: ${containerName}`);
                } else {
                    errors.push(`${containerName}: ${error.message}`);
                    console.error(`❌ Failed to delete ${containerName}:`, error);
                }
            }
        }

        console.log(`🎉 Cleanup complete! Deleted ${deleted.length} containers`);

        return {
            success: true,
            message: `Successfully deleted ${deleted.length} unused containers`,
            deleted,
            errors: errors.length > 0 ? errors : undefined
        };
    } catch (error) {
        console.error("❌ Database cleanup failed:", error);
        return {
            success: false,
            message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            deleted: []
        };
    }
}
