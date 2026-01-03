import snowflake from 'snowflake-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- MOCK USERS for Stores ---
const RETAILERS = [
    { id: 'psd-r1', name: 'Central Store A', section: 'FDC' },
    { id: 'psd-r2', name: 'Central Store B', section: 'FDC' },
    { id: 'psd-r3', name: 'Central Store C', section: 'FDC' },
    { id: 'hosp-r1', name: 'City General', section: 'Hospital' },
    { id: 'hosp-r2', name: 'Rural PHC 1', section: 'Hospital' },
    { id: 'hosp-r3', name: 'Rural PHC 2', section: 'Hospital' },
    { id: 'ngo-r1', name: 'Relief Camp Alpha', section: 'NGO' },
    { id: 'ngo-r2', name: 'Relief Camp Beta', section: 'NGO' },
    { id: 'ngo-r3', name: 'Mobile Unit 1', section: 'NGO' },
];

// --- SECTION SPECIFIC ITEM CATALOGS ---

const FDC_ITEMS = [
    { name: "Basmati Rice Premium", category: "Grains", unit: "Kg", basePrice: 80.0, minQty: 500 },
    { name: "Wheat Flour (Atta)", category: "Grains", unit: "Kg", basePrice: 40.0, minQty: 400 },
    { name: "Toor Dal", category: "Pulses", unit: "Kg", basePrice: 120.0, minQty: 200 },
    { name: "Moong Dal", category: "Pulses", unit: "Kg", basePrice: 110.0, minQty: 200 },
    { name: "Sunflower Oil", category: "Oil", unit: "Liters", basePrice: 150.0, minQty: 100 },
    { name: "Mustard Oil", category: "Oil", unit: "Liters", basePrice: 160.0, minQty: 100 },
    { name: "Salt (Iodized)", category: "Spices", unit: "Kg", basePrice: 20.0, minQty: 300 },
    { name: "Sugar", category: "Sweeteners", unit: "Kg", basePrice: 45.0, minQty: 300 },
    { name: "Milk Powder", category: "Dairy", unit: "Kg", basePrice: 350.0, minQty: 50 },
    { name: "Canned Beans", category: "Canned Goods", unit: "Cans", basePrice: 60.0, minQty: 150 },
    { name: "Tea Leaves", category: "Beverages", unit: "Kg", basePrice: 400.0, minQty: 50 },
    { name: "Coffee Powder", category: "Beverages", unit: "Kg", basePrice: 800.0, minQty: 20 },
    { name: "Potato", category: "Vegetables", unit: "Kg", basePrice: 30.0, minQty: 500 },
    { name: "Onion", category: "Vegetables", unit: "Kg", basePrice: 40.0, minQty: 400 },
    { name: "Bottled Water 1L", category: "Beverages", unit: "Bottles", basePrice: 20.0, minQty: 1000 },
];

const HOSPITAL_ITEMS = [
    { name: "Paracetamol 500mg", category: "Medicine", unit: "Tablets", basePrice: 2.5, minQty: 500 },
    { name: "Amoxicillin 250mg", category: "Medicine", unit: "Capsules", basePrice: 5.0, minQty: 200 },
    { name: "Ibuprofen 400mg", category: "Medicine", unit: "Tablets", basePrice: 3.0, minQty: 300 },
    { name: "Ciprofloxacin 500mg", category: "Medicine", unit: "Tablets", basePrice: 8.0, minQty: 100 },
    { name: "Sterile Bandage", category: "Supplies", unit: "Rolls", basePrice: 15.0, minQty: 150 },
    { name: "Cotton Wool", category: "Supplies", unit: "Packets", basePrice: 20.0, minQty: 100 },
    { name: "Disposable Syringe 5ml", category: "Equipment", unit: "Pieces", basePrice: 8.0, minQty: 500 },
    { name: "Surgical Gloves", category: "Equipment", unit: "Pairs", basePrice: 12.0, minQty: 400 },
    { name: "N95 Mask", category: "Supplies", unit: "Pieces", basePrice: 45.0, minQty: 300 },
    { name: "IV Fluid (Saline)", category: "Medicine", unit: "Bottles", basePrice: 60.0, minQty: 100 },
    { name: "ORS Sachet", category: "Medicine", unit: "Sachets", basePrice: 5.0, minQty: 1000 },
    { name: "Vitamin C Tablets", category: "Medicine", unit: "Strips", basePrice: 35.0, minQty: 200 },
    { name: "Antiseptic Liquid", category: "Supplies", unit: "Bottles", basePrice: 85.0, minQty: 100 },
    { name: "Thermometer (Digital)", category: "Equipment", unit: "Pieces", basePrice: 250.0, minQty: 50 },
    { name: "Insulin Injection", category: "Medicine", unit: "Vials", basePrice: 350.0, minQty: 50 },
];

