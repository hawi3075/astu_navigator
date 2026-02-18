import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage({ onBackToLogin }) {
  // 1. INPUT STATES
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 

  // 2. VALIDATION & SUBMISSION LOGIC
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true); 

    // Client-side validation
    if (!formData.email.includes('@')) {
      setLoading(false);
      return setError('Please use a valid ASTU email address.');
    }
    if (formData.password.length < 6) {
      setLoading(false);
      return setError('Password must be at least 6 characters long.');
    }

    try {
      // UPDATED TO PORT 8000: Now targeting your FastAPI backend
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // FastAPI returns errors in a 'detail' field by default
        setError(data.detail || data.message || 'Registration failed');
      } else {
        alert("Registration Successful! Welcome to ASTU Navigator.");
        onBackToLogin(); 
      }
    } catch (err) {
      setError('Cannot connect to Python server. Make sure main.py is running on port 8000.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Back Button */}
        <button 
          onClick={onBackToLogin} 
          className="absolute mt-8 ml-8 text-white/90 hover:text-white transition-all z-20 hover:scale-110"
        >
          <ArrowLeft size={24} />
        </button>
        
        {/* Header Section */}
        <div className="bg-blue-600 p-12 text-center text-white">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">Create Account</h2>
          <p className="text-blue-100 mt-2 text-sm font-medium opacity-90">Join the ASTU community</p>
        </div>
        
        <form onSubmit={handleRegister} className="p-10 space-y-6">
          {/* Error Message Box */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100 animate-pulse">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 ml-2 tracking-wider">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                disabled={loading}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 outline-none focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" 
                placeholder="e.g. Hawi"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 ml-2 tracking-wider">ASTU Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                disabled={loading}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 outline-none focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" 
                placeholder="hawi@astu.edu.et" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 ml-2 tracking-wider">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                disabled={loading}
                placeholder="Min. 6 characters" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 pr-12 outline-none focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 mt-6 transition-all transform ${
              loading 
                ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Setting up your account...
              </>
            ) : (
              <>
                <UserPlus size={22} /> Create Account
              </>
            )}
          </button>
          
          <div className="pt-4 border-t border-slate-100">
            <p className="text-center text-slate-500 text-xs font-semibold uppercase tracking-widest">
              Already have an account? <button type="button" onClick={onBackToLogin} className="text-blue-600 hover:underline decoration-2 underline-offset-4">Sign In</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}