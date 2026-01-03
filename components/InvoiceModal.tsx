'use client';

import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/lib/snowflakeService';
import { X, Download, Printer } from 'lucide-react';

interface InvoiceModalProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function InvoiceModal({ transaction, isOpen, onClose }: InvoiceModalProps) {
    if (!isOpen || !transaction) return null;

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text("INVOICE", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text(`Invoice #: ${transaction.invoiceNumber}`, 20, 40);
        doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 20, 50);
        doc.text(`Type: ${transaction.type}`, 20, 60);

        // Client Info (Mock)
        doc.text(`Bill To: ${transaction.customerName || 'Walk-in Customer'}`, 140, 40);

        // Table
        const tableColumn = ["Item", "Qty", "Price", "Subtotal"];
        const tableRows: any[] = [];

        transaction.items.forEach(item => {
            const itemData = [
                item.name,
                item.quantity,
                `${item.unitPrice.toFixed(2)}`,
                `${item.subtotal.toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
        });

        // Totals
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 100;

        doc.text(`Total Amount: $${transaction.totalAmount.toFixed(2)}`, 140, finalY + 20);
        doc.text(`Payment Method: ${transaction.paymentMethod}`, 20, finalY + 20);

        // Footer
        doc.setFontSize(10);
        doc.text("Thank you for your business!", 105, finalY + 40, { align: "center" });

        return doc;
    };

    const handleDownload = () => {
        const doc = generatePDF();
        doc.save(`${transaction.invoiceNumber}.pdf`);
    };

    const handlePrint = () => {
        const doc = generatePDF();
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-neutral-800 p-4 flex justify-between items-center border-b border-neutral-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Invoice Generated
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{transaction.invoiceNumber}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Visual Preview */}
                <div className="p-8 text-neutral-300 font-mono text-sm max-h-[60vh] overflow-y-auto">
                    <div className="flex justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">STORE NAME</h3>
                            <p>123 Medical Drive</p>
                            <p>New York, NY 10001</p>
                        </div>
                        <div className="text-right">
                            <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                            <p>Bill To: {transaction.customerName || 'Walk-in'}</p>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b border-neutral-700 text-left text-gray-400">
                                <th className="py-2">Item</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Price</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaction.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-neutral-800/50">
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                                    <td className="py-2 text-right">${item.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end border-t border-neutral-700 pt-4">
                        <div className="w-1/2 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>$ {transaction.items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-white">
                                <span>Total</span>
                                <span>${transaction.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-neutral-800 border-t border-neutral-700 flex justify-end gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2 font-bold"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
