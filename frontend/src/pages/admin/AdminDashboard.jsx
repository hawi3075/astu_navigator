import React, { useState } from 'react';
import { 
    MapPin, LogOut, Building2, Users, 
    LayoutDashboard, List, BarChart3, Calendar, Send, CheckCircle2
} from 'lucide-react';
import UserManagement from './UserManagement';
import LocationList from './LocationList';
import AdminStats from './AdminStats'; 
import EventList from './EventList'; 

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('Manage'); 
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', lat: '', lng: '' });

    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }),
            });
            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
                setFormData({ name: '', lat: '', lng: '' });
            }
        } catch (error) { console.error("Error saving location:", error); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            
            {/* STICKY HEADER */}
            <header className="bg-blue-600 p-5 text-white shadow-lg flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Building2 size={24} strokeWidth={2.5} />
                    <h1 className="text-xl font-black uppercase italic tracking-tighter">ASTU NAV ADMIN</h1>
                </div>
                <button 
                    onClick={onLogout} 
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md"
                >
                    <LogOut size={16} /> LOGOUT
                </button>
            </header>

            {/* MAIN SCROLLABLE CONTENT */}
            {/* pb-40 ensures the content isn't hidden by the long blue nav */}
            <main className="flex-1 w-full max-w-5xl mx-auto p-6 pb-40">
                
                {activeTab === 'Manage' && (
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-800 uppercase italic">Add Campus Point</h2>
                            {submitted && (
                                <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-xs font-black flex items-center gap-1 animate-bounce">
                                    <CheckCircle2 size={14}/> SAVED
                                </span>
                            )}
                        </div>
                        <form onSubmit={handleLocationSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Building Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Block 504" 
                                    value={formData.name} 
                                    onChange={(e)=>setFormData({...formData, name:e.target.value})} 
                                    className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Latitude</label>
                                    <input 
                                        type="number" 
                                        step="any" 
                                        placeholder="8.54..." 
                                        value={formData.lat} 
                                        onChange={(e)=>setFormData({...formData, lat:e.target.value})} 
                                        className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold" 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Longitude</label>
                                    <input 
                                        type="number" 
                                        step="any" 
                                        placeholder="39.29..." 
                                        value={formData.lng} 
                                        onChange={(e)=>setFormData({...formData, lng:e.target.value})} 
                                        className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold" 
                                        required 
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95">
                                Update Map
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'List' && (
                    <div className="animate-in fade-in duration-500">
                        <LocationList />
                    </div>
                )}

                {activeTab === 'EventsList' && (
                    <div className="animate-in fade-in duration-500">
                        <EventList />
                    </div>
                )}

                {activeTab === 'Stats' && <AdminStats />}
                {activeTab === 'Users' && <UserManagement />}
            </main>

            {/* ✅ LONG BLUE NAVBAR (Solid Bottom) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.2)] z-50 border-t border-blue-400">
                <div className="flex justify-around items-center h-20 max-w-5xl mx-auto">
                    {[
                        { id: 'Manage', icon: LayoutDashboard, label: 'Add' },
                        { id: 'List', icon: List, label: 'Points' },
                        { id: 'EventsList', icon: Calendar, label: 'Events' },
                        { id: 'Stats', icon: BarChart3, label: 'Stats' },
                        { id: 'Users', icon: Users, label: 'Users' }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)} 
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${activeTab === tab.id ? 'bg-white/20 border-b-4 border-white' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
                        >
                            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
                            <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default AdminDashboard;