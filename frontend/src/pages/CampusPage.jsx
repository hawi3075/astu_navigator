import React from 'react';
import axios from 'axios';
import { Calendar, Users, GraduationCap, BookmarkPlus } from 'lucide-react';

const CampusCard = ({ title, desc, icon: Icon, onSave }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start">
      <div className="bg-blue-600/10 p-3 rounded-2xl w-fit text-blue-600 mb-4"><Icon size={24}/></div>
      {/* Save Button */}
      <button 
        onClick={() => onSave(title)}
        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        title="Save to Bookmarks"
      >
        <BookmarkPlus size={20} />
      </button>
    </div>
    <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default function CampusPage() {
  
  // ✅ THE SAVE LOGIC
  const handleSaveLocation = async (locationName) => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");

    // 1. Check if user is logged in
    if (!token || !email) {
      alert("Please login to save.");
      return;
    }

    try {
      // 2. Send request to the backend route we fixed earlier
      const response = await axios.post('http://localhost:5000/api/save-location', {
        email: email,
        location: {
          name: locationName,
          category: "Campus Building", // Default category
          coordinates: [0, 0] // Placeholder or real coordinates
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        alert(`📍 ${locationName} added to your Bookmarks!`);
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert(err.response?.data?.error || "Failed to save location.");
    }
  };

  return (
    <div className="app-shell flex h-screen w-screen p-6 pb-32 gap-6 bg-slate-50 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto space-y-8 mt-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ASTU Campus</h1>
          <p className="text-slate-500 font-medium italic">Explore everything happening at Adama Science and Technology University</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CampusCard 
            icon={Calendar} 
            title="Events" 
            desc="Check out upcoming seminars, sports meets, and cultural festivals." 
            onSave={handleSaveLocation}
          />
          <CampusCard 
            icon={Users} 
            title="Student Clubs" 
            desc="Join 20+ active student organizations and enhance your campus life." 
            onSave={handleSaveLocation}
          />
          <CampusCard 
            icon={GraduationCap} 
            title="Academic Blocks" 
            desc="Navigate through the 12 major blocks and specialized laboratories." 
            onSave={handleSaveLocation}
          />
        </div>
      </div>
    </div>
  );
}