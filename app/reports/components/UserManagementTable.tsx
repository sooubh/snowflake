'use client';

import { useState } from 'react';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';

const MOCK_USERS = [
  {id: 1, name: "Sarah Chen", email: "sarah.c@gov.org", role: "Super Admin", region: "Central HQ", lastActive: "Just now", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn26oqo047ja6eRDdHXe70qNoLHYZun4HY7kzefaIeRDZsQ3fe059pCOXftUCtWdtcMk10sSuNykTv_YHgJEMelKbGYpRsgfRXFw6FC5vEZyqcquPdrWeIWmxREWvqwqncuv-YR1aYLI9pqXezQU2kCXhw5DIoHZ3tTcG0jpA38B94_bwblNIhRNUJ0mY3wG74l6KTEdEvigFjDt6VU4pm50zFDlk3fDHrmgSVcDPSJf1mu5wWFGH5fkGZ2RYJgoCnLH95GepSG1Q"},
  {id: 2, name: "Marcus Johnson", email: "m.johnson@relief.org", role: "Logistician", region: "North District", lastActive: "2 hrs ago", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsguqMDLgkUDeXcszRKwbCOctcIaLcBSmotdtmAFE3MrXIXkW6tICh0XTn-3LjQvtyl_LF9SEN59qO0BP0lxE9_RoRaW4-gVD8UV4rlHQimNI1LaokSr_hrJTBPi0nZvQswWxIb1CK9SIbQZwOL8eaVvj9qfc63EGxIssIchTvh5M4RkH4FaX6mviy7rAZb2OWfvW4J4Xv-cxRA8NfsnHwnYlewu-KsAlemhjSioarYIrk97kJDwWpoD3PH8L2ApFHtzl4W3hulM0"},
  {id: 3, name: "Priya Patel", email: "priya.p@health.gov", role: "Viewer", region: "East Region", lastActive: "Yesterday", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfgxh5pLac9NLXFYI3oBTOSJ7T8yyYjGexx08fdW6l-SxmkU6E_YP9x1BhJ2_Oa0m-hlO2-3pX8eF-wmGValRI1ajAy1lZUwpJ1did0fd8obtNMvI-uxOr09fW0InJzzTtXZ_DoditKlxaCeCE45bnJaX0bKLjhzKzp9QuVxQzqC5hXZm6Li08BbJEIa9TuE4ENDbV3vWTblxBmsxpthzgIjBoNwhyvNFi_KSWXNt8xr9OUNLdDOZNj-zKYBlHzcAk15WnAcajTQM"},
];

export function UserManagementTable() {
  const [filterText, setFilterText] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(filterText.toLowerCase()) ||
    u.email.toLowerCase().includes(filterText.toLowerCase()) ||
    u.region.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleExport = (type: 'csv' | 'pdf') => {
    const users = filteredUsers.map(({avatar, ...rest}) => rest);
    if (type === 'csv') {
      exportToCSV(users, 'team_members');
    } else {
      const headers = ["Name", "Email", "Role", "Region", "Last Active"];
      const rows = users.map(u => [u.name, u.email, u.role, u.region, u.lastActive]);
      exportToPDF("Active Team Members", headers, rows, 'team_members');
    }
  };

  const handleInvite = () => {
    alert(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleAction = (action: string, user: any) => {
    alert(`${action} action for ${user.name}`);
    setShowActionsMenu(null);
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold tracking-tight text-neutral-dark dark:text-white">Active Team Members</h3>
          <div className="flex gap-2">
            <button onClick={() => handleExport('csv')} className="h-9 px-3 rounded-full bg-white dark:bg-[#23220f] border border-neutral-200 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">csv</span>
              CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="h-9 px-3 rounded-full bg-white dark:bg-[#23220f] border border-neutral-200 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              PDF
            </button>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-500 text-[18px]">search</span>
              <input 
                className="h-9 pl-9 pr-4 rounded-full bg-white dark:bg-[#23220f] border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-primary focus:border-primary text-neutral-dark dark:text-white placeholder-neutral-500" 
                placeholder="Filter users" 
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <button onClick={() => setShowInviteModal(true)} className="h-9 px-4 rounded-full bg-primary text-black text-xs font-bold hover:brightness-95 transition-colors">
              Invite User
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-[#23220f] rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-700/50">
                  <th className="p-5 text-xs uppercase tracking-wider text-neutral-500 font-bold">User</th>
                  <th className="p-5 text-xs uppercase tracking-wider text-neutral-500 font-bold">Role</th>
                  <th className="p-5 text-xs uppercase tracking-wider text-neutral-500 font-bold">Region</th>
                  <th className="p-5 text-xs uppercase tracking-wider text-neutral-500 font-bold">Last Active</th>
                  <th className="p-5 text-xs uppercase tracking-wider text-neutral-500 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-black/20 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-center bg-cover size-8 rounded-full" style={{backgroundImage: `url('${user.avatar}')`}}></div>
                        <div>
                          <p className="text-sm font-bold text-neutral-dark dark:text-white">{user.name}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Super Admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                        user.role === 'Logistician' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-neutral-dark dark:text-white">{user.region}</td>
                    <td className="p-5 text-sm text-neutral-500">{user.lastActive}</td>
                    <td className="p-5 text-right relative">
                      <button onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)} className="text-neutral-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {showActionsMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-10 py-2 min-w-[160px]">
                          <button onClick={() => handleAction('Edit', user)} className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Edit User
                          </button>
                          <button onClick={() => handleAction('Change Role', user)} className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            Change Role
                          </button>
                          <button onClick={() => handleAction('Remove', user)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Remove User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-background-light dark:bg-black/20 p-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-center">
            <button className="text-sm font-bold text-neutral-500 hover:text-neutral-dark dark:hover:text-white transition-colors">View All 42 Users</button>
          </div>
        </div>
      </section>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white dark:bg-[#1f1e0b] w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/20 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-dark dark:text-white">Invite Team Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="size-10 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Email Address</label>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full p-3 border rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700" placeholder="user@example.com" type="email" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Role</label>
                <select className="w-full p-3 border rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                  <option>Viewer</option>
                  <option>Logistician</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Region</label>
                <select className="w-full p-3 border rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                  <option>Central HQ</option>
                  <option>North District</option>
                  <option>East Region</option>
                  <option>South Zone</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowInviteModal(false)} className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl font-bold">Cancel</button>
                <button onClick={handleInvite} className="flex-1 py-3 bg-primary text-black rounded-xl font-bold shadow-lg">Send Invitation</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
