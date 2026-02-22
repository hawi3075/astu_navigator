import React, { useState, useEffect } from 'react';
import { Users, Shield, Trash2, Mail } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      // ✅ FIX: Changed port from 8000 to 5000 to match your Auth server
      const res = await fetch('http://localhost:5000/api/admin/users');
      const data = await res.json();
      
      // ✅ FIX: Ensure data is an array before setting state to prevent .map() crash
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Users...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">User Management</h2>
        <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase">
          Total: {users.length}
        </div>
      </div>

      {/* ✅ Check for empty users to prevent crashes */}
      {users.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] text-center border-2 border-dashed border-slate-200">
          <Users className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">No users found on the server.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail size={12} /> {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                }`}>
                  {user.role}
                </span>
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}