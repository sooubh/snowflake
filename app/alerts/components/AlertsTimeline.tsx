import { AlertFilter, RegionFilter } from '../page';

interface AlertsTimelineProps {
  activeFilters: AlertFilter[];
  regionFilter: RegionFilter;
}

const ALL_ALERTS = [
  {
    id: 1,
    type: 'critical',
    title: 'Amoxicillin 500mg',
    location: 'Downtown Hospital, Ward 3',
    region: 'North',
    time: 'Just now',
    daysLeft: '24h Left',
    icon: 'dangerous',
    color: 'red',
    date: 'Today'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Rice Supply (Sacks)',
    location: 'Sector 4 Relief Camp',
    region: 'South',
    time: '09:00 AM',
    daysLeft: '2 Days',
    icon: 'warning',
    color: 'orange',
    date: 'Today'
  },
  {
    id: 3,
    type: 'unread',
    title: 'Tetanus Toxoid',
    location: 'Central Warehouse, Shelf B2',
    region: 'East',
    time: 'Yesterday',
    daysLeft: null,
    icon: 'inventory_2',
    color: 'gray',
    date: 'Yesterday'
  },
  {
    id: 4,
    type: 'critical',
    title: 'Surgical Gauze',
    location: 'West side Medical Center',
    region: 'West',
    time: '2h ago',
    daysLeft: '12h Left',
    icon: 'dangerous',
    color: 'red',
    date: 'Today'
  }
];

export function AlertsTimeline({ activeFilters, regionFilter }: AlertsTimelineProps) {
  const filteredAlerts = ALL_ALERTS.filter(alert => {
    const typeMatch = activeFilters.includes(alert.type as AlertFilter);
    const regionMatch = regionFilter === 'All' || alert.region === regionFilter;
    return typeMatch && regionMatch;
  });

  if (filteredAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 text-center">
        <div className="size-16 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-neutral-400">notifications_off</span>
        </div>
        <h3 className="text-xl font-bold text-neutral-dark dark:text-white mb-2">No alerts found</h3>
        <p className="text-neutral-500 max-w-xs mx-auto">Try adjusting your filters to see more notifications.</p>
      </div>
    );
  }

  const groupedAlerts = filteredAlerts.reduce((acc, alert) => {
    if (!acc[alert.date]) acc[alert.date] = [];
    acc[alert.date].push(alert);
    return acc;
  }, {} as Record<string, typeof ALL_ALERTS>);

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-neutral-100 dark:bg-neutral-800 -z-10"></div>

      {Object.entries(groupedAlerts).map(([date, alerts]) => (
        <div key={date} className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mt-4 first:mt-0">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 bg-white dark:bg-[#121212] py-1 pr-2">{date}</span>
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 flex-1"></div>
          </div>

          {alerts.map((alert) => (
            <div key={alert.id} className="flex gap-4 group">
              <div className="mt-4 relative shrink-0">
                <div className="size-12 rounded-full bg-white dark:bg-[#2c2b13] border-4 border-white dark:border-[#121212] flex items-center justify-center shadow-sm relative z-10">
                  <span className={`material-symbols-outlined filled ${alert.color === 'red' ? 'text-red-500' :
                    alert.color === 'orange' ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                    {alert.icon}
                  </span>
                </div>
              </div>
              <div className={`flex-1 bg-white dark:bg-[#23220f] border rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden ${alert.type === 'critical' ? 'border-l-4 border-l-red-500 border-neutral-200 dark:border-neutral-700' : 'border-neutral-200 dark:border-neutral-700'
                }`}>
                <div className="absolute top-5 right-5">
                  <span className="text-xs font-medium text-neutral-500">{alert.time}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-neutral-dark dark:text-white">{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${alert.type === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        alert.type === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}>
                        {alert.type === 'unread' ? 'Notice' : alert.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-neutral-500 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold">
                        {alert.region}
                      </div>
                    </div>
                  </div>
                  {alert.daysLeft && (
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm ${alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400' :
                        'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 text-orange-600 dark:text-orange-400'
                        }`}>
                        <span className="material-symbols-outlined text-[18px]">timer</span>
                        {alert.daysLeft}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-3">
                  <button className={`h-9 px-5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${alert.type === 'critical' ? 'bg-primary text-black hover:bg-[#e6e205]' :
                    alert.type === 'warning' ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90' :
                      'bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}>
                    {alert.type === 'critical' ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                        Approve Transfer
                      </>
                    ) : alert.type === 'warning' ? 'Reorder' : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Mark Resolved
                      </>
                    )}
                  </button>
                  {alert.type !== 'unread' && (
                    <button className="h-9 px-5 rounded-full bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-dark dark:text-white text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      {alert.type === 'critical' ? 'Contact Admin' : 'Snooze (1h)'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
