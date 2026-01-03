# 📘 User Guide & Workflows

## 🚪 Login Workflow

The login experience is designed to be secure yet strictly segmented.

1.  **Section Selection**:
    *   Upon landing, you see three large cards: **Food Distribution**, **Hospital Network**, **NGO Operations**.
    *   You must choose the network you belong to. This physically separates the contexts.
2.  **Profile Selection**:
    *   Once a section is chosen, you see a list of valid profiles for that section.
    *   **Admin Profiles** (e.g., "District Admin"): Have access to analytics for all stores in the group.
    *   **Store Profiles** (e.g., "Central Store A"): Have access only to their own inventory.
3.  **Authentication**:
    *   Clicking a profile pre-fills the credentials (for demo purposes).
    *   Click "Login Now" to enter the secure dashboard.

## 🖥️ Dashboard Navigation

### 1. Stats Overview
*   **Total Inventory Value**: Sum of (Price * Quantity) for all reachable items.
*   **Low Stock Items**: Count of items below their `MIN_QUANTITY`.
*   **Expiring Soon**: Count of items expiring within 30 days.

### 2. Inventory Management
*   **View**: A sortable, searchable table of all items.
    *   *Admins* see a "Store" column to identify item location.
*   **Edit**: Click the "Edit" (Pencil) icon to manually adjust Stock, Price, or Description. Updates are saved instantly to Snowflake.

### 3. Settings & Profile
*   Navigate to **Settings** -> **Profile**.
*   Here you can update your:
    *   Display Name
    *   Email / Contact Info
    *   Bio/Location
*   **Real-Time Effect**: Changes here are reflected immediately in the Header and Sidebar greeting.

## 🤖 Using the AI Assistant

### The "Insight Banner"
*   At the top of the dashboard, you will often see a colored banner.
*   **Blue/Green**: Everything is healthy.
*   **Orange/Red**: The AI has detected an anomaly (e.g., "Safety Stock Breach").
*   **Action Button**: If available, clicking "Create Order" or "Fix Issue" will let the AI perform a database action on your behalf.

### The Chat Interface
Located at the bottom right. Use this for complex queries.

**Sample Prompts:**
*   *"Which items are expiring this month?"*
*   *"What is the total value of stock in Relief Camp Alpha?"*
*   *"List all medications with less than 50 units."*
*   *"Who has the most surplus Rice?"* (FDC Admin only)

**Note**: The AI respects your role. If you are a Hospital Store Manager, you cannot ask about NGO tent supplies. The AI simply won't have access to that data in its context.
