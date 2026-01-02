import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSearchParams } from 'next/navigation';
import { StockItem  } from '@/lib/snowflakeService';
import { ActionMenu } from './ActionMenu';

interface ReorderTableProps {
  items: StockItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onViewItem?: (item: StockItem) => void;
  onEditItem?: (item: StockItem) => void;
}

export function ReorderTable({ items, selectedIds, onSelectionChange, onViewItem, onEditItem }: ReorderTableProps) {
  const searchParams = useSearchParams();

  const filteredItems = useMemo(() => {
    const search = searchParams.get('search')?.toLowerCase() || '';
    const criticalOnly = searchParams.get('criticalOnly') === 'true';
    const lifeSaving = searchParams.get('lifeSaving') === 'true';

    return items.filter(item => {
        // Search Filter
        const matchesSearch = item.name.toLowerCase().includes(search) || item.id.toLowerCase().includes(search);
        if (!matchesSearch) return false;

        const minQty = item.minQuantity || 20;
        const isCritical = item.quantity <= minQty;
        
        // Filters
        if (criticalOnly && !isCritical) return false;
        if (lifeSaving && item.category !== 'Medication') return false; 

        return true;
    });
  }, [items, searchParams]);

  const allItemIds = useMemo(() => filteredItems.map(i => `${i.id}-${i.section}`), [filteredItems]);
  const isAllSelected = allItemIds.length > 0 && allItemIds.every(id => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  // Categorize
  const { criticalItems, stableItems } = useMemo(() => {
    const critical: StockItem[] = [];
    const stable: StockItem[] = [];
    
    filteredItems.forEach(item => {
        const minQty = item.minQuantity || 20;
        if (item.quantity <= (minQty * 1.5)) {
            critical.push(item);
        } else {
            stable.push(item);
        }
    });

      return { criticalItems: critical, stableItems: stable };
  }, [filteredItems]);

  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'stable'>('all');

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Reorder List", 14, 22);
        
        const tableBody = filteredItems.map(item => [
            item.name,
            item.category,
            `${item.quantity} / ${item.minQuantity || 20}`,
            Math.max(0, (item.minQuantity || 20) * 2 - item.quantity).toString(), // Suggested
            item.section
        ]);

        autoTable(doc, {
            head: [['Item', 'Category', 'Stock/Min', 'Sugg. Order', 'Section']],
            body: tableBody,
            startY: 30,
        });
        doc.save('reorder_list.pdf');
    };

    const handleExportCSV = () => {
        const headers = ['Item Name', 'Category', 'Current Stock', 'Min Stock', 'Suggested Order', 'Section'];
        const rows = filteredItems.map(item => [
            `"${item.name}"`,
            item.category,
            item.quantity,
            item.minQuantity || 20,
            Math.max(0, (item.minQuantity || 20) * 2 - item.quantity),
            item.section
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reorder_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  const toggleAll = () => {
    // Select only visible items based on tab
    let idsToSelect: string[] = [];
    if (activeTab === 'all' || activeTab === 'critical') {
        idsToSelect = [...idsToSelect, ...criticalItems.map(i => `${i.id}-${i.section}`)];
    }
    if (activeTab === 'all' || activeTab === 'stable') {
        idsToSelect = [...idsToSelect, ...stableItems.map(i => `${i.id}-${i.section}`)];
    }

    if (isAllSelected) {
      onSelectionChange([]);
    } else {
        // If some selected, or none, select all visible
        onSelectionChange(idsToSelect);
    }
  };

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const renderRow = (item: StockItem) => {
    const id = `${item.id}-${item.section}`;
    const isSelected = selectedIds.includes(id);
    const minQty = item.minQuantity || 20;
    const capacity = 100; 
    const status = item.quantity <= minQty ? 'critical' : item.quantity <= (minQty * 1.5) ? 'low' : 'stable';
    const stockRatio = Math.min(1, item.quantity / capacity);
    const urgencyScore = Math.max(0, Math.round((1 - stockRatio) * 100));

    return (
        <tr
        key={id}
        className={`group hover:bg-primary/5 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
        onClick={() => toggleItem(id)}
        >
        <td className="p-4 pl-6 text-center" onClick={(e) => e.stopPropagation()}>
            <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleItem(id)}
            className="rounded border-gray-300 text-primary focus:ring-primary size-4 cursor-pointer"
            />
        </td>
        <td className="p-4">
            <div className="flex flex-col">
            <span className="font-bold text-neutral-dark dark:text-white group-hover:text-primary transition-colors">{item.name}</span>
            <span className="text-xs text-neutral-500 font-mono flex items-center gap-2">
                SKU: {item.id}
                {item.category === 'Medication' && (
                <span className="inline-flex items-center text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded ring-1 ring-blue-500/20">LIFE-SAVING</span>
                )}
            </span>
            </div>
        </td>
        <td className="p-4">
            <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-500 text-lg">location_on</span>
            <span className="text-sm text-neutral-dark dark:text-white">{item.section}</span>
            </div>
        </td>
        <td className="p-4">
            {status === 'critical' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-black border border-black/10">
                <span className="size-1.5 rounded-full bg-red-600 animate-pulse"></span>
                CRITICAL
            </span>
            ) : status === 'low' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                <span className="size-1.5 rounded-full bg-orange-500"></span>
                WARNING
            </span>
            ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                <span className="size-1.5 rounded-full bg-green-500"></span>
                STABLE
            </span>
            )}
        </td>
        <td className="p-4 text-right font-mono font-medium text-neutral-dark dark:text-white">
            {Math.max(0, capacity - item.quantity).toLocaleString()}
        </td>
        <td className="p-4">
            {urgencyScore > 80 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    <span className="size-1.5 rounded-full bg-red-600 animate-pulse"></span>
                    HIGH URGENCY
                </span>
            ) : urgencyScore > 50 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    <span className="size-1.5 rounded-full bg-orange-500"></span>
                    MEDIUM
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                    <span className="size-1.5 rounded-full bg-green-500"></span>
                    LOW
                </span>
            )}
        </td>
        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
            <ActionMenu
            onViewDetails={() => onViewItem?.(item)}
            onEdit={() => onEditItem?.(item)}
            />
        </td>
        </tr>
    );
  };

  if (filteredItems.length === 0) {
      return (
        <div className="bg-white dark:bg-[#23220f] rounded-3xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden mb-8 p-12 text-center text-neutral-500">
            <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
            No items found matching your criteria.
        </div>
      );
  }

  return (
    <div className="space-y-4">
        {/* Toggle Buttons & Exports */}
        <div className="flex justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
             <div className="flex">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                >
                    All Items
                </button>
                <button 
                    onClick={() => setActiveTab('critical')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'critical' ? 'bg-white dark:bg-neutral-700 shadow-sm text-red-600' : 'text-neutral-500 hover:text-red-500'}`}
                >
                    Critical & Warning
                    <span className="bg-red-100 text-red-700 text-[10px] px-1.5 rounded-full">{criticalItems.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('stable')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'stable' ? 'bg-white dark:bg-neutral-700 shadow-sm text-green-600' : 'text-neutral-500 hover:text-green-500'}`}
                >
                    Stable
                    <span className="bg-green-100 text-green-700 text-[10px] px-1.5 rounded-full">{stableItems.length}</span>
                </button>
             </div>
             
             <div className="flex gap-1 pr-2">
                   <button onClick={handleExportPDF} className="p-2 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-500 transition-colors" title="Export PDF">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                   </button>
                   <button onClick={handleExportCSV} className="p-2 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-500 transition-colors" title="Export CSV">
                        <span className="material-symbols-outlined">csv</span>
                   </button>
             </div>
        </div>

        <div className="bg-white dark:bg-[#23220f] rounded-3xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-background-light/50 dark:bg-black/20 border-b border-neutral-100 dark:border-neutral-700 text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6 w-12 text-center">
                    <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary size-4 cursor-pointer"
                    />
                </th>
                <th className="p-4 min-w-[200px]">Item Details</th>
                <th className="p-4 min-w-[180px]">Location</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4 text-right">Suggested Qty</th>
                <th className="p-4 w-[200px]">Urgency Score</th>
                <th className="p-4 w-20 text-center">Actions</th>
                </tr>
            </thead>
            
            {/* Critical Section */}
            {(activeTab === 'all' || activeTab === 'critical') && criticalItems.length > 0 && (
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700 border-b-4 border-neutral-100 dark:border-neutral-800">
                    {criticalItems.map(renderRow)}
                </tbody>
            )}

            {/* Stable Section */}
            {(activeTab === 'all' || activeTab === 'stable') && stableItems.length > 0 && (
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {stableItems.map(renderRow)}
                </tbody>
            )}

            </table>
        </div>
        </div>
    </div>
  );
}
