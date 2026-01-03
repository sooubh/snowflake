# ⚙️ Setup & Installation Guide

Follow these steps to deploy **StockHealth AI** from scratch.

## 1. Prerequisites
*   **Node.js**: v18.17 or newer.
*   **npm**: Installed with Node.
*   **Snowflake Account**: You must have `ACCOUNTADMIN` rights to set up roles initially.
*   **Git**: For cloning the code.

## 2. Snowflake Environment Setup

1.  **Log in to Snowsight** (Snowflake Web UI).
2.  **Create Database & Tables**:
    Copy the contents of `scripts/create-snowflake-tables.sql` into a worksheet and run it. This will create:
    *   Database: `INVENTORYDB`
    *   Schema: `PUBLIC`
    *   Tables: `ITEMS`, `PURCHASE_ORDERS`
3.  **Enable Cortex AI**:
    Run the following command to allow your role to use AI functions:
    ```sql
    GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE SYSADMIN;
    -- Or whichever role you plan to use in .env
    ```

## 3. Application Setup

1.  **Clone the Repository**:
    ```bash
    git clone <repo-url>
    cd snowflake
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create `.env.local` in the root:
    ```env
    SNOWFLAKE_ACCOUNT=xy12345.us-east-1
    SNOWFLAKE_USERNAME=MY_USER
    SNOWFLAKE_PASSWORD=MY_PASSWORD
    SNOWFLAKE_WAREHOUSE=COMPUTE_WH
    SNOWFLAKE_DATABASE=INVENTORYDB
    SNOWFLAKE_SCHEMA=PUBLIC
    ```

## 4. Data Seeding (Crucial Step)

The app needs data to function. We have a powerful seeder script.

1.  **Run the Segregated Seeder**:
    ```bash
    npx ts-node scripts/seed-snowflake-inventory.ts
    ```
    *   This script will **DELETE** all existing data in `ITEMS`.
    *   It will then generate **150 items** for each of the 9 simulated stores.
    *   It ensures strict segregation (Food for FDC stores, Medicine for Hospital stores, etc.).

## 5. Running the App

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```
2.  **Access**:
    Open `http://localhost:3000` in your browser.

## 6. Verification
*   Login as **Hospital Director** (Admin).
*   Check the dashboard. Use the "Chat with Data" feature.
*   Ask: *"How many N95 Masks do we have across all hospitals?"*
*   If you get a correct number, the setup is **100% complete**.
