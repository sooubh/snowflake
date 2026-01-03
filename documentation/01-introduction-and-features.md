# 📖 Introduction & Features

## 🚀 Project Overview

**StockHealth AI** is a cutting-edge **Supply Chain Management (SCM) Platform** engineered for critical infrastructure networks. It bridges the gap between chaos and clarity in:
1.  **Food Distribution Centers (FDC)**
2.  **Hospital Networks**
3.  **NGO Relief Operations**

By integrating **Snowflake Cortex AI**, the platform transforms static inventory data into a living, breathing intelligent system that proactively identifies shortages, prevents wastage, and automates procurement.

### mission
To ensure that no critical supply—be it a vaccine, a ration pack, or an emergency tent—is ever unavailable when needed, by leveraging the power of Data Cloud and Artificial Intelligence.

---

## 🌟 Key Features

### 1. 🔐 Role-Based Access Control (RBAC) & Usage
*   **Dual-Tier Authentication**:
    *   **Section Admins** (e.g., Hospital Directors): Have a "God View" of their entire network. Can see aggregated stock levels across all subordinate stores.
    *   **Store Managers** (e.g., PHC Pharmacist): Restricted view. Can only manage their local inventory.
*   **Section Isolation**:
    *   Strict segregation ensures FDC admins cannot see Hospital data, maintaining security and operational clarity.

### 2. 📦 Intelligent Inventory Management
*   **Real-Time Dashboard**: Live updates on stock quantities, unit prices, and status.
*   **Expiry Tracking**: Automated flagging of items nearing expiry dates (e.g., "Expiring in 30 days").
*   **Low Stock Alerts**: Visual indicators (Red badges) for items falling below minimum thresholds.
*   **Category Management**: Specialized taxonomies for different sections:
    *   *FDC*: Grains, Oils, Spices.
    *   *Hospital*: Medicines, Equipment, Consumables.
    *   *NGO*: Shelter, Hygiene, Food Packs.

### 3. 🧠 AI-Powered Insights (Snowflake Cortex)
*   **Dashboard Intelligence**: On login, the AI scans the entire inventory and generates a high-level summary of risks and health.
    *   *Example*: "Critical shortage of Insulin in Rural PHC 1. Expiry risk for 500kg Rice in Central Store A."
*   **Natural Language Query (NLQ)**:
    *   Allows users to ask questions in plain English: *"Show me all stores with less than 20% stock of Paracetamol."*
    *   The system translates this into SQL, queries Snowflake, and returns the accurate result.
*   **Agentic Actions**:
    *   The AI serves as an active agent. If it spots a shortage, it offers a "One-Click Action" to generating a Purchase Order draft.

### 4. 📊 Visualization & Reporting
*   **Interactive Heatmaps**: Visual representation of stock density across regions.
*   **Category Charts**: Pie and Bar charts showing value distribution (e.g., "70% of budget tied up in Equipment").
*   **Audit Trails**: Every login, update, and edit is logged for accountability.

### 5. 🛠️ Professional "Simulated" Environment
*   **Pre-Seeded Data**: The system comes alive with 150+ realistic items per store for demonstration.
*   **Demo Profiles**: Pre-configured accounts for smooth walkthroughs and presentations.
