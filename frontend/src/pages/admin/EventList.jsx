import React, { useState, useEffect } from 'react';
import { Send, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📝 1. Added State for the Form
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });

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

  // 🚀 2. FIXED PUBLISH LOGIC
  const handlePublish = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.title || !formData.date || !formData.location || !formData.description) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("✅ Event Published Successfully!");
        setFormData({ title: '', date: '', location: '', description: '' }); // Clear form
        fetchEvents(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to publish'}`);
      }
    } catch (error) {
      console.error("Publish request failed:", error);
      alert("Server is not responding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEvents(events.filter(event => event._id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      
      {/* --- TOP: CREATE EVENT FORM --- */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 mb-6">
          Create Campus Event
        </h2>

        {/* ✅ FIXED: Added onSubmit handler */}
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Event Title" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              required
            />
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-400"
              required
            />
          </div>
          
          <input 
            type="text" 
            placeholder="Location (e.g., Block 508)" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            required
          />

          <textarea 
            placeholder="Description..." 
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-medium"
            required
          ></textarea>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            {isSubmitting ? "Publishing..." : "Publish Event"}
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
          <div className="grid gap-3">
            {events.map((event) => (
              <div key={event._id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 leading-none">{event.title}</h4>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tight text-slate-400">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-500"/> {event.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {event.date}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(event._id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-50 rounded-[24px]">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No events published yet</p>
          </div>
        )}
      </div>
    </div>
  );
}