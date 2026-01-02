"use client";

import { useState } from 'react';
import { Activity  } from '@/lib/snowflakeService';
import { ReportAIInsight } from './ReportAIInsight';
import { ExportButton } from '@/components/ExportButton';
import { formatActivitiesForExport } from '@/lib/exportUtils';
import { TEAM_MEMBERS, TeamMember } from '@/lib/teamData';
import { X, Mail, Phone, Briefcase, GraduationCap, Award, Linkedin, Github, Calendar } from 'lucide-react';

interface TeamReportProps {
    activities: Activity[];
    isLoading: boolean;
}

export function TeamReport({ activities, isLoading }: TeamReportProps) {
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    // Use static team data instead of deriving from activities
    const teamMembers = TEAM_MEMBERS;
    const teamLeader = teamMembers.find(m => m.position === 'leader');
    const teamMembersList = teamMembers.filter(m => m.position === 'member');

    const contextData = teamMembers.map(m => 
        `${m.name} (${m.role}): ${m.responsibilities.length} key responsibilities, Skills: ${m.skills.join(', ')}`
    ).join('\n');

    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading Team Data...</div>;

    return (
        <div className="space-y-6">
            <ReportAIInsight contextData={contextData} type="team" />

            <div className="flex justify-between items-center bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <div>
                     <h2 className="text-2xl font-black text-neutral-dark dark:text-white mb-1">LedgerShield Project Team</h2>
                     <p className="text-neutral-500">Microsoft ImagineCup 2024 Team Members</p>
                </div>
                <ExportButton 
                    data={teamMembers.map(m => ({
                        Name: m.name,
                        Role: m.role,
                        Position: m.position,
                        Email: m.email,
                        Skills: m.skills.join(', '),
                        'Join Date': m.joinDate
                    }))}
                    filename="team_members_report"
                    reportTitle="LedgerShield Team Members"
                />
            </div>

            {/* Team Leader Section */}
            {teamLeader && (
                <div>
                    <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">shield_person</span>
                        Team Leader
                    </h3>
                    <div 
                        onClick={() => setSelectedMember(teamLeader)}
                        className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 rounded-3xl border-2 border-primary/30 hover:border-primary transition-all group shadow-md hover:shadow-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-16 rounded-full bg-gradient-to-br from-primary to-yellow-400 flex items-center justify-center text-2xl font-black text-black shadow-lg">
                                {teamLeader.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-xl text-neutral-dark dark:text-white">{teamLeader.name}</h3>
                                <p className="text-sm font-bold text-primary">{teamLeader.role}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                                        Team Leader
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div className="text-neutral-400 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{teamLeader.bio}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {teamLeader.skills.slice(0, 5).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-white dark:bg-neutral-800 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                    {skill}
                                </span>
                            ))}
                            {teamLeader.skills.length > 5 && (
                                <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-xs font-bold text-neutral-500">
                                    +{teamLeader.skills.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members Section */}
            <div>
                <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">group</span>
                    Team Members
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembersList.map(member => (
                        <div 
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className="bg-white dark:bg-[#23220f] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 hover:border-primary transition-all group shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-neutral-dark dark:text-white">{member.name}</h3>
                                    <p className="text-xs font-medium text-neutral-500">{member.role}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                        Active
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">{member.bio}</p>
                            
                            <div className="flex flex-wrap gap-1.5">
                                {member.skills.slice(0, 4).map(skill => (
                                    <span key={skill} className="px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                        {skill}
                                    </span>
                                ))}
                                {member.skills.length > 4 && (
                                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded-md text-xs font-bold text-neutral-500">
                                        +{member.skills.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Profile Modal */}
            {selectedMember && (
                <div 
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedMember(null)}
                >
                    <div 
                        className="bg-white dark:bg-[#1f1e0b] w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-br from-primary to-yellow-400 p-8">
                            <button 
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 size-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="flex items-start gap-6">
                                <div className="size-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black text-white shadow-xl border-4 border-white/30">
                                    {selectedMember.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-white mb-1">{selectedMember.name}</h2>
                                    <p className="text-lg font-bold text-black/70 mb-3">{selectedMember.role}</p>
                                    <div className="flex gap-2">
                                        {selectedMember.position === 'leader' && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/20 text-white backdrop-blur-sm border border-white/30">
                                                Team Leader
                                            </span>
                                        )}
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm border border-white/30">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8 space-y-6">
                            {/* Bio */}
                            <div>
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">About</h3>
                                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{selectedMember.bio}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                                    <Mail className="text-primary" size={20} />
                                    <div>
                                        <p className="text-xs text-neutral-500 font-medium">Email</p>
                                        <p className="text-sm font-bold text-neutral-dark dark:text-white">{selectedMember.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                                    <Phone className="text-primary" size={20} />
                                    <div>
                                        <p className="text-xs text-neutral-500 font-medium">Phone</p>
                                        <p className="text-sm font-bold text-neutral-dark dark:text-white">{selectedMember.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Education & Experience */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <GraduationCap className="text-primary" size={18} />
                                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Education</h3>
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300">{selectedMember.education}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="text-primary" size={18} />
                                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Experience</h3>
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300">{selectedMember.experience}</p>
                                </div>
                            </div>

                            {/* Responsibilities */}
                            <div>
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Key Responsibilities</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedMember.responsibilities.map((resp, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">{resp}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Technical Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMember.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm font-bold text-primary">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Achievements */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="text-primary" size={18} />
                                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Achievements</h3>
                                </div>
                                <div className="space-y-2">
                                    {selectedMember.achievements.map((achievement, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                                            <span className="material-symbols-outlined text-green-600 text-[16px] mt-0.5">military_tech</span>
                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">{achievement}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                {selectedMember.linkedIn && (
                                    <a href={`https://${selectedMember.linkedIn}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                                        <Linkedin className="text-blue-600" size={18} />
                                        <span className="text-sm font-bold text-blue-600">LinkedIn</span>
                                    </a>
                                )}
                                {selectedMember.github && (
                                    <a href={`https://${selectedMember.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors">
                                        <Github className="text-neutral-700 dark:text-neutral-300" size={18} />
                                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">GitHub</span>
                                    </a>
                                )}
                                <div className="flex items-center gap-2 ml-auto px-4 py-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                                    <Calendar className="text-neutral-500" size={16} />
                                    <span className="text-xs text-neutral-500">Joined {new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
