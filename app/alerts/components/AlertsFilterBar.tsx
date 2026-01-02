import { AlertFilter, RegionFilter } from '../page';
import { useState, useRef, useEffect } from 'react';

interface AlertsFilterBarProps {
  activeFilters: AlertFilter[];
  onFilterChange: (filter: AlertFilter) => void;
  onSetAll: (active: boolean) => void;
  regionFilter: RegionFilter;
  onRegionChange: (region: RegionFilter) => void;
}

export function AlertsFilterBar({
  activeFilters,
  onFilterChange,
  onSetAll,
  regionFilter,
  onRegionChange
}: AlertsFilterBarProps) {
  const isAllSelected = activeFilters.length === 3;
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  const regions: RegionFilter[] = ['All', 'North', 'South', 'East', 'West'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionMenuRef.current && !regionMenuRef.current.contains(event.target as Node)) {
        setIsRegionMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-2 border-b border-neutral-100 dark:border-neutral-700">
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => onSetAll(!isAllSelected)}
          className={`flex items-center gap-2 h-9 px-4 rounded-full font-medium text-sm transition-all active:scale-95 shadow-sm ${isAllSelected
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
        >
          {isAllSelected ? 'All Alerts Active' : 'Enable All Alerts'}
        </button>

        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => onFilterChange('critical')}
            className={`flex items-center gap-2 h-9 px-4 rounded-full font-medium text-sm transition-colors border ${activeFilters.includes('critical')
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50'
              : 'bg-[#f4f4e6] dark:bg-[#2c2b13] text-neutral-dark dark:text-white border-transparent hover:border-[#d4d3b5]'
              }`}
          >
            <span className={`size-2 rounded-full ${activeFilters.includes('critical') ? 'bg-red-500 animate-pulse' : 'bg-red-500/50'}`}></span>
            Critical
          </button>
          <button
            onClick={() => onFilterChange('warning')}
            className={`flex items-center gap-2 h-9 px-4 rounded-full font-medium text-sm transition-colors border ${activeFilters.includes('warning')
              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50'
              : 'bg-[#f4f4e6] dark:bg-[#2c2b13] text-neutral-dark dark:text-white border-transparent hover:border-[#d4d3b5]'
              }`}
          >
            <span className={`size-2 rounded-full ${activeFilters.includes('warning') ? 'bg-orange-400 animate-pulse' : 'bg-orange-400/50'}`}></span>
            Warning
          </button>
          <button
            onClick={() => onFilterChange('unread')}
            className={`flex items-center gap-2 h-9 px-4 rounded-full font-medium text-sm transition-colors border ${activeFilters.includes('unread')
              ? 'bg-primary/20 text-neutral-dark dark:text-white border-primary/50'
              : 'bg-[#f4f4e6] dark:bg-[#2c2b13] text-neutral-dark dark:text-white border-transparent hover:border-[#d4d3b5]'
              }`}
          >
            Unread Only
          </button>
        </div>

        <div className="w-px h-6 bg-[#e9e8ce] dark:bg-[#444320] mx-1"></div>

        <div className="relative" ref={regionMenuRef}>
          <button
            onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
            className={`flex items-center gap-2 h-9 pl-4 pr-3 rounded-full font-medium text-sm transition-colors group ${regionFilter !== 'All'
                ? 'bg-primary text-black'
                : 'bg-[#f4f4e6] dark:bg-[#2c2b13] text-neutral-dark dark:text-white'
              }`}
          >
            Region: {regionFilter}
            <span className={`material-symbols-outlined text-[18px] transition-transform ${isRegionMenuOpen ? 'rotate-180' : ''} ${regionFilter !== 'All' ? 'text-black' : 'text-neutral-500 group-hover:text-neutral-dark dark:group-hover:text-white'
              }`}>
              keyboard_arrow_down
            </span>
          </button>

          {isRegionMenuOpen && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-[#23220f] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-1">
                {regions.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => {
                      onRegionChange(reg);
                      setIsRegionMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${regionFilter === reg
                        ? 'bg-primary/20 text-neutral-dark dark:text-white'
                        : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                  >
                    {reg === 'All' ? 'All Regions' : reg}
                    {regionFilter === reg && (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
