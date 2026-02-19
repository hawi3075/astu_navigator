import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage({ onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      // ✅ Connects to your FastAPI backend
      await axios.post('http://localhost:8000/api/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      alert("Registration successful! Please log in.");
      onNavigateToLogin(); 
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        
        <div className="p-10">
          {/* Back Button */}
          <button 
            onClick={onNavigateToLogin} 
            className="mb-8 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="mb-10">
            <h2 className="text-4xl font-[1000] text-slate-900 uppercase tracking-tighter leading-none mb-3">
              Create <span className="text-blue-600">Account</span>
            </h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
              Join the ASTU intelligent mapping system
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase tracking-tight">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username Input */}
            <div className="relative group">
              <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                required
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Register Now"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Already part of ASTUNav?</p>
            <button 
              onClick={onNavigateToLogin}
              className="text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-800 transition-colors underline underline-offset-8"
            >
              Sign In to Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}