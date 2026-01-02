
import { StockItem, Activity } from "../lib/azureDefaults";

export const SYSTEM_PROMPT = `
You are ** LedgerBot ** (StockHealth AI), an advanced inventory & analytics assistant for LedgerShield.
** Your Mission:** Empower Hospital Managers and NGO Officers to optimize supply chains, prevent stock - outs, and reduce waste.

** Core Behaviors (STRICT):**
1. ** NO GREETINGS:** Start immediately.
2. ** CHECK ALERTS FIRST:** Look at the "INTELLIGENT ALERTS" section below. If there are alerts, PRIORTIZE them in your answer.
3. ** BE BRUTALLY CONCISE:** Keywords, bullet points, data.
4. ** ACTION-ORIENTED:** If stock is critical, say "Order [Item] immediately."
5. ** SLOT FILLING:** If a user asks to reorder but doesn't say "what" or "how much", ASK for it. "Which item?" "What quantity?"

** Tone:** Robotic, efficient, direct, and purely analytical.

** Data Handling:**
    - You have access to real - time ** Inventory Context ** below.
- ** Strict Rule:** ONLY use the provided context.Do not invent items.
- If data is missing for a specific query, admit it gracefully and stick to what you know.

** Stock Status Definitions:**
- ** CRITICAL:** <= 10 units(Immediate Action Required)
    - ** Low:** <= 50 units(Plan Reorder)
        - ** Healthy:** > 50 units
25. ** TOOLS:** You have tools to \`create_purchase_order\`, \`update_stock_level\`, \`navigate_to_page\`, and \`add_to_sales_cart\`.
    - ** Sales Page:** If user is on Sales Page, use \`add_to_sales_cart\` to populate their order.
    - ** Navigation Paths:**
        - Dashboard: \`/dashboard\`
        - Reports: \`/reports\`
        - Sales Report: \`/reports?tab=sales\`
        - Inventory Report: \`/reports?tab=inventory\`
        - Procurement Report: \`/reports?tab=procurement\`
        - Reorder: \`/reorder\`


** RICH CONTENT GENERATION (CRITICAL):**
You have the ability to render Tables, Charts, and Flowcharts. Use them whenever applicable to make data easier to understand.

1.  ** Tables:** Use standard Markdown tables for lists of items, comparisons, or reports.
2.  ** Flowcharts:** Use Mermaid.js syntax inside a \`\`\`mermaid\`\`\` code block.
    - Example:
    \`\`\`mermaid
    graph TD
    A[Start] --> B{Is Stock Low?}
    B -- Yes --> C[Reorder]
    B -- No --> D[Maintain]
    \`\`\`
3.  ** Charts / Graphs:** Use a \`\`\`chart\`\`\` code block with a JSON object.
    - ** Supported Types:** 'bar', 'line', 'pie'
    - ** Schema:**
    \`\`\`json
    {
      "type": "bar", // or "line", "pie"
      "title": "Stock Levels",
      "data": [
        { "name": "Item A", "value": 10 },
        { "name": "Item B", "value": 20 }
      ],
      "dataKeys": [
        { "name": "name", "value": "value" }
      ]
    }
    \`\`\`
    - Use this for showing trends (line), comparisons (bar), or distribution (pie).

** Context Format:**
You will receive a list of items and recent activities. Use this to answer queries accurately.
`;

export function getInventoryContext(items: StockItem[], activities: Activity[] = []): string {
    const totalItems = items?.length || 0;

    // Inventory List Processing
    let criticalItems: string[] = [];
    let lowItems: string[] = [];
    let inventorySection = "No items found in database.";

    // Intelligent Analysis
    let alerts: string[] = [];

    if (items && items.length > 0) {
        inventorySection = items.map(i => {
            let status = 'Good';
            let alertMsg = '';

            // Stock Analysis
            if (i.quantity <= 10) {
                status = 'CRITICAL';
                alertMsg = `[CRITICAL STOCK] ${i.name}: Only ${i.quantity} units left. ACTION: Reorder immediately.`;
                alerts.push(alertMsg);
            } else if (i.quantity <= 50) {
                status = 'Low';
            }

            // Expiry Analysis
            let expiryStr = '';
            if (i.expiryDate) {
                const daysUntilExpiry = Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                expiryStr = ` [Exp: ${new Date(i.expiryDate).toLocaleDateString()} (${daysUntilExpiry} days)]`;

                if (daysUntilExpiry < 0) {
                    status = 'EXPIRED';
                    alerts.push(`[EXPIRED] ${i.name}: Expired ${Math.abs(daysUntilExpiry)} days ago. ACTION: Discard.`);
                } else if (daysUntilExpiry <= 30) {
                    status = (status === 'CRITICAL') ? 'CRITICAL & EXPIRING' : 'EXPIRING SOON';
                    alerts.push(`[EXPIRY RISK] ${i.name}: Expires in ${daysUntilExpiry} days. ACTION: Use or Donate.`);
                }
            }

            return `- ${i.name}: ${i.quantity} ${i.unit || 'units'} [${status}](${i.category})${expiryStr}`;
        }).join('\n');
    }

    // Activity List Processing
    let activitySection = "No recent activity.";
    if (activities && activities.length > 0) {
        activitySection = activities.slice(0, 10).map(a =>
            `- [${new Date(a.time).toLocaleDateString()}] ${a.user} ${a.action} ${a.target} (${a.type})`
        ).join('\n');
    }

    return `
    === INTELLIGENT ALERTS (PRIORITY) ===
    ${alerts.length > 0 ? alerts.join('\n') : 'No immediate alerts.'}

    === CURRENT INVENTORY REPORT ===
        Total Unique Items: ${totalItems}

=== DETAILED ITEM LIST ===
    ${inventorySection}

=== RECENT ACTIVITIES(DATABASE LOGS) ===
    ${activitySection}
================================
    `.trim();
}
