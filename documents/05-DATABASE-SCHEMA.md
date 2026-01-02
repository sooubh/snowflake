# Database Schema

## Overview

The system uses **Azure Cosmos DB** (NoSQL) with the following containers (collections).

---

## Database Name

`MedicalSupplyChain`

---

## Collections

### 1. Items Collection

**Container ID**: `Items`

**Partition Key**: `/section`

**Schema**:
```typescript
interface StockItem {
  id: string;                    // Unique identifier
  name: string;                  // Item name
  category: string;              // Category (Medicine, Equipment, etc.)
  quantity: number;              // Current stock quantity
  price: number;                 // Unit price
  unit: string;                  // Unit of measurement (tablets, boxes, etc.)
  status: string;                // "In Stock" | "Low Stock" | "Out of Stock"
  ownerId: string;               // User who owns this item
  section: string;               // "PSD" | "Hospital" | "NGO"
  lastUpdated: string;           // ISO timestamp
  minQuantity?: number;          // Reorder threshold
  expiryDate?: string;           // Expiry date
  manufacturingDate?: string;    // Manufacturing date
  batchNumber?: string;          // Batch/lot number
  supplier?: string;             // Supplier name
  description?: string;          // Item description
}
```

**Indexes**:
- `/section` (partition key)
- `/ownerId`
- `/status`
- `/category`

---

### 2. Transactions Collection

**Container ID**: `Transactions`

**Partition Key**: `/section`

**Schema**:
```typescript
interface Transaction {
  id: string;                    // Unique identifier
  invoiceNumber: string;         // INV-XXXXXX format
  date: string;                  // ISO timestamp
  type: string;                  // "SALE" | "INTERNAL_USAGE" | "DONATION"
  items: TransactionItem[];      // Array of items sold
  totalAmount: number;           // Total transaction value
  paymentMethod: string;         // "CASH" | "UPI" | "CARD" | "BANK_TRANSFER"
  customerName?: string;         // Customer name
  performedBy: string;           // User ID who performed transaction
  section: string;               // Section where transaction occurred
}

interface TransactionItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}
```

**Indexes**:
- `/section` (partition key)
- `/date`
- `/type`
- `/performedBy`

---

### 3. Activities Collection

**Container ID**: `Activities`

**Partition Key**: `/section`

**Schema**:
```typescript
interface Activity {
  id: string;                    // Unique identifier
  user: string;                  // User who performed action
  action: string;                // Action verb (created, updated, sold, etc.)
  target: string;                // Target of action (item name, invoice number)
  type: string;                  // "create" | "update" | "delete"
  section: string;               // Section where action occurred
  time: number;                  // Unix timestamp
}
```

**Indexes**:
- `/section` (partition key)
- `/user`
- `/time` (with DESC order)

---

### 4. PurchaseOrders Collection

**Container ID**: `PurchaseOrders`

**Partition Key**: `/section`

**Schema**:
```typescript
interface PurchaseOrder {
  id: string;                    // Unique identifier
  poNumber: string;              // PO-YYYY-XXX format
  dateCreated: string;           // ISO date
  status: string;                // "PENDING" | "APPROVED" | "RECEIVED" | "CANCELLED"
  items: PurchaseOrderItem[];    // Items to order
  vendor?: string;               // Vendor name
  totalEstimatedCost?: number;   // Total cost estimate
  createdBy: string;             // User who created PO
  approvedBy?: string;           // User who approved
  receivedDate?: string;         // Date when received
  notes?: string;                // Additional notes
  section: string;               // Section
}

interface PurchaseOrderItem {
  name: string;
  requestedQuantity: number;
  price?: number;
  receivedQuantity?: number;
}
```

**Indexes**:
- `/section` (partition key)
- `/status`
- `/dateCreated`

---

### 5. Users Collection (Future)

**Container ID**: `Users`

**Partition Key**: `/section`

**Schema**:
```typescript
interface User {
  id: string;                    // Unique identifier (username)
  name: string;                  // Display name
  email: string;                 // Email address
  role: string;                  // "admin" | "retailer"
  section: string;               // Assigned section
  passwordHash: string;          // Hashed password
  createdAt: string;             // Account creation date
  lastLogin?: string;            // Last login timestamp
  active: boolean;               // Account status
}
```

---

## Data Relationships

```
Items (1) ──────┐
                │
Transactions (M)├──── performedBy ───> Users (1)
                │
Activities (M) ─┘
                
PurchaseOrders (1) ── createdBy ───> Users (1)
```

---

## Partition Strategy

All collections use `/section` as partition key because:
- Queries are almost always section-specific
- Provides natural data isolation
- Scales well (3 sections currently)
- Supports cross-partition queries when needed (reports)

---

## Query Examples

### Get all items in PSD section:
```sql
SELECT * FROM Items c WHERE c.section = "PSD"
```

### Get low stock items:
```sql
SELECT * FROM Items c 
WHERE c.section = "Hospital" 
  AND c.status = "Low Stock"
```

### Get recent activities:
```sql
SELECT * FROM Activities c 
WHERE c.section = "NGO"
ORDER BY c.time DESC
```

### Get pending purchase orders:
```sql
SELECT * FROM PurchaseOrders c 
WHERE c.section = "PSD" 
  AND c.status = "PENDING"
```

---

## Capacity Planning

### Current Scale
- Items: ~500 per section = 1,500 total
- Transactions: ~100/day = 36,000/year
- Activities: ~500/day = 180,000/year
- POs: ~50/month = 600/year

### Year 1 Projection
- Items: ~5,000 total
- Transactions: ~100,000/year
- Activities: ~500,000/year
- POs: ~2,000/year

**Storage**: <1 GB in Year 1
**RU/s**: 400 RU/s sufficient

---

**Next**: [Authentication Guide](./06-AUTHENTICATION.md)
