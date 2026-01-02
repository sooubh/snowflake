# 🔧 Quick Setup Guide for Snowflake Migration

## Step 1: Create Snowflake Account

1. Go to https://signup.snowflake.com
2. Choose **Azure** as cloud provider
3. Select **same region** as your application (e.g., East US, Central India)
4. Select **Standard** edition (for trial)
5. Complete signup

## Step 2: Initial Snowflake Setup

1. Login to Snowflake Web UI: `https://your-account.snowflakecomputing.com`
2. Click **Worksheets** → **+ Worksheet**
3. Copy and paste ALL SQL from Phase 2 of the migration guide
4. Run the SQL to create database, schema, and tables

## Step 3: Configure Environment Variables

1. Copy your existing `.env.local` or create a new one
2. Add these Snowflake credentials:

```env
SNOWFLAKE_ACCOUNT=xy12345.east-us-2.azure  # From Snowflake URL
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=INVENTORYDB
SNOWFLAKE_SCHEMA=SUPPLY_CHAIN
```

**How to find your account identifier:**
- Look at your Snowflake URL: `https://[ACCOUNT].snowflakecomputing.com`
- The [ACCOUNT] part is your account identifier

## Step 4: Install Dependencies

```bash
npm install
```

This will install the `snowflake-sdk` package.

## Step 5: Export Data from Cosmos DB

```bash
npm run export-cosmos
```

This creates JSON files in the `export/` directory.

## Step 6: Load Data to Snowflake

```bash
npm run load-snowflake
```

This imports the JSON files into your Snowflake database.

## Step 7: Switch Your App to Snowflake

Once data is loaded and verified:

1. Update your API routes to use `snowflakeService` instead of `azureService`
2. Test all functionality
3. Deploy!

## Troubleshooting

### Connection Error
- Check environment variables are correct
- Verify you can login to Snowflake Web UI
- Check warehouse is running

### Import Fails
- Make sure Phase 2 SQL was executed successfully
- Verify tables exist in Snowflake Web UI
- Check export/ directory has JSON files

### Data Missing
- Run validation queries in Snowflake:
```sql
SELECT 'ITEMS' AS T, COUNT(*) FROM ITEMS
UNION ALL SELECT 'TRANSACTIONS', COUNT(*) FROM TRANSACTIONS;
```

## Need Help?

Refer to the full migration guide: `snowflake_migration_guide.md`
