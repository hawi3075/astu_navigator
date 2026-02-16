import React from 'react';
import { Calendar, Users, GraduationCap } from 'lucide-react';

const CampusCard = ({ title, desc, icon: Icon }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="bg-blue-600/10 p-3 rounded-2xl w-fit text-blue-600 mb-4"><Icon size={24}/></div>
    <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default function CampusPage() {
  return (
    <div className="app-shell flex h-screen w-screen p-6 pb-32 gap-6 bg-slate-50 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto space-y-8 mt-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ASTU Campus</h1>
          <p className="text-slate-500 font-medium italic">Explore everything happening at Adama Science and Technology University</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CampusCard icon={Calendar} title="Events" desc="Check out upcoming seminars, sports meets, and cultural festivals." />
          <CampusCard icon={Users} title="Student Clubs" desc="Join 20+ active student organizations and enhance your campus life." />
          <CampusCard icon={GraduationCap} title="Academic Blocks" desc="Navigate through the 12 major blocks and specialized laboratories." />
        </div>
      </div>
    </div>
  );
}