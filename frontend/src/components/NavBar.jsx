import React from 'react';
import { Home, MapPin, Bookmark, Settings } from 'lucide-react';

const NavItem = ({ icon, label, active = false }) => (
  <button className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-400 scale-110' : 'text-slate-400 hover:text-white'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default function Navbar() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 py-4 px-8 rounded-3xl flex justify-between items-center shadow-2xl z-[5000]">
      <NavItem icon={<Home size={22}/>} label="Home" active />
      <NavItem icon={<MapPin size={22}/>} label="Campus" />
      <NavItem icon={<Bookmark size={22}/>} label="Saved" />
      <NavItem icon={<Settings size={22}/>} label="Settings" />
    </div>
  );
}