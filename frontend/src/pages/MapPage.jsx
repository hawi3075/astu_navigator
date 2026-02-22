import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Bookmark, ArrowLeft } from 'lucide-react'; 

// --- 📍 MINI ICON GENERATOR ---
const createPlaceIcon = (category, isTarget) => {
    let color = isTarget ? '#ef4444' : '#3b82f6'; 
    const cat = category?.toLowerCase() || "";
    
    if (cat.includes('dorm') || cat.includes('block')) color = '#22c55e'; 
    if (cat.includes('hall') || cat.includes('natural')) color = '#f59e0b'; 

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                background-color: ${color};
                width: 28px; 
                height: 28px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1.5px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">
                <div style="transform: rotate(45deg); color: white; display: flex;">
                    ${cat.includes('dorm') ? 
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/></svg>' : 
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4M9 21h6"/></svg>'}
                </div>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
};

const ASTU_CENTER = [8.5615, 39.2908];
const USER_START = [8.5640, 39.2900];

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => { 
        if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
            map.flyTo(coords, 18, { duration: 1.5 }); 
        }
    }, [coords, map]);
    return null;
}

export default function MapPage({ onNavigate, userEmail }) {
    const [messages, setMessages] = useState([{ text: "Welcome to ASTU! Ask me to find any building.", isBot: true }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [dbLocations, setDbLocations] = useState([]); 
    const [mapTarget, setMapTarget] = useState({ coords: ASTU_CENTER, name: "ASTU Campus" });
    const chatEndRef = useRef(null);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchLocs = async () => {
            try {
                // ✅ UPDATED: Points to Python (8000)
                const res = await axios.get('http://localhost:8000/api/admin/locations_list');
                setDbLocations(res.data);
            } catch (err) { 
                console.error("Failed to load map points from Python:", err); 
            }
        };
        fetchLocs();
    }, []);

    const handleSaveLocation = async (locationName) => {
        if (!userEmail) return alert("Please login to save.");
        try {
            // ✅ UPDATED: Points to Python (8000)
            await axios.post('http://localhost:8000/api/save-location', { 
                user_email: userEmail, 
                location_name: locationName 
            });
            alert(`Saved ${locationName}!`);
        } catch (err) { console.error("Save failed", err); }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInput("");
        setLoading(true);
        
        try {
            // ✅ UPDATED: Points to Python (8000)
            const response = await axios.post('http://localhost:8000/api/chat', { 
                message: userMsg 
            });
            
            const { reply, target } = response.data;
            
            if (target && target.lat && target.lng) {
                setMapTarget({ coords: [target.lat, target.lng], name: target.name });
            }
            setMessages(prev => [...prev, { text: reply, isBot: true }]);
        } catch (e) { 
            console.error("AI Server Error:", e);
            setMessages(prev => [...prev, { text: "⚠️ My Python backend is unreachable. Make sure main.py is running on port 8000.", isBot: true }]);
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
            
            {/* HEADER */}
            <div className="bg-white px-6 py-3 flex items-center justify-between border-b z-[2000] shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => onNavigate('Home')} className="mr-4 p-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Campus Navigator</h2>
                </div>
                <div className="bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">{mapTarget.name}</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6 mt-1 mb-2"> 
                {/* Chat Panel */}
                <div className="w-80 lg:w-[400px] flex flex-col bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <header className="p-5 bg-blue-600 text-white font-black text-lg">AI Assistant</header>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`p-4 rounded-2xl text-sm ${m.isBot ? 'bg-white text-slate-700 shadow-sm' : 'bg-blue-600 text-white shadow-lg'} max-w-[85%] animate-in fade-in slide-in-from-bottom-2`}>
                                    <ReactMarkdown>{m.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 bg-white border-t">
                        <div className="relative flex items-center">
                            <input 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="w-full bg-slate-100 rounded-xl p-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                                placeholder="Where is the library?" 
                            />
                            <button onClick={handleSend} disabled={loading} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg disabled:bg-slate-300">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map Panel */}
                <div className="flex-1 rounded-[2.5rem] overflow-hidden relative border-8 border-white bg-white shadow-2xl">
                    <MapContainer center={ASTU_CENTER} zoom={16} className="h-full w-full">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        
                        {mapTarget.coords && !isNaN(mapTarget.coords[0]) && (
                            <Polyline positions={[USER_START, mapTarget.coords]} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '8, 8' }} />
                        )}
                        
                        {/* ✅ RENDER REFINED LOCATIONS */}
                        {dbLocations
                            .filter(loc => loc.latitude && loc.longitude) 
                            .map((loc) => (
                            <Marker 
                                key={loc._id} 
                                position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]} 
                                icon={createPlaceIcon(loc.category, mapTarget.name === loc.name)}
                            >
                                <Popup>
                                    <div className="flex flex-col items-center gap-2 p-1 min-w-[130px]">
                                        <span className="text-slate-900 font-black text-sm text-center">{loc.name}</span>
                                        <button 
                                            onClick={() => handleSaveLocation(loc.name)} 
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-black shadow-md active:scale-95"
                                        >
                                            <Bookmark size={12} fill="white" /> Save Place
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        <RecenterMap coords={mapTarget.coords} />
                    </MapContainer>
                    
                    {/* Navigation Floating Badge */}
                    <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Navigation size={18} className="rotate-45" /></div>
                        <div>
                            <p className="text-[9px] font-black text-blue-600 uppercase leading-none">Target Locked</p>
                            <p className="text-xs font-black text-slate-800 tracking-tight">{mapTarget.name}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-24 bg-transparent" /> 
        </div>
    );
}