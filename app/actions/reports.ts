'use server';

import { snowflakeService as azureService, Transaction, StockItem, Activity  } from '@/lib/snowflakeService';

export async function getGlobalSalesData(): Promise<Transaction[]> {
    return await azureService.getAllTransactions();
}

export async function getGlobalInventoryData(): Promise<StockItem[]> {
    return await azureService.getGlobalItems();
}

export async function getGlobalTeamData(): Promise<Activity[]> {
    return await azureService.getAllActivities();
}

export async function getGlobalProcurementData(): Promise<any[]> {
    return await azureService.getOrders();
}
