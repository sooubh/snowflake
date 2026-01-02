"use server";

import { snowflakeService as azureService } from "@/lib/snowflakeService";

/**
 * Server action to fetch inventory in chunks with role-based filtering
 * - Admins: See ALL items in their section (all stores)
 * - Retailers: See only their own items (their store only)
 */
export async function getInventoryChunk(
    section: string,
    userId: string,
    role: string,
    pageSize: number = 50,
    continuationToken?: string
) {
    try {
        console.log(`\ud83d\udce6 Fetching chunk for ${role} in ${section}, pageSize: ${pageSize}, token: ${continuationToken ? 'YES' : 'NO'}`);

        const result = await azureService.getAllItems(section as 'FDC' | 'Hospital' | 'NGO', pageSize, continuationToken);

        if (typeof result === 'object' && 'items' in result) {
            // Paginated response
            const { items, continuationToken: newToken } = result;

            console.log(`\ud83d\udce6 Raw chunk: ${items.length} items loaded`);

            // Role-based filtering
            const filteredItems = role === 'admin'
                ? items.filter(i => i.section === section) // Admin sees ALL items in section
                : items.filter(i => i.ownerId === userId);  // Retailer sees only their items

            console.log(`\u2705 Filtered to: ${filteredItems.length} items (role: ${role})`);
            console.log(`\ud83d\udd17 Has next chunk: ${!!newToken}`);

            return {
                items: filteredItems,
                continuationToken: newToken
            };
        } else {
            // Non-paginated response (fallback)
            console.log(`\ud83d\udce6 Non-paginated: ${result.length} total items`);
            const filteredItems = role === 'admin'
                ? result.filter(i => i.section === section)
                : result.filter(i => i.ownerId === userId);

            console.log(`\u2705 Filtered to: ${filteredItems.length} items`);
            return { items: filteredItems, continuationToken: undefined };
        }
    } catch (error) {
        console.error('\u274c Error fetching inventory chunk:', error);
        return { items: [], continuationToken: undefined };
    }
}
