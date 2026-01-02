'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
  timestamp: number; // For sorting
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'time'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Load notifications from localStorage on mount
const loadNotificationsFromStorage = (): Notification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveNotificationsToStorage = (notifications: Notification[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setNotifications(loadNotificationsFromStorage());
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      saveNotificationsToStorage(notifications);
    }
  }, [notifications]);

  // Helper to format "time ago"
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `Just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `1 day ago`; 
  };

  // Update times every minute
  useEffect(() => {
    const interval = setInterval(() => {
        setNotifications(prev => prev.map(n => ({ ...n, time: getTimeAgo(n.timestamp) })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen for custom events to add notifications
  useEffect(() => {
    const handleSaleComplete = (e: CustomEvent) => {
      const { invoiceNumber, totalAmount } = e.detail;
      addNotification({
        type: 'success',
        title: 'Sale Completed',
        message: `Invoice ${invoiceNumber} - $${totalAmount.toFixed(2)}`
      });
    };

    const handleLowStock = (e: CustomEvent) => {
      const { itemName, quantity, location } = e.detail;
      addNotification({
        type: 'alert',
        title: 'Low Stock Alert',
        message: `${itemName} is down to ${quantity} units at ${location}`
      });
    };

    const handleCriticalStock = (e: CustomEvent) => {
      const { itemName, location } = e.detail;
      addNotification({
        type: 'alert',
        title: 'Critical: Stock Depleted',
        message: `${itemName} is out of stock at ${location}`
      });
    };

    window.addEventListener('sale-completed' as any, handleSaleComplete);
    window.addEventListener('low-stock-alert' as any, handleLowStock);
    window.addEventListener('critical-stock-alert' as any, handleCriticalStock);

    return () => {
      window.removeEventListener('sale-completed' as any, handleSaleComplete);
      window.removeEventListener('low-stock-alert' as any, handleLowStock);
      window.removeEventListener('critical-stock-alert' as any, handleCriticalStock);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const clearAll = () => {
    setNotifications([]);
  }

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read' | 'time'>) => {
      const newNotif: Notification = {
          ...notif,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
          time: 'Just now'
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
