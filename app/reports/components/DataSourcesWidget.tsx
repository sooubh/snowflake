'use client';

import { useState } from 'react';

export function DataSourcesWidget() {
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({name: '', type: 'API', url: ''});

  const handleAddSource = () => {
    alert(`Source "${newSource.name}" added successfully!`);
    setShowAddModal(false);
    setNewSource({name: '', type: 'API', url: ''});
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-neutral-dark dark:text-white">Data Sources</h3>
          <button onClick={() => setShowManageModal(true)} className="text-primary text-sm font-bold hover:underline">Manage</button>
        </div>
        <div className="bg-white dark:bg-[#23220f] p-5 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-sm flex flex-col gap-4 h-full">
          {/* Source Items */}
          <div className="flex items-center gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined">api</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-neutral-dark dark:text-white">National Health API</p>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-green-500"></span>
                <p className="text-xs text-neutral-500">Connected • Synced 2m ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <span className="material-symbols-outlined">upload_file</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-neutral-dark dark:text-white">Q3 Manual Logs</p>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-gray-300"></span>
                <p className="text-xs text-neutral-500">Uploaded yesterday</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-neutral-dark dark:text-white">District 4 Portal</p>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500"></span>
                <p className="text-xs text-neutral-500">Auth Error • Retry needed</p>
              </div>
            </div>
            <button className="text-xs font-bold text-neutral-dark dark:text-white underline">Fix</button>
          </div>
          <div className="mt-auto pt-4">
            <button onClick={() => setShowAddModal(true)} className="w-full h-10 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center gap-2 text-neutral-500 text-sm font-bold hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span> Add New Source
            </button>
          </div>
        </div>
      </div>

      {/* Manage Sources Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowManageModal(false)}>
          <div className="bg-white dark:bg-[#1f1e0b] w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/20 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-dark dark:text-white">Manage Data Sources</h2>
              <button onClick={() => setShowManageModal(false)} className="size-10 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {['National Health API', 'Q3 Manual Logs', 'District 4 Portal'].map((source, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl">
                  <div>
                    <p className="font-bold text-neutral-dark dark:text-white">{source}</p>
                    <p className="text-xs text-neutral-500">Last synced: 2 minutes ago</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">Edit</button>
                    <button className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-[#1f1e0b] w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/20 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-dark dark:text-white">Add Data Source</h2>
              <button onClick={() => setShowAddModal(false)} className="size-10 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Source Name</label>
                <input value={newSource.name} onChange={e => setNewSource({...newSource, name: e.target.value})} className="w-full p-3 border rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700" placeholder="e.g., Regional Database" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Source Type</label>
                <select value={newSource.type} onChange={e => setNewSource({...newSource, type: e.target.value})} className="w-full p-3 border rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                  <option>API</option>
                  <option>File Upload</option>
                  <option>Database</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">URL / Path</label>
                <input value={newSource.url} onChange={e => setNewSource({...newSource, url: e.target.value})} className="w-full p-3 border rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700" placeholder="https://..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl font-bold">Cancel</button>
                <button onClick={handleAddSource} className="flex-1 py-3 bg-primary text-black rounded-xl font-bold shadow-lg">Add Source</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
