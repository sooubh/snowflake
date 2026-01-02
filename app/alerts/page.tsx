'use client';

import { useState } from 'react';
import { useNotifications, Notification } from '@/app/context/NotificationContext';
import { AlertTriangle, Info, CheckCircle, X, Bell, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

// Export types for use in child components
export type AlertFilter = 'critical' | 'warning' | 'unread';
export type RegionFilter = 'All' | 'North' | 'South' | 'East' | 'West';

export default function AlertsPage() {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'critical' | 'alert' | 'info' | 'success'>('all');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'critical') return n.type === 'alert' && n.title.toLowerCase().includes('critical');
        return n.type === filter;
    });

    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        critical: notifications.filter(n => n.type === 'alert').length,
        info: notifications.filter(n => n.type === 'info').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-indigo-500" />
                        Alerts & Notifications
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Stay updated with real-time alerts on stock levels, orders, and system status.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-white dark:bg-[#1f1e0b] border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        Mark all as read
                    </button>
                     <button 
                        onClick={clearAll}
                        className="px-4 py-2 bg-white dark:bg-[#1f1e0b] border border-slate-200 dark:border-neutral-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1f1e0b] p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Notifications</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Bell className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-[#1f1e0b] p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Unread</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.unread}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1f1e0b] p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Alerts</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.critical}</h3>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1f1e0b] p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">System Info</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.info}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Info className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'critical', 'alert', 'info', 'success'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize whitespace-nowrap",
                            filter === f 
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                                : "bg-white dark:bg-[#1f1e0b] border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-800"
                        )}
                    >
                        {f === 'alert' ? 'All Alerts' : f}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="bg-white dark:bg-[#1f1e0b] rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">All caught up!</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                            No notifications found for the selected filter.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                         <AnimatePresence initial={false}>
                            {filteredNotifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={clsx(
                                        "p-6 flex gap-4 transition-colors group hover:bg-slate-50 dark:hover:bg-white/5",
                                        !notification.read ? "bg-indigo-50/40 dark:bg-indigo-900/10" : "bg-white dark:bg-[#1f1e0b]"
                                    )}
                                    // Make whole row clickable to toggle read status if desired, or just use actions
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                                        notification.type === 'alert' && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                                        notification.type === 'info' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                                        notification.type === 'success' && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                                    )}>
                                         {notification.type === 'alert' && <AlertTriangle className="w-6 h-6" />}
                                         {notification.type === 'info' && <Info className="w-6 h-6" />}
                                         {notification.type === 'success' && <CheckCircle className="w-6 h-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={clsx(
                                                    "text-base font-semibold",
                                                    !notification.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                                                )}>
                                                    {notification.title}
                                                    {!notification.read && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-600 align-middle"></span>}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{notification.message}</p>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-4">
                                                {notification.time}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center self-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
