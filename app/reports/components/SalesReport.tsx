"use client";

import { Transaction  } from '@/lib/snowflakeService';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import { ReportAIInsight } from './ReportAIInsight';
import { ExportButton } from '@/components/ExportButton';
import { formatSalesForExport } from '@/lib/exportUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalesReportProps {
    transactions: Transaction[];
    isLoading: boolean;
}

export function SalesReport({ transactions, isLoading }: SalesReportProps) {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalOrders = transactions.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Process data for payment method chart
    const salesByMethod = transactions.reduce((acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    // Process revenue by date (group by day)
    const revenueByDate = transactions.reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + t.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    const revenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({
        date,
        revenue: Number(revenue.toFixed(2))
    })).slice(-14); // Last 14 days

    // Category breakdown
    const categoryRevenue = transactions.reduce((acc, t) => {
        t.items.forEach(item => {
            const category = item.name.includes('Paracetamol') ? 'Medicine' : 
                           item.name.includes('Syringe') ? 'Supplies' : 
                           item.name.includes('Gloves') ? 'Equipment' : 'Other';
            acc[category] = (acc[category] || 0) + item.subtotal;
        });
        return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2))
    }));

    // Payment method data for pie chart
    const paymentData = Object.entries(salesByMethod).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2))
    }));

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    // Prepare AI Context
    const contextData = transactions.slice(0, 20).map(t => 
        `Transaction ${t.id}: ${t.type} of $${t.totalAmount} via ${t.paymentMethod}`
    ).join('\n');

    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading Sales Data...</div>;

    return (
        <div className="space-y-6">
            <ReportAIInsight contextData={contextData} type="sales" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                     <p className="text-neutral-500 text-sm mb-1">Total Revenue</p>
                     <h3 className="text-3xl font-black text-neutral-dark dark:text-white">₹{totalRevenue.toFixed(2)}</h3>
                     <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                 </div>
                 <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                     <p className="text-neutral-500 text-sm mb-1">Total Orders</p>
                     <h3 className="text-3xl font-black text-neutral-dark dark:text-white">{totalOrders}</h3>
                     <p className="text-xs text-blue-600 mt-1">{(totalOrders/30).toFixed(1)} orders/day</p>
                 </div>
                 <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                     <p className="text-neutral-500 text-sm mb-1">Avg. Order Value</p>
                     <h3 className="text-3xl font-black text-neutral-dark dark:text-white">₹{avgOrderValue.toFixed(2)}</h3>
                     <p className="text-xs text-purple-600 mt-1">per transaction</p>
                 </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    Revenue Trend (Last 14 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            formatter={(value) => `₹${value}`}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">pie_chart</span>
                        Revenue by Category
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip formatter={(value) => `₹${value}`} />
                            <RechartsLegend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Methods */}
                <div className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">payments</span>
                        Payment Methods Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={paymentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value) => `₹${value}`}
                            />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-[#23220f] p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Recent Transactions</h2>
                    <ExportButton 
                        data={formatSalesForExport(transactions)}
                        filename="sales_report"
                        reportTitle="Sales Transaction Report"
                    />
                 </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-neutral-500 text-xs uppercase border-b border-neutral-100 dark:border-neutral-800">
                            <tr>
                                <th className="pb-3 px-4">Date</th>
                                <th className="pb-3 px-4">Type</th>
                                <th className="pb-3 px-4">Items</th>
                                <th className="pb-3 px-4">Method</th>
                                <th className="pb-3 px-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {transactions.slice(0, 10).map(t => (
                                <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-white/5">
                                    <td className="py-3 px-4 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            t.type === 'SALE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{t.type}</span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-neutral-500">{t.items.length} items</td>
                                    <td className="py-3 px-4 text-sm">{t.paymentMethod}</td>
                                    <td className="py-3 px-4 text-right font-bold">₹{t.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
