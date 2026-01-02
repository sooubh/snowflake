'use client';

import { ThemeProvider } from 'next-themes';
import { createContext, useContext, useState, useEffect } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

type Density = 'comfortable' | 'compact';

interface DensityContextType {
    density: Density;
    setDensity: (density: Density) => void;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
    const [density, setDensity] = useState<Density>('comfortable');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    return (
        <ToastProvider>
            <NotificationProvider>
                {mounted ? (
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <DensityContext.Provider value={{ density, setDensity }}>
                            <div data-density={density}>
                                {children}
                            </div>
                        </DensityContext.Provider>
                    </ThemeProvider>
                ) : (
                    <>{children}</>
                )}
            </NotificationProvider>
        </ToastProvider>
    );
}

export function useDensity() {
    const context = useContext(DensityContext);
    if (context === undefined) {
        throw new Error('useDensity must be used within a Providers');
    }
    return context;
}
