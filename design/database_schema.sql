-- 1. STORES TABLE (Users/Retailers)
-- Stores the identity of each PHC, Hospital, or Retailer.
CREATE TABLE Stores (
    id VARCHAR(50) PRIMARY KEY,          -- Unique ID (e.g., 'hosp-r1')
    name VARCHAR(100) NOT NULL,          -- Display Name (e.g., 'City General')
    role VARCHAR(20) NOT NULL,           -- 'admin' or 'retailer'
    section VARCHAR(20) NOT NULL,        -- 'PSD', 'Hospital', 'NGO'
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. INVENTORY TABLE (Items)
-- Stores individual stock items, linked to a specific Store.
CREATE TABLE Inventory (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,          -- Item Name (e.g., 'Surgical Masks')
    category VARCHAR(50) NOT NULL,       -- 'PPE', 'Medicine', etc.
    quantity INTEGER DEFAULT 0,
    price DECIMAL(10, 2),
    owner_id VARCHAR(50) NOT NULL,       -- LINK: Foreign Key to Stores.id
    section VARCHAR(20) NOT NULL,        -- Denormalized for faster section filtering
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- CONSTRAINT: Links Inventory to a Store
    FOREIGN KEY (owner_id) REFERENCES Stores(id) ON DELETE CASCADE
);

-- 3. EXAMPLE DATA INSERTION (Seeding)

-- Insert Stores
INSERT INTO Stores (id, name, role, section, email) VALUES 
('hosp-r1', 'City General', 'retailer', 'Hospital', 'city@hospital.gov'),
('hosp-r2', 'Rural PHC 1', 'retailer', 'Hospital', 'phc1@hospital.gov');

-- Insert Items (Linked to Stores)
INSERT INTO Inventory (id, name, category, quantity, price, owner_id, section) VALUES 
('item-1', 'Surgical Masks', 'PPE', 500, 0.50, 'hosp-r1', 'Hospital'), -- Belongs to City General
('item-2', 'Insulin', 'Medicine', 100, 15.00, 'hosp-r2', 'Hospital');  -- Belongs to Rural PHC 1

-- 4. QUERY EXAMPLES

-- Get ALL stock for "Hospital" Section (Admin View)
SELECT s.name as StoreName, i.name as Item, i.quantity 
FROM Inventory i
JOIN Stores s ON i.owner_id = s.id
WHERE s.section = 'Hospital';

-- Get ONLY stock for "City General" (Retailer View)
SELECT * FROM Inventory WHERE owner_id = 'hosp-r1';
