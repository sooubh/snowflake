import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/aiContext";

// Interface for AI response
export interface StockInsight {
    sentiment: "positive" | "negative" | "neutral" | "critical";
    summary: string;
    actionableSuggestion: string;
    affectedItems?: string[];
}

export class AzureAIService {
    private client: OpenAI | null = null;
    private deploymentName: string = "";

    constructor() {
        this.initializeClient();
    }

    private initializeClient() {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/+$/, ""); // Remove trailing slash
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "";

        if (endpoint && apiKey && this.deploymentName) {
            // Check for placeholders
            if (endpoint.includes("YOUR_") || apiKey.includes("your_") || this.deploymentName.includes("your_")) {
                console.warn("⚠️ Azure OpenAI Credentials appear to be placeholders. Please update .env.local with your actual keys.");
                return;
            }

            try {
                this.client = new OpenAI({
                    apiKey: apiKey,
                    baseURL: `${endpoint}/openai/deployments/${this.deploymentName}`,
                    defaultQuery: { "api-version": "2025-01-01-preview" },
                    defaultHeaders: { "api-key": apiKey },
                });
                console.log("✅ Azure OpenAI Client Initialized");
            } catch (error) {
                console.error("❌ Failed to initialize Azure OpenAI Client", error);
            }
        } else {
            console.warn("⚠️ Azure OpenAI Credentials missing. AI features will use mock data.");
        }
    }

    // Generate a quick insight for the dashboard banner
    async getDashboardInsight(inventoryCtx: string): Promise<StockInsight> {
        if (!this.client) this.initializeClient();

        if (!this.client) {
            return this.generateOfflineInsight(inventoryCtx);
        }

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
            ${inventoryCtx.substring(0, 5000)} ... (truncated if long)

            Return JSON:
            {
                "sentiment": "critical" | "warning" | "positive" | "neutral",
                "summary": "Urgent: [Item] is critically low",
                "actionableSuggestion": "Create PO for 50 units from [Vendor]",
                "affectedItems": ["Item Name"]
            }
            `;

            const completion = await this.client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a precise JSON-only inventory assistant." },
                    { role: "user", content: prompt }
                ],
                model: this.deploymentName,
                response_format: { type: "json_object" },
                temperature: 0.2, // Lower temp for more deterministic actions
            });

            const content = completion.choices[0].message.content;
            if (content) {
                return JSON.parse(content) as StockInsight;
            }
            throw new Error("Empty response from AI");

        } catch (error) {
            console.error("Azure AI Error:", error);
            return this.generateOfflineInsight(inventoryCtx);
        }
    }

    // Chat with data
    async chatWithData(userMessage: string, context: string): Promise<string> {
        if (!this.client) this.initializeClient();

        if (!this.client) {
            return "I am currently in offline mode. Please configure Azure OpenAI credentials to chat with your real data.";
        }

        try {
            const completion = await this.client.chat.completions.create({
                messages: [
                    { role: "system", content: `${SYSTEM_PROMPT}\n\nData Context:\n${context}` },
                    { role: "user", content: userMessage }
                ],
                model: this.deploymentName,
                temperature: 0.5,
            });
            return completion.choices[0].message.content || "I couldn't process that.";
        } catch (error: any) {
            console.error("Chat Error:", error);
            return `Connection Error: ${error.message || "Unknown error"}. Check your .env.local configuration.`;
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

export const azureAIService = new AzureAIService();
