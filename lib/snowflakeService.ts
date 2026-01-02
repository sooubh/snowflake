import snowflake from 'snowflake-sdk';

// Interfaces matching azureDefaults.ts
export interface StockItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
    lastUpdated: string;
    expiryDate?: string;
    manufacturingDate?: string;
    batchNumber?: string;
    supplier?: string;
    description?: string;
    unit?: string;
    minQuantity?: number;
    ownerId: string;
    section: 'FDC' | 'Hospital' | 'NGO';
}

export interface Transaction {
    id: string;
    invoiceNumber: string;
    date: string;
    type: 'SALE' | 'INTERNAL_USAGE' | 'DAMAGE' | 'EXPIRY';
    items: {
        itemId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        tax: number;
        subtotal: number;
    }[];
    totalAmount: number;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
    customerName?: string;
    customerContact?: string;
    section: string;
    performedBy: string;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    dateCreated: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
    items: {
        itemId: string;
        name: string;
        currentStock: number;
        requestedQuantity: number;
        unit: string;
        section: string;
        receivedQuantity?: number;
        price?: number;
    }[];
    totalEstimatedCost?: number;
    vendor?: string;
    notes?: string;
    createdBy: string;
    approvedBy?: string;
    receivedDate?: string;
}

export interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    type: 'update' | 'create' | 'delete' | 'alert';
    section: string;
}

export interface SystemStore {
    id: string;
    name: string;
    section: string;
    containerName: string;
    status: 'ACTIVE' | 'ARCHIVED';
    createdAt: string;
}

export class SnowflakeInventoryService {
    private connection: snowflake.Connection | null = null;
    private isConnected: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    constructor() {
        if (this.hasCredentials()) {
            this.connectionPromise = this.connect();
        } else {
            console.warn("⚠️ Snowflake credentials not found. Service will not connect.");
        }
    }

    private hasCredentials(): boolean {
        return !!(
            process.env.SNOWFLAKE_ACCOUNT &&
            process.env.SNOWFLAKE_USERNAME &&
            process.env.SNOWFLAKE_WAREHOUSE &&
            process.env.SNOWFLAKE_DATABASE &&
            process.env.SNOWFLAKE_SCHEMA
        );
    }

    private async connect(): Promise<void> {
        if (this.isConnected) return;

        return new Promise((resolve, reject) => {
            // Build connection config based on authentication method
            const config: any = {
                account: process.env.SNOWFLAKE_ACCOUNT!,
                username: process.env.SNOWFLAKE_USERNAME!,
                warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
                database: process.env.SNOWFLAKE_DATABASE!,
                schema: process.env.SNOWFLAKE_SCHEMA!,
            };

            // ALWAYS use password if available (server-side compatible)
            if (process.env.SNOWFLAKE_PASSWORD) {
                config.password = process.env.SNOWFLAKE_PASSWORD;
                console.log('🔐 Using password authentication');
            } else {
                console.error('❌ SNOWFLAKE_PASSWORD is required for server-side authentication!');
                reject(new Error('Missing SNOWFLAKE_PASSWORD'));
                return;
            }

            this.connection = snowflake.createConnection(config);

            this.connection.connect((err) => {
                if (err) {
                    console.error('❌ Failed to connect to Snowflake:', err);
                    this.isConnected = false;
                    reject(err);
                } else {
                    console.log('✅ Connected to Snowflake');
                    this.isConnected = true;
                    resolve();
                }
            });
        });
    }

    private async ensureConnected(): Promise<void> {
        if (!this.connectionPromise) {
            throw new Error('Snowflake not configured');
        }
        await this.connectionPromise;
    }

    private async executeQuery<T>(sqlText: string, binds?: any[]): Promise<T[]> {
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject(new Error('No connection established'));
                return;
            }

