'use client';

import { Camera } from 'lucide-react';

export function ProfileSection() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-lg overflow-hidden">
                        JD
                        {/* <img src="/avatar-placeholder.jpg" alt="Profile" className="h-full w-full object-cover" /> */}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors" title="Change Avatar">
                        <Camera className="h-4 w-4" />
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">John Doe</h3>
                    <p className="text-slate-500 dark:text-slate-400">john.doe@example.com</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        Pro Plan
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        defaultValue="John"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        defaultValue="Doe"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        defaultValue="john.doe@example.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        defaultValue="+1 (555) 000-0000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Bio
                </label>
                <textarea
                    id="bio"
                    rows={4}
                    defaultValue="Product Designer based in San Francisco. I love creating beautiful and functional interfaces."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all resize-none"
                />
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
                    Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all">
                    Save Changes
                </button>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Session Control</h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-red-900 dark:text-red-200">Sign Out</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">End your current session safely.</p>
                    </div>
                    <button 
                        onClick={() => {
                            document.cookie = 'simulated_user_id=; path=/; max-age=0';
                            window.location.href = '/';
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                        Log Out Now
                    </button>
                </div>
            </div>
        </div>
    );
}
