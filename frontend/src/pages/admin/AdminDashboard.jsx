import React, { useState } from 'react';
import { 
    MapPin, PlusCircle, LogOut, Navigation, Building2, Users, 
    LayoutDashboard, Settings, CheckCircle2, List, BarChart3, Calendar 
} from 'lucide-react';
import UserManagement from './UserManagement';
import LocationList from './LocationList';
import AdminStats from './AdminStats'; 
import EventList from './EventList'; // ✅ Integrated the new list component

const AdminDashboard = ({ onLogout }) => {
    // Added 'EventsList' to the possible active tabs
    const [activeTab, setActiveTab] = useState('Manage'); 
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '', latitude: '', longitude: '', category: 'Academic Block', description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
                setFormData({ name: '', latitude: '', longitude: '', category: 'Academic Block', description: '' });
            }
        } catch (error) {
            alert("Connection error to Backend");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-28">
            {/* STICKY TOP NAV */}
            <header className="sticky top-0 z-50 bg-blue-600 p-5 text-white shadow-md flex justify-between items-center backdrop-blur-md bg-blue-600/90">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Building2 size={24} /></div>
                    <h1 className="text-lg font-bold tracking-tight">ASTU Admin</h1>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-sm">
                    <LogOut size={16} /> Logout
                </button>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                {activeTab === 'Manage' ? (
                    <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <PlusCircle className="text-blue-400" size={20} />
                                <h2 className="text-md font-semibold">Add Campus Location</h2>
                            </div>
                            {submitted && <span className="text-xs text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={14}/> SAVED</span>}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Building Name</label>
                                <input type="text" placeholder="e.g. Block 504" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" step="any" placeholder="Lat (e.g. 8.54)" value={formData.latitude} onChange={(e)=>setFormData({...formData, latitude:e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" required />
                                <input type="number" step="any" placeholder="Long (e.g. 39.29)" value={formData.longitude} onChange={(e)=>setFormData({...formData, longitude:e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" required />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <MapPin size={20} /> Update Map
                            </button>
                        </form>
                    </div>
                ) : activeTab === 'Users' ? (
                    <UserManagement />
                ) : activeTab === 'List' ? (
                    <LocationList />
                ) : activeTab === 'EventsList' ? ( // ✅ Added condition for Event Management
                    <EventList />
                ) : (
                    <AdminStats /> 
                )}
            </main>

            {/* FLOATING BOTTOM NAV */}
            <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[30px] p-2 flex justify-around items-center z-50 overflow-x-auto">
                <button onClick={() => setActiveTab('Manage')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all min-w-[64px] ${activeTab === 'Manage' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-bold">Manage</span>
                </button>
                <button onClick={() => setActiveTab('List')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all min-w-[64px] ${activeTab === 'List' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <List size={20} />
                    <span className="text-[10px] font-bold">Points</span>
                </button>
                <button onClick={() => setActiveTab('EventsList')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all min-w-[64px] ${activeTab === 'EventsList' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <Calendar size={20} />
                    <span className="text-[10px] font-bold">Events</span>
                </button>
                <button onClick={() => setActiveTab('Stats')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all min-w-[64px] ${activeTab === 'Stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <BarChart3 size={20} />
                    <span className="text-[10px] font-bold">Stats</span>
                </button>
                <button onClick={() => setActiveTab('Users')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all min-w-[64px] ${activeTab === 'Users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <Users size={20} />
                    <span className="text-[10px] font-bold">Users</span>
                </button>
            </nav>
        </div>
    );
};

export default AdminDashboard;