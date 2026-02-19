import React from 'react';
import { Home, MapPin, Bookmark, User } from 'lucide-react';

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={() => onClick(label)}
    className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${active ? 'text-white scale-105' : 'text-blue-200 hover:text-white'}`}
  >
    <div className={`p-1.5 rounded-lg transition-all ${active ? 'bg-white/20 shadow-inner' : ''}`}>
      {icon}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <div className="fixed bottom-4 left-6 right-6 bg-blue-600 border border-blue-400/30 rounded-[24px] py-2 px-8 flex justify-between items-center shadow-xl z-[5000]">
      <NavItem icon={<Home size={20}/>} label="Home" active={activeTab === 'Home'} onClick={setActiveTab} />
      <NavItem icon={<MapPin size={20}/>} label="Campus" active={activeTab === 'Campus'} onClick={setActiveTab} />
      <NavItem icon={<Bookmark size={20}/>} label="Saved" active={activeTab === 'Saved'} onClick={setActiveTab} />
      {/* Label changed to Profile and icon changed to User */}
      <NavItem icon={<User size={20}/>} label="Profile" active={activeTab === 'Profile'} onClick={setActiveTab} />
    </div>
  );
}