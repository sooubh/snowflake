'use server';

import OpenAI from 'openai';
import { snowflakeService as azureService } from '@/lib/snowflakeService';
import { getInventoryContext, SYSTEM_PROMPT } from '@/lib/aiContext';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/auth';

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "dummy",
    baseURL: process.env.AZURE_OPENAI_ENDPOINT ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo'}` : undefined,
    defaultQuery: process.env.AZURE_OPENAI_ENDPOINT ? { 'api-version': '2023-05-15' } : undefined,
    defaultHeaders: process.env.AZURE_OPENAI_ENDPOINT ? { 'api-key': process.env.AZURE_OPENAI_API_KEY } : undefined,
});

// Define Tools
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "create_purchase_order",
            description: "Create a new purchase order for an item. Use this when the user wants to buy, order, or restock items.",
            parameters: {
                type: "object",
                properties: {
                    itemName: { type: "string", description: "The name of the item to order" },
                    quantity: { type: "number", description: "The quantity to order" },
                    vendor: { type: "string", description: "The vendor to order from (optional)" }
                },
                required: ["itemName", "quantity"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "update_stock_level",
            description: "Update the stock quantity of an item. Use this when the user reports new stock arrival or manual adjustments.",
            parameters: {
                type: "object",
                properties: {
                    itemName: { type: "string", description: "The name of the item to update" },
                    newQuantity: { type: "number", description: "The new total quantity" }
                },
                required: ["itemName", "newQuantity"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "navigate_to_page",
            description: "Navigate the user to a specific page in the application.",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "The relative path to navigate to (e.g., '/reports', '/dashboard', '/reorder', '/reports?tab=sales')"
                    }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "add_to_sales_cart",
            description: "Add items to the sales cart. Only use this when the user is explicitly on the Sales Page or asks to add items to the current order/cart.",
            parameters: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                itemName: { type: "string" },
                                quantity: { type: "number" }
                            },
                            required: ["itemName", "quantity"]
                        }
                    }
                },
                required: ["items"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_transaction",
            description: "Record a sale or usage transaction. Use this when the user says 'Sell 5 Aspirin' or 'Record usage of X'.",
            parameters: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                itemName: { type: "string" },
                                quantity: { type: "number" }
                            },
                            required: ["itemName", "quantity"]
                        },
                        description: "List of items to sell/use"
                    },
                    type: { type: "string", enum: ["SALE", "INTERNAL_USAGE", "DAMAGE", "EXPIRY"], description: "Type of transaction" },
                    customerName: { type: "string", description: "Name of customer (optional)" }
                },
                required: ["items", "type"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "analyze_inventory_health",
            description: "Perform a deep analysis of inventory health, identifying critical items, expiry risks, and suggestions.",
            parameters: {
                type: "object",
                properties: {
                    focus: { type: "string", enum: ["all", "expiry", "critical"], description: "Focus area for analysis" }
                }
            }
        }
    }
];

