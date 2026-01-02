-- Check what data was actually seeded in Snowflake
-- Run this in Snowflake Web UI to see what section values exist

USE DATABASE INVENTORYDB;
USE SCHEMA SUPPLY_CHAIN;

-- Check items by section
SELECT 
    SECTION,
    COUNT(*) as ITEM_COUNT
FROM ITEMS
GROUP BY SECTION
ORDER BY SECTION;

-- View sample items
SELECT 
    ID,
    NAME,
    SECTION,
    OWNER_ID,
    QUANTITY
FROM ITEMS
LIMIT 10;

-- Check stores
SELECT * FROM STORES;
