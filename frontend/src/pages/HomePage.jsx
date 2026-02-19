import React from 'react';
import { Map, Bookmark, User, Bell, LayoutGrid, ChevronRight } from 'lucide-react';

const HomePage = ({ userName = "hawi", onNavigate }) => {
  const menuItems = [
    {
      id: 'map',
      title: "Explore Campus",
      subtitle: "Interactive Map & AI Chat",
      icon: <Map className="text-blue-500" size={24} />,
      // ✅ Now redirects correctly to your Map & Chat page
      action: () => onNavigate('Map') 
    },
    {
      id: 'campus',
      title: "Campus Life",
      subtitle: "Events & Student Clubs",
      icon: <LayoutGrid className="text-purple-500" size={24} />, 
      // ✅ Now redirects correctly to the Events/Clubs Hub
      action: () => onNavigate('Campus')
    },
    {
      id: 'saved',
      title: "Saved Spots",
      subtitle: "Your favorite buildings",
      icon: <Bookmark className="text-emerald-500" size={24} />,
      action: () => onNavigate('Saved')
    },
    {
      id: 'profile',
      title: "Account Profile",
      subtitle: "Manage your settings",
      icon: <User className="text-pink-500" size={24} />,
      action: () => onNavigate('Profile')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="bg-blue-600 pt-12 pb-10 px-8 rounded-b-[2.5rem] shadow-lg z-0">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="animate-in fade-in slide-in-from-top-2">
            <h1 className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Welcome back,</h1>
            <div className="flex items-center gap-2">
              <span className="text-white text-4xl font-black lowercase tracking-tighter">
                {userName}
              </span>
              <span className="text-3xl animate-pulse">👋</span>
            </div>
          </div>
          <button className="bg-white/10 p-3 rounded-2xl backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* --- MENU SECTION --- */}
      <div className="flex-1 px-6 pt-8 z-10">
        <div className="max-w-md mx-auto space-y-4 pb-36">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                item.action();
              }}
              className="w-full bg-white p-6 rounded-[2.2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all active:scale-[0.96]"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-50 rounded-[1.4rem] group-hover:bg-blue-50 transition-all">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-slate-800 text-lg font-black tracking-tight leading-none">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 italic">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <div className="p-2 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                <ChevronRight size={22} strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default HomePage;