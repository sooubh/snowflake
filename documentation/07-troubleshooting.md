# 🔧 Troubleshooting & FAQ

## ❄️ Snowflake Connection Issues

### "Incorrect username or password"
*   **Cause**: The credentials in `.env.local` do not match your Snowflake account.
*   **Fix**:
    1.  Verify `SNOWFLAKE_ACCOUNT`. It should be in the format `xy12345.region` (e.g., `ab12345.us-east-1`). Do not include `https://`.
    2.  Check for whitespace in `.env.local`.

### "Table or View not found"
*   **Cause**: The database schema hasn't been initialized.
*   **Fix**: Run `scripts/create-snowflake-tables.sql` in your Snowflake worksheet.

### "Self-signed certificate in certificate chain"
*   **Cause**: Corporate proxy intercepting SSL.
*   **Fix**: Set `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env.local` (Only for development!).

---

## 🧠 Cortex AI Issues

### "Language model function is not available in your region"
*   **Cause**: The `llama3-70b` model is not hosted in your Snowflake region.
*   **Fix**: Enable Cross-Region Inference.
    ```sql
    USE ROLE ACCOUNTADMIN;
    ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'ANY_REGION';
    ```

### "Insufficient privileges to operate on function"
*   **Cause**: The user role lacks the `CORTEX_USER` role.
*   **Fix**:
    ```sql
    GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE <your_role>;
    ```

### "I couldn't find any relevant items" (AI Response)
*   **Cause**: The AI context window might be empty because the current User Profile has no items assigned.
*   **Fix**:
    1.  Check `ITEMS` table: `SELECT * FROM ITEMS WHERE OWNER_ID = '<current_user_id>'`.
    2.  If empty, run the seeder: `npx ts-node scripts/seed-snowflake-inventory.ts`.

---

## 💻 Application Issues

### "Header showing wrong user name"
*   **Cause**: Browser caching or `localStorage` simulated state issue.
*   **Fix**:
    1.  Go to Settings -> Profile.
    2.  Update the name and Save.
    3.  Refresh the page.

### "Theme toggle not appearing"
*   **Note**: The theme toggle was intentionally removed in a previous update to streamline the login UI.

---

## 📞 Support

If these steps don't resolve your issue, please open a GitHub Issue with:
1.  Your Vercel deployment logs.
2.  The error message from the browser console.
