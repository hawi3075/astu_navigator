import React from 'react';
import { 
  User, Mail, Shield, ChevronLeft, LogOut, Settings 
} from 'lucide-react';

export default function ProfilePage({ onNavigate, onLogout }) {
  // Mock user data matching your screenshot
  const user = {
    name: "Hawi",
    email: "hawi@astu.edu.et",
    role: "Student"
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Bar */}
      <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('Home')}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Account Settings</h1>
        </div>

        {/* ✅ LOGOUT BUTTON ADDED HERE */}
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 shadow-sm"
        >
          <LogOut size={16} strokeWidth={3} />
          <span>Logout</span>
        </button>
      </div>

      <div className="px-6 py-10 max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50" />
          <div className="px-8 pb-8 -mt-16 text-center">
            <div className="inline-block p-1 bg-white rounded-full shadow-lg mb-4">
              <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white">
                <User size={60} className="text-slate-400" />
              </div>
            </div>
            <h2 className="text-3xl font-[1000] text-slate-900 tracking-tighter">{user.name}</h2>
            <p className="text-blue-600 font-bold text-sm tracking-wide mt-1">ASTU Navigator Explorer</p>
          </div>
        </div>

        {/* Info Items */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Email Address</p>
              <p className="font-bold text-slate-800">{user.email}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">User Role</p>
              <p className="font-bold text-slate-800">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}