import React, { useState, useEffect } from 'react';
import { Send, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Load events from the backend
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      
      {/* --- TOP: CREATE EVENT FORM (Clean, No Icons) --- */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 mb-6">
          Create Campus Event
        </h2>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Event Title" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
            <input 
              type="date" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-400"
            />
          </div>
          
          <input 
            type="text" 
            placeholder="Location (e.g., Block 508)" 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />

          <textarea 
            placeholder="Description..." 
            rows="3"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-medium"
          ></textarea>

          <button 
            type="button"
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all"
          >
            <Send size={18} /> Publish Event
          </button>
        </form>
      </div>

      {/* --- BOTTOM: LIST OF CREATED ITEMS --- */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 min-h-[200px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Published Events List
          </h3>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
            {events.length} Total
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-300">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">Updating List...</p>
          </div>
        ) : events.length > 0 ? (
          /* DISPLAY LIST IF NOT EMPTY */
          <div className="grid gap-3">
            {events.map((event) => (
              <div key={event._id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 leading-none">{event.title}</h4>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tight text-slate-400">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-500"/> {event.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* DISPLAY THIS IF LIST IS EMPTY */
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-50 rounded-[24px]">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Calendar size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No events published yet</p>
            <p className="text-slate-300 text-[10px] mt-1">New events you create will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}