// Update signature to accept full history and current path
export async function chatWithLedgerBot(messages: { role: 'user' | 'bot' | 'system', text: string }[], currentPath?: string) {
    try {
        // 1. Get User Context
        const cookieStore = await cookies();
        const userId = cookieStore.get('simulated_user_id')?.value;
        const user = userId ? getUser(userId) : null;
        const section = user?.section || 'Hospital';

        // 2. Fetch Real-time Data
        const [itemsResult, activities] = await Promise.all([
            azureService.getAllItems(section),
            azureService.getRecentActivities(section, 10)
        ]);

        // Extract items array from the result
        const items = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;

        // 3. Build Context String
        const contextData = getInventoryContext(items, activities);

        // 4. Call AI with Fallback
        const hasKeys = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;

        if (!hasKeys) {
            console.warn("LedgerBot: No API keys found. Defaulting to Simulation Mode.");
            return generateSimulationResponse(items, section, messages[messages.length - 1].text);
        }

        // Format messages for OpenAI
        const formattedHistory = messages.map(m => ({
            role: m.role === 'bot' ? 'assistant' : m.role,
            content: m.text
        }));

        try {
            const runner = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "system", content: `CURRENT USER: ${user?.name || 'Guest'} (${user?.role || 'Viewer'}). SECTION: ${section}` },
                    { role: "system", content: contextData },
                    ...formattedHistory
                ] as any,
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-35-turbo",
                temperature: 0.7,
                max_tokens: 500,
                tools: tools,
                tool_choice: "auto",
            });

            const msg = runner.choices[0].message;

            // Handle Function Calling
            if (msg.tool_calls && msg.tool_calls.length > 0) {
                const toolCall = msg.tool_calls[0] as any;
                const fnName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                let toolResult = "";

                if (fnName === "create_purchase_order") {
                    // Match item ID from name (fuzzy match)
                    const item = items.find(i => i.name.toLowerCase().includes(args.itemName.toLowerCase()));
                    if (item) {
                        await azureService.createOrder({
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
                        toolResult = `Successfully created Purchase Order for ${args.quantity} ${item.name}.`;
                    } else {
                        toolResult = `Error: Could not find item "${args.itemName}" in inventory.`;
                    }
                } else if (fnName === "update_stock_level") {
                    const item = items.find(i => i.name.toLowerCase().includes(args.itemName.toLowerCase()));
                    if (item) {
                        await azureService.updateItem(item.id, { quantity: args.newQuantity }, section);
                        toolResult = `Successfully updated stock for ${item.name} to ${args.newQuantity}.`;
                    } else {
                        toolResult = `Error: Could not find item "${args.itemName}".`;
                    }
                } else if (fnName === "create_transaction") {
                    // Handle Sale / Usage
                    const transactionItems: any[] = [];
                    let totalAmount = 0;
                    const itemsNotFound: string[] = [];

                    for (const reqItem of args.items) {
                        const stockItem = items.find(i => i.name.toLowerCase().includes(reqItem.itemName.toLowerCase()));
                        if (stockItem) {
                            if (stockItem.quantity < reqItem.quantity) {
                                toolResult += `Warning: Not enough stock for ${stockItem.name} (Has: ${stockItem.quantity}, Needed: ${reqItem.quantity}). Transaction aborted. `;
                                itemsNotFound.push("Stock Low"); // Hacky break
                                break;
                            }
                            const price = stockItem.price || 0;
                            const subtotal = price * reqItem.quantity;
                            transactionItems.push({
                                itemId: stockItem.id,
                                name: stockItem.name,
                                quantity: reqItem.quantity,
                                unitPrice: price,
                                tax: 0,
                                subtotal: subtotal
                            });
                            totalAmount += subtotal;

                            // Decrement Stock
                            await azureService.updateItem(stockItem.id, { quantity: stockItem.quantity - reqItem.quantity }, section);

                        } else {
                            itemsNotFound.push(reqItem.itemName);
                        }
                    }

                    if (itemsNotFound.length > 0 && !toolResult.includes("aborted")) {
                        toolResult = `Error: Could not find items: ${itemsNotFound.join(", ")}`;
                    } else if (!toolResult.includes("aborted")) {
                        await azureService.createTransaction({
                            invoiceNumber: `INV-${Date.now()}`,
                            date: new Date().toISOString(),
                            type: args.type,
                            items: transactionItems,
                            totalAmount: totalAmount,
                            paymentMethod: 'CASH', // Default
                            section: section,
                            performedBy: user?.name || 'LedgerBot',
                            customerName: args.customerName
                        });
                        toolResult = `Successfully processed ${args.type} for ${transactionItems.length} items. Total: $${totalAmount}`;
                    }

                } else if (fnName === "analyze_inventory_health") {
                    const critical = items.filter(i => i.quantity <= (i.minQuantity || 10));
                    const expired = items.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date());

                    toolResult = `Analysis Results:\n- Critical Items: ${critical.length} (${critical.map(i => i.name).join(', ')})\n- Expired Items: ${expired.length}\n- Total Value: $${items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}`;
                }
                else if (fnName === "navigate_to_page") {
                    return { reply: `Navigating to ${args.path}...`, redirectPath: args.path };
                } else if (fnName === "add_to_sales_cart") {
                    // We don't execute DB function here, we tell client to do it
                    // Just return the data
                    return {
                        reply: `Adding ${args.items.map((i: any) => `${i.quantity} ${i.itemName}`).join(", ")} to cart...`,
                        clientAction: { type: 'ADD_TO_CART', data: args.items }
                    };
                }

                // Call AI again with result
                const secondResponse = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "system", content: contextData },
                        ...formattedHistory,
                        msg,
                        { role: "tool", tool_call_id: toolCall.id, content: toolResult }
                    ] as any,
                    model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-35-turbo",
                });
                return { reply: secondResponse.choices[0].message.content || "Task completed." };
            }

            return { reply: msg.content || "I'm not sure how to answer that." };
        } catch (apiError) {
            console.error("LedgerBot API Error (Falling back to simulation):", apiError);
            return generateSimulationResponse(items, section, messages[messages.length - 1].text);
        }

    } catch (error) {
        console.error("LedgerBot Critical Error:", error);
        return { reply: "I'm having trouble retrieving data right now. Please try again later." };
    }
}

