import React from 'react';
import { Home, Map as MapIcon, LayoutGrid, Bookmark, User } from 'lucide-react';

const NavItem = ({ icon, label, id, active, onClick }) => (
  <button 
    onClick={() => onClick(id)} // ✅ Uses ID for logic, Label for display
    className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
      active ? 'text-white scale-110' : 'text-blue-200 hover:text-white'
    }`}
  >
    <div className={`p-2 rounded-xl transition-all duration-300 ${
      active ? 'bg-white/20 shadow-lg ring-1 ring-white/30' : 'bg-transparent'
    }`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.15em] mt-0.5 ${
      active ? 'opacity-100' : 'opacity-60'
    }`}>
      {label}
    </span>
  </button>
);

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <div className="fixed bottom-6 left-6 right-6 bg-blue-600/90 backdrop-blur-xl border border-white/20 rounded-[2rem] py-3 px-6 flex justify-between items-center shadow-[0_20px_50px_rgba(37,99,235,0.3)] z-[5000]">
      
      <NavItem 
        id="Home"
        label="Home" 
        icon={<Home size={22} strokeWidth={activeTab === 'Home' ? 2.5 : 2} />} 
        active={activeTab === 'Home'} 
        onClick={setActiveTab} 
      />

      {/* ✅ ADDED: Dedicated Map Icon for redirection to Map Page */}
      <NavItem 
        id="Map"
        label="Explore" 
        icon={<MapIcon size={22} strokeWidth={activeTab === 'Map' ? 2.5 : 2} />} 
        active={activeTab === 'Map'} 
        onClick={setActiveTab} 
      />

      {/* ✅ FIXED: Correct label to trigger the Campus Hub */}
      <NavItem 
        id="Campus"
        label="Campus" 
        icon={<LayoutGrid size={22} strokeWidth={activeTab === 'Campus' ? 2.5 : 2} />} 
        active={activeTab === 'Campus'} 
        onClick={setActiveTab} 
      />

      <NavItem 
        id="Saved"
        label="Saved" 
        icon={<Bookmark size={22} strokeWidth={activeTab === 'Saved' ? 2.5 : 2} />} 
        active={activeTab === 'Saved'} 
        onClick={setActiveTab} 
      />

      <NavItem 
        id="Profile"
        label="Profile" 
        icon={<User size={22} strokeWidth={activeTab === 'Profile' ? 2.5 : 2} />} 
        active={activeTab === 'Profile'} 
        onClick={setActiveTab} 
      />
      
    </div>
  );
}