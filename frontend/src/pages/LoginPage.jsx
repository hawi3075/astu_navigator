import React, { useState } from 'react';
// MAKE SURE Eye AND EyeOff ARE IN THIS LIST:
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLogin, onGoRegister }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-blue-100 mt-2">Log in to your ASTU account</p>
        </div>
        
        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-400" size={18} />
              <input type="email" placeholder="student@astu.edu.et" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500/50" 
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

          <button onClick={onLogin} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
            <LogIn size={20} /> Sign In
          </button>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account? <button onClick={onGoRegister} className="text-blue-600 font-bold hover:underline">Register</button>
          </p>
        </div>
      </div>
    </div>
  );
}