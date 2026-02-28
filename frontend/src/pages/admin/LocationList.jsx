import React, { useEffect, useState } from 'react';
import { Trash2, Home, School } from 'lucide-react';

export default function LocationList() {
    const [locations, setLocations] = useState([]);

    const fetchLocations = async () => {
        try {
            // Updated: Changed localhost:5000 to your live Render API URL
            const res = await fetch('https://astu-navigator-api.onrender.com/api/admin/locations'); 
            const data = await res.json();
            
            if (Array.isArray(data)) {
                setLocations(data);
            } else {
                setLocations([]);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    useEffect(() => { fetchLocations(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Remove this building from the campus map?")) {
            try {
                // Updated: Changed localhost:5000 to your live Render API URL
                const res = await fetch(`https://astu-navigator-api.onrender.com/api/admin/locations/${id}`, { 
                    method: 'DELETE' 
                });
                
                if (res.ok) {
                    fetchLocations();
                } else {
                    alert("Failed to delete point.");
                }
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-5 duration-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 px-2">Campus Map Points</h2>
            <div className="grid gap-4">
                {locations.length > 0 ? locations.map((loc) => (
                    <div key={loc._id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                                {loc.category === 'Academic Block' ? <School size={20} /> : <Home size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700">{loc.name}</h3>
                                <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">
                                    {loc.lat?.toFixed(4) || "0.0000"}, {loc.lng?.toFixed(4) || "0.0000"}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDelete(loc._id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )) : (
                    <p className="text-center py-10 text-slate-400">No campus points found.</p>
                )}
            </div>
        </div>
    );
}