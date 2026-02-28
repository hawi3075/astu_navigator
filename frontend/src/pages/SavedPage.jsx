import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Trash2, Navigation, Bookmark, Loader2 } from 'lucide-react';

export default function SavedPage({ onNavigate, userEmail }) {
    const [savedLocations, setSavedLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 📡 FETCH SAVED LOCATIONS ---
    const fetchSavedLocations = async () => {
        const token = localStorage.getItem("token");
        const activeEmail = userEmail || localStorage.getItem("userEmail");

        if (!activeEmail) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const formattedEmail = activeEmail.toLowerCase().trim();
            
            // ✅ Updated: Targeting live Render Node.js API
            const res = await axios.get(`https://astu-navigator-api.onrender.com/api/saved-locations/${formattedEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const locations = Array.isArray(res.data) ? res.data : (res.data.locations || []);
            setSavedLocations(locations);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedLocations();
    }, [userEmail]);

    // --- 🗑️ DELETE HANDLER ---
    const handleDelete = async (locationName) => {
        if (!window.confirm(`Are you sure you want to remove ${locationName}?`)) return;

        const token = localStorage.getItem("token");
        const activeEmail = userEmail || localStorage.getItem("userEmail");

        try {
            // ✅ Updated: Targeting live Render Node.js API
            await axios.delete(`https://astu-navigator-api.onrender.com/api/delete-location`, {
                data: { 
                    email: activeEmail.toLowerCase().trim(), 
                    locationName: locationName 
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh list after delete
            fetchSavedLocations();
        } catch (err) {
            alert("Failed to delete location. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Saved Spots</h1>
                <p className="text-slate-500 font-medium">Your personal ASTU shortcuts</p>
            </div>

            {savedLocations.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center shadow-inner">
                    <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Bookmark className="text-slate-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Your list is empty</h3>
                    <p className="text-slate-500 mb-8">Start exploring the campus and bookmark<br/>your favorite buildings!</p>
                    <button 
                        onClick={() => onNavigate('Explore')}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 mx-auto active:scale-95"
                    >
                        <Navigation size={20} /> Open Map Explorer
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {savedLocations.map((loc, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{loc.name}</h4>
                                    <p className="text-xs text-slate-400 uppercase font-black tracking-widest">{loc.category || 'Location'}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onNavigate('Explore')} 
                                    className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    title="View on Map"
                                >
                                    <Navigation size={20} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(loc.name)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                    title="Remove Bookmark"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}