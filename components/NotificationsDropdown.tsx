'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useNotifications } from '@/app/context/NotificationContext';

export function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteNotification(id);
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-background-light dark:bg-[#323118] hover:bg-neutral-200 dark:hover:bg-[#403e20] transition-colors relative"
            >
                <span className="material-symbols-outlined text-[20px] text-neutral-600 dark:text-neutral-400">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#323118]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#2a2912] rounded-lg shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500 text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={clsx(
                                        'p-4 border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer relative group',
                                        !notification.read && 'bg-indigo-50/50 dark:bg-indigo-900/10'
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div
                                            className={clsx(
                                                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                                                notification.type === 'alert' && 'bg-red-100 text-red-600',
                                                notification.type === 'info' && 'bg-blue-100 text-blue-600',
                                                notification.type === 'success' && 'bg-green-100 text-green-600'
                                            )}
                                        >
                                            {notification.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                                            {notification.type === 'info' && <Info className="h-4 w-4" />}
                                            {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx("text-sm font-medium truncate", !notification.read ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400')}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-neutral-400 mt-1">{notification.time}</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all"
                                            title="Dismiss"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        {!notification.read && (
                                            <div className="flex-shrink-0 self-center">
                                                <span className="block h-2 w-2 rounded-full bg-indigo-600"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-[#323118]/50 text-center">
                        <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium transition-colors">
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
