"use client";

import { UserProfile } from "@/lib/auth";
import { useEffect, useState } from "react";

interface UserProfilePillProps {
    user: UserProfile;
}

export function UserProfilePill({ user }: UserProfilePillProps) {
    const [displayName, setDisplayName] = useState(user.name);

    useEffect(() => {
        // Initial check
        const saved = localStorage.getItem('user_profile_override');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.id === user.id) {
                    setDisplayName(parsed.name);
                }
            } catch (e) { }
        }

        // Listener
        const updateProfile = () => {
            const saved = localStorage.getItem('user_profile_override');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.id === user.id) {
                        setDisplayName(parsed.name);
                    }
                } catch (e) { }
            }
        };

        window.addEventListener('profileUpdated', updateProfile);
        return () => window.removeEventListener('profileUpdated', updateProfile);
    }, [user.id]);

    return (
        <div className="bg-white dark:bg-[#1f1e0b] px-4 py-2 rounded-full border border-transparent dark:border-neutral-800 shadow-sm flex items-center gap-3">
            <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300">
                {displayName.charAt(0)}
            </div>
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-neutral-dark dark:text-white leading-none">{displayName}</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{user.role}</span>
            </div>
        </div>
    );
}
