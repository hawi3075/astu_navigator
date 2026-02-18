import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Edit3, MapPin, Clock } from 'lucide-react';

export default function EventList() {
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        const res = await fetch('http://localhost:8000/api/admin/events');
        const data = await res.json();
        setEvents(data);
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Delete this event?")) {
            await fetch(`http://localhost:8000/api/admin/events/${id}`, { method: 'DELETE' });
            fetchEvents(); // Refresh list
        }
    };

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