'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileDown, FileJson, FileText, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import stockData from '@/data/sampleStockData.json';

interface StockItem {
    location_id: string;
    location_name: string;
    item_id: string;
    item_name: string;
    category: string;
    opening_stock: number;
    received: number;
    issued: number;
    closing_stock: number;
    avg_daily_issue: number;
    lead_time_days: number;
    unit: string;
    last_updated: string;
}

export function ExportOptions() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const downloadFile = (content: string, fileName: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportCSV = () => {
        const headers = [
            'Location ID',
            'Location Name',
            'Item ID',
            'Item Name',
            'Category',
            'Opening Stock',
            'Received',
            'Issued',
            'Closing Stock',
            'Avg Daily Issue',
            'Lead Time (Days)',
            'Unit',
            'Last Updated'
        ];

        const timestamp = new Date().toLocaleString();
        const totalRecords = stockData.length;

        // Add summary header
        const summaryHeader = [
            `Export Date: ${timestamp}`,
            `Total Records: ${totalRecords}`,
            ''
        ].join('\n');

        const csvBody = [
            headers.join(','),
            ...(stockData as StockItem[]).map(item => [
                item.location_id,
                `"${item.location_name}"`,
                item.item_id,
                `"${item.item_name}"`,
                item.category,
                item.opening_stock,
                item.received,
                item.issued,
                item.closing_stock,
                item.avg_daily_issue,
                item.lead_time_days,
                item.unit,
                item.last_updated
            ].join(','))
        ].join('\n');

        // Add Byte Order Mark for Excel compatibility
        const csvContent = '\uFEFF' + summaryHeader + '\n\n' + csvBody;

        downloadFile(csvContent, `stock_data_professional_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
        setIsOpen(false);
    };

    const handleExportJSON = () => {
        const jsonContent = JSON.stringify(stockData, null, 2);
        downloadFile(jsonContent, `stock_data_raw_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        setIsOpen(false);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Add Summary
        doc.setFontSize(18);
        doc.text('StockHealth AI - Inventory Report', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleString();
        doc.text(`Generated on: ${dateStr}`, 14, 30);
        doc.text(`Total Records: ${stockData.length}`, 14, 36);

        // Define table columns and rows
        const tableColumn = ["Loc ID", "Item Name", "Category", "Stock", "Unit", "Updated"];
        const tableRows = (stockData as StockItem[]).map(item => [
            item.location_id,
            item.item_name,
            item.category,
            item.closing_stock,
            item.unit,
            item.last_updated
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            alternateRowStyles: { fillColor: [249, 250, 251] } // Gray-50
        });

        doc.save(`inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#2a2912] border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-[#323118] transition-colors shadow-sm hover:shadow active:scale-95"
            >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#2a2912] rounded-lg shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        <button
                            onClick={handleExportPDF}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors group"
                        >
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">PDF Report</p>
                                <p className="text-xs text-neutral-500">Professional format</p>
                            </div>
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors group"
                        >
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                                <FileDown className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Excel CSV</p>
                                <p className="text-xs text-neutral-500">Spreadsheet format</p>
                            </div>
                        </button>
                        <button
                            onClick={handleExportJSON}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors group"
                        >
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <FileJson className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Raw JSON</p>
                                <p className="text-xs text-neutral-500">Data interchange</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
