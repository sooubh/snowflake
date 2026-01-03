// Team Member Data for LedgerShield Project
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    position: 'leader' | 'member';
    email: string;
    phone: string;
    avatar?: string;
    bio: string;
    responsibilities: string[];
    skills: string[];
    education: string;
    experience: string;
    achievements: string[];
    linkedIn?: string;
    github?: string;
    joinDate: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
    {
        id: 'sourabh-singh',
        name: 'Sourabh Singh',
        role: 'Project Lead & Full Stack Developer',
        position: 'leader',
        email: 'sourabh.singh@ledgershield.com',
        phone: '+91 98765 43210',
        bio: 'Passionate technology leader with expertise in blockchain, cloud computing, and healthcare IT. Leading the LedgerShield project to revolutionize pharmaceutical supply chain management in India.',
        responsibilities: [
            'Overall project architecture and technical direction',
            'Team coordination and mentorship',
            'Stakeholder management and presentations',
            'Backend development and Snowflake integration',
            'Security and blockchain implementation'
        ],
        skills: [
            'Next.js',
            'React',
            'TypeScript',
            'Snowflake',
            'Blockchain',
            'System Design',
            'Leadership'
        ],
        education: 'B.Tech in Computer Science',
        experience: '3+ years in full-stack development',
        achievements: [
            'Built 5+ production-grade applications',
            'Open source contributor'
        ],
        linkedIn: 'linkedin.com/in/sourabh-singh',
        github: 'github.com/sourabhsingh',
        joinDate: '2024-10-01'
    }
];

export function getTeamMember(id: string): TeamMember | undefined {
    return TEAM_MEMBERS.find(member => member.id === id);
}

export function getTeamLeader(): TeamMember | undefined {
    return TEAM_MEMBERS.find(member => member.position === 'leader');
}

export function getTeamMembers(): TeamMember[] {
    return TEAM_MEMBERS.filter(member => member.position === 'member');
}
