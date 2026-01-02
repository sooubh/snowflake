interface StickyActionFooterProps {
  selectedCount: number;
  selectedItems: any[]; // Selected items for export
  onMarkOrdered?: () => void;
  onSendToProcurement?: () => void;
}

export function StickyActionFooter({ selectedCount, selectedItems, onMarkOrdered, onSendToProcurement }: StickyActionFooterProps) {
  
  const handleExportPDF = () => {
    if (selectedCount === 0) {
      alert('Please select items to export');
      return;
    }
    
    // Create PDF content
    const content = selectedItems.map(item => 
      `${item.name} - Qty: ${item.quantity} - Price: $${item.price}`
    ).join('\n');
    
    alert(`📄 PDF Export\n\nSelected ${selectedCount} items:\n${content}\n\n(PDF generation would happen here)`);
  };
  
  const handleExportCSV = () => {
    if (selectedCount === 0) {
      alert('Please select items to export');
      return;
    }
    
    // Create CSV
    const headers = 'Name,Category,Quantity,Price,Status\n';
    const rows = selectedItems.map(item => 
      `"${item.name}","${item.category}",${item.quantity},${item.price},"${item.status}"`
    ).join('\n');
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reorder-items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 mb-8 flex justify-center">
      <div className="bg-white dark:bg-[#23220f] text-neutral-dark dark:text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between p-4 gap-4 w-full border border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-dark dark:text-white text-sm font-medium border border-transparent whitespace-nowrap">
            {selectedCount}
          </div>
          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleExportPDF}
              disabled={selectedCount === 0}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white group relative disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Export to PDF"
            >
              <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={selectedCount === 0}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Export to CSV"
            >
              <span className="material-symbols-outlined text-xl">csv</span>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          <button
            disabled={selectedCount === 0}
            onClick={onMarkOrdered}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-dark dark:text-white text-sm font-medium transition-colors border border-transparent whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark Ordered
          </button>
          <button
            disabled={selectedCount === 0}
            onClick={onSendToProcurement}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-primary hover:bg-[#eae605] text-black text-sm font-bold shadow-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send to Procurement
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
