import { snowflakeService } from "@/lib/snowflakeService";
import { SYSTEM_PROMPT } from "@/lib/aiContext";

// Interface for AI response
export interface StockInsight {
    sentiment: "positive" | "negative" | "neutral" | "critical" | "warning";
    summary: string;
    actionableSuggestion: string;
    affectedItems?: string[];
    suggestedToolAction?: { tool: string; arguments: any };
}

export class AIService {
    private model: string = "llama3-70b"; // Snowflake Cortex Model

    // Generate a quick insight for the dashboard banner
    async getDashboardInsight(inventoryCtx: string): Promise<StockInsight> {
        try {
            // Enhanced prompt for "AI-First" decision making
            const prompt = `
            You are an expert AI Supply Chain Manager. Your goal is to optimize inventory and prevent stockouts.
            
            Analyze the following inventory snapshot and Identify the SINGLE most critical action.
            Prioritize: 
            1. "Critical" stock (< 10 units) -> Suggest Reorder.
            2. "Expired" items -> Suggest Removal.
            3. "Overstock" -> Suggest Sale/Promotion.
            
            Data Snapshot:
            ${inventoryCtx.substring(0, 5000).replace(/'/g, "''")} ... (truncated if long)

            Usage instructions:
            Return ONLY a valid JSON object. Do not include any markdown formatting.
            Structure:
            {
                "sentiment": "critical" | "warning" | "positive" | "neutral",
                "summary": "Urgent: [Item] is critically low",
                "actionableSuggestion": "Create PO for 50 units from [Vendor]",
                "affectedItems": ["Item Name"],
                "suggestedToolAction": { "tool": "create_purchase_order", "arguments": { "itemName": "Name", "quantity": 50 } } (Optional)
            }
            
            Available Tools for "suggestedToolAction":
            1. create_purchase_order(itemName, quantity, vendor) -> Use for Low Stock.
            2. navigate_to_page(path) -> Use for 'Check Waste Report' (/reports?tab=waste) or 'Review' (/reports).
            `;

            // Use Snowflake Cortex COMPLETE function
            // Note: response_format is supported in some regions/models, but prompting for JSON is safer cross-region
            const sql = `
                SELECT SNOWFLAKE.CORTEX.COMPLETE(
                    '${this.model}',
                    '${prompt}'
                ) as RESPONSE
            `;

            const results = await snowflakeService.runAIQuery(sql);

            if (results && results.length > 0 && results[0].response) {
                const content = results[0].response;
                // Clean up markdown if model adds it
                const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanContent) as StockInsight;
            }
            throw new Error("Empty response from Cortex AI");

        } catch (error) {
            console.error("Cortex AI Service Error:", error);
            return this.generateOfflineInsight(inventoryCtx);
        }
    }

    // Chat with data
    async chatWithData(userMessage: string, context: string): Promise<string> {
        try {
            const fullPrompt = `${SYSTEM_PROMPT}\n\nData Context:\n${context.replace(/'/g, "''")}\n\nUser Question:\n${userMessage.replace(/'/g, "''")}`;

            const sql = `
                SELECT SNOWFLAKE.CORTEX.COMPLETE(
                    '${this.model}',
                    '${fullPrompt}'
                ) as RESPONSE
            `;

            const results = await snowflakeService.runAIQuery(sql);
            if (results && results.length > 0 && results[0].response) {
                return results[0].response;
            }
            return "I couldn't process that.";
        } catch (error: any) {
            console.error("Cortex Chat Error:", error);
            return `AI Error: ${error.message || "Unknown error"}. Check Snowflake Cortex availability.`;
        }
    }


    private generateOfflineInsight(context: string): StockInsight {
        // Parsing context. Context might be JSON or plain text depending on caller.
        // We need to detect what KIND of data this is.
        // Sales data usually has "Transaction" or "Revenue". Inventory has "Stock" or "Quantity".

        let sentiment: StockInsight['sentiment'] = 'neutral';
        let summary = " Analyzing local data...";
        let suggestion = "Review the detailed table below.";

        try {
            const lowerCtx = context.toLowerCase();

            // --- SALES DATA ANALYSIS ---
            if (lowerCtx.includes('transaction') || lowerCtx.includes('revenue') || lowerCtx.includes('sale')) {
                // Mock analysis for Sales strings
                const salesCount = (context.match(/Sale/gi) || []).length + (context.match(/Transaction/gi) || []).length;
                if (salesCount > 5) {
                    sentiment = 'positive';
                    summary = `High Activity: ~${salesCount} transactions recorded recently.`;
                    suggestion = "Ensure top-selling items are restocked immediately.";
                } else {
                    sentiment = 'neutral';
                    summary = `Steady Sales Activity.`;
                    suggestion = "Consider running a promotion to boost sales.";
                }
                return { sentiment, summary, actionableSuggestion: suggestion, affectedItems: [] };
            }

            // --- INVENTORY DATA ANALYSIS (Default) ---
            // Look for [CRITICAL], [Low], [EXPIRED] markers
            let criticalCount = 0;
            let warningCount = 0;
            let expiredCount = 0;
            let totalItems = 0;
            const criticalItems: string[] = [];

            const lines = context.split('\n');
            lines.forEach(line => {
                if (line.includes('[CRITICAL')) {
                    criticalCount++;
                    const match = line.match(/- (.*?):/);
                    if (match && match[1]) criticalItems.push(match[1]);
                } else if (line.includes('[Low]') || line.includes('[EXPIRING SOON]')) {
                    warningCount++;
                } else if (line.includes('[EXPIRED]')) {
                    expiredCount++;
                }
                if (line.trim().startsWith('- ')) {
                    totalItems++;
                }
            });

            if (criticalCount > 0) {
                return {
                    sentiment: "critical",
                    summary: `⚠️ Attention: ${criticalCount} items are critically low.`,
                    actionableSuggestion: `Reorder: ${criticalItems.slice(0, 3).join(', ')}...`,
                    affectedItems: criticalItems
                };
            } else if (expiredCount > 0) {
                return {
                    sentiment: "critical",
                    summary: `Waste Alert: ${expiredCount} items have expired.`,
                    actionableSuggestion: "Remove expired stock immediately.",
                    affectedItems: []
                };
            } else {
                return {
                    sentiment: "positive",
                    summary: `Inventory Health is Good (${totalItems} items).`,
                    actionableSuggestion: "Maintain current stock levels.",
                    affectedItems: []
                };
            }

        } catch (e) {
            console.warn("Failed to parse offline context", e);
            return {
                sentiment: "neutral",
                summary: "System Online. Data available.",
                actionableSuggestion: "Check reports for details.",
                affectedItems: []
            };
        }
    }
}

export const aiService = new AIService();
