import { CosmosClient } from "@azure/cosmos";

// Interfaces for our data
export interface StockItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
    lastUpdated: string;
    expiryDate?: string; // ISO Date String
    manufacturingDate?: string; // ISO Date String
    batchNumber?: string;
    supplier?: string;
    description?: string;
    unit?: string;       // e.g., 'box', 'vial', 'kg'
    minQuantity?: number; // Threshold for reorder alert
    ownerId: string;
    section: 'FDC' | 'Hospital' | 'NGO';
}

// Configuration
const ENDPOINT = process.env.AZURE_COSMOS_ENDPOINT;
const KEY = process.env.AZURE_COSMOS_KEY;
const DATABASE_NAME = "InventoryDB";

// Map Sections to Container Names
const CONTAINERS = {
    FDC: "Items_FDC",
    Hospital: "Items_Hospital",
    NGO: "Items_NGO"
};
const ACTIVITIES_CONTAINER = "Activities";
const TRANSACTIONS_CONTAINER = "Transactions";
const ORDERS_CONTAINER = "Orders";

const STORES_CONTAINER = "Stores";

export interface Transaction {
    id: string;
    invoiceNumber: string;
    date: string; // ISO String
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
    performedBy: string; // User ID or Name
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

// ... (Existing interfaces)

export class AzureInventoryService {
    private client: CosmosClient | null = null;
    private isConnected: boolean = false;
    // Cache for dynamic containers
    private dynamicStores: Record<string, string> = {};

    constructor() {
        if (ENDPOINT && KEY) {
            this.client = new CosmosClient({ endpoint: ENDPOINT, key: KEY });
            this.isConnected = true;
            this.initContainers();
            this.refreshStoreCache(); // Load dynamic stores
        } else {
            console.warn("Azure Cosmos DB credentials not found.");
        }
    }

    private async initContainers() {
        if (!this.client || !this.isConnected) return;
        try {
            const db = this.client.database(DATABASE_NAME);
            await db.read();

            // Create Stock Containers (Static)
            for (const [key, containerName] of Object.entries(CONTAINERS)) {
                await db.containers.createIfNotExists({ id: containerName, partitionKey: "/category" });
            }

            // Create System Containers
            await db.containers.createIfNotExists({ id: ACTIVITIES_CONTAINER, partitionKey: "/section" });
            await db.containers.createIfNotExists({ id: TRANSACTIONS_CONTAINER, partitionKey: "/section" });
            await db.containers.createIfNotExists({ id: ORDERS_CONTAINER, partitionKey: "/status" });
            await db.containers.createIfNotExists({ id: STORES_CONTAINER, partitionKey: "/section" });

            console.log("✅ Verified All Containers");

        } catch (e) {
            console.error("Error initializing containers:", e);
        }
    }

    async refreshStoreCache() {
        if (!this.isConnected || !this.client) return;
        try {
            const container = this.client.database(DATABASE_NAME).container(STORES_CONTAINER);
            const { resources } = await container.items.query("SELECT * FROM c").fetchAll();

            // Update dynamic cache
            resources.forEach((r: any) => {
                this.dynamicStores[r.name] = r.containerName;
            });
        } catch (e) {
            console.warn("Failed to refresh store cache", e);
        }
    }

    private getContainer(section: string) {
        if (!this.client) {
            console.error("❌ getContainer: Client is null");
            return null;
        }

        let containerName = CONTAINERS[section as keyof typeof CONTAINERS];

        // If not in static, check dynamic
        if (!containerName) {
            containerName = this.dynamicStores[section];
        }

        // Fallback or Error
        if (!containerName) {
            // Try to construct standard naming convention as last resort or default to Hospital
            // But if it really doesn't exist, this might fail.
            console.warn(`⚠️ Warning: Unknown section '${section}', checking dynamic cache...`);
            // We return Hospital as a fail-safe to prevent crashing, BUT for Admin Create this is bad.
            // Let's assume if it's not found, we return null? 
            // Existing code defaults to Hospital. We keep that for safety but log warning.
            containerName = CONTAINERS.Hospital;
        }

        return this.client.database(DATABASE_NAME).container(containerName);
    }

