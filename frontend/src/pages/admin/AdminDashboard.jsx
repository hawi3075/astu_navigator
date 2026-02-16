import React, { useState } from 'react';
import { MapPin, PlusCircle, LogOut, Navigation, Building2, Users, LayoutDashboard, Settings } from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('Add'); // Manage internal admin tabs
    const [formData, setFormData] = useState({
        name: '', latitude: '', longitude: '', category: 'Academic Block', description: ''
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
            {/* 1. STICKY TOP NAV */}
            <header className="sticky top-0 z-50 bg-blue-600 p-5 text-white shadow-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Building2 size={24} />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">ASTU Admin</h1>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-sm"
                >
                    <LogOut size={16} /> Logout
                </button>
            </header>

            {/* 2. DYNAMIC CONTENT AREA */}
            <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
                {activeTab === 'Add' && (
                    <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
                        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
                            <PlusCircle className="text-blue-400" size={20} />
                            <h2 className="text-md font-semibold">New Campus Location</h2>
                        </div>

                        <form className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Building Name</label>
                                <input type="text" placeholder="e.g. Block 504" className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Latitude</label>
                                    <input type="number" placeholder="8.54..." className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Longitude</label>
                                    <input type="number" placeholder="39.29..." className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                                <MapPin size={20} /> Save to Map
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'Users' && (
                    <div className="text-center py-20 text-slate-400">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium">User Management coming soon...</p>
                    </div>
                )}
            </main>

            {/* 3. FIXED BOTTOM NAVIGATION */}
            <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[30px] p-2 flex justify-around items-center z-50">
                <button 
                    onClick={() => setActiveTab('Add')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all w-20 ${activeTab === 'Add' ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-bold">Manage</span>
                </button>

                <button 
                    onClick={() => setActiveTab('Users')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all w-20 ${activeTab === 'Users' ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                    <Users size={20} />
                    <span className="text-[10px] font-bold">Users</span>
                </button>

                <button 
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all w-20 text-slate-400 hover:bg-slate-100"
                >
                    <Settings size={20} />
                    <span className="text-[10px] font-bold">Config</span>
                </button>
            </nav>
        </div>
    );
};

export default AdminDashboard;