'use client';

import { useState } from 'react';

export function RegionalComparison() {
  const [showMapModal, setShowMapModal] = useState(false);

  return (
    <>
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h3 className="text-xl font-bold tracking-tight text-neutral-dark dark:text-white">Regional Comparison</h3>
        <div className="bg-white dark:bg-[#23220f] p-1 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden h-96 relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center gap-2 text-neutral-dark dark:text-white">
              <span className="size-2 bg-primary rounded-full"></span> 5 Critical Zones
            </div>
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center gap-2 text-neutral-dark dark:text-white">
              <span className="size-2 bg-green-500 rounded-full"></span> 12 Stable Zones
            </div>
          </div>
          <div className="w-full h-full bg-cover bg-center rounded-[1.8rem]" data-alt="Map showing regional distribution of supplies with heatmap overlay" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZIKSaUDjhjt8fNuo3Vb67mrP0Pe8pY3Fo8Y-Z7ZoPwLYRIRmcrqBSmJjv0gmE_ziy608eieoGSIyKiKQkKUA0Pq-PH2jkULSV0TyvKqL-NtCFpwD9WTMSIVjndZAThCnhXUmh-7utJyXZJqaeIqq7QBsjDOY_bpF5nu0Y3iCW3kwoo551vmWX2Lb-XNtbmUXqahlXodNqZno3rKq-MNShJPRo15U0IJ4T3axlAIKlvhzI7FE9CQ3zsBAhAUUcVJQQa3yjL6OgTX0')"}}></div>
          <button 
            onClick={() => setShowMapModal(true)}
            className="absolute bottom-4 right-4 bg-primary text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:brightness-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">map</span> Open Interactive Map
          </button>
        </div>
      </div>

      {/* Interactive Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowMapModal(false)}>
          <div className="bg-white dark:bg-[#1f1e0b] w-full max-w-6xl rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/20 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-neutral-dark dark:text-white">Interactive Regional Map</h2>
                <p className="text-sm text-neutral-500 mt-1">Live inventory status across all regions</p>
              </div>
              <button onClick={() => setShowMapModal(false)} className="size-10 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <iframe 
                src="https://www.google.com/maps/d/embed?mid=1h3bB3W6Mf0mWlTR4nRi_nJxQ6vU5Sw8&ehbc=2E312F" 
                width="100%" 
                height="100%" 
                style={{border:0}}
                className="w-full h-full"
              />
            </div>

            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/20">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-xs text-neutral-500">Stable Regions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">8</p>
                  <p className="text-xs text-neutral-500">Low Stock</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">5</p>
                  <p className="text-xs text-neutral-500">Critical</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">25</p>
                  <p className="text-xs text-neutral-500">Total Locations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
