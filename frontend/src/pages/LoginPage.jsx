import React, { useState } from 'react';
import { FaArrowLeft, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';

const LoginPage = ({ onLoginSuccess, onNavigateToRegister, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Updated: Changed localhost:5000 to your live Render Node.js API URL
      const res = await axios.post("https://astu-navigator-api.onrender.com/api/auth/login", { 
        email: email.toLowerCase(), 
        password 
      });
      
      // ✅ Tip: Ensure your onLoginSuccess function saves the token/email to localStorage
      onLoginSuccess(res.data);
    } catch (err) {
      // Handling potential different error structures from the backend
      alert(err.response?.data?.message || err.response?.data?.detail || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 relative">
      {/* ⬅️ Back Icon */}
      <div 
        className="absolute top-6 left-6 cursor-pointer p-2 hover:bg-gray-200 rounded-full transition"
        onClick={onBack}
      >
        <FaArrowLeft size={24} color="#3b82f6" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="text-3xl font-bold tracking-tight">ASTU NAV</h1>
          <p className="opacity-80 text-sm mt-1">SECURE PORTAL ACCESS</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
            <input 
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-4 text-gray-400" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              className="w-full pl-10 pr-12 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span 
              className="absolute right-3 top-4 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg disabled:opacity-50"
          >
            {loading ? "AUTHORIZING..." : "AUTHORIZE ACCESS"}
          </button>
        </form>

        <div className="p-6 text-center border-t border-gray-100">
          <p className="text-gray-600">
            Don't have an account? 
            <span 
              onClick={onNavigateToRegister}
              className="ml-2 text-blue-600 font-bold cursor-pointer hover:underline"
            >
              Register Now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;