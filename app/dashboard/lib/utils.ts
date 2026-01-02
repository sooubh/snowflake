import { StockItem  } from '@/lib/snowflakeService';
import { SIMULATED_USERS } from "@/lib/auth";

export type StockStatus = 'critical' | 'low' | 'good';

export function getStockStatus(current: number, opening: number): StockStatus {
    // Simplified status logic for real data without opening stock context
    if (current <= 10) return 'critical';
    if (current <= 50) return 'low';
    return 'good';
}

export interface FilterState {
    dateRange: string;
    category: string;
    status: string;
    location: string;
    view?: string; // 'district' | 'hospital' | 'ngo'
    search?: string;
    criticalOnly?: boolean;
    lowLeadTime?: boolean;
    lifeSaving?: boolean;
}

export function isLifeSaving(item: StockItem): boolean {
    const lifeSavingKeywords = ['insulin', 'amoxicillin', 'epinephrine', 'vaccine', 'oxygen'];
    return lifeSavingKeywords.some(keyword => (item.name || "").toLowerCase().includes(keyword)) || item.category === 'Medicine';
}

export function isLowLeadTime(item: StockItem): boolean {
    return false; // Not tracked in simple schema
}

function classifyLocationType(name: string): 'hospital' | 'ngo' | 'other' {
    return 'hospital'; // Default
}

export function filterStockData(data: StockItem[], filters: FilterState) {
    return data.filter(item => {
        const itemLocation = SIMULATED_USERS.find(u => u.id === item.ownerId)?.name || "Unknown Location";

        // 0. View Filtering - Simplified
        if (filters.view && filters.view !== 'district') {
            // Pass through for now
        }

        // 1. Category
        if (filters.category !== 'all' && item.category !== filters.category) {
            return false;
        }

        // 2. Location
        if (filters.location !== 'all' && itemLocation !== filters.location) {
            return false;
        }

        // 3. Status
        if (filters.status !== 'all') {
            const status = getStockStatus(item.quantity, 0); // Opening stock not available
            if (status !== filters.status) return false;
        }

        // 5. Search
        if (filters.search) {
            const query = filters.search.toLowerCase();
            const matches =
                (item.name || "").toLowerCase().includes(query) ||
                (item.category || "").toLowerCase().includes(query) ||
                itemLocation.toLowerCase().includes(query);
            if (!matches) return false;
        }

        // 6. Advanced Filters
        if (filters.criticalOnly) {
            if (getStockStatus(item.quantity, 0) !== 'critical') return false;
        }
        if (filters.lowLeadTime) {
            if (!isLowLeadTime(item)) return false;
        }
        if (filters.lifeSaving) {
            if (!isLifeSaving(item)) return false;
        }

        return true;
    });
}

