import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 1. Save data for persistence
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role); 
        localStorage.setItem("userName", data.user.full_name);

        // ✅ 2. Pass the user object back to App.jsx
        // App.jsx will handle the redirect to Home or Admin based on data.user.role
        onLoginSuccess(data.user); 
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection to server failed. Is the FastAPI server running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-600 p-10 text-center text-white">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Welcome Back</h2>
          <p className="text-blue-100 mt-2 font-bold text-xs uppercase tracking-widest opacity-80">Log in to your ASTUNav account</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-tight border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-300" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@astu.edu.et" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" 
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" 
                required
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

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={20} /> Sign In</>}
          </button>

          {/* Register Link */}
          <div className="pt-4 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">New to the platform?</p>
            <button 
              type="button" 
              onClick={onNavigateToRegister} 
              className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}