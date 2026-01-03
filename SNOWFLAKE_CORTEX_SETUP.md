# ❄️ Snowflake Cortex AI Setup

LedgerShield now uses **Snowflake Cortex AI** for all intelligence features (Dashboard Insights, Chat with Data). This runs AI models directly within your Snowflake account.

## 1. Prerequisites

### A. Snowflake Region Support
Cortex AI is available in specific Snowflake regions (e.g., AWS US West 2, Azure East US 2).
Check availability: [Snowflake Cortex Regions](https://docs.snowflake.com/en/user-guide/snowflake-cortex-llm-functions#availability)

### B. Required Privileges
The Snowflake user configured in `.env.local` needs the `CORTEX_USER` database role or specific privileges.

Run this in your Snowflake Worksheet to enable it for your role:

```sql
-- Replace 'SYSADMIN' with the role your app uses (or accountadmin)
GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE SYSADMIN;
```

## 2. Configuration

No extra API keys are needed! The application uses the existing Snowflake credentials defined in `.env.local`:

```bash
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=INVENTORYDB
SNOWFLAKE_SCHEMA=PUBLIC
```

## 3. Verify Cortex is Working

Run this test query in your Snowflake Worksheet:

```sql
SELECT SNOWFLAKE.CORTEX.COMPLETE('llama3-70b', 'Tell me a joke about supply chains');
```

If this returns a response, your setup is correct!

## 4. Models Used

The application uses **llama3-70b** by default for the best balance of reasoning and cost.
You can change the model in `services/AIService.ts`.

- `snowflake-arctic`

## 5. Troubleshooting

### Error: "Model unavailable in your region"
If you see an error saying the model is unavailable, you need to enable **Cross-Region Inference**. This allows Snowflake to process your request in a nearby region where the model is hosted.

Run this command (as ACCOUNTADMIN) to enable it for any region:

```sql
ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'ANY_REGION';
```

Or specific regions:
```sql
ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'AWS_US,AZURE_US';
```

For more details, see [Cross-Region Inference Docs](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cross-region-inference).

