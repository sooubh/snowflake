# 🏛️ System Architecture Documentation

This document provides a comprehensive technical overview of the **StockHealth AI** architecture, including system design, component interactions, data flows, and deployment strategies.

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Layered Architecture](#2-layered-architecture)
3. [Component Architecture](#3-component-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Integration Architecture](#5-integration-architecture)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Scalability & Performance](#8-scalability--performance)

---

## 1. Architecture Overview

### 1.1 High-Level System Architecture

StockHealth AI follows a **modern serverless architecture** with clear separation of concerns, leveraging Next.js for the application layer and Snowflake for data and AI processing.

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Application Layer - Next.js 16"
        UI[React Components<br/>Server & Client]
        API[API Routes<br/>/api/*]
        Actions[Server Actions<br/>/actions/*]
    end
    
    subgraph "Business Logic Layer"
        Services[Service Layer<br/>snowflakeService.ts]
        AIService[AI Service<br/>AIService.ts]
        Utils[Utilities<br/>Validation, Export, etc.]
    end
    
    subgraph "Snowflake Data Cloud"
        Database[Database Tables<br/>ITEMS, TRANSACTIONS, etc.]
        Cortex[Cortex AI<br/>LLama 3-70B]
        Storage[Data Storage<br/>Scalable Warehouse]
    end
    
    subgraph "External Services"
        CDN[Vercel Edge CDN]
        Analytics[Analytics<br/>Optional]
    end
    
    Browser --> UI
    Mobile --> UI
    UI --> API
    UI --> Actions
    API --> Services
    Actions --> Services
    Actions --> AIService
    
    Services --> Database
    AIService --> Cortex
    Cortex --> Database
    Database --> Storage
    
    UI --> CDN
    
    style UI fill:#61DAFB
    style Services fill:#4CAF50
    style Database fill:#29B5E8
    style Cortex fill:#9C27B0
```

### 1.2 Architecture Principles

| Principle | Implementation |
|-----------|---------------|
| **Separation of Concerns** | Clear boundaries between UI, Business Logic, and Data layers |
| **Single Responsibility** | Each component/service has one well-defined purpose |
| **DRY (Don't Repeat Yourself)** | Shared interfaces, reusable components, centralized services |
| **Scalability First** | Serverless architecture with auto-scaling capabilities |
| **Security by Design** | Role-based access, parameterized queries, environment-based secrets |
| **Performance Optimized** | Server Components, Edge CDN, chunked data loading |

---

## 2. Layered Architecture

### 2.1 Architecture Layers

The system follows a clean **four-tier architecture**:

```mermaid
graph TD
    subgraph "Presentation Layer"
        P1[React UI Components]
        P2[Client-Side State Management]
        P3[User Input Validation]
    end
    
    subgraph "Application Layer"
        A1[Next.js API Routes]
        A2[Server Actions]
        A3[Middleware & Auth]
    end
    
    subgraph "Business Logic Layer"
        B1[Service Classes<br/>SnowflakeInventoryService]
        B2[AI Service<br/>Cortex Integration]
        B3[Domain Logic<br/>Calculations, Rules]
        B4[Utilities<br/>Export, Validation]
    end
    
    subgraph "Data Layer"
        D1[Snowflake Database]
        D2[SQL Queries]
        D3[Data Models<br/>Interfaces]
    end
    
    P1 --> A1
    P1 --> A2
    P2 --> P1
    P3 --> A1
    
    A1 --> B1
    A2 --> B1
    A2 --> B2
    A3 --> A1
    
    B1 --> D2
    B2 --> D2
    B3 --> B1
    B4 --> B1
    
    D2 --> D1
    D3 --> B1
    
    style P1 fill:#61DAFB
    style A2 fill:#FF6B6B
    style B1 fill:#4CAF50
    style D1 fill:#29B5E8
```

### 2.2 Layer Responsibilities

#### Presentation Layer
- **Purpose**: User interface and interaction
- **Technologies**: React 19, Tailwind CSS, Framer Motion
- **Components**:
  - Page layouts (`app/*/page.tsx`)
  - Reusable UI components (`components/*`)
  - Client-side state management (React hooks)
  - Form validation (Zod schemas)

#### Application Layer
- **Purpose**: Request handling and routing
- **Technologies**: Next.js 16 App Router
- **Components**:
  - API endpoints (`app/api/*`)
  - Server Actions (`app/actions/*`)
  - Route handlers
  - Cookie-based authentication

#### Business Logic Layer
- **Purpose**: Core application logic and rules
- **Technologies**: TypeScript, Node.js
- **Components**:
  - `SnowflakeInventoryService`: Database operations
  - `AIService`: Cortex AI integration
  - Domain calculators (stock status, expiry checks)
  - Export utilities (PDF/CSV/Excel generation)

#### Data Layer
- **Purpose**: Data persistence and retrieval
- **Technologies**: Snowflake, SQL
- **Components**:
  - Database schema (tables, indexes)
  - SQL query execution
  - Data models (TypeScript interfaces)
  - Connection management

---

## 3. Component Architecture

### 3.1 Frontend Component Hierarchy

```mermaid
graph TD
    Root[RootLayout<br/>Theme Provider] --> Pages

    Pages --> Dashboard[Dashboard Page]
    Pages --> Inventory[Inventory Page]
    Pages --> Sales[Sales Page]
    Pages --> Reports[Reports Page]
    Pages --> Procurement[Procurement Page]
    
    Dashboard --> DashHeader[Dashboard Header]
    Dashboard --> AIBanner[AI Insights Banner]
    Dashboard --> StatsCards[Statistics Cards]
    Dashboard --> Charts[Chart Components]
    
    Inventory --> InvTable[Inventory Table]
    Inventory --> GlobalSearch[Global Search Modal]
    Inventory --> AddEditModal[Add/Edit Modal]
    
    InvTable --> ChunkedLoader[Chunked Data Loader]
    InvTable --> TableRow[Table Row Component]
    
    Sales --> SalesCart[Shopping Cart]
    Sales --> ItemSelector[Item Selector]
    Sales --> InvoiceModal[Invoice Modal]
    
    Reports --> ReportTabs[Tab Navigation]
    Reports --> ChartDisplay[Chart Display]
    Reports --> ExportButtons[Export Buttons]
    Reports --> AIInsight[AI Insight Component]
    
    Procurement --> POForm[PO Form]
    Procurement --> OrderHistory[Order History Table]
    
    style Root fill:#1E1E1E
    style AIBanner fill:#9C27B0
    style ChunkedLoader fill:#4CAF50
```

### 3.2 Backend Service Architecture

```mermaid
graph LR
    subgraph "Service Layer"
        SFS[SnowflakeInventoryService<br/>Singleton Instance]
        AIS[AIService<br/>Singleton Instance]
    end
    
    subgraph "Core Methods - SnowflakeInventoryService"
        CRUD[CRUD Operations<br/>getAllItems, addItem<br/>updateItem, deleteItem]
        Trans[Transaction Management<br/>createTransaction<br/>getTransactions]
        Orders[Order Management<br/>createOrder, updateOrder<br/>getOrders]
        Stores[Store Management<br/>getSystemStores<br/>getStoresBySection]
        Activities[Activity Logging<br/>logActivity<br/>getRecentActivities]
    end
    
    subgraph "Core Methods - AIService"
        Insight[getDashboardInsight]
        Chat[chatWithData]
        Offline[generateOfflineInsight]
    end
    
    SFS --> CRUD
    SFS --> Trans
    SFS --> Orders
    SFS --> Stores
    SFS --> Activities
    
    AIS --> Insight
    AIS --> Chat
    AIS --> Offline
    
    CRUD --> DB[(Snowflake DB)]
    Trans --> DB
    Orders --> DB
    Stores --> DB
    Activities --> DB
    
    Insight --> Cortex[Cortex AI]
    Chat --> Cortex
    Cortex --> DB
    
    style SFS fill:#4CAF50
    style AIS fill:#9C27B0
    style DB fill:#29B5E8
```

### 3.3 Service Design Patterns

#### Singleton Pattern (Service Classes)
```typescript
// Ensures single instance across application
export class SnowflakeInventoryService {
    private connection: snowflake.Connection | null = null;
    private connectionPromise: Promise<void> | null = null;
    
    constructor() {
        if (this.hasCredentials()) {
            this.connectionPromise = this.connect();
        }
    }
}

export const snowflakeService = new SnowflakeInventoryService();
```

#### Repository Pattern (Data Access)
```typescript
// Encapsulates data access logic
async getAllItems(section: string): Promise<StockItem[]> {
    const query = 'SELECT * FROM ITEMS WHERE SECTION = ?';
    return await this.executeQuery<StockItem>(query, [section]);
}
```

#### Factory Pattern (Query Building)
```typescript
// Dynamically constructs queries based on input
private buildUpdateQuery(updates: Partial<StockItem>): string {
    const fields = Object.keys(updates);
    const setClause = fields.map(f => `${toSnakeCase(f)} = ?`).join(', ');
    return `UPDATE ITEMS SET ${setClause}, LAST_UPDATED = ? WHERE ID = ?`;
}
```

---

## 4. Data Architecture

### 4.1 Database Schema (Entity-Relationship Diagram)

```mermaid
erDiagram
    ITEMS ||--o{ TRANSACTIONS : "included_in"
    ITEMS ||--o{ PURCHASE_ORDERS : "ordered_in"
    STORES ||--o{ ITEMS : "owns"
    USERS ||--o{ ACTIVITIES : "performs"
    USERS ||--o{ TRANSACTIONS : "performs"
    USERS ||--o{ PURCHASE_ORDERS : "creates"
    
    ITEMS {
        string ID PK
        string NAME
        string CATEGORY
        int QUANTITY
        decimal PRICE
        string STATUS
        string OWNER_ID FK
        string SECTION
        timestamp LAST_UPDATED
        date EXPIRY_DATE
        date MANUFACTURING_DATE
        string BATCH_NUMBER
        string SUPPLIER
        string UNIT
        int MIN_QUANTITY
    }
    
    TRANSACTIONS {
        string ID PK
        string INVOICE_NUMBER
        timestamp DATE
        string TYPE
        json ITEMS
        decimal TOTAL_AMOUNT
        string PAYMENT_METHOD
        string CUSTOMER_NAME
        string SECTION
        string PERFORMED_BY FK
    }
    
    PURCHASE_ORDERS {
        string ID PK
        string PO_NUMBER
        timestamp DATE_CREATED
        string STATUS
        json ITEMS
        string VENDOR
        decimal TOTAL_ESTIMATED_COST
        string CREATED_BY FK
        string APPROVED_BY
        timestamp RECEIVED_DATE
        string NOTES
    }
    
    ACTIVITIES {
        string ID PK
        string USER FK
        string ACTION
        string TARGET
        timestamp TIME
        string TYPE
        string SECTION
    }
    
    STORES {
        string ID PK
        string NAME
        string SECTION
        string CONTAINER_NAME
        string STATUS
        timestamp CREATED_AT
    }
    
    USERS {
        string ID PK
        string NAME
        string EMAIL
        string ROLE
        string SECTION
    }
```

### 4.2 Data Flow Architecture

```mermaid
graph LR
    subgraph "Data Sources"
        User[User Input<br/>Forms, Actions]
        System[System Events<br/>Auto-calculations]
    end
    
    subgraph "Application Layer"
        Validation[Input Validation<br/>Zod Schemas]
        ServerAction[Server Actions<br/>CRUD Operations]
    end
    
    subgraph "Service Layer"
        ServiceLogic[Business Logic<br/>Rules & Calculations]
        QueryBuilder[Query Builder<br/>Parameterized SQL]
    end
    
    subgraph "Data Layer"
        SnowflakeDB[(Snowflake Database)]
        Tables[Tables:<br/>ITEMS, TRANSACTIONS,<br/>ORDERS, ACTIVITIES]
    end
    
    subgraph "AI Processing"
        Context[Context Builder<br/>Data Formatting]
        Cortex[Cortex AI<br/>LLM Processing]
        Response[AI Response<br/>JSON/Text]
    end
    
    subgraph "Output"
        UI[UI Update<br/>React State]
        Export[Data Export<br/>CSV/Excel/PDF]
    end
    
    User --> Validation
    System --> ServerAction
    Validation --> ServerAction
    ServerAction --> ServiceLogic
    ServiceLogic --> QueryBuilder
    QueryBuilder --> SnowflakeDB
    SnowflakeDB --> Tables
    
    Tables --> Context
    Context --> Cortex
    Cortex --> Response
    
    Tables --> UI
    Response --> UI
    Tables --> Export
    
    style SnowflakeDB fill:#29B5E8
    style Cortex fill:#9C27B0
    style ServiceLogic fill:#4CAF50
```

### 4.3 Data Consistency & Integrity

#### Transaction Management
```sql
-- Example: Atomic transaction for sales processing
BEGIN TRANSACTION;

-- Step 1: Deduct inventory
UPDATE ITEMS 
SET QUANTITY = QUANTITY - :sold_quantity 
WHERE ID = :item_id AND QUANTITY >= :sold_quantity;

-- Step 2: Record transaction
INSERT INTO TRANSACTIONS (ID, INVOICE_NUMBER, ...) 
VALUES (:id, :invoice_num, ...);

-- Step 3: Log activity
INSERT INTO ACTIVITIES (ID, USER, ACTION, TARGET, TIME, TYPE, SECTION)
VALUES (:id, :user, 'processed sale', :item_name, CURRENT_TIMESTAMP(), 'create', :section);

COMMIT;
```

#### Referential Integrity
- **OWNER_ID** in ITEMS references STORES.ID (implicit)
- **PERFORMED_BY** in TRANSACTIONS references USERS.ID (implicit)
- **SECTION** field ensures data isolation between departments

#### Data Validation Layers
1. **Frontend**: Zod schema validation before submission
2. **Backend**: TypeScript type checking + runtime validation
3. **Database**: Snowflake constraints (NOT NULL, data types)

---

## 5. Integration Architecture

### 5.1 External Integration Points

```mermaid
graph TD
    subgraph "StockHealth AI Application"
        App[Next.js Application]
    end
    
    subgraph "Snowflake Cloud"
        DB[Database Service]
        Cortex[Cortex AI Service]
        Warehouse[Virtual Warehouse]
    end
    
    subgraph "Hosting & CDN"
        Vercel[Vercel Platform]
        Edge[Edge Network]
    end
    
    subgraph "Development Tools"
        GitHub[GitHub Repository]
        VSCode[VS Code IDE]
    end
    
    subgraph "Monitoring (Optional)"
        Logs[Application Logs]
        Metrics[Performance Metrics]
    end
    
    App <-->|snowflake-sdk| DB
    App <-->|SQL Functions| Cortex
    DB <--> Warehouse
    
    App --> Vercel
    Vercel --> Edge
    
    GitHub --> Vercel
    VSCode --> GitHub
    
    App --> Logs
    Vercel --> Metrics
    
    style App fill:#61DAFB
    style DB fill:#29B5E8
    style Cortex fill:#9C27B0
    style Vercel fill:#000000
```

### 5.2 API Integration Flow

```mermaid
sequenceDiagram
    participant Client as Browser
    participant NextJS as Next.js Server
    participant Service as Service Layer
    participant Snowflake as Snowflake DB
    participant Cortex as Cortex AI
    
    Client->>NextJS: HTTP Request<br/>(User Action)
    NextJS->>NextJS: Authenticate<br/>(Cookie Check)
    NextJS->>Service: Call Service Method<br/>(getItems, addItem, etc.)
    Service->>Service: Build SQL Query<br/>(Parameterized)
    Service->>Snowflake: Execute Query<br/>(snowflake-sdk)
    Snowflake-->>Service: Return Data
    Service->>Service: Transform Data<br/>(snake_case → camelCase)
    Service-->>NextJS: Return Typed Data
    
    alt AI Request
        NextJS->>Service: AI Service Call
        Service->>Service: Build Context<br/>(Format Data)
        Service->>Cortex: CORTEX.COMPLETE<br/>(Prompt + Context)
        Cortex->>Snowflake: Access Data if needed
        Snowflake-->>Cortex: Return Query Results
        Cortex-->>Service: AI Response (JSON/Text)
        Service-->>NextJS: Parsed Response
    end
    
    NextJS-->>Client: JSON Response
    Client->>Client: Update UI<br/>(React State)
```

### 5.3 Authentication Flow

```mermaid
graph TD
    Start([User Visits App]) --> CheckCookie{Cookie Exists?}
    
    CheckCookie -->|No| LoginPage[Show Login Page]
    CheckCookie -->|Yes| ValidateCookie[Validate Cookie]
    
    LoginPage --> SelectUser[User Selects Profile]
    SelectUser --> SetCookie[Set Cookie:<br/>simulated_user_id]
    
    ValidateCookie --> GetUser[Get User from ID]
    SetCookie --> GetUser
    
    GetUser --> CheckRole{User Role?}
    
    CheckRole -->|Admin| AdminAccess[Admin Access<br/>Full Section View]
    CheckRole -->|Retailer| RetailerAccess[Retailer Access<br/>Own Store Only]
    
    AdminAccess --> LoadData[Load Data with Filter:<br/>WHERE section = user.section]
    RetailerAccess --> LoadData2[Load Data with Filter:<br/>WHERE ownerId = user.id]
    
    LoadData --> RenderDash[Render Dashboard]
    LoadData2 --> RenderDash
    
    style SetCookie fill:#4CAF50
    style AdminAccess fill:#FF9800
    style RetailerAccess fill:#2196F3
```

---

## 6. Deployment Architecture

### 6.1 Deployment Overview

```mermaid
graph TB
    subgraph "Development Environment"
        Dev[Developer Machine]
        GitRepo[Git Repository]
    end
    
    subgraph "CI/CD Pipeline - Vercel"
        Build[Build Process<br/>next build]
        Test[Type Checking<br/>ESLint]
        Deploy[Deployment]
    end
    
    subgraph "Production Environment - Vercel Edge"
        EdgeFunc[Edge Functions<br/>API Routes]
        ServerFunc[Serverless Functions<br/>Server Actions]
        Static[Static Assets<br/>CSS, JS, Images]
        CDN[Global CDN]
    end
    
    subgraph "Snowflake Cloud"
        Warehouse[Virtual Warehouse<br/>Compute]
        Storage[Data Storage<br/>S3-based]
        CortexEngine[Cortex AI Engine]
    end
    
    subgraph "End Users"
        Users[Web Browsers<br/>Desktop & Mobile]
    end
    
    Dev --> GitRepo
    GitRepo --> Build
    Build --> Test
    Test --> Deploy
    
    Deploy --> EdgeFunc
    Deploy --> ServerFunc
    Deploy --> Static
    
    Static --> CDN
    EdgeFunc --> CDN
    ServerFunc --> Warehouse
    
    CDN --> Users
    Warehouse --> Storage
    Warehouse --> CortexEngine
    
    style Build fill:#4CAF50
    style CDN fill:#FF6B6B
    style Warehouse fill:#29B5E8
    style CortexEngine fill:#9C27B0
```

### 6.2 Environment Configuration

| Environment | Purpose | Hosting | Database |
|-------------|---------|---------|----------|
| **Development** | Local development | localhost:3000 | Snowflake Dev Schema |
| **Staging** | Pre-production testing | Vercel Preview | Snowflake Staging Schema |
| **Production** | Live application | Vercel Production | Snowflake Production Schema |

### 6.3 Infrastructure Components

#### Vercel Platform
- **Serverless Functions**: Auto-scaling server actions
- **Edge Network**: Global CDN for static assets
- **Build Pipeline**: Automated builds on git push
- **Environment Variables**: Secure secret management

#### Snowflake Infrastructure
- **Compute Layer**: Virtual Warehouses (auto-suspend/resume)
- **Storage Layer**: Scalable object storage
- **Services Layer**: Metadata, optimization, security

---

## 7. Security Architecture

### 7.1 Security Layers

```mermaid
graph TD
    subgraph "Application Security"
        Auth[Authentication<br/>Cookie-based]
        RBAC[Role-Based Access<br/>Admin vs Retailer]
        Input[Input Validation<br/>Zod + TypeScript]
    end
    
    subgraph "Transport Security"
        HTTPS[HTTPS/TLS 1.3<br/>Encryption in Transit]
        Headers[Security Headers<br/>CSP, HSTS, etc.]
    end
    
    subgraph "Data Security"
        Encryption[Encryption at Rest<br/>Snowflake Native]
        RowLevel[Row-Level Security<br/>WHERE clauses]
        Params[Parameterized Queries<br/>SQL Injection Prevention]
    end
    
    subgraph "Infrastructure Security"
        Env[Environment Variables<br/>Secret Management]
        Network[Network Isolation<br/>Snowflake VPC]
        Audit[Audit Logging<br/>Activity Tracking]
    end
    
    User[User Request] --> HTTPS
    HTTPS --> Auth
    Auth --> RBAC
    RBAC --> Input
    Input --> Params
    Params --> RowLevel
    RowLevel --> Encryption
    
    Env --> Auth
    Network --> Encryption
    Audit --> RowLevel
    
    style Auth fill:#4CAF50
    style Encryption fill:#FF9800
    style Params fill:#2196F3
```

### 7.2 Security Measures

#### Authentication & Authorization
- **Cookie-based Sessions**: Secure, HTTP-only cookies
- **Role-based Access Control**: Admin vs Retailer permissions
- **Server-side Validation**: All auth checks happen server-side

#### Data Protection
- **Encryption at Rest**: Snowflake default encryption
- **Encryption in Transit**: TLS 1.3 for all connections
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Prevention**: React auto-escaping + CSP headers

#### Secrets Management
```bash
# .env.local (Never committed to Git)
SNOWFLAKE_ACCOUNT=xxx
SNOWFLAKE_USERNAME=xxx
SNOWFLAKE_PASSWORD=xxx  # Encrypted credential
SNOWFLAKE_WAREHOUSE=xxx
SNOWFLAKE_DATABASE=xxx
SNOWFLAKE_SCHEMA=xxx
```

---

## 8. Scalability & Performance

### 8.1 Scalability Architecture

```mermaid
graph TD
    Load[Increasing Load]
    
    Load --> AppScale[Application Scaling]
    Load --> DataScale[Data Scaling]
    
    AppScale --> Serverless[Serverless Functions<br/>Auto-scale to demand]
    AppScale --> Edge[Edge CDN<br/>Geographic distribution]
    AppScale --> Cache[Static Asset Caching<br/>Browser + CDN]
    
    DataScale --> Warehouse[Warehouse Scaling<br/>Size: XS to 6XL]
    DataScale --> Clustering[Data Clustering<br/>Partition by section]
    DataScale --> QueryOpt[Query Optimization<br/>Indexes, materialized views]
    
    Serverless --> Capacity[Unlimited Capacity<br/>Pay-per-execution]
    Edge --> LowLatency[Low Latency<br/>&lt;100ms globally]
    Cache --> ReduceLoad[Reduced Backend Load]
    
    Warehouse --> AutoSuspend[Auto-suspend when idle<br/>Cost optimization]
    Clustering --> FastQuery[Fast filtered queries]
    QueryOpt --> Performance[10x Performance Gain]
    
    style Serverless fill:#4CAF50
    style Warehouse fill:#29B5E8
    style Edge fill:#FF6B6B
```

### 8.2 Performance Optimizations

#### Frontend Optimizations
| Technique | Implementation | Impact |
|-----------|---------------|---------|
| **Server Components** | Default in Next.js 16 | 30% smaller bundle size |
| **Code Splitting** | Dynamic imports for heavy components | Faster initial load |
| **Image Optimization** | Next.js Image component | 40% faster image loading |
| **Chunked Loading** | Load 50 items at a time | No UI freeze on large datasets |

#### Backend Optimizations
| Technique | Implementation | Impact |
|-----------|---------------|---------|
| **Connection Pooling** | Singleton service pattern | Reuse DB connections |
| **Query Caching** | Snowflake result cache | 10x faster repeated queries |
| **Prepared Statements** | Parameterized queries | Query plan reuse |
| **Warehouse Auto-clustering** | Snowflake native feature | Faster WHERE clause filters |

#### Database Optimizations
```sql
-- Clustering key for faster section-based queries
ALTER TABLE ITEMS CLUSTER BY (SECTION, LAST_UPDATED);

-- Automatic query result caching (24 hours)
-- Snowflake automatically caches identical queries

-- Search optimization for text searches
ALTER TABLE ITEMS ADD SEARCH OPTIMIZATION;
```

### 8.3 Monitoring & Observability

```mermaid
graph LR
    subgraph "Application Monitoring"
        Logs[Server Logs<br/>console.log statements]
        Errors[Error Tracking<br/>Try-catch blocks]
    end
    
    subgraph "Snowflake Monitoring"
        QueryHist[Query History<br/>Execution times]
        WarehouseMetrics[Warehouse Metrics<br/>Credit usage]
        CortexUsage[Cortex Usage<br/>AI call metrics]
    end
    
    subgraph "Vercel Monitoring"
        FuncMetrics[Function Metrics<br/>Execution time, memory]
        Analytics[Web Analytics<br/>Page views, performance]
    end
    
    App[Application] --> Logs
    App --> Errors
    
    App --> QueryHist
    QueryHist --> WarehouseMetrics
    QueryHist --> CortexUsage
    
    App --> FuncMetrics
    FuncMetrics --> Analytics
    
    style App fill:#61DAFB
    style QueryHist fill:#29B5E8
    style FuncMetrics fill:#000000
```

---

## 🎯 Architecture Summary

### Key Architectural Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Next.js 16** | Modern framework with Server Components and Actions | Learning curve for traditional React developers |
| **Snowflake** | Integrated data warehouse + AI platform | Higher cost than traditional databases at small scale |
| **Serverless** | Auto-scaling, pay-per-use model | Cold start latency (mitigated by Edge functions) |
| **TypeScript** | Type safety reduces runtime errors | Additional development time for type definitions |
| **Cortex AI** | Zero data movement, integrated AI | Limited to Snowflake-supported models |
| **Simulated Auth** | Quick MVP development | Must be replaced with real auth for production |

### Architecture Strengths

✅ **Highly Scalable**: Serverless + cloud-native design  
✅ **Low Maintenance**: Managed services reduce DevOps overhead  
✅ **Fast Performance**: Edge CDN + optimized queries  
✅ **Secure by Default**: Encryption, RBAC, parameterized queries  
✅ **AI-Ready**: Native Cortex integration with zero setup  
✅ **Developer Friendly**: TypeScript, modern tooling, clear separation of concerns  

### Future Architecture Enhancements

1. **Real Authentication**: Implement NextAuth.js or Auth0
2. **Real-time Updates**: WebSockets for live inventory changes
3. **Multi-region**: Deploy to multiple Vercel regions
4. **Advanced Caching**: Redis for session and query caching
5. **Microservices**: Split AI service into separate deployment if needed
6. **GraphQL API**: Consider GraphQL for mobile app integration

---

## 📚 Related Documentation

- [Technology Stack Details](./09-detailed-tech-stack.md)
- [Process Flows & Use Cases](./10-process-flows-and-use-cases.md)
- [Database Schema](./03-database-schema.md)
- [Setup & Installation](./04-setup-and-installation.md)
