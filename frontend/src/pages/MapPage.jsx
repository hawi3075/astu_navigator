import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Sparkles } from 'lucide-react';

// --- LEAFLET ASSET FIX ---
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- DYNAMIC ICON GENERATOR ---
// This function returns different colored markers based on building category
const getIcon = (category, isTarget) => {
  let color = 'blue'; // Default for generic points
  const cat = category?.toLowerCase() || "";

  if (isTarget) color = 'red';
  else if (cat.includes('dorm')) color = 'green';
  else if (cat.includes('library')) color = 'gold';
  else if (cat.includes('hall') || cat.includes('oda')) color = 'orange';
  else if (cat.includes('academic') || cat.includes('dept')) color = 'violet';
  else if (cat.includes('health') || cat.includes('hospital')) color = 'red';

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: isTarget ? [30, 46] : [22, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Map Constraints
const ADAMA_BOUNDS = [[8.5200, 39.2500], [8.6000, 39.3300]];
const USER_START = [8.5640, 39.2900]; // Mock user location
const ASTU_CENTER = [8.5615, 39.2908];

// Component to handle map movement
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

  // 1. Fetch Locations from MongoDB on Mount
  useEffect(() => {
    const fetchLocs = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/admin/locations_list');
        setDbLocations(res.data);
      } catch (err) {
        console.error("Database fetch failed. Make sure your backend is running!", err);
      }
    };
    fetchLocs();
  }, []);

  // Auto-scroll chat
  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  // 2. Main Logic: Send Message & Search Map
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setLoading(true);

    // Search logic: Check if any building name is inside the user's message
    const matchedBuilding = dbLocations.find(loc => 
      userText.toLowerCase().includes(loc.name.toLowerCase()) ||
      loc.name.toLowerCase().includes(userText.toLowerCase())
    );

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/chat', { message: userText });
      let botReply = response.data.reply;

      if (matchedBuilding) {
        setMapTarget({ 
          coords: [matchedBuilding.latitude, matchedBuilding.longitude], 
          name: matchedBuilding.name,
          category: matchedBuilding.category
        });
        botReply += `\n\n📍 **I've located ${matchedBuilding.name} on the map for you.**`;
      }

      setMessages(prev => [...prev, { text: botReply, isBot: true }]);
    } catch (e) { 
      setMessages(prev => [...prev, { text: "Connection error. I can't reach the AI, but the map is still active!", isBot: true }]);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="app-shell flex h-screen w-screen p-6 pb-32 gap-6 overflow-hidden bg-slate-50">
      
      {/* --- CHAT SIDEBAR --- */}
      <div className="w-[400px] flex flex-col bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl z-10">
        <header className="p-6 bg-blue-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Navigation size={22} className="rotate-45"/>
            <h1 className="font-bold text-xl tracking-tight">ASTUNav AI</h1>
          </div>
          <Sparkles size={20} className="text-blue-200 animate-pulse"/>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-4 rounded-2xl text-sm max-w-[85%] shadow-sm leading-relaxed ${
                m.isBot ? 'bg-white text-slate-800 border border-slate-100' : 'bg-blue-600 text-white'
              }`}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-5 bg-white border-t border-slate-100">
          <div className="relative flex items-center">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-100 border-none rounded-2xl p-4 pr-12 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all" 
              placeholder="Where is the Library?" 
            />
            <button 
              onClick={handleSend} 
              disabled={loading}
              className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-300"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20}/>}
            </button>
          </div>
        </div>
      </div>

      {/* --- INTERACTIVE MAP --- */}
      <div className="flex-1 relative h-full rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-200">
        <MapContainer 
          center={ASTU_CENTER} 
          zoom={16} 
          minZoom={14} 
          maxBounds={ADAMA_BOUNDS} 
          className="h-full w-full" 
          zoomControl={false}
        >
          {/* Satellite Layer */}
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          {/* Labels Layer */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" pane="shadowPane" />
          
          {/* Animated Navigation Line */}
          <Polyline 
            positions={[USER_START, mapTarget.coords]} 
            pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', className: 'animate-pulse' }} 
          />

          {/* Render All Database Locations */}
          {dbLocations.map((loc) => {
            const isTarget = mapTarget.name === loc.name;
            return (
              <Marker 
                key={loc._id} 
                position={[loc.latitude, loc.longitude]} 
                icon={getIcon(loc.category, isTarget)}
                opacity={isTarget ? 1 : 0.8}
              >
                <Popup className="custom-popup">
                  <div className="text-center p-1">
                    <p className="font-bold text-blue-800 m-0">{loc.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 m-0">{loc.category}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <RecenterMap coords={mapTarget.coords} />
        </MapContainer>
        
        {/* Location Badge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 z-[1000] shadow-2xl flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
          <span className="text-slate-700 font-semibold text-sm">
            Target: <span className="text-blue-600">{mapTarget.name}</span>
          </span>
        </div>
      </div>
    </div>
  );
}