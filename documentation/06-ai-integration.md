# 🧠 AI Integration Detailed

**Snowflake Cortex** is the brain behind StockHealth AI. This document details how we implement it.

## 1. The Cortex Difference
Unlike traditional apps that use OpenAI APIs (sending data out to public internet), we use **Local Inference**.
*   **Function**: `SNOWFLAKE.CORTEX.COMPLETE(model, prompt)`
*   **Location**: Runs inside the Snowflake Data Cloud perimeter.
*   **Latency**: Extremely low, as data doesn't travel across the web.

## 2. Intent Detection System

The AI Service (`services/AIService.ts`) doesn't just "chat". It classifies user intent into three categories:

1.  **ANALYTICS**: Questions about data ("How many...", "Show me...").
    *   *Action*: Queries the database, aggregates stats, returns text.
2.  **ACTION**: Requests to change state ("Order more...", "Update stock...").
    *   *Action*: Returns a structured JSON triggering a frontend Tool (e.g., `create_purchase_order`).
3.  **GENERAL**: Casual conversation ("Hello", "Help").
    *   *Action*: Returns standard helpful text.

## 3. The Context Window
To make the LLM "smart" about *your* data, we inject a **System Context**.

### Dynamic Context Generation
Before every prompt, we run a fast SQL query:
```sql
SELECT * FROM ITEMS WHERE OWNER_ID = 'current_user_store_id';
```
We convert this result set into a minified JSON string:
```json
[{"name":"Rice","qty":500,"status":"In Stock"}, {"name":"Oil","qty":5,"status":"Low"}]
```

### The System Prompt
We wrap the user's question with this context:
```text
SYSTEM: You are an inventory management assistant for Store 'Central Store A'.
CONTEXT: <...JSON_DATA_ABOVE...>
USER: "Do we need oil?"
```

The AI reads the JSON in the context and answers: *"Yes, Oil is low (5 units). You should restock."*

## 4. Bind Variables & Security
We use **SQL Bind Variables** (?) for all AI queries to prevent SQL Injection.
Even though the AI generates text, the underlying node.js driver handles the query execution securely.
