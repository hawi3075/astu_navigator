import React from 'react';
import { Map, Bookmark, User, Bell, ChevronRight, GraduationCap } from 'lucide-react';

const HomePage = ({ onNavigate }) => {
  const userName = localStorage.getItem("userName") || "hawi";

  const menuItems = [
    { id: 'Campus', title: 'Explore Campus', desc: 'Interactive Map & AI Chat', icon: <Map className="text-blue-600" />, color: 'bg-blue-50' },
    { id: 'Events', title: 'Campus Life', desc: 'Events & Student Clubs', icon: <GraduationCap className="text-purple-600" />, color: 'bg-purple-50' },
    { id: 'Saved', title: 'Saved Spots', desc: 'Your favorite buildings', icon: <Bookmark className="text-emerald-600" />, color: 'bg-emerald-50' },
    { id: 'Profile', title: 'Account Profile', desc: 'Manage your settings', icon: <User className="text-pink-600" />, color: 'bg-pink-50' },
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Blue Header */}
      <div className="bg-blue-600 p-10 rounded-b-[3.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl font-medium opacity-90">Welcome back,</h1>
          <p className="text-4xl font-black mt-1">
            {userName} <span className="inline-block animate-bounce">👋</span>
          </p>
        </div>
        {/* Decorative Circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Cards */}
      <div className="px-6 -mt-10 space-y-4 relative z-20">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
               if (typeof onNavigate === 'function') {
                 onNavigate(item.id);
               }
            }}
            className="w-full bg-white p-6 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-50 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className={`${item.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">{item.desc}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ChevronRight size={20} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;