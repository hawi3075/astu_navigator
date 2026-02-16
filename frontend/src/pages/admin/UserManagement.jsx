import React, { useEffect, useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/admin/users')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    return (
        <div className="animate-in slide-in-from-bottom-5 duration-700">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Registered Students</h2>
            <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="p-5 text-[10px] font-black uppercase">Student</th>
                            <th className="p-5 text-[10px] font-black uppercase">Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                            <tr key={u.email} className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-5 flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><User size={16}/></div>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm">{u.name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">{u.email}</div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                        {u.role?.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}