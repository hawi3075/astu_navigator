import React, { useState } from 'react';
import { 
    MapPin, PlusCircle, LogOut, Navigation, Building2, Users, 
    LayoutDashboard, Settings, CheckCircle2, List, BarChart3, Calendar, Send
} from 'lucide-react';
import UserManagement from './UserManagement';
import LocationList from './LocationList';
import AdminStats from './AdminStats'; 
import EventList from './EventList'; 

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('Manage'); 
    const [submitted, setSubmitted] = useState(false);
    
    // Form for Locations
    const [formData, setFormData] = useState({
        name: '', lat: '', lng: '' 
    });

    // Form for Events
    const [eventData, setEventData] = useState({
        title: '', date: '', location: '', description: ''
    });

    // 📍 HANDLE LOCATION SUBMISSION
    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare data: Ensure numbers are actually Numbers
        const payload = {
            name: formData.name,
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng)
        };

        try {
            const response = await fetch('http://localhost:5000/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
                setFormData({ name: '', lat: '', lng: '' });
            } else {
                // Check browser console (F12) to see exactly what Mongoose didn't like
                console.error("Backend Validation Error:", result);
                alert(`Error: ${result.error || "Server rejected the data"}`);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Connection error to Backend (Port 5000)");
        }
    };

    // 📅 HANDLE EVENT SUBMISSION
    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });
            if (response.ok) {
                alert("Event Published Successfully!");
                setEventData({ title: '', date: '', location: '', description: '' });
                setActiveTab('EventsList'); 
            } else {
                alert("Failed to publish event.");
            }
        } catch (error) {
            alert("Error publishing event.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-28">
            {/* STICKY TOP NAV */}
            <header className="sticky top-0 z-50 bg-blue-600 p-5 text-white shadow-md flex justify-between items-center backdrop-blur-md bg-blue-600/90">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Building2 size={24} /></div>
                    <h1 className="text-lg font-bold tracking-tight uppercase italic">ASTU Nav Admin</h1>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-sm">
                    <LogOut size={16} /> Logout
                </button>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                
                {/* 1. MANAGE LOCATIONS TAB */}
                {activeTab === 'Manage' && (
                    <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <PlusCircle className="text-blue-400" size={20} />
                                <h2 className="text-md font-bold uppercase tracking-wider">Add Campus Point</h2>
                            </div>
                            {submitted && <span className="text-xs text-green-400 font-black flex items-center gap-1"><CheckCircle2 size={14}/> UPDATED</span>}
                        </div>

                        <form onSubmit={handleLocationSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Building/Place Name</label>
                                <input type="text" placeholder="e.g. Library Wing A" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Latitude</label>
                                    <input type="number" step="any" placeholder="8.54..." value={formData.lat} onChange={(e)=>setFormData({...formData, lat:e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Longitude</label>
                                    <input type="number" step="any" placeholder="39.29..." value={formData.lng} onChange={(e)=>setFormData({...formData, lng:e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" required />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <MapPin size={20} /> Update Map
                            </button>
                        </form>
                    </div>
                )}

                {/* 2. EVENTS TAB */}
                {activeTab === 'EventsList' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase flex items-center gap-2">
                                <Calendar className="text-blue-600" /> Create Campus Event
                            </h2>
                            <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Event Title" value={eventData.title} onChange={(e)=>setEventData({...eventData, title:e.target.value})} className="bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" required />
                                <input type="date" value={eventData.date} onChange={(e)=>setEventData({...eventData, date:e.target.value})} className="bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" required />
                                <input type="text" placeholder="Location (e.g. Stadium)" value={eventData.location} onChange={(e)=>setEventData({...eventData, location:e.target.value})} className="bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 md:col-span-2" required />
                                <textarea placeholder="Event Description..." value={eventData.description} onChange={(e)=>setEventData({...eventData, description:e.target.value})} className="bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 md:col-span-2 h-24" />
                                <button type="submit" className="bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest md:col-span-2 flex items-center justify-center gap-2 hover:bg-black transition-all">
                                    <Send size={18}/> Publish Event
                                </button>
                            </form>
                        </div>
                        <EventList />
                    </div>
                )}

                {activeTab === 'Users' && <UserManagement />}
                {activeTab === 'List' && <LocationList />}
                {activeTab === 'Stats' && <AdminStats />}
            </main>

            {/* FLOATING BOTTOM NAV */}
            <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[30px] p-2 flex justify-around items-center z-50">
                {[
                    { id: 'Manage', icon: LayoutDashboard, label: 'Manage' },
                    { id: 'List', icon: List, label: 'Points' },
                    { id: 'EventsList', icon: Calendar, label: 'Events' },
                    { id: 'Stats', icon: BarChart3, label: 'Stats' },
                    { id: 'Users', icon: Users, label: 'Users' }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all min-w-[64px] ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        <tab.icon size={20} />
                        <span className="text-[10px] font-bold uppercase">{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default AdminDashboard;