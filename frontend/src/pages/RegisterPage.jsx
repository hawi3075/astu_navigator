import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage({ onBackToLogin }) {
  // 1. INPUT STATES
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // To display "Already exists" or "Too short"

  // 2. VALIDATION & SUBMISSION LOGIC
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Client-side validation for immediate feedback
    if (!formData.email.includes('@')) {
      return setError('The email is incorrect. Please use a valid email.');
    }
    if (formData.password.length < 6) {
      return setError('Use more than six characters for your password.');
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // This handles "Already exists" sent from your backend
        setError(data.message);
      } else {
        alert("Registration Successful!");
        onBackToLogin();
      }
    } catch (err) {
      setError('Connection to server failed.');
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative">
        <button onClick={onBackToLogin} className="absolute mt-6 ml-6 text-white/80 hover:text-white transition-colors z-20">
          <ArrowLeft size={24} />
        </button>
        
        <div className="bg-blue-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold uppercase tracking-tighter">Create Account</h2>
          <p className="text-blue-100 mt-2 text-sm font-medium">Join the ASTU community</p>
        </div>
        
        <form onSubmit={handleRegister} className="p-10 space-y-5">
          {/* DYNAMIC ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-100" 
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">ASTU Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-100" 
                placeholder="student@astu.edu.et" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="More than 6 characters" 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-100" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 mt-4 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <UserPlus size={20} /> Register
          </button>
          
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">
            Already have an account? <button type="button" onClick={onBackToLogin} className="text-blue-600 hover:underline">Sign In</button>
          </p>
        </form>
      </div>
    </div>
  );
}