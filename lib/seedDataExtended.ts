// IMPORTANT: Hospital and NGO seed data arrays (50 items each)
// Due to file size, these are defined separately and will be imported

type SeedDataItem = {
    name: string;
    category: string;
    quantity: number;
    price: number;
    status: "In Stock" | "Low Stock";
    expiryDate: string;
    manufacturingDate: string;
    batchNumber: string;
    supplier: string;
    description: string;
    unit: string;
    minQuantity: number;
};

// Helper function to add days to a date
const addDays = (date: Date, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
};

const today = new Date();

export const HOSPITAL_SEED_DATA: SeedDataItem[] = Array(50).fill(null).map((_, index) => {
    const baseItems = [
        { name: "Paracetamol 500mg", category: "Medicines", price: 2 },
        { name: "Amoxicillin 500mg", category: "Antibiotics", price: 8 },
        { name: "Insulin 100IU/ml", category: "Diabetes", price: 350 },
        { name: "N95 Face Masks", category: "PPE", price: 15 },
        { name: "Surgical Gloves", category: "PPE", price: 12 },
        // ... (pattern repeats with variations)
    ];

    const base = baseItems[index % baseItems.length];
    const variation = Math.floor(index / baseItems.length);

    return {
        name: `${base.name} ${variation > 0 ? `(Batch ${variation})` : ''}`,
        category: base.category,
        quantity: 1000 + Math.floor(Math.random() * 4000),
        price: base.price,
        status: Math.random() > 0.15 ? "In Stock" : "Low Stock" as "In Stock" | "Low Stock",
        expiryDate: addDays(today, 180 + Math.floor(Math.random() * 550)),
        manufacturingDate: addDays(today, -(30 + Math.floor(Math.random() * 150))),
        batchNumber: `MED2024-${String(1000 + index).padStart(4, '0')}`,
        supplier: "Medical Supplies Ltd",
        description: `Medical item ${index + 1}`,
        unit: base.category.includes("PPE") ? "piece" : "unit",
        minQuantity: 200
    };
});

export const NGO_SEED_DATA: SeedDataItem[] = Array(50).fill(null).map((_, index) => {
    const baseItems = [
        { name: "ORS Packets", category: "Emergency Medicine", price: 5 },
        { name: "Water Purification Tablets", category: "Emergency Supplies", price: 8 },
        { name: "Emergency Blankets", category: "Relief Supplies", price: 45 },
        { name: "Mosquito Nets", category: "Prevention", price: 120 },
        { name: "Vitamin Supplements", category: "Nutrition", price: 2 },
        // ... (pattern repeats)
    ];

    const base = baseItems[index % baseItems.length];
    const variation = Math.floor(index / baseItems.length);

    return {
        name: `${base.name} ${variation > 0 ? `(Type ${variation})` : ''}`,
        category: base.category,
        quantity: 500 + Math.floor(Math.random() * 3500),
        price: base.price,
        status: Math.random() > 0.2 ? "In Stock" : "Low Stock" as "In Stock" | "Low Stock",
        expiryDate: addDays(today, 365 + Math.floor(Math.random() * 730)),
        manufacturingDate: addDays(today, -(40 + Math.floor(Math.random() * 120))),
        batchNumber: `NGO2024-${String(1000 + index).padStart(4, '0')}`,
        supplier: "Relief Aid Corporation",
        description: `Relief item ${index + 1}`,
        unit: "piece",
        minQuantity: 150
    };
});
