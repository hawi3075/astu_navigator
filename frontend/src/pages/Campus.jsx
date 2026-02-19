import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Calendar, Users, Trophy, Rocket, AlertCircle, Loader2 } from 'lucide-react';

const Campus = ({ onNavigate }) => {
  const [view, setView] = useState('menu');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Connects to FastAPI backend and handles 404 errors
  const openCategory = async (category) => {
    setLoading(true);
    setError('');
    setView(category);
    try {
      // ⚠️ Ensure your FastAPI has @app.get("/api/events") and @app.get("/api/clubs")
      const res = await axios.get(`http://localhost:8000/api/${category}`);
      setItems(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      // ✅ Corrects the 404 error seen in your screenshot
      if (err.response?.status === 404) {
        setError(`Error 404: The endpoint '/api/${category}' was not found on your server.`);
      } else {
        setError("Connection failed. Is the FastAPI server running at localhost:8000?");
      }
      setItems([]);
    }
    setLoading(false);
  };

  // --- SUB-PAGE VIEW (Events or Clubs List) ---
  if (view !== 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Sticky Header */}
        <div className="bg-white px-6 py-4 flex items-center border-b border-slate-200 sticky top-0 z-50">
          <button 
            onClick={() => setView('menu')} 
            className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-800" />
          </button>
          <h2 className="text-lg font-black text-slate-800 capitalize">
            {view === 'events' ? "Upcoming Events" : "Student Clubs"}
          </h2>
        </div>

        <div className="p-6 max-w-2xl mx-auto w-full space-y-4 pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-medium">Fetching {view}...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 p-6 rounded-[2.5rem] flex flex-col items-center text-center gap-3">
              <AlertCircle size={40} className="text-red-500" />
              <p className="text-red-700 font-bold">{error}</p>
              <button 
                onClick={() => setView('menu')}
                className="mt-2 text-red-600 underline font-bold"
              >
                Go back and try again
              </button>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div key={item._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                <div className="flex-1 pr-4">
                  <h4 className="text-xl font-black text-slate-800">{item.title || item.name}</h4>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed italic">{item.description}</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                  Join
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 font-medium italic">No {view} found at the moment.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MAIN MENU VIEW (Side-by-Side Cards) ---
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Header */}
      <div className="bg-white px-6 py-4 flex items-center border-b border-slate-50 sticky top-0 z-50">
        <button 
          onClick={() => onNavigate('Home')} 
          className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h2 className="text-lg font-black text-slate-800 tracking-tight">Campus Hub</h2>
      </div>

      <div className="p-8 text-center max-w-5xl mx-auto w-full">
        <header className="mt-8 mb-12">
          <h1 className="text-5xl font-black text-slate-900 leading-tight">
            ASTU <span className="text-blue-600 italic">Life</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium italic">Explore everything happening on campus</p>
        </header>

        {/* ✅ Side-by-Side Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Events Card */}
          <button 
            onClick={() => openCategory('events')}
            className="w-full bg-blue-50/50 p-10 rounded-[3.5rem] border border-blue-100 flex flex-col items-center group hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-blue-100/20"
          >
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-md mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Calendar size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Campus Events</h3>
            <p className="text-blue-600/70 text-sm font-bold mt-2 italic tracking-wide">Workshops & Festivals</p>
          </button>

          {/* Clubs Card */}
          <button 
            onClick={() => openCategory('clubs')}
            className="w-full bg-purple-50/50 p-10 rounded-[3.5rem] border border-purple-100 flex flex-col items-center group hover:bg-purple-50 transition-all active:scale-95 shadow-xl shadow-purple-100/20"
          >
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-purple-600 shadow-md mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <Users size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Student Clubs</h3>
            <p className="text-purple-600/70 text-sm font-bold mt-2 italic tracking-wide">Join Tech & Art Teams</p>
          </button>
        </div>

        {/* Decorative Icons */}
        <div className="mt-20 flex justify-center gap-12 text-slate-200">
           <Trophy size={40} className="opacity-40" />
           <Rocket size={40} className="opacity-40" />
        </div>
      </div>
    </div>
  );
};

export default Campus;