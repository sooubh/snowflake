# API Documentation

## Overview

This document details all API endpoints available in the Medical Supply Chain Management System.

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Authentication

Currently using cookie-based authentication with simulated users.

**Cookie Name**: `simulated_user_id`

**Example**:
```
Cookie: simulated_user_id=admin-psd
```

---

## API Endpoints

### 1. Items API

#### GET /api/items

**Description**: Fetch inventory items

**Query Parameters**:
- `section` (optional): Filter by section (PSD, Hospital, NGO)

**Example**:
```bash
GET /api/items?section=PSD
```

**Response**:
```json
[
  {
    "id": "item-001",
    "name": "Paracetamol 500mg",
    "category": "Medicine",
    "quantity": 450,
    "price": 2.5,
    "unit": "tablets",
    "status": "In Stock",
    "ownerId": "psd-r1",
    "section": "PSD",
    "lastUpdated": "2026-01-01T10:00:00Z",
    "minQuantity": 100,
    "expiryDate": "2027-12-31",
    "batchNumber": "BATCH-001"
  }
]
```

---

#### POST /api/items

**Description**: Create new inventory item

**Request Body**:
```json
{
  "name": "Bandages",
  "category": "Medical Supplies",
  "quantity": 200,
  "price": 1.0,
  "unit": "pieces",
  "section": "Hospital",
  "ownerId": "hosp-r1",
  "minQuantity": 50,
  "description": "Sterile bandages",
  "supplier": "MedSupply Co"
}
```

**Response** (201 Created):
```json
{
  "id": "item-002",
  "name": "Bandages",
  "status": "In Stock",
  ...
}
```

---

#### PATCH /api/items/[id]

**Description**: Update existing item

**Request Body** (partial update allowed):
```json
{
  "quantity": 180,
  "price": 1.2
}
```

**Response** (200 OK):
```json
{
  "id": "item-002",
  "quantity": 180,
  "price": 1.2,
  ...
}
```

---

#### DELETE /api/items/[id]

**Description**: Delete item (soft delete)

**Response** (200 OK):
```json
{
  "message": "Item deleted successfully",
  "id": "item-002"
}
```

---

### 2. Sales API

#### POST /api/items/sell

**Description**: Process a sale transaction

**Request Body**:
```json
{
  "items": [
    {
      "itemId": "item-001",
      "quantity": 10,
      "price": 2.5
    }
  ],
  "section": "PSD",
  "transactionType": "SALE",
  "paymentMethod": "CASH",
  "customerName": "Walk-in Customer",
  "operatorId": "psd-r1"
}
```

**Response** (200 OK):
```json
{
  "id": "tx-001",
  "invoiceNumber": "INV-123456",
  "date": "2026-01-01T14:30:00Z",
  "items": [...],
  "totalAmount": 25.0,
  "paymentMethod": "CASH",
  "section": "PSD",
  "performedBy": "psd-r1",
  "updatedItems": ["item-001"]
}
```

**Side Effects**:
- Deducts stock quantities
- Updates item status (if needed)
- Logs activity for each item sold
- Logs main transaction activity

---

### 3. Procurement API

#### GET /api/procurement/orders

**Description**: Fetch purchase orders

**Query Parameters**:
- `section` (optional): Filter by section
- `status` (optional): Filter by status (PENDING, APPROVED, RECEIVED, CANCELLED)

**Response**:
```json
[
  {
    "id": "po-001",
    "poNumber": "PO-2026-001",
    "dateCreated": "2026-01-01",
    "status": "PENDING",
    "vendor": "MedSupply Co",
    "items": [
      {
        "name": "Syringes",
        "requestedQuantity": 1000,
        "price": 0.5
      }
    ],
    "totalEstimatedCost": 500,
    "createdBy": "admin-psd",
    "section": "PSD"
  }
]
```

---

#### POST /api/procurement/orders

**Description**: Create purchase order

**Request Body**:
```json
{
  "items": [
    {
      "name": "Syringes",
      "requestedQuantity": 1000,
      "price": 0.5
    }
  ],
  "vendor": "MedSupply Co",
  "section": "PSD",
  "notes": "Urgent order"
}
```

**Response** (201 Created):
```json
{
  "id": "po-001",
  "poNumber": "PO-2026-001",
  "status": "PENDING",
  ...
}
```

---

### 4. Reports API

#### GET /api/reports/sales

**Description**: Get sales data for reports

**Response**:
```json
{
  "transactions": [...],
  "totalRevenue": 50000,
  "orderCount": 245,
  "avgOrderValue": 204.08
}
```

---

#### GET /api/reports/inventory

**Description**: Get inventory data for reports

**Response**:
```json
{
  "items": [...],
  "totalValue": 125000,
  "lowStockCount": 15,
  "totalItems": 1500
}
```

---

## Error Responses

All APIs return standard error responses:

**400 Bad Request**:
```json
{
  "error": "Missing required fields"
}
```

**404 Not Found**:
```json
{
  "error": "Item not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to process request"
}
```

---

## Rate Limiting

Currently no rate limiting implemented.

**Future**: 100 requests per minute per user.

---

## Data Validation

All POST/PATCH requests validate:
- Required fields present
- Data types correct
- Value ranges appropriate
- Foreign key references valid

---

**Next**: [Component Guide](./04-COMPONENTS.md)
