import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Bookmark, ArrowLeft, Target } from 'lucide-react'; 

// --- 📍 ICON GENERATOR ---
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
                width: 32px; 
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            ">
                <div style="transform: rotate(45deg); color: white; display: flex;">
                    ${cat.includes('dorm') ? 
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/></svg>' : 
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4M9 21h6"/></svg>'}
                </div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchLocs = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/admin/locations_list');
                setDbLocations(res.data);
            } catch (err) { 
                console.error("Failed to load map points:", err); 
            }
        };
        fetchLocs();
    }, []);

    const handleSaveLocation = async (location) => {
        // Fallback check for session data
        const storedEmail = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");
        const activeEmail = userEmail || storedEmail;

        if (!activeEmail || !token) {
            console.error("Auth Fail:", { activeEmail, hasToken: !!token });
            alert("Session Missing: Please Log In again to save locations.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/save-location', { 
                email: activeEmail.toLowerCase().trim(), 
                location: {
                    name: location.name,
                    category: location.category || "Campus Spot"
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`✅ Saved ${location.name}!`);
        } catch (err) { 
            console.error("Save Error:", err.response?.data || err.message);
            alert(err.response?.data?.error || "Error saving location.");
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { text: input, isBot: false }]);
        const query = input;
        setInput("");
        setLoading(true);
        
        try {
            const response = await axios.post('http://localhost:8000/api/chat', { message: query });
            const { reply, target } = response.data;
            
            if (target && target.lat && target.lng) {
                setMapTarget({ coords: [target.lat, target.lng], name: target.name });
            }
            setMessages(prev => [...prev, { text: reply, isBot: true }]);
        } catch (e) { 
            setMessages(prev => [...prev, { text: "⚠️ AI Server is offline.", isBot: true }]);
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
            <div className="bg-white px-6 py-3 flex items-center justify-between border-b z-[2000] shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => onNavigate('Home')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Campus Navigator</h2>
                </div>
                <div className="bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100">
                    <span className="text-xs font-black text-blue-600 uppercase">{mapTarget.name}</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6"> 
                <div className="w-80 lg:w-[400px] flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <header className="p-5 bg-blue-600 text-white font-bold flex items-center gap-2">
                        <Navigation size={20} /> ASTU AI Guide
                    </header>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`p-4 rounded-2xl text-sm shadow-sm ${m.isBot ? 'bg-white text-slate-700 border border-slate-100' : 'bg-blue-600 text-white'} max-w-[90%]`}>
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
                                className="w-full bg-slate-100 rounded-xl p-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="Find a building..." 
                            />
                            <button onClick={handleSend} disabled={loading} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg transition-transform active:scale-90">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 rounded-[3rem] overflow-hidden relative border-8 border-white shadow-2xl">
                    <MapContainer center={ASTU_CENTER} zoom={16} className="h-full w-full">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        
                        {mapTarget.coords && (
                            <Polyline positions={[USER_START, mapTarget.coords]} pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 15' }} />
                        )}
                        
                        {dbLocations.filter(loc => loc.latitude && loc.longitude).map((loc) => (
                            <Marker 
                                key={loc._id} 
                                position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]} 
                                icon={createPlaceIcon(loc.category, mapTarget.name === loc.name)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2 text-center min-w-[140px]">
                                        <p className="font-bold text-slate-800 mb-2">{loc.name}</p>
                                        <button 
                                            onClick={() => handleSaveLocation(loc)} 
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                                        >
                                            <Bookmark size={14} /> SAVE PLACE
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        <RecenterMap coords={mapTarget.coords} />
                    </MapContainer>
                    
                    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-white z-[1000] flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Target size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Target Location</p>
                            <p className="font-bold text-slate-800">{mapTarget.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}