    // --- STORE MANAGEMENT ---
    async getSystemStores(): Promise<SystemStore[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(STORES_CONTAINER);
            const { resources } = await container.items.query("SELECT * FROM c").fetchAll();

            // Check and Seed Default Stores & Retailers
            const existingNames = new Set(resources.map((r: any) => r.name));

            const seedData = [
                // Infrastructure
                { name: "Hospital", section: "Hospital" },
                { name: "PSD", section: "PSD" },
                { name: "NGO", section: "NGO" },
                // PSD Retailers
                { name: "Central Store A", section: "PSD" },
                { name: "Central Store B", section: "PSD" },
                { name: "Central Store C", section: "PSD" },
                // Hospital Retailers
                { name: "City General", section: "Hospital" },
                { name: "Rural PHC 1", section: "Hospital" },
                { name: "Rural PHC 2", section: "Hospital" },
                // NGO Retailers
                { name: "Relief Camp Alpha", section: "NGO" },
                { name: "Relief Camp Beta", section: "NGO" },
                { name: "Mobile Unit 1", section: "NGO" }
            ];

            const missingItems = seedData.filter(d => !existingNames.has(d.name));

            if (missingItems.length > 0) {
                console.log("Seeding missing stores:", missingItems.map(i => i.name));
                for (const item of missingItems) {
                    await this.addStore(item.name, item.section);
                }
                // Refetch to get the newly created stores with IDs
                const { resources: updatedResources } = await container.items.query("SELECT * FROM c").fetchAll();
                return updatedResources as SystemStore[];
            }

            return resources as SystemStore[];
        } catch (e) {
            console.error("Failed to fetch stores", e);
            return [];
        }
    }

    async addStore(storeName: string, section: string = "General"): Promise<SystemStore | null> {
        if (!this.isConnected || !this.client) return null;
        try {
            const db = this.client.database(DATABASE_NAME);
            const containerId = `Items_${storeName.replace(/\s+/g, '')}`;

            // 1. Create actual container
            await db.containers.createIfNotExists({ id: containerId, partitionKey: "/category" });

            // 2. Register in Stores container
            const newStore: SystemStore = {
                id: Math.random().toString(36).substring(7),
                name: storeName,
                section: section,
                containerName: containerId,
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            };

            const storesContainer = db.container(STORES_CONTAINER);
            await storesContainer.items.create(newStore);

            // 3. Update Cache
            this.dynamicStores[storeName] = containerId;

            return newStore;
        } catch (e) {
            console.error("Failed to add store:", e);
            return null;
        }
    }

    async deleteStore(storeId: string): Promise<boolean> {
        if (!this.isConnected || !this.client) return false;
        try {
            const db = this.client.database(DATABASE_NAME);
            const storesContainer = db.container(STORES_CONTAINER);

            // 1. Get Store Info
            const { resource: store } = await storesContainer.item(storeId, undefined).read(); // If PK is section, we need it. 
            // Actually, we need to query by ID first if we don't know section (PK).
            const { resources } = await storesContainer.items.query(`SELECT * FROM c WHERE c.id = '${storeId}'`).fetchAll();

            if (resources.length === 0) return false;
            const targetStore = resources[0];

            // 2. Delete the Items Container (DANGEROUS!)
            // Check if it's a default container?
            if (Object.values(CONTAINERS).includes(targetStore.containerName)) {
                console.warn("Cannot delete default system container via API.");
                return false;
            }

            try {
                await db.container(targetStore.containerName).delete();
            } catch (containerErr) {
                console.warn("Container might barely exist or already deleted", containerErr);
            }

            // 3. Remove from Stores registry
            await storesContainer.item(targetStore.id, targetStore.section).delete();

            // 4. Update Cache
            delete this.dynamicStores[targetStore.name];

            return true;
        } catch (e) {
            console.error("Failed to delete store:", e);
            return false;
        }
    }

    async updateStore(storeId: string, updates: Partial<SystemStore>): Promise<SystemStore | null> {
        if (!this.isConnected || !this.client) return null;
        try {
            const db = this.client.database(DATABASE_NAME);
            const storesContainer = db.container(STORES_CONTAINER);

            // 1. Get Store Info
            const { resources } = await storesContainer.items.query(`SELECT * FROM c WHERE c.id = '${storeId}'`).fetchAll();
            if (resources.length === 0) return null;

            const existingStore = resources[0];
            const updatedStore = {
                ...existingStore,
                ...updates
            };

            // 2. Update via Replace
            const { resource } = await storesContainer.item(storeId, existingStore.section).replace(updatedStore);

            // 3. Update Cache if name changed (Container name usually shouldn't change easily without migration, currently ignoring container rename complexity)
            if (updates.name) {
                delete this.dynamicStores[existingStore.name];
                this.dynamicStores[updatedStore.name] = updatedStore.containerName;
            }

            return resource as SystemStore;
        } catch (e) {
            console.error("Failed to update store:", e);
            return null;
        }
    }



