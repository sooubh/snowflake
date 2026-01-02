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
            'Backend development and Azure integration',
            'Security and blockchain implementation'
        ],
        skills: [
            'Next.js',
            'React',
            'TypeScript',
            'Azure',
            'Cosmos DB',
            'Blockchain',
            'System Design',
            'Leadership'
        ],
        education: 'B.Tech in Computer Science',
        experience: '3+ years in full-stack development',
        achievements: [
            'Microsoft ImagineCup 2024 Regional Finalist',
            'Built 5+ production-grade applications',
            'Azure Certified Developer',
            'Open source contributor'
        ],
        linkedIn: 'linkedin.com/in/sourabh-singh',
        github: 'github.com/sourabhsingh',
        joinDate: '2024-10-01'
    },
    {
        id: 'sahil-sarode',
        name: 'Sahil Sarode',
        role: 'Frontend Developer & UI/UX Designer',
        position: 'member',
        email: 'sahil.sarode@ledgershield.com',
        phone: '+91 98765 43211',
        bio: 'Creative frontend developer with a keen eye for design. Specializes in creating intuitive user interfaces and seamless user experiences for complex systems.',
        responsibilities: [
            'Frontend development and component architecture',
            'UI/UX design and prototyping',
            'Responsive design implementation',
            'User testing and feedback integration',
            'Design system maintenance'
        ],
        skills: [
            'React',
            'Next.js',
            'TypeScript',
            'TailwindCSS',
            'Figma',
            'UI/UX Design',
            'Responsive Design',
            'Accessibility'
        ],
        education: 'B.Tech in Information Technology',
        experience: '2+ years in frontend development',
        achievements: [
            'Designed LedgerShield\'s complete UI system',
            'Created 50+ reusable components',
            'Improved user engagement by 40%',
            'Won Best UI Design Award at college hackathon'
        ],
        linkedIn: 'linkedin.com/in/sahil-sarode',
        github: 'github.com/sahilsarode',
        joinDate: '2024-10-01'
    },
    {
        id: 'sneha-darade',
        name: 'Sneha Darade',
        role: 'Backend Developer & Data Analyst',
        position: 'member',
        email: 'sneha.darade@ledgershield.com',
        phone: '+91 98765 43212',
        bio: 'Data-driven developer with expertise in backend systems and analytics. Focuses on building scalable APIs and deriving actionable insights from complex datasets.',
        responsibilities: [
            'Backend API development and optimization',
            'Database design and management',
            'Data analytics and reporting',
            'AI/ML model integration',
            'Performance monitoring and optimization'
        ],
        skills: [
            'Node.js',
            'TypeScript',
            'Azure Cosmos DB',
            'REST APIs',
            'Python',
            'Data Analysis',
            'AI/ML',
            'Performance Optimization'
        ],
        education: 'B.Tech in Computer Engineering',
        experience: '2+ years in backend development',
        achievements: [
            'Optimized database queries reducing latency by 60%',
            'Implemented real-time analytics dashboards',
            'Developed AI-powered inventory prediction system',
            'Published research paper on supply chain optimization'
        ],
        linkedIn: 'linkedin.com/in/sneha-darade',
        github: 'github.com/snehadarade',
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
