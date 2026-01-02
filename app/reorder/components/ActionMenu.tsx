'use client';

import { useState, useRef, useEffect } from 'react';

interface ActionMenuProps {
    onViewDetails: () => void;
    onEdit: () => void;
}

export function ActionMenu({ onViewDetails, onEdit }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleAction = (callback: () => void) => {
        callback();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`size-8 inline-flex items-center justify-center rounded-full transition-colors ${isOpen
                        ? 'bg-primary text-black'
                        : 'hover:bg-background-light dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
            >
                <span className="material-symbols-outlined">more_vert</span>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a10] rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => handleAction(onViewDetails)}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
                    >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                        View Details
                    </button>
                    <button
                        onClick={() => handleAction(onEdit)}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Edit Item
                    </button>
                </div>
            )}
        </div>
    );
}
