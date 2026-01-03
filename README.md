# 📦 StockHealth AI

**Secure, Intelligent Supply Chain Management for Critical Infrastructure.**
*Empowering Food Distribution Centers, Hospitals, and NGO Relief Networks.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Snowflake](https://img.shields.io/badge/Snowflake-Data_Cloud-29b5e8)](https://www.snowflake.com/)
[![Powered by Cortex](https://img.shields.io/badge/AI-Snowflake_Cortex-purple)](https://docs.snowflake.com/en/user-guide/snowflake-cortex-llm-functions)

---

## 📖 Table of Contents

- [Overview & Features](documentation/01-introduction-and-features.md)
- [Architecture & Tech Stack](documentation/02-architecture-and-tech-stack.md)
- [Database & Snowflake](documentation/03-database-schema.md)
- [Setup & Installation](documentation/04-setup-and-installation.md)
- [User Guide](documentation/05-user-guide-and-workflows.md)
- [AI Integration](documentation/06-ai-integration.md)

---

## 🎯 Overview

**StockHealth AI** is a unified, real-time supply chain management platform designed to solve the critical challenges of wastage, stock-outs, and lack of visibility in essential service networks.

*For a detailed deep dive into features and mission, see [Introduction & Features](documentation/01-introduction-and-features.md).*

It serves three distinct operational sections:
1.  **Food Distribution Centers (FDC)**: Managing grains, oils, and essential rations.
2.  **Hospital Networks**: Tracking medicines, surgical equipment, and vaccine stocks.
3.  **NGO Operations**: Coordinating relief supplies like tents, blankets, and hygiene kits.

By integrating **Snowflake Cortex AI**, StockHealth AI transforms raw inventory data into actionable insights, predicting shortages before they happen and identifying stock at risk of expiry.

---

## 🌟 Key Features

### 🔐 Secure & Segmented Access
- **Multi-Role Authentication**: Distinct login flows for **Administrators** (Regional Heads) and **Store Managers**.
- **Section Segregation**: Strict data isolation ensures FDC managers see only food items, while Hospital staff see only medical supplies.
- **Real-Time Profile**: Professional profile management with instant updates across the dashboard.

### 📦 Intelligent Inventory
- **Real-Time Tracking**: Live monitoring of quantity, price, and status (In Stock, Low Stock, Out of Stock).
- **Expiry Management**: Visual alerts for items nearing expiration to prevent wastage.
- **Smart Catalog**: Detailed categorization (e.g., Grains, Medicines, Shelter) specific to each section.

### 🧠 Cortex AI Integration
- **Natural Language Query**: "Chat with your Data" - Ask questions like *"Which store has the lowest stock of Paracetamol?"* and get instant SQL-backed answers.
- **Actionable Insights**: AI proactively suggests actions. *Example: "Stock of Rice is low in Store A. Create a Purchase Order for 500kg?"*
- **Agent Capabilities**: The AI can execute tasks like creating simulated Purchase Orders directly from the chat interface.

### 📊 Advanced Analytics
- **Dynamic Dashboard**: Aggregated views of Total Inventory Value, Stock Health, and Critical Alerts.
- **Visual Reports**: Interactive charts showing category distribution and stock trends.
- **Team Management**: Audit logs and user activity tracking associated with specific store sections.

---

## 🏗 Architecture

StockHealth AI follows a modern **Serverless** architecture leveraging the Snowflake Data Cloud.

```mermaid
graph TD
    Client[Next.js Client (Browser)] -->|API Routes| Server[Next.js Server (Vercel)]
    
    subgraph Data Layer
        Server -->|SQL Queries| Snowflake[(Snowflake Database)]
        Snowflake -->|Inventory Data| Server
    end
    
    subgraph AI Layer
        Server -->|Prompt| Cortex[Snowflake Cortex AI]
        Cortex -->|SQL/Insights| Server
        Cortex -.->|Reads| Snowflake
    end
    
    subgraph Auth Layer
        Client -->|Cookies| Auth[Simulated Auth Provider]
    end
```

---

## 🛠 Tech Stack

### Frontend & Application
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Icons**: Material Symbols & Lucide React
- **Notifications**: Sonner (Toasts)

### Backend & Data
- **Database**: [Snowflake](https://www.snowflake.com/) (Warehousing & Compute)
- **Connectivity**: `snowflake-sdk` for Node.js
- **Seeding**: Custom TypeScript scripts for realistic data generation

### Artificial Intelligence
- **Engine**: Snowflake Cortex (Serverless AI)
- **Models**: `llama3-70b` (Primary reasoning model), `snowflake-arctic`
- **Functions**: `SNOWFLAKE.CORTEX.COMPLETE` for prompt completion

---

## 🚀 Getting Started

> **Note**: For a complete, step-by-step setup guide including seeding and AI configuration, please read the **[Setup & Installation Guide](documentation/04-setup-and-installation.md)**.

### Quick Start
1.  **Clone**: `git clone ...`
2.  **Install**: `npm install`
3.  **Config**: Set up `.env.local`
4.  **Seed**: `npx ts-node scripts/seed-snowflake-inventory.ts`
5.  **Run**: `npm run dev`

### Database Setup

1.  **Initialize Schema**
    Run the SQL script located in `scripts/create-snowflake-tables.sql` in your Snowflake Worksheet to create the necessary tables (`ITEMS`, `PURCHASE_ORDERS`, etc.).

2.  **Seed Data**
    Populate the database with 150+ segregated items per store (Food, Medical, Relief) using the seed script:
    ```bash
    npx ts-node scripts/seed-snowflake-inventory.ts
    ```
    *This script automatically clears old data and injects fresh, section-specific inventory.*

### AI Integration

To enable Cortex AI features:

1.  **Grant Privileges**: Ensure your Snowflake role has `CORTEX_USER` access.
    ```sql
    GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE SYSADMIN;
    ```
2.  **Cross-Region Inference** (If required):
    ```sql
    ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'ANY_REGION';
    ```
    *See [Troubleshooting & FAQ](documentation/07-troubleshooting.md) for detailed help.*

---

## 💻 Usage Guide

### Authentication
1.  Navigate to the login page.
2.  **Step 1**: Select your Section (e.g., **Hospital Network**).
3.  **Step 2**: Select a Profile (e.g., **Hospital Director** for Admin, **City General** for Store Manager).
4.  Click **Login Now**. The system uses simulated secure cookies for the session.

### Inventory Management
- Go to the **Inventory** tab.
- Use the **Search Bar** to filter items.
- Click **Edit** to update stock levels or prices.
- **Admin View**: See stock across all stores in your section.
- **Store View**: Manage only your assigned store's inventory.

### AI Insights
- Look for the **AI Insight Banner** at the top of the dashboard.
- The AI analyzes your stock in real-time and alerts you to issues (e.g., "Shortage of Insulin").
- Click **"Take Action"** to let the Agent resolve the issue (e.g., automatically drafting a purchase order).
- Use the **Chat Interface** (bottom right) to ask free-form questions about your data.

---

## 🤝 Contributing

We welcome contributions to StockHealth AI!

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by Sourabh Singh for a Safer, Smarter Supply Chain.*
