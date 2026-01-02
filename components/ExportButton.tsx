'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, FileDown, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { useToast } from '@/app/context/ToastContext';

interface ExportButtonProps {
  data: any[];
  filename: string;
  reportTitle: string;
  disabled?: boolean;
}

export function ExportButton({ data, filename, reportTitle, disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsOpen(false);

    if (!data || data.length === 0) {
      toast.warning('No Data', 'There is no data to export');
      return;
    }

    try {
      toast.info('Exporting...', `Generating ${format.toUpperCase()} file`);

      switch (format) {
        case 'csv':
          exportToCSV(data, filename);
          break;
        case 'excel':
          await exportToExcel(data, filename, reportTitle);
          break;
        case 'pdf':
          // Convert data to array format for PDF
          const headers = Object.keys(data[0]);
          const body = data.map(row => headers.map(h => row[h]?.toString() || ''));
          exportToPDF(reportTitle, headers, body, filename);
          break;
      }

      toast.success('Export Successful!', `${format.toUpperCase()} file downloaded`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Failed', 'Could not export data. Please try again.');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || !data || data.length === 0}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
          transition-all transform active:scale-95
          ${disabled || !data || data.length === 0
            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            : 'bg-primary hover:bg-[#eae605] text-black shadow-sm hover:shadow-md'
          }
        `}
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1f1e0b] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleExport('csv')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-bold text-sm text-neutral-dark dark:text-white">CSV</div>
              <div className="text-xs text-neutral-500">Spreadsheet format</div>
            </div>
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left border-t border-neutral-100 dark:border-neutral-800"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-bold text-sm text-neutral-dark dark:text-white">Excel</div>
              <div className="text-xs text-neutral-500">XLSX format</div>
            </div>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left border-t border-neutral-100 dark:border-neutral-800"
          >
            <FileDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <div>
              <div className="font-bold text-sm text-neutral-dark dark:text-white">PDF</div>
              <div className="text-xs text-neutral-500">Printable document</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
