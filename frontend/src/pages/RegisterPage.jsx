import React, { useState } from 'react';
import { FaArrowLeft, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';

const RegisterPage = ({ onNavigateToLogin, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // 📧 Strict Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return alert("Please enter a valid email address (e.g., name@astu.edu.et)");
    }

    setLoading(true);
    try {
      // Points to your Node.js auth route
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      alert(res.data.message || "Registration Successful!");
      onNavigateToLogin(); // Move user to login screen on success
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed. Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 relative">
      {/* ⬅️ Back Icon to Landing */}
      <div 
        className="absolute top-6 left-6 cursor-pointer p-2 hover:bg-gray-200 rounded-full transition"
        onClick={onBack}
      >
        <FaArrowLeft size={24} color="#3b82f6" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="inline-block p-3 bg-white/20 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CREATE ACCOUNT</h1>
          <p className="opacity-80 text-sm mt-1">JOIN THE ASTU SPATIAL NETWORK</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-5">
          {/* Full Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* Email Address */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
            <input 
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
              required
            />
          </div>

          {/* Password with Eye Icon */}
          <div className="relative">
            <FaLock className="absolute left-3 top-4 text-gray-400" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
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
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
          >
            {loading ? "CREATING ACCOUNT..." : "REGISTER NOW →"}
          </button>
        </form>

        <div className="p-6 text-center border-t border-gray-100">
          <p className="text-gray-600">
            ALREADY HAVE AN ACCOUNT? 
            <span 
              onClick={onNavigateToLogin}
              className="ml-2 text-blue-600 font-bold cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;