// Helper: Generate a "Simulated" but data-aware response
function generateSimulationResponse(items: any[], section: string, query: string) {
    const lowerQuery = query.toLowerCase();
    const criticalCount = items.filter((i: any) => i.quantity <= 10).length;
    const lowCount = items.filter((i: any) => i.quantity <= 50 && i.quantity > 10).length;

    // Default Fallback
    let reply = `I'm currently in **Offline Mode** (no AI connection), but I can still check your local data for **${section}**.\n\n`;

    // 1. Stock / Inventory Status
    if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('count') || lowerQuery.includes('how many')) {
        reply += `Here is your current inventory summary:\n\n` +
            `- **Total Items:** ${items.length}\n` +
            `- **Critical Low:** ${criticalCount} items (Need attention)\n` +
            `- **Running Low:** ${lowCount} items\n\n` +
            `You can view the full details in the **Reports** tab.`;
    }
    // 2. Greetings
    else if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
        reply = `Hi there! 👋 I'm **LedgerBot**.\n\nI'm running in offline mode right now, but I can still check your **stock levels** or summarize **critical items**. Just ask!`;
    }
    // 3. Help / Capabilities
    else if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
        reply += `Since I'm offline, I can't answer complex questions, but I can:\n` +
            `- Summarize your stock status\n` +
            `- Count critical items\n` +
            `- Guide you to reports`;
    }
    // 4. Waste / Expiry
    else if (lowerQuery.includes('waste') || lowerQuery.includes('expiry') || lowerQuery.includes('expired')) {
        const expiredCount = items.filter((i: any) => i.status === 'EXPIRED').length; // Assuming status check or date check logic exists
        reply += `**Waste Analysis (Offline):**\n\n` +
            `- **Expired Items:** ${expiredCount} (Check Waste Report)\n` +
            `- **Overstocked:** ${items.filter((i: any) => i.quantity > 500).length} items\n\n` +
            `I recommend reviewing the **Critical Reports > Waste Reduction** tab to minimize losses.`;
    }
    // 5. Reorder / Procurement
    else if (lowerQuery.includes('reorder') || lowerQuery.includes('buy') || lowerQuery.includes('purchase')) {
        reply += `**Reorder Recommendations:**\n\n` +
            `You have **${criticalCount} critical items** that need immediate reordering.\n` +
            `Go to the **Reorder** page to generate automated Purchase Orders for these items.`;
    }
    // 6. Unknown / Fallback
    else {
        reply += `I found **${items.length} items** in your records.\n\n` +
            `**Quick Stats:**\n` +
            `- **Critical:** ${criticalCount} items\n` +
            `- **Low Stock:** ${lowCount} items\n\n` +
            `**Status:** ${criticalCount > 0 ? '⚠️ High Risk (Stock Protection Needed)' : '✅ Healthy'}\n\n` +
            `*(Note: Connect an OpenAI API Key in .env.local for full AI chat capabilities)*`;
    }

    return { reply };
}
