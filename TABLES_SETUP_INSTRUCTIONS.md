# 🗄️ Create Snowflake Tables - Quick Guide

## The Issue
You're getting "Failed to create in database" because the tables don't exist in Snowflake yet!

## ⚡ Quick Fix (2 minutes)

### Step 1: Login to Snowflake Web UI
Go to: **https://qzocpqx-mi36866.snowflakecomputing.com**

### Step 2: Open Worksheets
1. Click **"Worksheets"** in the left sidebar
2. Click **"+ Worksheet"** to create a new worksheet

### Step 3: Copy & Paste the SQL
Open the file: `scripts/create-snowflake-tables.sql`

Copy ALL the SQL and paste into the worksheet.

### Step 4: Run the Script
1. Click **"Run All"** button (or press Ctrl+Enter)
2. Wait for ~5 seconds
3. You should see: "Tables created successfully!"

### Step 5: Verify
At the bottom of the worksheet, you should see 5 tables listed:
- ACTIVITIES
- ITEMS  
- PURCHASE_ORDERS
- STORES
- TRANSACTIONS

## ✅ Done!

Now go back to your app and try adding a store again. It will work! 🎉

---

## Troubleshooting

**If you get "Database INVENTORYDB does not exist":**

Run this FIRST:
```sql
CREATE DATABASE IF NOT EXISTS INVENTORYDB;
CREATE SCHEMA IF NOT EXISTS INVENTORYDB.SUPPLY_CHAIN;
USE DATABASE INVENTORYDB;
USE SCHEMA SUPPLY_CHAIN;
```

Then run the table creation script again.
