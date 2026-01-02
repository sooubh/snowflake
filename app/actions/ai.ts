'use server';

import { azureAIService } from '@/services/AzureAIService';
import { snowflakeService as azureService, StockItem  } from '@/lib/snowflakeService';
import { getInventoryContext } from '@/lib/aiContext';

import { cookies } from 'next/headers';
import { getUser } from '@/lib/auth';

// Start a chat with data
// Context is now auto-generated server-side for security and freshness
export async function chatWithDataAction(userMessage: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('simulated_user_id')?.value;
        const user = userId ? getUser(userId) : null;

        let section = "Hospital"; // Default fallback
        if (user) {
            section = user.section;
        }

        // Fetch scoped data
        const itemsResult = await azureService.getAllItems(section);
        const items = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
        const activities = await azureService.getRecentActivities(section);

        const context = getInventoryContext(items, activities);
        const response = await azureAIService.chatWithData(userMessage, context);
        return response;
    } catch (error) {
        console.error("Action Error:", error);
        return "Sorry, I encountered an error processing your request.";
    }
}

// Get dashboard insight
// Get dashboard insight (Autonomously fetches data)
export async function getDashboardInsightAction() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('simulated_user_id')?.value;
        const user = userId ? getUser(userId) : null;
        const section = user?.section || 'Hospital';

        // Fetch fresh data
        const itemsResult = await azureService.getAllItems(section);
        const items = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
        // We only need items for the summary, but activities help context
        const context = getInventoryContext(items, []);

        const response = await azureAIService.getDashboardInsight(context);
        return response;
    } catch (error) {
        console.error("Action Error:", error);
        return null;
    }
}

// Get specific report insight (Takes context from client for specific tab data)
export async function getReportInsightAction(contextData: string) {
    try {
        // We trust the client to pass the string representation of the data they are viewing
        const response = await azureAIService.getDashboardInsight(contextData);
        return response;
    } catch (error) {
        console.error("Report Insight Action Error:", error);
        return null; // Logic in AI service handles fallback if parsing fails
    }
}
