'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SIMULATED_USERS, UserSection } from '@/lib/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<UserSection>('FDC');
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // Filter users by selected section
  const sectionUsers = SIMULATED_USERS.filter(u => u.section === selectedSection);
  const adminUser = sectionUsers.find(u => u.role === 'admin');
  const retailers = sectionUsers.filter(u => u.role === 'retailer');

  const handleLogin = async (userId: string) => {
    setLoading(true);
    // Set cookie for server-side access (simple simulation)
    document.cookie = `simulated_user_id=${userId}; path=/; max-age=86400`;
    
    // Simulate network delay
    setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
    }, 800);
  };

  const handleCleanupDatabase = async () => {
    if (!confirm('⚠️ This will DELETE all unused database containers. This action cannot be undone. Continue?')) {
      return;
    }

    setCleanupLoading(true);
    try {
      const { cleanupDatabaseContainers } = await import('@/app/actions/cleanupDatabase');
      const result = await cleanupDatabaseContainers();
      
      if (result.success) {
        alert(`✅ ${result.message}\n\nDeleted containers:\n${result.deleted.join('\n')}`);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Cleanup failed: ${error}`);
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-blue-500/30">
       {/* Background Glows */}
       <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
         <div className="absolute top-[40%] left-[-10%] w-[30%] h-[50%] bg-purple-600/5 rounded-full blur-[100px]" />
       </div>

       <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
         {/* Title Section */}
         <div className="text-center mb-10">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4">StockHealth AI</h1>
            <p className="text-lg text-slate-400 font-medium">Select your role to access the secure dashboard.</p>
         </div>

         {/* Section Pills */}
         <div className="flex flex-wrap justify-center gap-4 mb-14">
            <button
                onClick={() => setSelectedSection('FDC')}
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                    selectedSection === 'FDC' 
                    ? 'bg-blue-600 border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.5)] text-white scale-105' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
            >
                Food Distribution Center
            </button>
            <button
                onClick={() => setSelectedSection('Hospital')}
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                    selectedSection === 'Hospital' 
                    ? 'bg-purple-600 border-purple-400 shadow-[0_0_25px_rgba(147,51,234,0.5)] text-white scale-105' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
            >
                Hospital Section
            </button>
            <button
                onClick={() => setSelectedSection('NGO')}
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                    selectedSection === 'NGO' 
                    ? 'bg-teal-600 border-teal-400 shadow-[0_0_25px_rgba(13,148,136,0.5)] text-white scale-105' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
            >
                NGO Section
            </button>
         </div>

         {/* Cards Container */}
         <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* Admin View Card */}
            <motion.div 
                layout
                className="relative overflow-hidden bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center group hover:border-white/20 transition-all shadow-2xl backdrop-blur-xl"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col items-center w-full h-full">
                    <div className="flex items-center gap-2 text-slate-300 font-bold tracking-widest text-xs uppercase mb-12">
                        <span className="material-symbols-outlined text-lg">shield_person</span>
                        ADMIN VIEW
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center mb-12">
                        {adminUser ? (
                            <>
                                <div className="w-20 h-20 rounded-full bg-slate-700/50 border border-white/10 flex items-center justify-center text-3xl font-medium text-slate-200 mb-6 shadow-inner">
                                    {adminUser.name.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{adminUser.name} ({adminUser.section})</h3>
                                <p className="text-slate-400">Full Section Access</p>
                            </>
                        ) : (
                            <p className="text-slate-500 italic">No admin found for this section</p>
                        )}
                    </div>

                    <button 
                        onClick={() => adminUser && handleLogin(adminUser.id)}
                        disabled={!adminUser || loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Accessing..." : "Login as Admin"}
                        {!loading && <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>}
                    </button>
                </div>
            </motion.div>

            {/* Retailer View Card */}
            <motion.div 
                layout
                className="relative overflow-hidden bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center group hover:border-white/20 transition-all shadow-2xl backdrop-blur-xl"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col items-center w-full h-full">
                    <div className="flex items-center gap-2 text-slate-300 font-bold tracking-widest text-xs uppercase mb-8">
                        <span className="material-symbols-outlined text-lg">storefront</span>
                        RETAILER VIEW
                    </div>

                    <div className="w-full space-y-3 flex-1">
                        {retailers.length > 0 ? retailers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleLogin(user.id)}
                                disabled={loading}
                                className="w-full p-4 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-white/20 text-left flex items-center justify-between group/item transition-all backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-600/50 flex items-center justify-center text-slate-300 font-bold text-xs">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-slate-200 group-hover/item:text-white">{user.name}</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-500 group-hover/item:text-white text-lg transition-colors">chevron_right</span>
                            </button>
                        )) : (
                            <div className="text-center text-slate-500 italic py-10">No retailers configured</div>
                        )}
                        {/* Mock data to look fuller if needed, or valid data */}
                    </div>
                </div>
            </motion.div>
         </div>

         <div className="mt-16 flex flex-col items-center gap-4">
           <button
             onClick={handleCleanupDatabase}
             disabled={cleanupLoading}
             className="px-6 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             {cleanupLoading ? (
               <>
                 <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                 Cleaning Database...
               </>
             ) : (
               <>
                 <span className="material-symbols-outlined text-sm">delete_sweep</span>
                 Cleanup Unused Containers
               </>
             )}
           </button>
           
           <p className="text-center text-slate-600 text-xs font-medium tracking-wide">
             © 2025 StockHealth AI • Imagine Cup Prototype
           </p>
         </div>
       </div>
    </div>
  );
}
