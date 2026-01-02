"use client";

import { StockItem  } from '@/lib/snowflakeService';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import { ReportAIInsight } from './ReportAIInsight';
import { ExportButton } from '@/components/ExportButton';
import { formatInventoryForExport } from '@/lib/exportUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface InventoryReportProps {
    items: StockItem[];
    isLoading: boolean;
}

export function InventoryReport({ items, isLoading }: InventoryReportProps) {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    const lowStockCount = items.filter(i => i.quantity <= (i.minQuantity || 20)).length;

    const topValueItems = [...items].sort((a,b) => (b.quantity * b.price) - (a.quantity * a.price)).slice(0, 5);

    // Category wise stock levels
    const categoryStock = items.reduce((acc, i) => {
        const cat = i.category || 'Other';
        acc[cat] = (acc[cat] || 0) + i.quantity;
        return acc;
    }, {} as Record<string, number>);

    const stockByCategory = Object.entries(categoryStock).map(([name, quantity]) => ({
        name,
        quantity
    }));

    // Expiry tracking - items expiring in next 30 days
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringItems = items.filter(i => {
        if (!i.expiryDate) return false;
        const expiry = new Date(i.expiryDate);
        return expiry >= today && expiry <= thirtyDaysLater;
    });

    // Stock status data
    const stockStatusData = [
        { name: 'In Stock', value: items.filter(i => i.status === 'In Stock').length, color: '#10b981' },
        { name: 'Low Stock', value: items.filter(i => i.status === 'Low Stock').length, color: '#f59e0b' },
        { name: 'Out of Stock', value: items.filter(i => i.status === 'Out of Stock').length, color: '#ef4444' }
    ];

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    // Prepare Context for AI
    const contextData = items.slice(0, 30).map(i => {
        let statusTag = '';
        if (i.quantity <= (i.minQuantity || 10)) statusTag = '[CRITICAL]';
        else if (i.quantity < 50) statusTag = '[Low]';
        if (i.expiryDate && new Date(i.expiryDate) < new Date()) statusTag += ' [EXPIRED]';
        return `- ${i.name}: ${i.quantity} units ${statusTag}`;
    }).join('\n');



    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading Inventory Analysis...</div>;

    return (
        <div className="space-y-6">
             <ReportAIInsight contextData={contextData} type="inventory" />

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                     <p className="text-neutral-500 text-sm mb-1">Total Inventory Value</p>
                     <h3 className="text-3xl font-black text-neutral-dark dark:text-white">${totalValue.toFixed(2)}</h3>
                 </div>
                 <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                     <p className="text-neutral-500 text-sm mb-1">Total Items in Stock</p>
                     <h3 className="text-3xl font-black text-neutral-dark dark:text-white">{totalItems}</h3>
                 </div>
                 <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                     <p className="text-neutral-500 text-sm mb-1">Low Stock Alerts</p>
                     <h3 className="text-3xl font-black text-red-500">{lowStockCount}</h3>
                 </div>
             </div>

            {/* Stock Level by Category */}
            <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                    Stock Levels by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stockByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            formatter={(value) => `${value} units`}
                        />
                        <Bar dataKey="quantity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Expiring Items Alert */}
            {expiringItems.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-orange-600 text-3xl">warning</span>
                        <div>
                            <h3 className="font-bold text-lg text-orange-900 dark:text-orange-300">Expiry Alert</h3>
                            <p className="text-sm text-orange-700 dark:text-orange-400">{expiringItems.length} items expiring in next 30 days</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {expiringItems.slice(0, 3).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-white dark:bg-orange-900/30 rounded-xl border border-orange-200 dark:border-orange-700">
                                <div>
                                    <p className="font-bold text-sm text-orange-900 dark:text-orange-200">{item.name}</p>
                                    <p className="text-xs text-orange-600">Expires: {new Date(item.expiryDate!).toLocaleDateString()}</p>
                                </div>
                                <div className="px-3 py-1 bg-orange-200 dark:bg-orange-800 rounded-lg text-xs font-bold text-orange-900 dark:text-orange-200">
                                    {item.quantity} units
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-[#23220f] p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Inventory Valuation</h2>
                    <ExportButton 
                        data={formatInventoryForExport(items)}
                        filename="inventory_report"
                        reportTitle="Inventory Valuation Report"
                    />
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                         <h4 className="font-bold text-sm text-neutral-500 uppercase mb-4">Top 5 Highest Value Items</h4>
                         <div className="space-y-3">
                             {topValueItems.map(item => (
                                 <div key={item.id} className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-black/20 rounded-xl">
                                     <div>
                                         <p className="font-bold text-sm">{item.name}</p>
                                         <p className="text-xs text-neutral-400">{item.quantity} units @ ${item.price}</p>
                                     </div>
                                     <div className="font-mono font-bold">₹{(item.quantity * item.price).toFixed(2)}</div>
                                 </div>
                             ))}
                         </div>
                     </div>
                     <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                         <h4 className="font-bold text-sm text-neutral-500 uppercase mb-4 self-start">Stock Status Distribution</h4>
                         <ResponsiveContainer width="100%" height={250}>
                             <PieChart>
                                 <Pie
                                     data={stockStatusData}
                                     cx="50%"
                                     cy="50%"
                                     labelLine={false}
                                     label={({ name, value }) => `${name}: ${value}`}
                                     outerRadius={80}
                                     fill="#8884d8"
                                     dataKey="value"
                                 >
                                     {stockStatusData.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.color} />
                                     ))}
                                 </Pie>
                                 <RechartsTooltip />
                                 <RechartsLegend />
                             </PieChart>
                         </ResponsiveContainer>
                     </div>
                </div>
            </div>
        </div>
    );
}
