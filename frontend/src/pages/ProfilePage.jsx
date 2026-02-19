import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, LogOut, Camera, User, Mail, Shield } from 'lucide-react';

// ✅ Added onNavigate and onLogout props
const ProfilePage = ({ onNavigate, onLogout }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("Student");
  const [userEmail, setUserEmail] = useState("user@astu.edu.et");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 🛡️ Get the real name and email saved during Login
    const savedName = localStorage.getItem("userName"); 
    const savedEmail = localStorage.getItem("userEmail");
    if (savedName) setUserName(savedName);
    if (savedEmail) setUserEmail(savedEmail);
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 🚀 Sticky Back Header */}
      <div className="bg-white px-6 py-4 flex items-center border-b border-slate-200 sticky top-0 z-50">
        <button 
          onClick={() => onNavigate('Home')} 
          className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h2 className="text-lg font-bold text-slate-800">Account Settings</h2>
      </div>

      <div className="p-6 max-w-md mx-auto w-full space-y-6 mt-4">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10" />
          
          <div className="relative mt-4">
            {/* Avatar Upload */}
            <div 
              className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg cursor-pointer group"
              onClick={() => fileInputRef.current.click()}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-slate-50">👤</div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />

            <h3 className="text-2xl font-black text-slate-800 mt-6 capitalize">{userName}</h3>
            <p className="text-blue-600 font-semibold text-sm">ASTU Navigator Explorer</p>
          </div>
        </div>

        {/* Info List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Mail size={20}/></div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email Address</p>
              <p className="text-slate-700 font-medium">{userEmail}</p>
            </div>
          </div>
          <div className="p-5 flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-2xl text-purple-600"><Shield size={20}/></div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">User Role</p>
              <p className="text-slate-700 font-medium text-capitalize">Student</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 p-5 rounded-[2rem] font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-100"
        >
          <LogOut size={20} />
          Log Out of Account
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;