    // ... (rest of methods, getContainer needs to be updated or is already updated above)
    // IMPORTANT: getAllItems and getGlobalItems only loop over static CONTAINERS. 
    // We should fix them.



    // ... Copy implementation of other methods if needed, or if I'm replacing the whole class ...
    // The prompt says "Use replace_file_content". I should target specific blocks if possible, or use multi_replace.
    // Given the complexity of injecting "dynamicStores" property and modifying initContainers + getGlobalItems,
    // It is safer to REPLACE THE WHOLE CLASS or Large Chunks.
    // I will use START and END lines carefully.


    // --- ACTIVITY LOGGING ---
    async logActivity(user: string, action: string, target: string, type: Activity['type'], section: string) {
        if (!this.isConnected || !this.client) return;
        try {
            const container = this.client.database(DATABASE_NAME).container(ACTIVITIES_CONTAINER);
            const activity: Activity = {
                id: Math.random().toString(36).substring(7),
                user,
                action,
                target,
                time: new Date().toISOString(),
                type,
                section
            };
            await container.items.create(activity);
        } catch (e) {
            console.error("Failed to log activity:", e);
        }
    }

    // --- ORDER MANAGEMENT ---
    async createOrder(order: Omit<PurchaseOrder, "id">): Promise<PurchaseOrder | null> {
        if (!this.isConnected || !this.client) return null;
        try {
            const container = this.client.database(DATABASE_NAME).container(ORDERS_CONTAINER);
            const newOrder: PurchaseOrder = {
                ...order,
                id: Math.random().toString(36).substring(7)
            };
            const { resource } = await container.items.create(newOrder);
            return resource as PurchaseOrder;
        } catch (e) {
            console.error("Failed to create purchase order:", e);
            return null;
        }
    }

