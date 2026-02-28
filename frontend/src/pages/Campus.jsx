import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Calendar, Users, Trophy, Rocket, AlertCircle, Loader2, Search, X } from 'lucide-react';

const Campus = ({ onNavigate }) => {
  const [view, setView] = useState('menu');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openCategory = async (category) => {
    setLoading(true);
    setError('');
    setSearchTerm('');
    setView(category);
    try {
      // ✅ Updated: Changed localhost:8000 to your live Render Python service URL
      const res = await axios.get(`https://astu-navigator-chat1.onrender.com/api/${category}`);
      setItems(res.data);
    } catch (err) {
      // ✅ Specific error handling for the live environment
      setError(`Connection failed. Please ensure the Python backend at chat1 is active.`);
      setItems([]);
    }
    setLoading(false);
  };

  // ✅ Filtering logic for the search bar
  const filteredItems = items.filter(item => 
    (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- SUB-PAGE VIEW (Events or Clubs List) ---
  if (view !== 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Sticky Header with Search */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-50">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('menu')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-slate-800" />
              </button>
              <h2 className="text-xl font-black text-slate-800 capitalize tracking-tight">{view}</h2>
            </div>
            
            {/* Search Input */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder={`Search ${view}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto w-full space-y-4 pb-32">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-bold italic tracking-wide">Syncing with ASTU Database...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-100 p-8 sm:p-12 rounded-[3rem] flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
              <AlertCircle size={60} className="text-red-500 mb-2" />
              <h3 className="text-red-800 font-black text-2xl tracking-tight">Backend Connection Failed</h3>
              <p className="text-red-600 font-semibold max-w-xs leading-relaxed italic">{error}</p>
              <button 
                onClick={() => setView('menu')} 
                className="mt-4 bg-red-100 text-red-700 px-8 py-3 rounded-2xl font-black hover:bg-red-200 transition-colors"
              >
                Return to Hub
              </button>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-2xl transition-all group">
                <div className="flex-1 pr-4">
                  <h4 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{item.title || item.name}</h4>
                  <p className="text-slate-500 font-medium mt-2 leading-relaxed italic">{item.description}</p>
                </div>
                <button className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all hover:bg-blue-700">
                  Join Now
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-black italic text-lg">No {view} found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MAIN MENU VIEW (Side-by-Side Cards) ---
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-white px-6 py-4 flex items-center border-b border-slate-50 sticky top-0 z-50">
        <button onClick={() => onNavigate('Home')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h2 className="text-lg font-black text-slate-800 tracking-tighter uppercase">Campus Hub</h2>
      </div>

      <div className="p-8 text-center max-w-6xl mx-auto w-full">
        <header className="mt-8 mb-16">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
            ASTU <span className="text-blue-600 italic">Life</span>
          </h1>
          <p className="text-slate-400 mt-3 font-bold italic text-lg">Your gateway to workshops, clubs, and festivals</p>
        </header>

        {/* ✅ Side-by-Side Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Events Card */}
          <button 
            onClick={() => openCategory('events')} 
            className="w-full bg-blue-50/40 p-12 sm:p-16 rounded-[4.5rem] border-2 border-blue-50 flex flex-col items-center group hover:bg-blue-50 transition-all active:scale-95 shadow-2xl shadow-blue-100/40"
          >
            <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center text-blue-600 shadow-xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <Calendar size={56} />
            </div>
            <h3 className="text-4xl font-black text-slate-800 mb-2">Events</h3>
            <p className="text-blue-600 font-black tracking-widest uppercase text-xs italic">Seminars & Festivals</p>
          </button>

          {/* Clubs Card */}
          <button 
            onClick={() => openCategory('clubs')} 
            className="w-full bg-purple-50/40 p-12 sm:p-16 rounded-[4.5rem] border-2 border-purple-50 flex flex-col items-center group hover:bg-purple-50 transition-all active:scale-95 shadow-2xl shadow-purple-100/40"
          >
            <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center text-purple-600 shadow-xl mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <Users size={56} />
            </div>
            <h3 className="text-4xl font-black text-slate-800 mb-2">Clubs</h3>
            <p className="text-purple-600 font-black tracking-widest uppercase text-xs italic">Join Tech & Art Teams</p>
          </button>
        </div>

        {/* Decorative Icons */}
        <div className="mt-24 flex justify-center gap-16 text-slate-100">
           <Trophy size={64} /> 
           <Rocket size={64} />
        </div>
      </div>
    </div>
  );
};

export default Campus;