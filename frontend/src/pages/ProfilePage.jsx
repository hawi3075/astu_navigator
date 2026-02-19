import React, { useState, useEffect, useRef } from 'react';

const ProfilePage = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("Student"); // Default fallback
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 🛡️ Get the real name saved during Login or Registration
    const savedName = localStorage.getItem("userName"); 
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Profile Page</h2>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm max-w-md border border-slate-100">
        <div className="flex items-center gap-6">
          {/* Circular Image Upload Section */}
          <div 
            className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-blue-500 cursor-pointer group"
            onClick={() => fileInputRef.current.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">CHANGE</span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
            accept="image/*" 
          />

          <div className="flex flex-col">
            {/* 🏷️ Dynamically displays the logged-in user's name */}
            <h3 className="text-2xl font-bold text-slate-800">{userName}</h3>
            <p className="text-slate-500 text-sm">ASTU Navigator User</p>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Upload New Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;