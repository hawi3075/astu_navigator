import React, { useState } from 'react';
// MAKE SURE Eye AND EyeOff ARE IN THIS LIST:
import { User, Mail, Lock, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage({ onBackToLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative">
        <button onClick={onBackToLogin} className="absolute mt-6 ml-6 text-white/80 hover:text-white transition-colors z-20">
          <ArrowLeft size={24} />
        </button>
        
        <div className="bg-blue-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-blue-100 mt-2">Join the ASTU navigation community</p>
        </div>
        
        <div className="p-10 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 text-slate-400" size={18} />
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12" placeholder="iDesire User" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">ASTU Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-400" size={18} />
              <input type="email" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12" placeholder="student@astu.edu.et" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create password" 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 pr-12" 
              />
              {/* EYE ICON BUTTON */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 mt-4 hover:bg-blue-700">
            <UserPlus size={20} /> Register
          </button>
        </div>
      </div>
    </div>
  );
}