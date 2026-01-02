export type UserRole = 'admin' | 'retailer';
export type UserSection = 'FDC' | 'Hospital' | 'NGO';

export interface UserProfile {
    id: string;
    name: string;
    role: UserRole;
    section: UserSection;
    email: string;
}

export const SIMULATED_USERS: UserProfile[] = [
    // FDC (Food Distribution Center) Section
    { id: 'admin-psd', name: 'District Admin (FDC)', role: 'admin', section: 'FDC', email: 'admin@fooddist.gov' },
    { id: 'psd-r1', name: 'Central Store A', role: 'retailer', section: 'FDC', email: 'storeA@fooddist.gov' },
    { id: 'psd-r2', name: 'Central Store B', role: 'retailer', section: 'FDC', email: 'storeB@fooddist.gov' },
    { id: 'psd-r3', name: 'Central Store C', role: 'retailer', section: 'FDC', email: 'storeC@fooddist.gov' },

    // Hospital Section
    { id: 'admin-hosp', name: 'Hospital Director', role: 'admin', section: 'Hospital', email: 'director@hospital.gov' },
    { id: 'hosp-r1', name: 'City General', role: 'retailer', section: 'Hospital', email: 'city@hospital.gov' },
    { id: 'hosp-r2', name: 'Rural PHC 1', role: 'retailer', section: 'Hospital', email: 'phc1@hospital.gov' },
    { id: 'hosp-r3', name: 'Rural PHC 2', role: 'retailer', section: 'Hospital', email: 'phc2@hospital.gov' },

    // NGO Section
    { id: 'admin-ngo', name: 'NGO Coordinator', role: 'admin', section: 'NGO', email: 'coord@ngo.org' },
    { id: 'ngo-r1', name: 'Relief Camp Alpha', role: 'retailer', section: 'NGO', email: 'alpha@ngo.org' },
    { id: 'ngo-r2', name: 'Relief Camp Beta', role: 'retailer', section: 'NGO', email: 'beta@ngo.org' },
    { id: 'ngo-r3', name: 'Mobile Unit 1', role: 'retailer', section: 'NGO', email: 'mobile1@ngo.org' },
];

export function getUser(id: string): UserProfile | undefined {
    return SIMULATED_USERS.find(u => u.id === id);
}
