'use server';

import { aiService } from '@/services/AIService';
import { snowflakeService as inventoryService } from '@/lib/snowflakeService';
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
        const itemsResult = await inventoryService.getAllItems(section);
        const items = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
        const activities = await inventoryService.getRecentActivities(section);

        const context = getInventoryContext(items, activities);
        const response = await aiService.chatWithData(userMessage, context);
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
        const itemsResult = await inventoryService.getAllItems(section);
        const items = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
        // We only need items for the summary, but activities help context
        const context = getInventoryContext(items, []);

        const response = await aiService.getDashboardInsight(context);
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
        const response = await aiService.getDashboardInsight(contextData);
        return response;
    } catch (error) {
        console.error("Report Insight Action Error:", error);
        return null; // Logic in AI service handles fallback if parsing fails
    }
}
// Execute an AI Tool Action (Server-Side)
export async function performAIAction(toolCall: any) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('simulated_user_id')?.value;
        const user = userId ? getUser(userId) : null;
        const section = user?.section || 'Hospital';

        console.log(`🛠️ Performing AI Action: ${toolCall.tool} for ${user?.name}`);

        // Fetch fresh data for context needed by tools
        const itemsResult = await inventoryService.getAllItems(section);
        const itemList = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;

        const { tool, arguments: args } = toolCall;

        if (tool === "create_purchase_order") {
            const item = itemList.find((i: any) => i.name.toLowerCase().includes(args.itemName.toLowerCase()));
            if (!item) return { success: false, message: `Error: I couldn't find "${args.itemName}" in the inventory.` };

            await inventoryService.createOrder({
                poNumber: `PO-${Date.now()}`,
                status: 'PENDING',
                dateCreated: new Date().toISOString(),
                createdBy: user?.name || 'LedgerBot',
                vendor: args.vendor || item.supplier || 'Best Vendor',
                items: [{
                    itemId: item.id,
                    name: item.name,
                    currentStock: item.quantity,
                    requestedQuantity: args.quantity,
                    unit: item.unit || 'unit',
                    section: section,
                    price: item.price
                }]
            });
            return { success: true, message: `Created Purchase Order for ${args.quantity} ${item.name}.` };

        } else if (tool === "update_stock_level") {
            const item = itemList.find((i: any) => i.name.toLowerCase().includes(args.itemName.toLowerCase()));
            if (!item) return { success: false, message: `Error: I couldn't find "${args.itemName}".` };

            await inventoryService.updateItem(item.id, { quantity: args.newQuantity }, section);
            return { success: true, message: `Updated stock for ${item.name} to ${args.newQuantity}.` };

        } else if (tool === "create_transaction") {
            const transactionItems: any[] = [];
            let totalAmount = 0;
            const notFound: string[] = [];

            for (const req of args.items) {
                const item = itemList.find((i: any) => i.name.toLowerCase().includes(req.itemName.toLowerCase()));
                if (item) {
                    if (['SALE', 'INTERNAL_USAGE'].includes(args.type) && item.quantity < req.quantity) {
                        return { success: false, message: `Transaction Failed: Not enough stock for ${item.name}.` };
                    }

                    const price = item.price || 0;
                    const subtotal = price * req.quantity;
                    transactionItems.push({
                        itemId: item.id,
                        name: item.name,
                        quantity: req.quantity,
                        unitPrice: price,
                        tax: 0,
                        subtotal
                    });
                    totalAmount += subtotal;

                    // Update Inventory
                    await inventoryService.updateItem(item.id, { quantity: item.quantity - req.quantity }, section);

                } else {
                    notFound.push(req.itemName);
                }
            }

            if (notFound.length > 0) return { success: false, message: `Error: Could not find items: ${notFound.join(", ")}` };

            await inventoryService.createTransaction({
                invoiceNumber: `INV-${Date.now()}`,
                date: new Date().toISOString(),
                type: args.type,
                items: transactionItems,
                totalAmount,
                paymentMethod: 'CASH',
                section,
                performedBy: user?.name || 'LedgerBot',
                customerName: args.customerName
            });

            return { success: true, message: `Processed ${args.type} for $${totalAmount.toFixed(2)}.` };

        } else if (tool === "add_to_sales_cart") {
            // Validate and find items
            const cartItems: any[] = [];
            const notFound: string[] = [];

            for (const req of args.items) {
                const item = itemList.find((i: any) => i.name.toLowerCase().includes(req.itemName.toLowerCase()));
                if (item) {
                    if (item.quantity < req.quantity) {
                        return { success: false, message: `Not enough stock for ${item.name}. Available: ${item.quantity}` };
                    }
                    cartItems.push({
                        id: item.id,
                        name: item.name,
                        quantity: req.quantity,
                        price: item.price || 0,
                        unit: item.unit || 'unit'
                    });
                } else {
                    notFound.push(req.itemName);
                }
            }

            if (notFound.length > 0) {
                return { success: false, message: `Couldn't find: ${notFound.join(", ")}` };
            }

            // Return a client action for the frontend to handle
            return {
                success: true,
                message: `Added ${cartItems.map(i => `${i.quantity} ${i.name}`).join(', ')} to cart.`,
                clientAction: {
                    type: 'ADD_TO_SALES_CART',
                    data: { items: cartItems }
                }
            };

        } else if (tool === "navigate_to_page") {
            return { success: true, message: `Navigating...`, redirectPath: args.path };
        }

        return { success: false, message: `Unknown tool: ${tool}` };

    } catch (error: any) {
        console.error("Action Error:", error);
        return { success: false, message: `Action failed: ${error.message}` };
    }
}
