import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Sparkles, MapPin, Home, Map as MapIcon, Bookmark, Settings } from 'lucide-react';

// --- LEAFLET ASSET FIX ---
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const getIcon = (category, isTarget) => {
  let color = 'blue'; 
  const cat = category?.toLowerCase() || "";
  if (isTarget) color = 'red';
  else if (cat.includes('dorm')) color = 'green';
  else if (cat.includes('library')) color = 'gold';
  else if (cat.includes('hall') || cat.includes('oda')) color = 'orange';
  else if (cat.includes('academic')) color = 'violet';
  else if (cat.includes('health')) color = 'red';

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: isTarget ? [30, 46] : [22, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Map Config
const ADAMA_BOUNDS = [[8.5200, 39.2500], [8.6000, 39.3300]];
const USER_START = [8.5640, 39.2900]; 
const ASTU_CENTER = [8.5615, 39.2908];

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { 
    if (coords) map.flyTo(coords, 18, { duration: 1.5 }); 
  }, [coords, map]);
  return null;
}

export default function MapPage() {
  const [messages, setMessages] = useState([
    { text: "Welcome to ASTU! Ask me to find any building like **Oda Nabe Hall** or the **Female Library**.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbLocations, setDbLocations] = useState([]); 
  const [mapTarget, setMapTarget] = useState({ coords: ASTU_CENTER, name: "ASTU Campus", category: "General" });
  const chatEndRef = useRef(null);

  // Fetch all markers for the map overlay
  useEffect(() => {
    const fetchLocs = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/admin/locations_list');
        setDbLocations(res.data);
      } catch (err) {
        console.error("Backend unreachable. Ensure your FastAPI server is running.");
      }
    };
    fetchLocs();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setLoading(true);

    try {
      // 1. Send query to Smart AI Backend
      const response = await axios.post('http://127.0.0.1:8000/api/chat', { message: userText });
      const { reply, target } = response.data;

      // 2. Update Map based on Backend Search Result
      if (target) {
        setMapTarget({ 
          coords: [target.lat, target.lng], 
          name: target.name,
          category: "Target"
        });
      } else {
        // Fallback frontend search if backend doesn't return a target
        const matchedBuilding = dbLocations.find(loc => 
          userText.toLowerCase().includes(loc.name.toLowerCase())
        );
        if (matchedBuilding) {
          setMapTarget({ 
            coords: [matchedBuilding.latitude, matchedBuilding.longitude], 
            name: matchedBuilding.name,
            category: matchedBuilding.category
          });
        }
      }
      
      setMessages(prev => [...prev, { text: reply, isBot: true }]);
    } catch (e) { 
      setMessages(prev => [...prev, { text: "Connection error. Please check your backend.", isBot: true }]);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* 1. TOP SECTION: Chat & Map */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        
        {/* --- SIDEBAR CHAT --- */}
        <div className="w-80 lg:w-96 flex flex-col bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <header className="p-5 bg-blue-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Navigation size={20} className="rotate-45" />
              <span className="font-bold text-lg tracking-tight">ASTUNav AI</span>
            </div>
            <Sparkles size={18} className="animate-pulse" />
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                  m.isBot ? 'bg-white text-slate-800 border border-slate-100' : 'bg-blue-600 text-white shadow-blue-200'
                }`}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-center">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-slate-100 rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700" 
                placeholder="Where is the Library?" 
              />
              <button onClick={handleSend} disabled={loading} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>}
              </button>
            </div>
          </div>
        </div>

        {/* --- INTERACTIVE MAP --- */}
        <div className="flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white bg-white">
          <MapContainer center={ASTU_CENTER} zoom={16} className="h-full w-full" zoomControl={false} maxBounds={ADAMA_BOUNDS}>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            
            <Marker position={USER_START} icon={userIcon}><Popup>You are here</Popup></Marker>
            
            <Polyline 
              positions={[USER_START, mapTarget.coords]} 
              pathOptions={{ 
                color: '#3b82f6', 
                weight: 5, 
                dashArray: '12, 12',
                className: 'animate-path' 
              }} 
            />

            {dbLocations.map((loc) => (
              <Marker key={loc._id} position={[loc.latitude, loc.longitude]} icon={getIcon(loc.category, mapTarget.name === loc.name)}>
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-blue-700 m-0">{loc.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase m-0 font-semibold">{loc.category}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            <RecenterMap coords={mapTarget.coords} />
          </MapContainer>

          {/* Floating Target Badge */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full shadow-lg z-[1000] border border-blue-100 flex items-center gap-2 transition-all">
            <MapPin size={16} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-700">To: <span className="text-blue-600">{mapTarget.name}</span></span>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM NAVIGATION BAR */}
      <div className="h-20 bg-blue-600 flex items-center justify-around px-12 shrink-0 shadow-[0_-10px_25px_-5px_rgba(37,99,235,0.3)]">
        <button className="flex flex-col items-center text-white/70 hover:text-white transition-colors">
          <Home size={24} />
          <span className="text-[10px] uppercase font-bold mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <MapIcon size={24} />
          <span className="text-[10px] uppercase font-bold mt-1 border-b-2 border-white">Campus</span>
        </button>
        <button className="flex flex-col items-center text-white/70 hover:text-white transition-colors">
          <Bookmark size={24} />
          <span className="text-[10px] uppercase font-bold mt-1">Saved</span>
        </button>
        <button className="flex flex-col items-center text-white/70 hover:text-white transition-colors">
          <Settings size={24} />
          <span className="text-[10px] uppercase font-bold mt-1">Settings</span>
        </button>
      </div>

    </div>
  );
}