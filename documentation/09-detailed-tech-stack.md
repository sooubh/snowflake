# 💻 Detailed Technology Stack Documentation

This document provides an in-depth technical breakdown of the libraries, frameworks, and services used in the **StockHealth AI** project.

## 🚀 Core Framework & Runtime

### **Next.js 16.0 (Turbopack)**
*   **Role**: Full-stack Web Framework.
*   **Key Features Used**:
    *   **App Router**: We utilize the modern file-system based routing (`app/` directory) for layouts, nested routes, and loading states.
    *   **Server Actions**: All mutations (CRUD, AI calls) are handled via Server Actions (`"use server"`) to eliminate the need for a separate API backend server.
    *   **Server Components (RSC)**: By default, components enable direct database access and reduced client-side JavaScript bundles.
    *   **Turbopack**: Used for instant development server starts and fast HMR (Hot Module Replacement).

### **React 19.x**
*   **Role**: UI Library.
*   **Key Features Used**:
    *   **Hooks**: Extensive use of `useState`, `useEffect`, `useTransition`, `useFormStatus` for managing UI state and pending actions.
    *   **Concurrency**: Features aligned with Next.js 16 for streaming UI updates.

### **TypeScript 5.x**
*   **Role**: Static Type Checking.
*   **Implementation**: Strict type safety is enforced across the entire application.
    *   **Shared Interfaces**: Data models like `StockItem`, `Transaction`, `PurchaseOrder` are defined once in `lib/snowflakeService.ts` and reused across frontend and backend.
    *   **API Contracts**: Server actions return typed responses to ensure client safety.

---

## 🎨 Frontend & User Interface

### **Tailwind CSS 4.x**
*   **Role**: Styling Engine.
*   **Configuration**: Zero-runtime configuration using the new v4 engine for lightning-fast builds.
*   **Design System**: Custom color palette (Medical/Professional themes) defined via CSS variables for native dark mode support.
*   **Plugins**: `@tailwindcss/typography` for rendering beautiful markdown content from AI responses.

### **Framer Motion**
*   **Role**: Animation Library.
*   **Usage**:
    *   Page transitions (fade-in, slide-up).
    *   Micro-interactions (button taps, card hovers).
    *   Layout animations (expanding/collapsing lists).

### **Lucide React**
*   **Role**: Iconography.
*   **Choice**: Selected for its extensive, consistent set of SVG icons that are tree-shakeable and lightweight.

### **Recharts & Chart.js**
*   **Role**: Data Visualization.
*   **Implementation**:
    *   **Recharts**: Used for complex, responsive declarative charts (Sales Trends, Activity Heatmaps).
    *   **Chart.js**: Used directly or via `react-chartjs-2` for specific high-performance canvas rendering needs.

### **Next-Themes**
*   **Role**: Theme Management.
*   **Usage**: Handles robust switching between Light, Dark, and System themes without hydration mismatches.

---

## ☁️ Backend & Database

### **Snowflake Data Cloud**
*   **Role**: Primary Database & Data Warehouse.
*   **Why Snowflake?**:
    1.  **Scalability**: Separates storage from compute. Can handle millions of inventory SKUs without performance degradation.
    2.  **Security**: Enterprise-grade encryption and role-based access control.
    3.  **Integrated AI**: Allows running AI models directly next to the data (Zero Data Movement).
*   **Tables**:
    *   `ITEMS`: Main inventory ledger.
    *   `TRANSACTIONS`: Immutable log of all sales and movements.
    *   `PURCHASE_ORDERS`: Procurement lifecycle tracking.
    *   `ACTIVITIES`: Audit trail of user actions.
    *   `STORES`: Registry of physical and logical store locations.

### **snowflake-sdk**
*   **Role**: Node.js Driver.
*   **Usage**: Establishes secure connection to Snowflake.
*   **Pattern**: Implements a Singleton Service pattern (`SnowflakeInventoryService`) to manage connections and execute parameterized SQL queries securely to prevent SQL injection.

### **Zod**
*   **Role**: Schema Validation.
*   **Usage**: Validates runtime data structures, particularly form inputs before they reach the database layer, ensuring data integrity.

---

## 🤖 Artificial Intelligence (Cortex)

### **Snowflake Cortex**
*   **Role**: Intelligence Engine.
*   **Function**: `SNOWFLAKE.CORTEX.COMPLETE`.
*   **Architecture**: Serverless Inference. We do not manage GPU servers. We simply call a SQL function.

### **Model: Llama 3 (70B)**
*   **Role**: Large Language Model.
*   **Capabilities**:
    *   Analyzes JSON patterns of inventory data.
    *   Generates SQL (if needed for natural language search).
    *   Provides "Sentiment Analysis" on stock health (Critical, Healthy, Warning).

### **Vector / RAG (Retrieval Augmented Generation)**
*   **Implementation**: The system constructs a "Context Window" (`lib/aiContext.ts`) containing the most relevant recent activities and critical stock items to feed into the prompt, grounding the AI's answers in real-time data.

---

## 🛠️ Utilities & Helpers

| Library | Version | Purpose |
| :--- | :--- | :--- |
| **jspdf** | ^3.0 | Generating robust PDF documents (Invoices, Purchase Orders) on the client side. |
| **jspdf-autotable** | ^5.0 | Adds table capability to PDF generation for itemized lists. |
| **papaparse** | ^5.5 | High-speed CSV parsing and generation for bulk data import/export. |
| **xlsx** | ^0.18 | Reading and writing Microsoft Excel (.xlsx) spreadsheets for compatibility with legacy hospital systems. |
| **clsx** | ^2.1 | Utility for constructing conditional className strings strings. |
| **tailwind-merge** | ^3.4 | Merges Tailwind classes intelligently, resolving conflicts (e.g., `p-4` vs `p-2`). |
| **react-markdown** | ^10.0 | safely renders markdown content returned by the AI Chatbot. |

---

## 🔒 Security & Auth

### **Simulated Auth (Current)**
*   **State**: For demonstration/MVP purposes, authentication is role-based but simulated via Cookies (`simulated_user_id`).
*   **Permissions**:
    *   **Admin**: Full visibility across their Section (FDC, Hospital, NGO).
    *   **Retailer**: Restricted visibility to their specific Store (`ownerId`).

### **Environment Variables**
*   Configuration is strictly managed via `.env` files, ensuring no sensitive credentials (Snowflake Keys, etc.) are hardcoded in the source.
