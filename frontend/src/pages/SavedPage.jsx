import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, MapPin, Loader2, BookmarkX } from 'lucide-react';

const SavedPage = () => {
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);
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
            const res = await axios.get(`http://localhost:8000/api/saved-locations/${userEmail}`);
            setSavedItems(res.data);
        } catch (err) {
            console.error("Error fetching saved locations:", err);
        } finally {
            setLoading(false);
        }
    };

    const removeLocation = async (name) => {
        try {
            await axios.delete(`http://localhost:8000/api/save-location?email=${userEmail}&location_name=${name}`);
            // Refresh the list locally after deletion
            setSavedItems(prev => prev.filter(item => item.name !== name));
        } catch (err) {
            console.error("Could not remove location:", err);
            alert("Failed to remove location.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 pb-24">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                <p className="text-slate-500 font-medium">Loading your favorites...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen pb-32">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Your Saved Locations</h1>
                <p className="text-slate-500 text-sm">Quick access to your favorite spots</p>
            </header>

            {savedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                        <BookmarkX size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Nothing saved yet</h3>
                    <p className="text-slate-400 max-w-[250px] mt-2">
                        Go to the Map and click the bookmark icon on a building to save it here!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {savedItems.map((loc) => (
                        <div key={loc._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">{loc.name}</h3>
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-500">
                                        {loc.category}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeLocation(loc.name)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedPage;