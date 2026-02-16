import React, { useEffect, useState } from 'react';
import { Mail, User, ShieldCheck, Trash2 } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Fetch users from your FastAPI backend
        fetch('http://localhost:8000/api/admin/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 px-2">Registered Community</h2>
            <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="p-4 text-xs font-black uppercase tracking-widest">User</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Role</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{user.full_name || 'Student'}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Mail size={10} /> {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-red-400 hover:text-red-600 transition-colors p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;