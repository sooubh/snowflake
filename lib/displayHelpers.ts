// Helper function to display full section names
export const getSectionDisplayName = (section: string): string => {
    const displayNames: Record<string, string> = {
        'FDC': 'Food Distribution Center',
        'Hospital': 'Hospital',
        'NGO': 'NGO'
    };
    return displayNames[section] || section;
};
