import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 1. Safely extract the user data from the response
        const user = data.user || data;
        
        // ✅ 2. Store the REAL role from the database, not a hardcoded "admin"
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.name || "User");
        localStorage.setItem("userRole", user.role); // 'admin' or 'user' from DB
        localStorage.setItem("token", data.token);

        // ✅ 3. Trigger the success callback (your App.js will handle the redirect)
        onLoginSuccess(data); 
      } else {
        setError(data.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      setError("Cannot reach server. Ensure the Node.js terminal is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-10 text-center text-white">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">ASTU NAV</h2>
          <p className="text-blue-100 mt-2 font-bold text-[10px] uppercase tracking-widest opacity-80">
            Secure Portal Access
          </p>
        </div>
        
        <form onSubmit={handleLoginSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold border border-red-100 animate-pulse">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-300" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@astu.edu.et" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" 
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Authorize Access"}
          </button>
        </form>
      </div>
    </div>
  );
}