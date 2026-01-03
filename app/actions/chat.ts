'use server';

import { snowflakeService as inventoryService, PurchaseOrder } from '@/lib/snowflakeService';
import { getInventoryContext, SYSTEM_PROMPT } from '@/lib/aiContext';
import { cookies } from 'next/headers';
import { getUser, SIMULATED_USERS } from '@/lib/auth';

// --- TOOL DEFINITIONS (Passed to System Prompt) ---
const TOOL_DEFINITIONS = `
You have access to the following tools to perform actions. 
To use a tool, you MUST output a JSON object in this EXACT format and NOTHING else:
{ "tool": "tool_name", "arguments": { ... } }

Available Tools:

1. create_purchase_order
   - Description: Create a new purchase order.
   - Arguments: { "itemName": string, "quantity": number, "vendor": string (optional) }

2. update_stock_level
   - Description: Update stock quantity (e.g., new arrival, cycle count).
   - Arguments: { "itemName": string, "newQuantity": number }

3. create_transaction
   - Description: Record a sale, usage, or damage.
   - Arguments: { 
       "type": "SALE" | "INTERNAL_USAGE" | "DAMAGE" | "EXPIRY",
       "items": [{ "itemName": string, "quantity": number }],
       "customerName": string (optional)
     }

4. navigate_to_page
   - Description: Redirect the user to a specific page.
   - Arguments: { "path": string }
   - paths: '/reports', '/dashboard', '/reorder', '/reports?tab=sales', '/reports?tab=inventory'

5. add_to_sales_cart
   - Description: Add items to the client-side cart (if user asks to "sell" or "add" but is browsing).
   - Arguments: { "items": [{ "itemName": string, "quantity": number }] }

IMPORTANT: 
- If the user asks a question, just answer as normal text.
- If the user asks to perform an action, output ONLY the JSON tool call.
`;

const AGENT_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

${TOOL_DEFINITIONS}
`;

// Simple token estimation: ~4 characters per token (rough approximation)
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// Truncate text to fit within token limit
function truncateToTokens(text: string, maxTokens: number): string {
    const estimatedTokens = estimateTokens(text);
    if (estimatedTokens <= maxTokens) {
        return text;
    }
    const targetChars = maxTokens * 4;
    return text.substring(0, targetChars);
}

export async function chatWithLedgerBot(messages: { role: 'user' | 'bot' | 'system', text: string }[], currentPath?: string) {
    try {
        // Token limit for Snowflake Cortex (8192 max, we'll target 6000 to be safe)
        const MAX_TOTAL_TOKENS = 6000;

        // 1. Get User Context
        const cookieStore = await cookies();
        const userId = cookieStore.get('simulated_user_id')?.value;
        const user = userId ? getUser(userId) : null;
        const section = user?.section || 'Hospital';

        // 1b. Get Store Mapping
        const storeMapping = SIMULATED_USERS.filter(u => u.section === section && u.role === 'retailer')
            .map(u => `- ${u.id}: ${u.name}`)
            .join('\n');

        // 2. Fetch Real-time Data
        const items = await inventoryService.getAllItems(section);

        // 3. Build Context (Limited to avoid hitting token limits)
        const contextData = getInventoryContext(Array.isArray(items) ? items : items.items, []);

        // 4. Estimate token usage and truncate accordingly
        const systemPromptTokens = estimateTokens(AGENT_SYSTEM_PROMPT);
        const lastUserMessage = messages[messages.length - 1].text;
        const userMessageTokens = estimateTokens(lastUserMessage);

        // Reserve tokens for system prompt, user message, and overhead (~500 tokens)
        const remainingTokens = MAX_TOTAL_TOKENS - systemPromptTokens - userMessageTokens - 500;

        // Allocate remaining tokens: 60% to context data, 40% to chat history
        const contextTokenLimit = Math.floor(remainingTokens * 0.6);
        const historyTokenLimit = Math.floor(remainingTokens * 0.4);

        // Truncate context data to fit token limit
        const truncatedContext = truncateToTokens(contextData, contextTokenLimit);

        // Truncate chat history (keep most recent messages)
        // Build history text from most recent to oldest, then reverse
        let historyText = '';
        let historyTokens = 0;
        const recentMessages = messages.slice(0, -1).reverse(); // Exclude last message, start from most recent

        for (const msg of recentMessages) {
            const msgText = `${msg.role.toUpperCase()}: ${msg.text}\n`;
            const msgTokens = estimateTokens(msgText);

            if (historyTokens + msgTokens > historyTokenLimit) {
                break; // Stop if we exceed the limit
            }

            historyText = msgText + historyText; // Prepend to maintain chronological order
            historyTokens += msgTokens;
        }

        // 5. Construct Prompt
        const fullPrompt = `
${AGENT_SYSTEM_PROMPT}

CURRENT CONTEXT:
User: ${user?.name || 'Guest'} (${section})
Current Page: ${currentPath}

DATA SNAPSHOT:
${truncatedContext.replace(/'/g, "''")}

STORE MAPPING:
${storeMapping}

CHAT HISTORY:
${historyText}

User: ${lastUserMessage}
        `;

        // Log token usage for debugging
        const totalEstimatedTokens = estimateTokens(fullPrompt);
        console.log(`🤖 Estimated tokens: ${totalEstimatedTokens} / ${MAX_TOTAL_TOKENS}`);

        // 6. Query Snowflake Cortex
        // Use 'llama3-70b' for best reasoning capability
        // We use BIND VARIABLES (?) to safely pass the prompt to Snowflake
        const sql = `SELECT SNOWFLAKE.CORTEX.COMPLETE(?, ?) as RESPONSE`;

        console.log("🤖 Cortex Agent: Thinking...");
        // Pass model name and prompt as binds
        const results = await inventoryService.runAIQuery(sql, ['llama3-70b', fullPrompt]);
        const responseText = results[0]?.response || "I couldn't process that.";

        // 7. Check for Tool Call (JSON detection)
        let toolCall: any = null;
        try {
            // Attempt to parse if it looks like JSON
            if (responseText.trim().startsWith('{') || responseText.includes('"tool":')) {
                // Heuristic to extract JSON if model chats around it
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    toolCall = JSON.parse(jsonMatch[0]);
                }
            }
        } catch (e) {
            // Not JSON, just normal text
        }

        if (toolCall && toolCall.tool) {
            console.log(`🛠️ Cortex Agent executing tool: ${toolCall.tool}`);
            return await executeTool(toolCall, section, user, items);
        }

        // Normal response
        return { reply: responseText };

    } catch (error) {
        console.error("LedgerBot Error:", error);
        return { reply: "I'm having trouble connecting to the AI brain (Snowflake Cortex). Please try again." };
    }
}

// --- TOOL EXECUTION LOGIC ---
// --- TOOL EXECUTION LOGIC MOVED TO actions/ai.ts ---
import { performAIAction } from './ai';

async function executeTool(toolCall: any, section: string, user: any, items: any) {
    // Adapter to match chat interface return type
    const result = await performAIAction(toolCall);

    // Build response object
    const response: any = {
        reply: result.success ? `✅ ${result.message}` : `❌ ${result.message}`
    };

    // Pass through redirectPath if exists
    if (result.redirectPath) {
        response.redirectPath = result.redirectPath;
    }

    // Pass through clientAction if exists
    if (result.clientAction) {
        response.clientAction = result.clientAction;
    }

    return response;
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
