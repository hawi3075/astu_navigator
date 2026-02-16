import React, { useState } from 'react';
import { MapPin, PlusCircle, LogOut, Navigation, Building2 } from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
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
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error("Error adding location:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header Area */}
            <div className="bg-blue-600 p-6 text-white shadow-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Building2 size={28} />
                    <h1 className="text-xl font-bold">ASTU Admin Control</h1>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl transition-all font-medium"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <div className="p-8 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
                        <PlusCircle className="text-blue-400" />
                        <h2 className="text-lg font-semibold">Add New Campus Location</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Building Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Building Name</label>
                            <div className="relative flex items-center">
                                <Navigation className="absolute left-4 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Block 504" 
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500/50"
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Coordinates Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Latitude</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    placeholder="8.54..." 
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50"
                                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Longitude</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    placeholder="39.29..." 
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50"
                                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Category</label>
                            <select 
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option>Academic Block</option>
                                <option>Food/Cafe</option>
                                <option>Library</option>
                                <option>Administrative</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Description</label>
                            <textarea 
                                placeholder="Details about this location..." 
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500/50"
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
                        >
                            <MapPin size={20} /> Add to Map
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;