const NGO_ITEMS = [
    { name: "Woolen Blanket", category: "Relief", unit: "Pieces", basePrice: 500.0, minQty: 100 },
    { name: "Emergency Tent (4 Person)", category: "Shelter", unit: "Pieces", basePrice: 2500.0, minQty: 20 },
    { name: "Tarpaulin Sheet", category: "Shelter", unit: "Pieces", basePrice: 300.0, minQty: 100 },
    { name: "Hygiene Kit (Family)", category: "Hygiene", unit: "Kits", basePrice: 400.0, minQty: 150 },
    { name: "Mosquito Net", category: "Shelter", unit: "Pieces", basePrice: 250.0, minQty: 200 },
    { name: "Solar Lamp", category: "Electronics", unit: "Pieces", basePrice: 600.0, minQty: 50 },
    { name: "Water Purification Tablets", category: "Water", unit: "Strips", basePrice: 50.0, minQty: 500 },
    { name: "Dry Ration Pack", category: "Food", unit: "Packs", basePrice: 800.0, minQty: 100 },
    { name: "First Aid Kit", category: "Health", unit: "Kits", basePrice: 350.0, minQty: 80 },
    { name: "Folding Cot", category: "Shelter", unit: "Pieces", basePrice: 1200.0, minQty: 30 },
    { name: "Raincoat", category: "Clothing", unit: "Pieces", basePrice: 200.0, minQty: 150 },
    { name: "Jerry Can 20L", category: "Water", unit: "Pieces", basePrice: 150.0, minQty: 100 },
    { name: "Sanitary Pads", category: "Hygiene", unit: "Packets", basePrice: 40.0, minQty: 500 },
    { name: "Soap Bars", category: "Hygiene", unit: "Bars", basePrice: 15.0, minQty: 1000 },
    { name: "Flashlight", category: "Electronics", unit: "Pieces", basePrice: 100.0, minQty: 100 },
];

async function seedData() {
    console.log("🚀 Starting Inventory Seeding Process (Segregated)...");

    const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT!,
        username: process.env.SNOWFLAKE_USERNAME!,
        password: process.env.SNOWFLAKE_PASSWORD!,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
        database: process.env.SNOWFLAKE_DATABASE!,
        schema: process.env.SNOWFLAKE_SCHEMA!,
    });

    try {
        await new Promise<void>((resolve, reject) => {
            connection.connect((err, conn) => {
                if (err) {
                    console.error('❌ Unable to connect: ' + err.message);
                    reject(err);
                } else {
                    console.log('✅ Successfully connected to Snowflake.');
                    resolve();
                }
            });
        });

        // 1. CLEAR EXISTING DATA
        console.log("🧹 Clearing existing inventory data...");
        await new Promise((resolve, reject) => {
            connection.execute({
                sqlText: 'DELETE FROM ITEMS',
                complete: (err, stmt, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            });
        });
        console.log("✅ Data cleared.");


        // 2. SEED FRESH DATA
        for (const retailer of RETAILERS) {
            console.log(`\n📦 Seeding store: ${retailer.name} (${retailer.section})...`);

            let sourceCatalog;
            switch (retailer.section) {
                case 'FDC': sourceCatalog = FDC_ITEMS; break;
                case 'Hospital': sourceCatalog = HOSPITAL_ITEMS; break;
                case 'NGO': sourceCatalog = NGO_ITEMS; break;
                default: sourceCatalog = FDC_ITEMS;
            }

            const insertPromises: Promise<any>[] = [];

            // Construct batch insert
            const placeholders: string[] = [];
            const allBinds: any[] = [];
            const ITEMS_PER_STORE = 150;

            for (let i = 0; i < ITEMS_PER_STORE; i++) {
                // Pick a random item from the correct catalog
                const baseItem = sourceCatalog[i % sourceCatalog.length];

                // Add some variation
                const quantity = Math.floor(Math.random() * 500) + 10;
                // Price variation +/- 10%
                const price = +(baseItem.basePrice * (0.9 + Math.random() * 0.2)).toFixed(2);

                // Generate expiry date (between 30 days ago and 2 years future)
                const today = new Date();
                const expiryDate = new Date(today.getTime() + (Math.random() * 730 - 30) * 24 * 60 * 60 * 1000);

                // Determine status
                let status = 'In Stock';
                if (quantity <= 20) status = 'Low Stock';
                if (quantity === 0) status = 'Out of Stock';

                // Generate ID
                const id = Math.random().toString(36).substring(2, 11);

                placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

                allBinds.push(
                    id,
                    baseItem.name,
                    baseItem.category,
                    quantity,
                    price,
                    baseItem.unit,
                    status,
                    retailer.id,
                    retailer.section,
                    new Date().toISOString(),
                    baseItem.minQty,
                    expiryDate.toISOString(),
                    `Standard stock item: ${baseItem.name}`
                );
            }

            const query = `
                INSERT INTO ITEMS (
                    ID, NAME, CATEGORY, QUANTITY, PRICE, UNIT, STATUS,
                    OWNER_ID, SECTION, LAST_UPDATED, MIN_QUANTITY,
                    EXPIRY_DATE, DESCRIPTION
                ) VALUES ${placeholders.join(', ')}
            `;

            await new Promise((resolve, reject) => {
                connection.execute({
                    sqlText: query,
                    binds: allBinds,
                    complete: (err, stmt, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                });
            });

            console.log(`✅ Added ${ITEMS_PER_STORE} segmented items for ${retailer.name}`);
        }

        console.log("\n✨ Seeding Complete!");
        console.log("Verify in dashboard: FDC should see food, Hospital should see meds, NGO should see relief items.");

    } catch (err) {
        console.error('❌ Application error: ' + (err as Error).message);
    } finally {
        connection.destroy((err, conn) => {
            if (err) {
                console.error('Unable to disconnect: ' + err.message);
            } else {
                console.log('Disconnected connection with id: ' + connection.getId());
            }
        });
    }
}

seedData();
