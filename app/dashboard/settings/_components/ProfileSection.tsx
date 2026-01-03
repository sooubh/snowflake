"use client";

import { useState, useEffect } from "react";
import { UserProfile, SIMULATED_USERS } from "@/lib/auth";
import { User, Mail, Phone, MapPin, Save, RefreshCw } from "lucide-react";

export function ProfileSection() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '+91 98765 43210',
        bio: 'Inventory Manager',
        location: 'Mumbai, India'
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load user from ID cookie
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }
        const userId = getCookie('simulated_user_id');

        // Load custom overrides from localStorage
        const savedProfile = localStorage.getItem('user_profile_override');

        if (userId) {
            const baseUser = SIMULATED_USERS.find(u => u.id === userId);
            if (baseUser) {
                setUser(baseUser);
                setFormData(prev => ({
                    ...prev,
                    name: baseUser.name,
                    email: baseUser.email,
                    location: baseUser.section === 'FDC' ? 'Delhi, India' : baseUser.section === 'Hospital' ? 'Mumbai, India' : 'Bangalore, India'
                }));

                // Apply overrides if they match the current user ID
                if (savedProfile) {
                    const parsed = JSON.parse(savedProfile);
                    if (parsed.id === userId) {
                        setFormData(prev => ({ ...prev, ...parsed }));
                    }
                }
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        if (!user) return;
        setLoading(true);

        // Save to localStorage to persist across refreshes (Simulation)
        // In a real app, this would be an API call
        const profileData = {
            id: user.id,
            ...formData
        };
        localStorage.setItem('user_profile_override', JSON.stringify(profileData));

        // Dispatch custom event for Header to update
        window.dispatchEvent(new Event('profileUpdated'));

        setTimeout(() => {
            setLoading(false);
            setSaved(true);
        }, 600);
    };

    if (!user) return <div className="text-gray-500">Loading profile...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                        {formData.name.charAt(0)}
                    </div>
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        Change Avatar
                    </button>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                        {user.role}
                    </span>
                </div>

                {/* Form Section */}
                <div className="flex-1 w-full space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <User className="w-3 h-3" /> Full Name
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Phone
                            </label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Location
                            </label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio / Role Description</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            ID: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{user.id}</span>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading || saved}
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 ${saved
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : saved ? <Save className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {loading ? 'Saving...' : saved ? 'Changes Saved' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
