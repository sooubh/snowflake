import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { StockItem, Transaction, Activity, PurchaseOrder } from './snowflakeService';

// Type for generic data objects
type DataItem = Record<string, any>;

// ==================== CSV Export ====================
export const exportToCSV = (data: DataItem[], filename: string) => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ==================== Excel Export ====================
export const exportToExcel = async (data: DataItem[], filename: string, sheetName: string = 'Sheet1') => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Dynamically import xlsx to avoid SSR issues
    const XLSX = await import('xlsx');

    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const cols = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length, 15) }));
    ws['!cols'] = cols;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate and download
    XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ==================== PDF Export ====================
export const exportToPDF = (
    title: string,
    headers: string[],
    data: (string | number)[][],
    filename: string
) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);

    // Add timestamp
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    // Add table
    autoTable(doc, {
        startY: 35,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 8,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    doc.save(`${filename}.pdf`);
};

// ==================== Data Formatters ====================

export function formatInventoryForExport(items: StockItem[]) {
    return items.map(item => ({
        'Item Name': item.name,
        'Category': item.category,
        'Quantity': item.quantity,
        'Unit': item.unit || 'units',
        'Price': `$${item.price.toFixed(2)}`,
        'Status': item.status,
        'Owner': item.ownerId,
        'Section': item.section,
        'Last Updated': new Date(item.lastUpdated).toLocaleString(),
        'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'
    }));
}

export function formatSalesForExport(transactions: Transaction[]) {
    return transactions.map(tx => ({
        'Invoice Number': tx.invoiceNumber,
        'Date': new Date(tx.date).toLocaleString(),
        'Type': tx.type,
        'Items Count': tx.items.length,
        'Total Amount': `$${tx.totalAmount.toFixed(2)}`,
        'Payment Method': tx.paymentMethod,
        'Customer': tx.customerName || 'Walk-in',
        'Section': tx.section,
        'Performed By': tx.performedBy
    }));
}

export function formatActivitiesForExport(activities: Activity[]) {
    return activities.map(activity => ({
        'User': activity.user,
        'Action': activity.action,
        'Target': activity.target,
        'Type': activity.type,
        'Section': activity.section,
        'Time': new Date(activity.time).toLocaleString()
    }));
}

export function formatOrdersForExport(orders: PurchaseOrder[]) {
    return orders.map(order => ({
        'PO Number': order.poNumber,
        'Date Created': new Date(order.dateCreated).toLocaleDateString(),
        'Status': order.status,
        'Items Count': order.items.length,
        'Vendor': order.vendor || 'N/A',
        'Estimated Cost': order.totalEstimatedCost ? `$${order.totalEstimatedCost.toFixed(2)}` : 'N/A',
        'Created By': order.createdBy,
        'Approved By': order.approvedBy || 'Pending'
    }));
}
