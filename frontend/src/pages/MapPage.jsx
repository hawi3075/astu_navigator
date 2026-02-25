import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Bookmark, ArrowLeft, MapPin } from 'lucide-react'; 

// --- 🎨 CUSTOM MARKER GENERATOR ---
const createPlaceIcon = (category, isTarget) => {
    let color = isTarget ? '#ef4444' : '#3b82f6'; 
    const cat = category?.toLowerCase() || "";
    
    if (!isTarget) {
        if (cat.includes('dorm') || cat.includes('block')) color = '#22c55e'; 
        if (cat.includes('hall') || cat.includes('natural') || cat.includes('admin')) color = '#f59e0b'; 
    }

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">
                <div style="transform: rotate(45deg); color: white; display: flex;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
            </div>`,
        iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
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
    const [mapTarget, setMapTarget] = useState({ coords: ASTU_CENTER, name: "ASTU Campus", category: "Campus" });
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 📡 FETCH MARKERS FROM BACKEND ---
    const fetchLocs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/locations_list');
            setDbLocations(res.data);
        } catch (err) { 
            console.error("Failed to load map points:", err); 
        }
    };

    useEffect(() => {
        fetchLocs();
    }, []);

    // --- 💾 SAVE LOCATION HANDLER ---
    const handleSaveLocation = async (location) => {
        const token = localStorage.getItem("token");
        const activeEmail = userEmail || localStorage.getItem("userEmail");

        if (!activeEmail || !token) {
            alert("Session Missing: Please log in again.");
            return;
        }

        try {
            // Ensure coordinates are sent as pure numbers to avoid 400 Bad Request
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lng);

            if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid Coordinates");

            await axios.post('http://localhost:5000/api/save-location', { 
                email: activeEmail.toLowerCase().trim(), 
                location: {
                    name: location.name,
                    category: location.category || "Campus Spot",
                    coordinates: [lat, lng]
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert(`✅ Saved ${location.name}!`);
            fetchLocs(); 
        } catch (err) { 
            console.error("Save failed:", err);
            alert(err.response?.data?.error || "Error saving location.");
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        
        const query = input;
        setMessages(prev => [...prev, { text: query, isBot: false }]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/chat', { message: query });
            const { reply, target } = response.data;

            if (target && target.lat && target.lng) {
                // We capture target.category here so it's ready for the save button
                setMapTarget({ 
                    coords: [target.lat, target.lng], 
                    name: target.name,
                    category: target.category || "Building"
                });
            }
            setMessages(prev => [...prev, { text: reply, isBot: true }]);
        } catch (e) { 
            setMessages(prev => [...prev, { text: "⚠️ AI Navigator is offline.", isBot: true }]);
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white px-6 py-3 flex items-center justify-between border-b z-[2000] shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => onNavigate('Home')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700" />
                    </button>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">ASTU Navigator</h2>
                </div>
                <div className="bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100 text-right">
                    <span className="text-[10px] font-black text-blue-600 uppercase block leading-none">Viewing</span>
                    <span className="text-xs font-bold text-slate-700 uppercase leading-none">{mapTarget.name}</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6"> 
                {/* --- CHAT SIDEBAR --- */}
                <div className="w-80 lg:w-[400px] flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <header className="p-5 bg-blue-600 text-white font-bold flex items-center gap-2">
                        <Navigation size={20} /> ASTU AI Guide
                    </header>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`p-4 rounded-2xl text-sm shadow-sm ${m.isBot ? 'bg-white text-slate-700 border border-slate-100' : 'bg-blue-600 text-white'} max-w-[90%]`}>
                                    <ReactMarkdown>{m.text || ""}</ReactMarkdown>
                                    
                                    {m.isBot && mapTarget.name !== "ASTU Campus" && i === messages.length - 1 && (
                                        <button 
                                            onClick={() => handleSaveLocation({ 
                                                name: mapTarget.name, 
                                                lat: mapTarget.coords[0], 
                                                lng: mapTarget.coords[1],
                                                category: mapTarget.category 
                                            })}
                                            className="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
                                        >
                                            <Bookmark size={12} /> SAVE TO PROFILE
                                        </button>
                                    )}
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
                                className="w-full bg-slate-100 rounded-xl p-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" 
                                placeholder="Where is the Library?" 
                            />
                            <button onClick={handleSend} disabled={loading} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- INTERACTIVE MAP --- */}
                <div className="flex-1 rounded-[3rem] overflow-hidden relative border-8 border-white shadow-2xl">
                    <MapContainer center={ASTU_CENTER} zoom={16} className="h-full w-full">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        
                        {mapTarget.coords && mapTarget.name !== "ASTU Campus" && (
                            <>
                                <Marker position={mapTarget.coords} icon={createPlaceIcon('target', true)}>
                                    <Popup><b className="text-red-600">{mapTarget.name}</b></Popup>
                                </Marker>
                                <Polyline 
                                    positions={[USER_START, mapTarget.coords]} 
                                    pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10, 15', opacity: 0.8 }} 
                                />
                            </>
                        )}

                        {dbLocations.map((loc, idx) => {
                            const lat = loc.latitude || (loc.coordinates ? loc.coordinates[0] : null);
                            const lng = loc.longitude || (loc.coordinates ? loc.coordinates[1] : null);

                            if (!lat || !lng) return null;
                            if (mapTarget.name === loc.name) return null;

                            return (
                                <Marker 
                                    key={loc._id || idx} 
                                    position={[parseFloat(lat), parseFloat(lng)]} 
                                    icon={createPlaceIcon(loc.category, false)}
                                >
                                    <Popup>
                                        <div className="p-2 text-center min-w-[140px]">
                                            <p className="font-bold text-slate-800">{loc.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase mb-3">{loc.category || "Building"}</p>
                                            <div className="text-[10px] text-blue-600 font-bold bg-blue-50 rounded py-1 mb-2">SAVED PLACE</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        <RecenterMap coords={mapTarget.coords} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}