import React, { useEffect, useState } from 'react';
import { User, Trash2 } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch (err) { console.error("Fetch error:", err); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Permanently delete this user from ASTU Navigator?")) {
            const response = await fetch(`http://localhost:8000/api/admin/users/${id}`, { method: 'DELETE' });
            if (response.ok) fetchUsers();
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-5 duration-700">
            <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">Registered Students</h2>
            <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="p-5 text-[10px] font-black uppercase">Student</th>
                            <th className="p-5 text-[10px] font-black uppercase text-right">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-red-50/40 transition-colors group">
                                <td className="p-5 flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><User size={16}/></div>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm">{u.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</div>
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <button onClick={() => handleDelete(u._id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="p-10 text-center text-slate-400 text-sm font-medium">No students registered yet.</div>}
            </div>
        </div>
    );
}