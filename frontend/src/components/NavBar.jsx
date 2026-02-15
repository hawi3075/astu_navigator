import React from 'react';
import { Home, MapPin, Bookmark, Settings } from 'lucide-react';

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${active ? 'text-blue-500 scale-110' : 'text-slate-400 hover:text-slate-200'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </div>
);

const NavBar = () => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xl border border-white/10 h-20 w-[90%] max-w-[500px] rounded-3xl flex justify-around items-center z-[5000] px-6 shadow-2xl">
      <NavItem icon={<Home size={24}/>} label="Home" active />
      <NavItem icon={<MapPin size={24}/>} label="Campus" />
      <NavItem icon={<Bookmark size={24}/>} label="Saved" />
      <NavItem icon={<Settings size={24}/>} label="Settings" />
    </nav>
  );
};

export default NavBar;