            this.connection.execute({
                sqlText,
                binds,
                complete: (err, stmt, rows) => {
                    if (err) {
                        console.error('Query execution error:', err);
                        reject(err);
                    } else {
                        // Convert Snowflake's UPPERCASE column names to lowercase
                        const results = (rows || []).map((row: any) => {
                            const converted: any = {};
                            for (const [key, value] of Object.entries(row)) {
                                // Convert column name to lowercase and handle both formats
                                const lowerKey = key.toLowerCase();
                                // Convert snake_case to camelCase for JavaScript
                                const camelKey = lowerKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                                converted[camelKey] = value;
                            }
                            return converted as T;
                        });
                        resolve(results);
                    }
                }
            });
        });
    }

    // --- ITEMS CRUD ---
    async getAllItems(section?: string, pageSize?: number, continuationToken?: string): Promise<StockItem[] | { items: StockItem[], continuationToken?: string }> {
        console.log(`🔍 getAllItems: section='${section}'`);

        if (!section) {
            console.warn("⚠️ getAllItems: No section provided. Returning empty.");
            return pageSize !== undefined ? { items: [], continuationToken: undefined } : [];
        }

        try {
            const query = 'SELECT * FROM ITEMS WHERE SECTION = ? ORDER BY LAST_UPDATED DESC';
            const items = await this.executeQuery<StockItem>(query, [section]);

            console.log(`✅ Found ${items.length} items in section ${section}`);
            return pageSize !== undefined ? { items, continuationToken: undefined } : items;
        } catch (error) {
            console.error('Failed to get items:', error);
            return pageSize !== undefined ? { items: [], continuationToken: undefined } : [];
        }
    }

    async getGlobalItems(): Promise<StockItem[]> {
        try {
            const query = 'SELECT * FROM ITEMS ORDER BY LAST_UPDATED DESC';
            return await this.executeQuery<StockItem>(query);
        } catch (error) {
            console.error('Failed to get global items:', error);
            return [];
        }
    }

    async getItem(id: string, section: string): Promise<StockItem | null> {
        try {
            const query = 'SELECT * FROM ITEMS WHERE ID = ? AND SECTION = ?';
            const results = await this.executeQuery<StockItem>(query, [id, section]);
            return results[0] || null;
        } catch (error) {
            console.error('Failed to get item:', error);
            return null;
        }
    }

    async addItem(item: Omit<StockItem, 'id' | 'lastUpdated'>): Promise<StockItem> {
        const id = Math.random().toString(36).substring(7);
        const now = new Date().toISOString();

        const query = `
            INSERT INTO ITEMS (
                ID, NAME, CATEGORY, QUANTITY, PRICE, UNIT, STATUS,
                OWNER_ID, SECTION, LAST_UPDATED, MIN_QUANTITY,
                EXPIRY_DATE, MANUFACTURING_DATE, BATCH_NUMBER,
                SUPPLIER, DESCRIPTION
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const binds = [
            id, item.name, item.category, item.quantity, item.price,
            item.unit || null, item.status, item.ownerId, item.section,
            now, item.minQuantity || null, item.expiryDate || null,
            item.manufacturingDate || null, item.batchNumber || null,
            item.supplier || null, item.description || null
        ];

        try {
            await this.executeQuery(query, binds);
            await this.logActivity(item.ownerId, 'added stock', item.name, 'create', item.section);
            return { ...item, id, lastUpdated: now } as StockItem;
        } catch (error) {
            console.error('Failed to add item:', error);
            return { ...item, id, lastUpdated: now } as StockItem;
        }
    }

    async updateItem(id: string, updates: Partial<StockItem>, section: string): Promise<StockItem | null> {
        try {
            const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'lastUpdated');
            if (fields.length === 0) {
                return await this.getItem(id, section);
            }

            const setClause = fields.map(f => {
                const snakeCase = f.replace(/([A-Z])/g, '_$1').toUpperCase();
                return `${snakeCase} = ?`;
            }).join(', ');

            const binds = [...fields.map(f => (updates as any)[f]), new Date().toISOString(), id, section];

            const query = `
                UPDATE ITEMS 
                SET ${setClause}, LAST_UPDATED = ?
                WHERE ID = ? AND SECTION = ?
            `;

            await this.executeQuery(query, binds);
            await this.logActivity('System', 'updated item', id, 'update', section);

            return await this.getItem(id, section);
        } catch (error) {
            console.error('Failed to update item:', error);
            return null;
        }
    }

    async deleteItem(id: string, section: string): Promise<boolean> {
        try {
            const item = await this.getItem(id, section);
            const query = 'DELETE FROM ITEMS WHERE ID = ? AND SECTION = ?';
            await this.executeQuery(query, [id, section]);

            if (item) {
                await this.logActivity('System', 'deleted item', item.name, 'delete', section);
            }
            return true;
        } catch (error) {
            console.error('Failed to delete item:', error);
            return false;
        }
    }

    // --- TRANSACTIONS ---
    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        const id = Math.random().toString(36).substring(7);

        try {
            const query = `
                INSERT INTO TRANSACTIONS (
                    ID, INVOICE_NUMBER, DATE, TYPE, ITEMS, 
                    TOTAL_AMOUNT, PAYMENT_METHOD, CUSTOMER_NAME, 
                    CUSTOMER_CONTACT, SECTION, PERFORMED_BY
                ) 
                SELECT ?, ?, ?, ?, PARSE_JSON(?), ?, ?, ?, ?, ?, ?
            `;

            const binds = [
                id,
                transaction.invoiceNumber,
                transaction.date,
                transaction.type,
                JSON.stringify(transaction.items),
                transaction.totalAmount,
                transaction.paymentMethod,
                transaction.customerName || null,
                transaction.customerContact || null,
                transaction.section,
                transaction.performedBy
            ];

            await this.executeQuery(query, binds);
            return { ...transaction, id };
        } catch (error) {
            console.error('Failed to create transaction:', error);
            return null;
        }
    }

    async getTransactions(section: string): Promise<Transaction[]> {
        try {
            const query = 'SELECT * FROM TRANSACTIONS WHERE SECTION = ? ORDER BY DATE DESC';
            return await this.executeQuery<Transaction>(query, [section]);
        } catch (error) {
            console.error('Failed to get transactions:', error);
            return [];
        }
    }

    async getAllTransactions(): Promise<Transaction[]> {
        try {
            const query = 'SELECT * FROM TRANSACTIONS ORDER BY DATE DESC';
            return await this.executeQuery<Transaction>(query);
        } catch (error) {
            console.error('Failed to get all transactions:', error);
            return [];
        }
    }

    // --- ACTIVITIES ---
    async logActivity(user: string, action: string, target: string, type: Activity['type'], section: string): Promise<void> {
        const id = Math.random().toString(36).substring(7);

        try {
            const query = `
                INSERT INTO ACTIVITIES (ID, USER, ACTION, TARGET, TIME, TYPE, SECTION)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            await this.executeQuery(query, [id, user, action, target, new Date().toISOString(), type, section]);
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }

    async getRecentActivities(section: string, limit: number = 5): Promise<Activity[]> {
        try {
            const query = 'SELECT * FROM ACTIVITIES WHERE SECTION = ? ORDER BY TIME DESC LIMIT ?';
            return await this.executeQuery<Activity>(query, [section, limit]);
        } catch (error) {
            console.error('Failed to get recent activities:', error);
            return [];
        }
    }

    async getAllActivities(): Promise<Activity[]> {
        try {
            const query = 'SELECT * FROM ACTIVITIES ORDER BY TIME DESC';
            return await this.executeQuery<Activity>(query);
        } catch (error) {
            console.error('Failed to get all activities:', error);
            return [];
        }
    }

    // --- PURCHASE ORDERS ---
    async createOrder(order: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder | null> {
        const id = Math.random().toString(36).substring(7);

        try {
            const query = `
                INSERT INTO PURCHASE_ORDERS (
                    ID, PO_NUMBER, DATE_CREATED, STATUS, ITEMS, VENDOR,
                    TOTAL_ESTIMATED_COST, CREATED_BY, APPROVED_BY, RECEIVED_DATE, NOTES
                ) 
                SELECT ?, ?, ?, ?, PARSE_JSON(?), ?, ?, ?, ?, ?, ?
            `;

            const binds = [
                id,
                order.poNumber,
                order.dateCreated,
                order.status,
                JSON.stringify(order.items),
                order.vendor || null,
                order.totalEstimatedCost || null,
                order.createdBy,
                order.approvedBy || null,
                order.receivedDate || null,
                order.notes || null
            ];

            await this.executeQuery(query, binds);
            return { ...order, id };
        } catch (error) {
            console.error('Failed to create order:', error);
            return null;
        }
    }

    async getOrders(): Promise<PurchaseOrder[]> {
        try {
            const query = 'SELECT * FROM PURCHASE_ORDERS ORDER BY DATE_CREATED DESC';
            return await this.executeQuery<PurchaseOrder>(query);
        } catch (error) {
            console.error('Failed to get orders:', error);
            return [];
        }
    }

    async updateOrder(id: string, updates: Partial<PurchaseOrder>, currentStatus: string): Promise<PurchaseOrder | null> {
        try {
            const fields = Object.keys(updates).filter(k => k !== 'id');
            if (fields.length === 0) return null;

            const setClauses: string[] = [];
            const binds: any[] = [];

            for (const field of fields) {
                const snakeCase = field.replace(/([A-Z])/g, '_$1').toUpperCase();

                if (field === 'items') {
                    setClauses.push(`${snakeCase} = PARSE_JSON(?)`);
                    binds.push(JSON.stringify((updates as any)[field]));
                } else {
                    setClauses.push(`${snakeCase} = ?`);
                    binds.push((updates as any)[field]);
                }
            }

            binds.push(id);

            const query = `
                UPDATE PURCHASE_ORDERS 
                SET ${setClauses.join(', ')}
                WHERE ID = ?
            `;

            await this.executeQuery(query, binds);

            const result = await this.executeQuery<PurchaseOrder>('SELECT * FROM PURCHASE_ORDERS WHERE ID = ?', [id]);
            return result[0] || null;
        } catch (error) {
            console.error('Failed to update order:', error);
            return null;
        }
    }

    // --- STORES ---
    async getSystemStores(): Promise<SystemStore[]> {
        try {
            const query = 'SELECT * FROM STORES WHERE STATUS = ? ORDER BY SECTION, NAME';
            return await this.executeQuery<SystemStore>(query, ['ACTIVE']);
        } catch (error) {
            console.error('Failed to get system stores:', error);
            return [];
        }
    }

    async addStore(storeName: string, section: string = "General"): Promise<SystemStore | null> {
        const id = Math.random().toString(36).substring(7);
        const containerName = `Items_${storeName.replace(/\s+/g, '')}`;

        try {
            const query = `
                INSERT INTO STORES (ID, NAME, SECTION, CONTAINER_NAME, STATUS, CREATED_AT)
                VALUES (?, ?, ?, ?, 'ACTIVE', ?)
            `;

            await this.executeQuery(query, [id, storeName, section, containerName, new Date().toISOString()]);

            return {
                id,
                name: storeName,
                section,
                containerName,
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to add store:', error);
            return null;
        }
    }

    async deleteStore(storeId: string): Promise<boolean> {
        try {
            const query = 'DELETE FROM STORES WHERE ID = ?';
            await this.executeQuery(query, [storeId]);
            return true;
        } catch (error) {
            console.error('Failed to delete store:', error);
            return false;
        }
    }

    async updateStore(storeId: string, updates: Partial<SystemStore>): Promise<SystemStore | null> {
        try {
            const fields = Object.keys(updates).filter(k => k !== 'id');
            if (fields.length === 0) return null;

            const setClause = fields.map(f => {
                const snakeCase = f.replace(/([A-Z])/g, '_$1').toUpperCase();
                return `${snakeCase} = ?`;
            }).join(', ');

            const binds = [...fields.map(f => (updates as any)[f]), storeId];

            const query = `UPDATE STORES SET ${setClause} WHERE ID = ?`;
            await this.executeQuery(query, binds);

            const result = await this.executeQuery<SystemStore>('SELECT * FROM STORES WHERE ID = ?', [storeId]);
            return result[0] || null;
        } catch (error) {
            console.error('Failed to update store:', error);
            return null;
        }
    }

    async getStoresBySection(section: string): Promise<SystemStore[]> {
        try {
            const query = 'SELECT * FROM STORES WHERE SECTION = ? AND STATUS = ? ORDER BY NAME';
            return await this.executeQuery<SystemStore>(query, [section, 'ACTIVE']);
        } catch (error) {
            console.error('Failed to get stores by section:', error);
            return [];
        }
    }

    async getItemsByStore(storeId: string, section: string): Promise<StockItem[]> {
        try {
            const query = 'SELECT * FROM ITEMS WHERE OWNER_ID = ? AND SECTION = ?';
            return await this.executeQuery<StockItem>(query, [storeId, section]);
        } catch (error) {
            console.error('Failed to get items by store:', error);
            return [];
        }
    }

    async getTransactionsByStore(storeId: string): Promise<Transaction[]> {
        try {
            const query = 'SELECT * FROM TRANSACTIONS WHERE PERFORMED_BY = ? ORDER BY DATE DESC';
            return await this.executeQuery<Transaction>(query, [storeId]);
        } catch (error) {
            console.error('Failed to get transactions by store:', error);
            return [];
        }
    }

    async getOrdersByStore(storeId: string): Promise<PurchaseOrder[]> {
        try {
            const query = 'SELECT * FROM PURCHASE_ORDERS WHERE CREATED_BY = ? ORDER BY DATE_CREATED DESC';
            return await this.executeQuery<PurchaseOrder>(query, [storeId]);
        } catch (error) {
            console.error('Failed to get orders by store:', error);
            return [];
        }
    }

    async refreshStoreCache(): Promise<void> {
        console.log('ℹ️ Store cache refresh not needed for Snowflake');
    }
}

export const snowflakeService = new SnowflakeInventoryService();
