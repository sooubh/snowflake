"use client";

import Link from "next/link";

export function ItemHeaderActions() {
    return (
        <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a190b] hover:bg-neutral-50 dark:hover:bg-[#23220f] text-neutral-dark dark:text-white font-medium text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share Report
            </button>
            <Link href="/reorder" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-neutral-dark font-bold text-sm transition-colors shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Reorder Stock
            </Link>
          </div>
    );
}
