import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Trash2, MapPin, Loader2, BookmarkX, Navigation, 
  ArrowRight, ArrowLeft, Calendar, Users 
} from 'lucide-react';

const SavedPage = ({ onNavigate, userEmail }) => {
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Retrieve latest token for delete permissions
    const token = localStorage.getItem("token");

    // ✅ 1. Improved Fetch Function
    const fetchSaved = async (email) => {
        if (!email) return;
        try {
            setLoading(true);
            // Ensure email is lowercase to match backend User.findOne logic
            const res = await axios.get(`http://localhost:5000/api/saved-locations/${email.toLowerCase()}`);
            
            // Set items (fallback to empty array if data is null)
            setSavedItems(res.data || []);
        } catch (err) {
            console.error("Error fetching saved locations:", err);
            // If the route returns 404, it means no user or no points yet
            if (err.response?.status === 404) {
                setSavedItems([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ 2. Synchronized Effect
    useEffect(() => {
        // Priority: Use the prop from App.js, then fallback to storage
        const activeEmail = userEmail || localStorage.getItem("userEmail");
        
        if (activeEmail) {
            fetchSaved(activeEmail);
        } else {
            setLoading(false);
            setSavedItems([]);
        }
    }, [userEmail]); // Re-runs if userEmail prop changes (e.g., after login)

    // ✅ 3. Remove Saved Point
    const removeLocation = async (e, locationId, locationName) => {
        e.stopPropagation(); // Stop card click from triggering
        
        if (!window.confirm(`Remove "${locationName}" from your saved spots?`)) return;

        try {
            await axios.delete(`http://localhost:5000/api/saved-points/${locationId}`, {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });

            // Optimistic UI Update: filter out the deleted item immediately
            setSavedItems(prev => prev.filter(item => item._id !== locationId));
        } catch (err) {
            console.error("Delete request failed:", err);
            if (err.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                onNavigate('Login');
            } else {
                alert("Failed to remove spot. Is your server running?");
            }
        }
    };

    // ✅ 4. Dynamic Category Styling
    const getCategoryStyle = (cat) => {
        const category = cat?.toLowerCase() || "";
        if (category.includes('library')) return "bg-amber-50 text-amber-600 border-amber-100";
        if (category.includes('dorm')) return "bg-emerald-50 text-emerald-600 border-emerald-100";
        if (category.includes('admin')) return "bg-blue-50 text-blue-600 border-blue-100";
        if (category.includes('event')) return "bg-purple-50 text-purple-600 border-purple-100";
        if (category.includes('club')) return "bg-pink-50 text-pink-600 border-pink-100";
        return "bg-slate-50 text-slate-600 border-slate-100";
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 pb-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-bold animate-pulse">Gathering your places...</p>
        </div>
    );

    const activeEmail = userEmail || localStorage.getItem("userEmail");

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            {/* Header */}
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

                {!activeEmail ? (
                    /* User not logged in */
                    <div className="max-w-md mx-auto mt-20 text-center bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800">Login Required</h3>
                        <p className="text-slate-400 mt-3 mb-8">Sign in to sync your saved campus locations across devices.</p>
                        <button 
                            onClick={() => onNavigate('Login')}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all mx-auto shadow-lg"
                        >
                            Sign In Now
                        </button>
                    </div>
                ) : savedItems.length === 0 ? (
                    /* Empty list state */
                    <div className="max-w-md mx-auto mt-20 text-center bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        <div className="inline-flex p-6 bg-slate-50 rounded-full mb-6">
                            <BookmarkX size={60} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Your list is empty</h3>
                        <p className="text-slate-400 mt-3 mb-8 leading-relaxed">
                            Start exploring the campus and bookmark your favorite buildings!
                        </p>
                        <button 
                            onClick={() => onNavigate('Explore')}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto"
                        >
                            Explore Hub <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    /* Active saved items grid */
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedItems.map((loc) => (
                            <div 
                                key={loc._id} 
                                onClick={() => onNavigate('Explore')} // Navigate back to map on click
                                className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Category Badge */}
                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryStyle(loc.category)}`}>
                                    {loc.category || 'Location'}
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl group-hover:bg-blue-600 transition-colors">
                                        {loc.category?.toLowerCase().includes('event') ? <Calendar size={24} /> : 
                                         loc.category?.toLowerCase().includes('club') ? <Users size={24} /> : 
                                         <MapPin size={24} />}
                                    </div>
                                    <div className="pr-12">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{loc.name}</h3>
                                        <div className="flex items-center gap-1 text-blue-500 font-bold text-sm">
                                            <Navigation size={14} /> 
                                            <span>View on Map</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                                    <button 
                                        onClick={(e) => removeLocation(e, loc._id, loc.name)}
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