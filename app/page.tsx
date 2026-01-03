'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SIMULATED_USERS, UserSection, UserRole, UserProfile } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [selectedSection, setSelectedSection] = useState<UserSection | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Derived state
  const sectionUsers = useMemo(() =>
    SIMULATED_USERS.filter(u => u.section === selectedSection),
    [selectedSection]);

  const availableUsers = useMemo(() =>
    sectionUsers.filter(u => u.role === selectedRole),
    [sectionUsers, selectedRole]);

  // Auto-select first user when list changes
  useMemo(() => {
    if (availableUsers.length > 0) {
      setSelectedUserId(availableUsers[0].id);
    }
  }, [availableUsers]);

  const currentUser = sectionUsers.find(u => u.id === selectedUserId);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    // Set cookie for server-side access
    document.cookie = `simulated_user_id=${currentUser.id}; path=/; max-age=86400`;

    // Simulate network delay
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 800);
  };



  // --- SELECTION VIEW ---
  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#05050A] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden transition-colors duration-500">


        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-white/70 tracking-tight mb-6 text-center drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            StockHealth AI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-16 text-center max-w-2xl font-medium">
            Secure Supply Chain Management Platform. <br />
            Select your network section to proceed.
          </p>

          <div className="grid md:grid-cols-3 gap-6 w-full">
            {[
              { id: 'FDC', label: 'Food Distribution', icon: 'inventory_2', color: 'blue', desc: 'Central Warehouses' },
              { id: 'Hospital', label: 'Hospital Network', icon: 'local_hospital', color: 'red', desc: 'Clinics & PHCs' },
              { id: 'NGO', label: 'NGO Operations', icon: 'volunteer_activism', color: 'teal', desc: 'Relief Camps' }
            ].map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setSelectedSection(section.id as UserSection)}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative group overflow-hidden rounded-3xl p-8 text-left border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-xl dark:shadow-none hover:border-${section.color}-500/50 transition-all`}
              >
                <div className={`absolute inset-0 bg-${section.color}-500/0 group-hover:bg-${section.color}-500/5 transition-colors`} />
                <div className={`w-14 h-14 rounded-2xl bg-${section.color}-500/10 dark:bg-${section.color}-500/20 flex items-center justify-center text-${section.color}-600 dark:text-${section.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-3xl">{section.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{section.label}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{section.desc}</p>

                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400/70 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <span>Access Portal</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIN FORM VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050A] text-slate-900 dark:text-white flex items-center justify-center p-4 font-sans relative transition-colors duration-500">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        {/* Left Side: User Selection */}
        <div className="w-full md:w-7/12 bg-slate-50 dark:bg-[#0f0f16] p-8 md:p-10 flex flex-col border-r border-slate-200 dark:border-white/5 relative">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedSection(null)}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{selectedSection} Section</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">group</span>
              Select Profile
            </h3>

            <div className="space-y-6">
              {/* Admin Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Administrator</label>
                {sectionUsers.filter(u => u.role === 'admin').map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedRole('admin');
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${selectedUserId === user.id
                      ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-900/20'
                      : 'bg-white dark:bg-[#181820] border-slate-200 dark:border-white/5 hover:border-blue-500/50 hover:shadow-lg'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${selectedUserId === user.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-[#252530] text-slate-600 dark:text-slate-300 group-hover:bg-blue-500/10 group-hover:text-blue-500'
                      }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className={`font-bold ${selectedUserId === user.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                        {user.name}
                      </h4>
                      <p className={`text-xs ${selectedUserId === user.id ? 'text-blue-100' : 'text-slate-500'}`}>
                        Section Administrator
                      </p>
                    </div>
                    {selectedUserId === user.id && (
                      <div className="ml-auto text-white">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Retailers Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Store Managers</label>
                <div className="grid grid-cols-1 gap-3">
                  {sectionUsers.filter(u => u.role === 'retailer').map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSelectedRole('retailer');
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${selectedUserId === user.id
                        ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-900/20'
                        : 'bg-white dark:bg-[#181820] border-slate-200 dark:border-white/5 hover:border-indigo-500/50 hover:shadow-lg'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm ${selectedUserId === user.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-[#252530] text-slate-600 dark:text-slate-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-500'
                        }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold truncate ${selectedUserId === user.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                          {user.name}
                        </h4>
                        <p className={`text-xs truncate ${selectedUserId === user.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {selectedSection} Unit
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-5/12 bg-white dark:bg-[#0A0A12] p-10 flex flex-col justify-center relative">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-xs mx-auto w-full relative z-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-[#181820] flex items-center justify-center text-4xl font-black text-slate-300 dark:text-slate-700 mb-4 shadow-inner">
                {currentUser ? currentUser.name.charAt(0) : '?'}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {currentUser ? 'Welcome back!' : 'Select a Profile'}
              </h3>
              <p className="text-slate-500 text-sm">
                {currentUser ? `Login as ${currentUser.name}` : 'Choose a user from the left to continue'}
              </p>
            </div>

            <form onSubmit={handleLogin} className={`space-y-4 transition-all duration-500 ${!currentUser ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 material-symbols-outlined text-lg">mail</span>
                  <input
                    type="email"
                    value={currentUser?.email || 'user@example.com'}
                    readOnly
                    className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 material-symbols-outlined text-lg">lock</span>
                  <input
                    type="password"
                    value="demo_password"
                    readOnly
                    className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !currentUser}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Login now</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
