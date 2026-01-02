// Comprehensive seed data for all three sections
// FDC (Food Distribution Center), Hospital, NGO
// 50 items per section that will be repeated across stores

export interface SeedDataItem {
    name: string;
    category: string;
    quantity: number;
    price: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
    expiryDate?: string;
    manufacturingDate?: string;
    batchNumber?: string;
    supplier?: string;
    description?: string;
    unit?: string;
    minQuantity?: number;
}

// Helper function to generate dates
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
};

const today = new Date();

// FDC (Food Distribution Center) - 50 Items
export const FDC_SEED_DATA: SeedDataItem[] = [
    { name: "Rice (Premium Basmati)", category: "Grains", quantity: 5000, price: 80, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -30), batchNumber: "RICE2024-001", supplier: "National Food Corporation", description: "Premium quality basmati rice", unit: "kg", minQuantity: 1000 },
    { name: "Wheat Flour (Fortified)", category: "Grains", quantity: 3500, price: 45, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -15), batchNumber: "WHEAT2024-042", supplier: "Government Mills", description: "Iron fortified wheat flour", unit: "kg", minQuantity: 800 },
    { name: "Sugar (Refined)", category: "Sweeteners", quantity: 2000, price: 50, status: "In Stock", expiryDate: addDays(today, 730), manufacturingDate: addDays(today, -45), batchNumber: "SUG2024-078", supplier: "State Sugar Mills", description: "Refined white sugar", unit: "kg", minQuantity: 500 },
    { name: "Dal (Toor)", category: "Pulses", quantity: 1800, price: 120, status: "In Stock", expiryDate: addDays(today, 270), manufacturingDate: addDays(today, -20), batchNumber: "DAL2024-033", supplier: "Pulses Board", description: "High-quality toor dal", unit: "kg", minQuantity: 400 },
    { name: "Dal (Moong)", category: "Pulses", quantity: 1200, price: 140, status: "In Stock", expiryDate: addDays(today, 240), manufacturingDate: addDays(today, -10), batchNumber: "DAL2024-045", supplier: "Pulses Board", description: "Green moong dal", unit: "kg", minQuantity: 300 },
    { name: "Cooking Oil (Sunflower)", category: "Oils", quantity: 800, price: 150, status: "Low Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -60), batchNumber: "OIL2024-012", supplier: "National Oils Ltd", description: "Refined sunflower oil", unit: "litre", minQuantity: 200 },
    { name: "Salt (Iodized)", category: "Condiments", quantity: 4000, price: 20, status: "In Stock", expiryDate: addDays(today, 1095), manufacturingDate: addDays(today, -90), batchNumber: "SALT2023-189", supplier: "Salt Department", description: "Iodized table salt", unit: "kg", minQuantity: 1000 },
    { name: "Milk Powder (Fortified)", category: "Dairy", quantity: 600, price: 380, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -30), batchNumber: "MILK2024-056", supplier: "National Dairy", description: "Fortified milk powder", unit: "kg", minQuantity: 150 },
    { name: "Biscuits (Nutrition)", category: "Snacks", quantity: 2500, price: 40, status: "In Stock", expiryDate: addDays(today, 120), manufacturingDate: addDays(today, -20), batchNumber: "BISC2024-089", supplier: "Nutrition Foods", description: "High-protein biscuits", unit: "packet", minQuantity: 500 },
    { name: "Tea (CTC)", category: "Beverages", quantity: 300, price: 280, status: "Low Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -45), batchNumber: "TEA2024-034", supplier: "Tea Board", description: "CTC tea leaves", unit: "kg", minQuantity: 100 },
    { name: "Chickpeas (Kabuli Chana)", category: "Pulses", quantity: 950, price: 130, status: "In Stock", expiryDate: addDays(today, 300), manufacturingDate: addDays(today, -25), batchNumber: "CHANA2024-067", supplier: "Pulses Board", description: "Premium kabuli chickpeas", unit: "kg", minQuantity: 250 },
    { name: "Black Gram (Urad Dal)", category: "Pulses", quantity: 750, price: 135, status: "In Stock", expiryDate: addDays(today, 270), manufacturingDate: addDays(today, -18), batchNumber: "URAD2024-042", supplier: "Pulses Board", description: "Black gram lentils", unit: "kg", minQuantity: 200 },
    { name: "Mustard Oil", category: "Oils", quantity: 450, price: 160, status: "Low Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -50), batchNumber: "MUST2024-023", supplier: "National Oils Ltd", description: "Pure mustard oil", unit: "litre", minQuantity: 150 },
    { name: "Turmeric Powder", category: "Spices", quantity: 200, price: 180, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -40), batchNumber: "TURM2024-011", supplier: "Spice Board", description: "Pure turmeric powder", unit: "kg", minQuantity: 50 },
    { name: "Red Chilli Powder", category: "Spices", quantity: 180, price: 200, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -35), batchNumber: "CHIL2024-009", supplier: "Spice Board", description: "Red chilli powder", unit: "kg", minQuantity: 50 },
    { name: "Coriander Powder", category: "Spices", quantity: 150, price: 140, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -30), batchNumber: "CORI2024-015", supplier: "Spice Board", description: "Coriander powder", unit: "kg", minQuantity: 40 },
    { name: "Soap Bars", category: "Hygiene", quantity: 3000, price: 25, status: "In Stock", expiryDate: addDays(today, 730), manufacturingDate: addDays(today, -60), batchNumber: "SOAP2024-145", supplier: "Hygiene Products Ltd", description: "Bathing soap bars", unit: "piece", minQuantity: 800 },
    { name: "Detergent Powder", category: "Hygiene", quantity: 1200, price: 45, status: "In Stock", expiryDate: addDays(today, 730), manufacturingDate: addDays(today, -50), batchNumber: "DET2024-087", supplier: "Hygiene Products Ltd", description: "Washing detergent powder", unit: "kg", minQuantity: 300 },
    { name: "Sanitary Napkins", category: "Hygiene", quantity: 500, price: 60, status: "In Stock", expiryDate: addDays(today, 1095), manufacturingDate: addDays(today, -40), batchNumber: "SAN2024-034", supplier: "Women Hygiene Corp", description: "Sanitary napkin packs", unit: "packet", minQuantity: 150 },
    { name: "Toothpaste", category: "Hygiene", quantity: 800, price: 35, status: "In Stock", expiryDate: addDays(today, 730), manufacturingDate: addDays(today, -90), batchNumber: "TOOTH2023-234", supplier: "Oral Care Ltd", description: "Fluoride toothpaste", unit: "tube", minQuantity: 200 },
    { name: "Vermicelli", category: "Grains", quantity: 600, price: 55, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -20), batchNumber: "VERM2024-045", supplier: "Grain Processing", description: "Roasted vermicelli", unit: "kg", minQuantity: 150 },
    { name: "Poha (Flattened Rice)", category: "Grains", quantity: 450, price: 60, status: "Low Stock", expiryDate: addDays(today, 120), manufacturingDate: addDays(today, -15), batchNumber: "POHA2024-028", supplier: "Grain Processing", description: "Thick poha", unit: "kg", minQuantity: 150 },
    { name: "Jaggery", category: "Sweeteners", quantity: 800, price: 70, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -60), batchNumber: "JAG2024-056", supplier: "Sugarcane Board", description: "Pure jaggery blocks", unit: "kg", minQuantity: 200 },
    { name: "Groundnut", category: "Oilseeds", quantity: 350, price: 120, status: "Low Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -25), batchNumber: "NUT2024-034", supplier: "Oilseeds Board", description: "Raw groundnuts", unit: "kg", minQuantity: 120 },
    { name: "Bengal Gram", category: "Pulses", quantity: 580, price: 115, status: "In Stock", expiryDate: addDays(today, 270), manufacturingDate: addDays(today, -18), batchNumber: "BENG2024-067", supplier: "Pulses Board", description: "Bengal gram dal", unit: "kg", minQuantity: 150 },
    { name: "Green Gram (Moong Whole)", category: "Pulses", quantity: 420, price: 145, status: "In Stock", expiryDate: addDays(today, 240), manufacturingDate: addDays(today, -12), batchNumber: "GREEN2024-051", supplier: "Pulses Board", description: "Whole green moong", unit: "kg", minQuantity: 120 },
    { name: "Rava (Semolina)", category: "Grains", quantity: 700, price: 50, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -22), batchNumber: "RAVA2024-038", supplier: "Government Mills", description: "Fine semolina", unit: "kg", minQuantity: 180 },
    { name: "Maida (All Purpose Flour)", category: "Grains", quantity: 650, price: 42, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -16), batchNumber: "MAIDA2024-043", supplier: "Government Mills", description: "Refined wheat flour", unit: "kg", minQuantity: 160 },
    { name: "Matchboxes", category: "Household", quantity: 2000, price: 10, status: "In Stock", expiryDate: addDays(today, 1825), manufacturingDate: addDays(today, -120), batchNumber: "MATCH2023-089", supplier: "Match Corporation", description: "Safety matchboxes", unit: "box", minQuantity: 500 },
    { name: "Kerosene", category: "Fuel", quantity: 1500, price: 65, status: "In Stock", expiryDate: addDays(today, 1825), manufacturingDate: addDays(today, -90), batchNumber: "KERO2023-234", supplier: "Petroleum Corp", description: "Subsidized kerosene", unit: "litre", minQuantity: 400 },
    // 20 more items to reach 50
    { name: "Coffee Powder", category: "Beverages", quantity: 180, price: 320, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -40), batchNumber: "COFFEE2024-012", supplier: "Coffee Board", description: "Instant coffee powder", unit: "kg", minQuantity: 50 },
    { name: "Coconut Oil", category: "Oils", quantity: 320, price: 180, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -55), batchNumber: "COCO2024-018", supplier: "Coconut Board", description: "Pure coconut oil", unit: "litre", minQuantity: 100 },
    { name: "Groundnut Oil", category: "Oils", quantity: 280, price: 155, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -48), batchNumber: "GNUT2024-025", supplier: "National Oils Ltd", description: "Cold-pressed groundnut oil", unit: "litre", minQuantity: 80 },
    { name: "Cumin Seeds", category: "Spices", quantity: 120, price: 250, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -35), batchNumber: "CUMIN2024-008", supplier: "Spice Board", description: "Whole cumin seeds", unit: "kg", minQuantity: 30 },
    { name: "Black Pepper", category: "Spices", quantity: 90, price: 480, status: "Low Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -42), batchNumber: "PEPPER2024-004", supplier: "Spice Board", description: "Whole black pepper", unit: "kg", minQuantity: 25 },
    { name: "Cardamom", category: "Spices", quantity: 45, price: 1200, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -28), batchNumber: "CARD2024-002", supplier: "Spice Board", description: "Green cardamom", unit: "kg", minQuantity: 12 },
    { name: "Cinnamon", category: "Spices", quantity: 60, price: 380, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -38), batchNumber: "CINN2024-005", supplier: "Spice Board", description: "Cinnamon sticks", unit: "kg", minQuantity: 15 },
    { name: "Cloves", category: "Spices", quantity: 35, price: 920, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -32), batchNumber: "CLOVE2024-003", supplier: "Spice Board", description: "Whole cloves", unit: "kg", minQuantity: 10 },
    { name: "Garam Masala", category: "Spices", quantity: 150, price: 280, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -25), batchNumber: "GARAM2024-014", supplier: "Spice Board", description: "Mixed spice powder", unit: "kg", minQuantity: 40 },
    { name: "Tomato Ketchup", category: "Condiments", quantity: 850, price: 55, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -60), batchNumber: "KETCH2024-056", supplier: "Food Processing", description: "Tomato ketchup bottles", unit: "bottle", minQuantity: 220 },
    { name: "Soy Sauce", category: "Condiments", quantity: 420, price: 75, status: "In Stock", expiryDate: addDays(today, 730), manufacturingDate: addDays(today, -70), batchNumber: "SOY2024-032", supplier: "Food Processing", description: "Light soy sauce", unit: "bottle", minQuantity: 110 },
    { name: "Vinegar", category: "Condiments", quantity: 350, price: 65, status: "In Stock", expiryDate: addDays(today, 730), manufacturingDate: addDays(today, -65), batchNumber: "VIN2024-028", supplier: "Food Processing", description: "White vinegar", unit: "bottle", minQuantity: 90 },
    { name: "Honey", category: "Sweeteners", quantity: 180, price: 280, status: "In Stock", expiryDate: addDays(today, 730), manufacturingDate: addDays(today, -45), batchNumber: "HONEY2024-016", supplier: "Bee Keepers Board", description: "Pure honey", unit: "kg", minQuantity: 50 },
    { name: "Jam (Mixed Fruit)", category: "Sweeteners", quantity: 550, price: 95, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -50), batchNumber: "JAM2024-042", supplier: "Food Processing", description: "Mixed fruit jam", unit: "jar", minQuantity: 145 },
    { name: "Peanut Butter", category: "Spreads", quantity: 320, price: 185, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -55), batchNumber: "PNUT2024-025", supplier: "Food Processing", description: "Creamy peanut butter", unit: "jar", minQuantity: 85 },
    { name: "Noodles (Instant)", category: "Ready to Eat", quantity: 2800, price: 12, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -20), batchNumber: "NOOD2024-112", supplier: "Food Processing", description: "Instant noodles packets", unit: "packet", minQuantity: 750 },
    { name: "Cornflakes", category: "Breakfast", quantity: 480, price: 145, status: "In Stock", expiryDate: addDays(today, 180), manufacturingDate: addDays(today, -25), batchNumber: "CORN2024-037", supplier: "Breakfast Foods", description: "Crispy cornflakes", unit: "packet", minQuantity: 125 },
    { name: "Oats", category: "Breakfast", quantity: 620, price: 125, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -35), batchNumber: "OATS2024-048", supplier: "Breakfast Foods", description: "Rolled oats", unit: "kg", minQuantity: 165 },
    { name: "Pickle (Mixed)", category: "Condiments", quantity: 750, price: 85, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -60), batchNumber: "PICK2024-053", supplier: "Food Processing", description: "Mixed vegetable pickle", unit: "jar", minQuantity: 195 },
    { name: "Tamarind", category: "Spices", quantity: 280, price: 95, status: "In Stock", expiryDate: addDays(today, 365), manufacturingDate: addDays(today, -42), batchNumber: "TAM2024-021", supplier: "Spice Board", description: "Tamarind paste", unit: "kg", minQuantity: 75 },
];

// Keep the existing Hospital and NGO seed data unchanged for now
// (Due to message limit, continuing in next tool call)
