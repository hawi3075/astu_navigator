import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, MapPin, Trash2, Loader2, Map as MapIcon } from 'lucide-react';

export default function SavedPage({ onNavigate, userEmail }) {
    const [savedLocations, setSavedLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const activeEmail = userEmail || localStorage.getItem("userEmail");

    useEffect(() => {
        const fetchSaved = async () => {
            if (!activeEmail) {
                setLoading(false);
                return;
            }
            try {
                // Ensure the email is formatted correctly for the API call
                const cleanEmail = activeEmail.toLowerCase().trim();
                console.log(`Fetching bookmarks for: ${cleanEmail}`);
                
                const res = await axios.get(`http://localhost:5000/api/saved-locations/${cleanEmail}`);
                
                // res.data should be an array of objects: { _id, name, category }
                setSavedLocations(res.data);
            } catch (err) {
                console.error("Fetch error:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSaved();
    }, [activeEmail]);

    const removeLocation = async (id, locName) => {
        const token = localStorage.getItem("token");
        try {
            // Using the delete route defined in userRoutes.js
            await axios.delete(`http://localhost:5000/api/saved-points/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state to remove the item instantly
            setSavedLocations(prev => prev.filter(item => item._id !== id));
            console.log(`Removed: ${locName}`);
        } catch (err) {
            console.error("Delete error:", err.response?.data || err.message);
            alert("Failed to remove bookmark. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold animate-pulse">Loading your bookmarks...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto mb-20 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Spots</h1>
                <p className="text-slate-500 font-medium">Your personal ASTU shortcuts</p>
            </header>

            {savedLocations.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border-4 border-dashed border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bookmark className="text-slate-300" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Your list is empty</h2>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start exploring the campus and bookmark your favorite buildings!</p>
                    <button 
                        onClick={() => onNavigate('Explore')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <MapIcon size={20} /> Explore Hub
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    <div className="flex justify-between items-center px-4 mb-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{savedLocations.length} Saved Items</span>
                    </div>
                    {savedLocations.map((loc) => (
                        <div key={loc._id} className="group bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:border-blue-100">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{loc.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase">
                                            {loc.category || "Campus Building"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeLocation(loc._id, loc.name)} 
                                className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                title="Remove Bookmark"
                            >
                                <Trash2 size={22} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}