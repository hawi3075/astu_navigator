import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';

export default function SavedPage() {
  const savedItems = ["Female Library", "Registrar Office", "Admin Building"];
  return (
    <div className="app-shell h-screen p-10 bg-slate-50">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Your Saved Locations</h2>
      <div className="space-y-4">
        {savedItems.map(item => (
          <div key={item} className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2 rounded-xl text-white"><MapPin size={20}/></div>
              <span className="font-bold text-slate-700">{item}</span>
            </div>
            <button className="text-slate-300 hover:text-red-500"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}