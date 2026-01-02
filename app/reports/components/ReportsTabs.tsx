import { motion } from 'framer-motion';

interface ReportsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'sales', label: 'Sales & Revenue', icon: 'payments' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
  { id: 'procurement', label: 'Procurement', icon: 'shopping_cart' },
  { id: 'team', label: 'Team Activity', icon: 'group' },
];

export function ReportsTabs({ activeTab, onTabChange }: ReportsTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-1 w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors rounded-t-lg outline-none
              ${isActive ? 'text-primary dark:text-white' : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'}
            `}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
            
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
