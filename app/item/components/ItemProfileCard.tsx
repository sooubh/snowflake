import { StockItem  } from '@/lib/snowflakeService';

interface ItemProfileCardProps {
  item: StockItem;
}

export function ItemProfileCard({ item }: ItemProfileCardProps) {
  const getCriticalStatus = () => {
    if (item.quantity <= 0) return 'Out of Stock';
    if (item.quantity < 100) return 'Critical Low';
    return null;
  };

  const criticalStatus = getCriticalStatus();

  return (
    <div className="bg-white dark:bg-[#1a190b] rounded-xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 flex flex-col gap-6">
      <div className="relative">
        <div className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-300">
            <span className="material-symbols-outlined text-[64px]">
                {item.category === 'Medicine' ? 'medication' : item.category === 'Supplies' ? 'inventory_2' : 'medical_services'}
            </span>
        </div>
        {criticalStatus && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {criticalStatus}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start border-b border-neutral-100 dark:border-neutral-700 pb-4">
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider font-bold mb-1">Batch #</p>
            <p className="font-mono text-sm font-medium text-neutral-dark dark:text-white">{item.batchNumber || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-neutral-500 text-xs uppercase tracking-wider font-bold mb-1">Expiry</p>
            <p className="font-medium text-sm text-neutral-dark dark:text-white">
                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background-light dark:bg-[#23220f] p-3 rounded-xl">
            <p className="text-neutral-500 text-xs mb-1">Mfc. Date</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-neutral-500 text-[16px]">calendar_month</span>
              <span className="font-bold text-neutral-dark dark:text-white text-sm">
                  {item.manufacturingDate ? new Date(item.manufacturingDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          <div className="bg-background-light dark:bg-[#23220f] p-3 rounded-xl">
            <p className="text-neutral-500 text-xs mb-1">Quantity</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-neutral-500 text-[16px]">inventory</span>
              <span className="font-bold text-neutral-dark dark:text-white">{item.quantity} {item.unit}</span>
            </div>
          </div>
        </div>
        <div className="pt-2">
          <p className="text-neutral-500 text-xs uppercase tracking-wider font-bold mb-2">Location/Section</p>
          <div className="flex items-center gap-3 p-3 border border-neutral-100 dark:border-neutral-700 rounded-xl">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark">
              <span className="material-symbols-outlined text-[18px] text-neutral-800">location_on</span>
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-dark dark:text-white">{item.section}</p>
              <p className="text-xs text-neutral-500 truncate w-40" title={item.ownerId}>{item.ownerId}</p>
            </div>
          </div>
        </div>
         <div className="pt-2">
          <p className="text-neutral-500 text-xs uppercase tracking-wider font-bold mb-2">Supplier</p>
             <p className="text-sm font-medium text-neutral-dark dark:text-white">{item.supplier || 'Unknown Supplier'}</p>
        </div>
      </div>
    </div>
  );
}
