import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Edit3, MapPin, Clock, AlertCircle } from 'lucide-react';

export default function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            // ✅ FIX: Change port from 8000 to 5000 (Node.js Auth/DB Server)
            const res = await fetch('http://localhost:5000/api/admin/events');
            
            if (!res.ok) throw new Error("Could not fetch events from server.");
            
            const data = await res.json();
            
            // ✅ FIX: Ensure data is an array before setting state
            setEvents(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Failed to load events. Check if Node.js server is running on port 5000.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchEvents(); 
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Delete this event?")) {
            try {
                // ✅ FIX: Match the port to 5000
                await fetch(`http://localhost:5000/api/admin/events/${id}`, { 
                    method: 'DELETE' 
                });
                fetchEvents(); // Refresh list
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Events...</div>;

    if (error) return (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex items-center gap-3 font-bold text-sm">
            <AlertCircle /> {error}
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Active Campus Events</h2>
            
            {events.length === 0 ? (
                <div className="bg-white p-12 rounded-[32px] text-center border-2 border-dashed border-slate-200">
                    <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">No events scheduled yet.</p>
                </div>
            ) : (
                events.map((event) => (
                    <div key={event._id} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-5">
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
                                <div className="flex gap-4 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                        <Clock size={14} /> {event.date}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                        <MapPin size={14} /> {event.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button className="p-3 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
                                <Edit3 size={20} />
                            </button>
                            <button 
                                onClick={() => handleDelete(event._id)}
                                className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}