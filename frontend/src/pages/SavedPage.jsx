import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, MapPin, Loader2, BookmarkX, Navigation, ArrowRight, ArrowLeft } from 'lucide-react';

const SavedPage = ({ onNavigate }) => {
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    // Ensure we are getting the email correctly
    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        if (userEmail) {
            fetchSaved();
        } else {
            setLoading(false);
        }
    }, [userEmail]);

    const fetchSaved = async () => {
        try {
            setLoading(true);
            // ✅ Updated port to 5000 to match your Node.js backend from previous logs
            const res = await axios.get(`http://localhost:5000/api/saved-locations/${userEmail}`);
            setSavedItems(res.data);
        } catch (err) {
            console.error("Error fetching saved locations:", err);
        } finally {
            setLoading(false);
        }
    };

    const removeLocation = async (e, locationName) => {
        e.stopPropagation(); // Prevents navigating to the map when clicking delete
        
        if (!window.confirm(`Remove ${locationName} from your saved spots?`)) return;

        try {
            // ✅ FIX: Match the backend route precisely. 
            // If your backend uses query params, use this:
            await axios.delete(`http://localhost:5000/api/save-location`, {
                params: {
                    email: userEmail,
                    location_name: locationName
                }
            });

            // Update UI immediately
            setSavedItems(prev => prev.filter(item => item.name !== locationName));
        } catch (err) {
            console.error("Delete request failed:", err);
            alert("Server is not responding. Check if your Node.js terminal is running on port 5000.");
        }
    };

    const getCategoryStyle = (cat) => {
        const category = cat?.toLowerCase() || "";
        if (category.includes('library')) return "bg-amber-50 text-amber-600 border-amber-100";
        if (category.includes('dorm')) return "bg-emerald-50 text-emerald-600 border-emerald-100";
        if (category.includes('admin')) return "bg-blue-50 text-blue-600 border-blue-100";
        return "bg-slate-50 text-slate-600 border-slate-100";
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 pb-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-bold animate-pulse">Gathering your places...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            {/* Sticky Back Header */}
            <div className="bg-white px-6 py-4 flex items-center border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <button 
                    onClick={() => onNavigate('Home')} 
                    className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-slate-800" />
                </button>
                <h2 className="text-lg font-bold text-slate-800">My Bookmarks</h2>
            </div>

            <div className="p-6 pb-32">
                {/* Header Section */}
                <div className="max-w-4xl mx-auto mb-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Spots</h1>
                            <p className="text-slate-500 font-medium">Your personal ASTU shortcuts</p>
                        </div>
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200">
                            {savedItems.length} Saved
                        </div>
                    </div>
                </div>

                {savedItems.length === 0 ? (
                    <div className="max-w-md mx-auto mt-20 text-center bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="inline-flex p-6 bg-slate-50 rounded-full mb-6">
                            <BookmarkX size={60} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Your list is empty</h3>
                        <p className="text-slate-400 mt-3 mb-8 leading-relaxed">
                            It looks like you haven't saved any buildings yet. Start exploring the campus map!
                        </p>
                        <button 
                            onClick={() => onNavigate('Campus')}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto"
                        >
                            Explore Map <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedItems.map((loc) => (
                            <div 
                                key={loc._id || loc.name} 
                                onClick={() => onNavigate('Campus')}
                                className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryStyle(loc.category)}`}>
                                    {loc.category || 'Location'}
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl group-hover:bg-blue-600 transition-colors">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="pr-12">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{loc.name}</h3>
                                        <div className="flex items-center gap-1 text-blue-500 font-bold text-sm">
                                            <Navigation size={14} /> 
                                            <span>Show Route</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                                    <button 
                                        onClick={(e) => removeLocation(e, loc.name)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs transition-colors"
                                    >
                                        <Trash2 size={16} /> REMOVE
                                    </button>
                                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPage;