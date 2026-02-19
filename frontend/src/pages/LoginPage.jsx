import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin, onGoRegister, onGoAdmin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Connect to your FastAPI backend on port 8000
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Save the specific user's name from the database to browser memory
        // This allows the Profile Page to replace "Student" with the real name
        localStorage.setItem("userName", data.user.full_name); 

        // Check the role returned by the backend to decide where to send the user
        if (data.user.role === 'admin') {
          onGoAdmin(); // Redirect to Admin Dashboard
        } else {
          onLogin(); // Redirect to regular Home page (MapPage)
        }
      } else {
        // Display the specific error message from FastAPI (e.g., "Invalid password")
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection to server failed. Is the FastAPI server running?");
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-blue-100 mt-2">Log in to your ASTU account</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@astu.edu.et" 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500/50" 
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500/50" 
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
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
            <LogIn size={20} /> Sign In
          </button>

          {/* Register Link */}
          <p className="text-center text-slate-500 text-sm">
            Don't have an account? <button type="button" onClick={onGoRegister} className="text-blue-600 font-bold hover:underline">Register</button>
          </p>
        </form>
      </div>
    </div>
  );
}