    async getOrders(): Promise<PurchaseOrder[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(ORDERS_CONTAINER);
            const { resources } = await container.items
                .query("SELECT * FROM c ORDER BY c.dateCreated DESC")
                .fetchAll();
            return resources as PurchaseOrder[];
        } catch (e) {
            console.error("Failed to fetch purchase orders:", e);
            return [];
        }
    }

    async updateOrder(id: string, updates: Partial<PurchaseOrder>, currentStatus: string): Promise<PurchaseOrder | null> {
        if (!this.isConnected || !this.client) return null;
        try {
            const container = this.client.database(DATABASE_NAME).container(ORDERS_CONTAINER);

            // Query to find the order
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.id = @id",
                parameters: [{ name: "@id", value: id }]
            }).fetchAll();

            if (resources.length === 0) return null;

            const existingOrder = resources[0];
            const updatedOrder = {
                ...existingOrder,
                ...updates
            };

            // Replace using status as partition key
            const { resource } = await container.item(id, currentStatus).replace(updatedOrder);
            return resource as PurchaseOrder;
        } catch (e) {
            console.error("Failed to update purchase order:", e);
            return null;
        }
    }

    // --- TRANSACTION LOGGING ---
    async createTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction | null> {
        if (!this.isConnected || !this.client) return null;
        try {
            const container = this.client.database(DATABASE_NAME).container(TRANSACTIONS_CONTAINER);
            const newTransaction: Transaction = {
                ...transaction,
                id: Math.random().toString(36).substring(7)
            };
            const { resource } = await container.items.create(newTransaction);
            return resource as Transaction;
        } catch (e) {
            console.error("Failed to create transaction:", e);
            return null;
        }
    }

    async getTransactions(section: string): Promise<Transaction[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(TRANSACTIONS_CONTAINER);
            const { resources } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.section = @section ORDER BY c.date DESC",
                    parameters: [{ name: "@section", value: section }]
                })
                .fetchAll();
            return resources as Transaction[];
        } catch (e) {
            console.error("Failed to fetch transactions:", e);
            return [];
        }
    }

    async getAllTransactions(): Promise<Transaction[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(TRANSACTIONS_CONTAINER);
            const { resources } = await container.items
                .query("SELECT * FROM c ORDER BY c.date DESC")
                .fetchAll();
            return resources as Transaction[];
        } catch (e) {
            console.error("Failed to fetch all transactions:", e);
            return [];
        }
    }

    async getAllActivities(): Promise<Activity[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(ACTIVITIES_CONTAINER);
            const { resources } = await container.items
                .query("SELECT * FROM c ORDER BY c.time DESC")
                .fetchAll();
            return resources as Activity[];
        } catch (e) {
            console.error("Failed to fetch all activities:", e);
            return [];
        }
    }

    async getRecentActivities(section: string, limit: number = 5): Promise<Activity[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(ACTIVITIES_CONTAINER);
            const { resources } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.section = @section ORDER BY c.time DESC OFFSET 0 LIMIT @limit",
                    parameters: [
                        { name: "@section", value: section },
                        { name: "@limit", value: limit }
                    ]
                })
                .fetchAll();
            return resources as Activity[];
        } catch (e) {
            console.error("Failed to fetch activities:", e);
            return [];
        }
    }

    // ALL ITEMS now requires knowing the SECTION (Container)
    async getAllItems(section?: string, pageSize?: number, continuationToken?: string): Promise<StockItem[] | { items: StockItem[], continuationToken?: string }> {
        console.log(`🚀 getAllItems: Started for section '${section}'`);

        if (!section) {
            console.warn("⚠️ getAllItems: No section provided. Returning empty.");
            return pageSize !== undefined ? { items: [], continuationToken: undefined } : [];
        }

        if (this.isConnected && this.client) {
            try {
                // Refresh cache if section is unknown to ensure we have latest containers
                if (!CONTAINERS[section as keyof typeof CONTAINERS] && !this.dynamicStores[section]) {
                    console.log(`Checking remote cache for section '${section}'...`);
                    await this.refreshStoreCache();
                }

                const container = this.getContainer(section);
                if (container) {
                    console.log(`⚡ Querying Cosmos container: ${container.id} for section: ${section}...`);

                    // If pageSize provided, use pagination
                    if (pageSize !== undefined) {
                        const queryIterator = container.items.query({
                            query: "SELECT * from c WHERE c.section = @section ORDER BY c.lastUpdated DESC",
                            parameters: [{ name: "@section", value: section }]
                        }, { maxItemCount: pageSize, continuationToken });

                        const { resources, continuationToken: newToken } = await queryIterator.fetchNext();
                        console.log(`✅ getAllItems (paginated): Found ${resources.length} items`);
                        return { items: resources as StockItem[], continuationToken: newToken };
                    }

                    // Original behavior - fetch all
                    const { resources } = await container.items.query({
                        query: "SELECT * from c WHERE c.section = @section",
                        parameters: [{ name: "@section", value: section }]
                    }).fetchAll();

                    console.log(`✅ getAllItems: Found ${resources.length} items in ${container.id}`);
                    return resources as StockItem[];
                } else {
                    console.error("❌ getAllItems: Container not found/initialized");
                }
            } catch (error) {
                console.error(`❌ getAllItems Error fetching from ${section}:`, error);
                return pageSize !== undefined ? { items: [], continuationToken: undefined } : [];
            }
        } else {
            console.warn("⚠️ getAllItems: Azure not connected");
        }
        return pageSize !== undefined ? { items: [], continuationToken: undefined } : [];
    }

    // FETCH ALL across ALL containers (For Super Admin or initial Debug)
    // FETCH ALL across ALL containers (Static + Dynamic)
    async getGlobalItems(): Promise<StockItem[]> {
        if (!this.isConnected || !this.client) return [];
        let all: StockItem[] = [];

        // Static
        for (const section of Object.keys(CONTAINERS)) {
            const itemsResult = await this.getAllItems(section);
            const items = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
            all = [...all, ...items];
        }

        // Dynamic
        for (const storeName of Object.keys(this.dynamicStores)) {
            if (Object.keys(CONTAINERS).includes(storeName)) continue;
            const itemsResult = await this.getAllItems(storeName);
            const items = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
            all = [...all, ...items];
        }

        return all;
    }

    async getItem(id: string, section: string): Promise<StockItem | null> {
        if (!this.isConnected || !this.client) return null;
        try {
            const container = this.getContainer(section);
            if (!container) return null;

            const { resources } = await container.items.query({
                query: "SELECT * from c WHERE c.id = @id",
                parameters: [{ name: "@id", value: id }]
            }).fetchAll();

            if (resources.length === 0) return null;
            return resources[0] as StockItem;
        } catch (error) {
            console.error("Failed to get item from Azure:", error);
            return null;
        }
    }

    async addItem(item: Omit<StockItem, "id" | "lastUpdated">): Promise<StockItem> {
        const newItem: StockItem = {
            ...item,
            id: Math.random().toString(36).substring(7),
            lastUpdated: new Date().toISOString(),
        };

        if (this.isConnected && this.client) {
            try {
                // Determine container from item.section
                const container = this.getContainer(newItem.section);
                if (container) {
                    const { resource } = await container.items.create(newItem);
                    // Log
                    this.logActivity(newItem.ownerId, "added stock", newItem.name, 'create', newItem.section);
                    return resource as StockItem;
                }
            } catch (error) {
                console.error("Failed to add to Azure:", error);
            }
        }
        return newItem;
    }

    async updateItem(id: string, updates: Partial<StockItem>, section: string): Promise<StockItem | null> {
        if (!this.isConnected || !this.client) return null;
        try {
            const container = this.getContainer(section);
            if (!container) return null;

            // 1. Query Item
            const { resources } = await container.items.query({
                query: "SELECT * from c WHERE c.id = @id",
                parameters: [{ name: "@id", value: id }]
            }).fetchAll();

            if (resources.length === 0) return null;
            const existingItem = resources[0];
            const updatedItem = { ...existingItem, ...updates, lastUpdated: new Date().toISOString() };

            // 2. Replace using Category PK
            const { resource } = await container.item(id, existingItem.category).replace(updatedItem);
            // Log
            this.logActivity("System", "updated item", existingItem.name, 'update', section);
            return resource as StockItem;

        } catch (error) {
            console.error("Failed to update in Azure:", error);
            return null;
        }
    }

    async deleteItem(id: string, section: string): Promise<boolean> {
        if (!this.isConnected || !this.client) return false;
        try {
            const container = this.getContainer(section);
            if (!container) return false;

            // 1. Need category for PK delete
            const { resources } = await container.items.query({
                query: "SELECT * from c WHERE c.id = @id",
                parameters: [{ name: "@id", value: id }]
            }).fetchAll();

            if (resources.length === 0) return false;

            await container.item(id, resources[0].category).delete();
            // Log
            this.logActivity("System", "deleted item", resources[0].name, 'delete', section);
            return true;
        } catch (error) {
            console.error("Failed to delete from Azure:", error);
            return false;
        }
    }

    // --- STORE-SPECIFIC QUERIES (NEW) ---

    /**
     * Get stores by section - for admins to see their sub-stores
     */
    async getStoresBySection(section: string): Promise<SystemStore[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(STORES_CONTAINER);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.section = @section AND c.status = 'ACTIVE'",
                parameters: [{ name: "@section", value: section }]
            }).fetchAll();
            return resources as SystemStore[];
        } catch (e) {
            console.error("Failed to fetch stores by section:", e);
            return [];
        }
    }

    /**
     * Get items for a specific store (by storeId)
     */
    async getItemsByStore(storeId: string, section: string): Promise<StockItem[]> {
        if (!this.isConnected) return [];
        try {
            const container = this.getContainer(section);
            if (!container) return [];

            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.ownerId = @storeId",
                parameters: [{ name: "@storeId", value: storeId }]
            }).fetchAll();
            return resources as StockItem[];
        } catch (e) {
            console.error("Failed to fetch items for store:", e);
            return [];
        }
    }

    /**
     * Get transactions for a specific store
     */
    async getTransactionsByStore(storeId: string): Promise<Transaction[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(TRANSACTIONS_CONTAINER);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.performedBy = @storeId ORDER BY c.date DESC",
                parameters: [{ name: "@storeId", value: storeId }]
            }).fetchAll();
            return resources as Transaction[];
        } catch (e) {
            console.error("Failed to fetch transactions for store:", e);
            return [];
        }
    }

    /**
     * Get orders for a specific store
     */
    async getOrdersByStore(storeId: string): Promise<PurchaseOrder[]> {
        if (!this.isConnected || !this.client) return [];
        try {
            const container = this.client.database(DATABASE_NAME).container(ORDERS_CONTAINER);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.createdBy = @storeId ORDER BY c.dateCreated DESC",
                parameters: [{ name: "@storeId", value: storeId }]
            }).fetchAll();
            return resources as PurchaseOrder[];
        } catch (e) {
            console.error("Failed to fetch orders for store:", e);
            return [];
        }
    }
}

export const azureService = new AzureInventoryService();
