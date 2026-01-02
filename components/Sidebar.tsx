import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, AlertTriangle, FileText, Settings, BarChart3, RefreshCw, LogOut, Store, CreditCard, PlusCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { SIMULATED_USERS, UserProfile } from '@/lib/auth';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Sales', href: '/sales', icon: CreditCard },
  { name: 'Reorder', href: '/reorder', icon: RefreshCw },
  { name: 'Add Stock', href: '/inventory/add', icon: PlusCircle },
  { name: 'Procurement', href: '/procurement', icon: FileText },
  { name: 'Stores', href: '/dashboard/stores', icon: Store },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Client-side cookie reading to get current user
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
    }
    const userId = getCookie('simulated_user_id');
    if (userId) {
        const foundUser = SIMULATED_USERS.find(u => u.id === userId);
        if (foundUser) setUser(foundUser);
    }
  }, []);

  const handleLogout = () => {
      document.cookie = 'simulated_user_id=; path=/; max-age=0'; // Clear cookie
      router.push('/');
      router.refresh(); // Ensure server components re-render
  };

  return (
    <div className={clsx(
        "flex h-full flex-col bg-slate-50 dark:bg-[#1f1e0b] border-r border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 transition-all duration-300",
        isCollapsed ? "w-20 items-center" : "w-64"
    )}>
      <div className={clsx("flex h-16 items-center border-b border-slate-200 dark:border-neutral-800", isCollapsed ? "justify-center px-0" : "justify-center px-6")}>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-primary hover:opacity-80 transition-opacity">
          <BarChart3 className="h-6 w-6" />
          {!isCollapsed && <span>LedgerShield</span>}
        </Link>
      </div>
      <nav className={clsx("flex-1 space-y-1 py-6", isCollapsed ? "px-2" : "px-4")}>
        {navItems.map((item) => {
          // Hide 'Stores' if not admin
          if (item.name === 'Stores' && user?.role !== 'admin') return null;
          
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={clsx(
                'group flex items-center rounded-md text-sm font-medium transition-colors',
                isCollapsed ? 'justify-center p-3' : 'px-3 py-2',
                isActive
                  ? 'bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <item.icon
                className={clsx(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-indigo-600 dark:text-primary' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300',
                  !isCollapsed && 'mr-3'
                )}
              />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>
      <div className={clsx("border-t border-slate-200 dark:border-neutral-800", isCollapsed ? "p-2" : "p-4")}>
        {user ? (
            <div className={clsx("flex items-center rounded-lg bg-indigo-600 dark:bg-primary/20 text-white dark:text-primary-light shadow-md transition-all", isCollapsed ? "flex-col justify-center p-2 gap-2" : "justify-between gap-2 p-3")}>
                <div className={clsx("flex items-center gap-3", isCollapsed && "justify-center")}>
                    <div className="h-8 w-8 rounded-full bg-indigo-500 dark:bg-primary/30 flex items-center justify-center text-xs font-bold text-white dark:text-primary uppercase flex-shrink-0">
                        {user.name.charAt(0)}
                    </div>
                    {!isCollapsed && (
                        <div className="text-xs">
                            <p className="font-semibold text-white dark:text-primary truncate max-w-[90px]" title={user.name}>{user.name}</p>
                            <p className="text-indigo-200 dark:text-primary/70 capitalize">{user.role}</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/70 hover:text-white"
                    title="Log Out"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        ) : (
             <div className="text-center text-sm text-gray-500">{isCollapsed ? '...' : 'Loading...'}</div>
        )}
      </div>
    </div>
  );
}
