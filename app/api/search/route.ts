import { NextResponse } from 'next/server';
import { snowflakeService as azureService } from '@/lib/snowflakeService';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { SIMULATED_USERS } from '@/lib/auth';

// Input Validation Schema using Zod
const searchSchema = z.object({
    query: z.string().max(100, "Query too long").transform(val => val.toLowerCase().trim()),
    section: z.string().max(50).optional().default('all'),
    category: z.string().max(50).optional().default('all'),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Get current user from cookies
        const cookieStore = await cookies();
        const userId = cookieStore.get('simulated_user_id')?.value;

        if (!userId) {
            return NextResponse.json({
                results: [],
                count: 0,
                error: "Unauthorized - Please log in"
            }, { status: 401 });
        }

        const currentUser = SIMULATED_USERS.find(u => u.id === userId);

        if (!currentUser) {
            return NextResponse.json({
                results: [],
                count: 0,
                error: "User not found"
            }, { status: 401 });
        }

        console.log('🔍 Search initiated by:', currentUser.name, '| Role:', currentUser.role, '| Section:', currentUser.section);

        // Validate inputs
        const result = searchSchema.safeParse({
            query: searchParams.get('q') || '',
            section: searchParams.get('section') || 'all',
            category: searchParams.get('category') || 'all'
        });

        if (!result.success) {
            return NextResponse.json({
                results: [],
                count: 0,
                error: "Invalid Input",
                details: result.error.flatten()
            }, { status: 400 });
        }

        let { query, section, category } = result.data;

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [], count: 0, query });
        }

        // ENFORCE ROLE-BASED FILTERING
        // Admins can only see their section's data
        // Retailers can only see their own store data (filtered by ownerId)
        if (currentUser.role === 'admin') {
            // Force section to be user's section, ignore any 'all' request
            section = currentUser.section;
            console.log('🔒 Admin search restricted to section:', section);
        } else if (currentUser.role === 'retailer') {
            // Retailers see only their section
            section = currentUser.section;
            console.log('🔒 Retailer search restricted to section:', section);
        }

        // Fetch items from user's allowed section
        const itemsResult = await azureService.getAllItems(section);
        let allItems = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;

        console.log(`📦 Fetched ${allItems.length} items from section: ${section}`);

        // Additional filtering for retailers - only show items they own
        if (currentUser.role === 'retailer') {
            allItems = allItems.filter(item => item.ownerId === currentUser.id);
            console.log(`🔒 Retailer filter applied - ${allItems.length} items owned by user`);
        }

        // Filter items based on search query
        const results = allItems.filter(item => {
            const matchesQuery =
                item.name.toLowerCase().includes(query) ||
                item.id.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query));

            const matchesCategory = category === 'all' || item.category === category;

            return matchesQuery && matchesCategory;
        });

        // Sort by relevance (exact matches first, then partial matches)
        results.sort((a, b) => {
            const aExact = a.name.toLowerCase() === query ? 1 : 0;
            const bExact = b.name.toLowerCase() === query ? 1 : 0;
            if (aExact !== bExact) return bExact - aExact;

            const aStarts = a.name.toLowerCase().startsWith(query) ? 1 : 0;
            const bStarts = b.name.toLowerCase().startsWith(query) ? 1 : 0;
            return bStarts - aStarts;
        });

        // Limit results to 50
        const limitedResults = results.slice(0, 50);

        console.log(`✅ Returning ${limitedResults.length} search results (${results.length} total matches)`);

        return NextResponse.json({
            results: limitedResults,
            count: limitedResults.length,
            total: results.length,
            query,
            userSection: currentUser.section,
            userRole: currentUser.role
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search items', results: [], count: 0 },
            { status: 500 }
        );
    }
}
