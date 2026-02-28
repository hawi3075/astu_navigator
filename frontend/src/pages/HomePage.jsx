import React from 'react';
import { Map, Bookmark, User, Bell, LayoutGrid, ChevronRight } from 'lucide-react';

const HomePage = ({ onNavigate, user }) => {
  // ✅ Prioritizes user prop, then localStorage name, then fallback
  const displayName = user?.full_name || localStorage.getItem("userName") || "Student";

  const menuItems = [
    {
      id: 'map',
      title: "Explore Campus",
      subtitle: "Interactive Map & AI Chat",
      icon: <Map className="text-blue-500" size={24} />,
      action: () => onNavigate('Map') 
    },
    {
      id: 'campus',
      title: "Campus Life",
      subtitle: "Events & Student Clubs",
      icon: <LayoutGrid className="text-purple-500" size={24} />, 
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
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      
      {/* --- HEADER --- */}
      <div className="bg-blue-600 pt-12 pb-10 px-8 rounded-b-[3rem] shadow-xl z-0">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
              Welcome back,
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-white text-4xl font-[1000] lowercase tracking-tighter">
                {displayName}
              </span>
              <span className="text-3xl animate-bounce">👋</span>
            </div>
          </div>
          
          <button className="bg-white/10 p-3 rounded-2xl backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20 active:scale-90">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* --- MENU SECTION --- */}
      <div className="flex-1 px-6 pt-10 z-10 -mt-4">
        <div className="max-w-md mx-auto space-y-5 pb-36">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                item.action();
              }}
              style={{ animationDelay: `${index * 100}ms` }}
              className="w-full bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center justify-between group hover:border-blue-400 hover:shadow-blue-200/20 transition-all active:scale-[0.96] animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-50 rounded-3xl group-hover:bg-blue-50 transition-all duration-300">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-slate-900 text-lg font-black tracking-tight leading-none">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-2 opacity-70 group-hover:text-blue-500 transition-colors">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:translate-x-1 transition-all">
                <ChevronRight size={22} strokeWidth={4} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 -right-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50 -z-10"></div>
    </div>
  );
};

export default HomePage;