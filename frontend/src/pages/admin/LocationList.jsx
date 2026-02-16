import React, { useEffect, useState } from 'react';
import { MapPin, Trash2, Home, School } from 'lucide-react';

export default function LocationList() {
    const [locations, setLocations] = useState([]);

    const fetchLocations = async () => {
        const res = await fetch('http://localhost:8000/api/admin/locations_list'); // You'll add this route next
        const data = await res.json();
        setLocations(data);
    };

    useEffect(() => { fetchLocations(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Remove this building from the campus map?")) {
            await fetch(`http://localhost:8000/api/admin/locations/${id}`, { method: 'DELETE' });
            fetchLocations();
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-5 duration-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 px-2">Campus Map Points</h2>
            <div className="grid gap-4">
                {locations.map((loc) => (
                    <div key={loc._id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                                {loc.category === 'Academic Block' ? <School size={20} /> : <Home size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700">{loc.name}</h3>
                                <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">
                                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
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
                ))}
            </div>
        </div>
    );
}