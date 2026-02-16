import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Sparkles } from 'lucide-react';

// Marker Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// 1. DEFINE BOUNDS FOR ADAMA (Prevents zooming out to the whole world)
const ADAMA_BOUNDS = [
  [8.5200, 39.2500], // Southwest corner
  [8.6000, 39.3300]  // Northeast corner
];

const USER_START = [8.5640, 39.2900];
const ASTU_CENTER = [8.5615, 39.2908];

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 18, { duration: 1.5 }); }, [coords]);
  return null;
}

export default function MapPage() {
  const [messages, setMessages] = useState([{ text: "Welcome to ASTU! Ready to find your way?", isBot: true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapTarget, setMapTarget] = useState({ coords: ASTU_CENTER, name: "ASTU Campus" });
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat', { text: input });
      const botReply = response.data.reply;
      setMessages(prev => [...prev, { text: botReply, isBot: true }]);
      
      const lower = botReply.toLowerCase();
      // 2. UPDATED COORDINATES FOR FEMALE LIBRARY (Adjusted based on your feedback)
      if (lower.includes("library")) {
        setMapTarget({ coords: [8.5638, 39.2922], name: "Female Library" });
      } else if (lower.includes("registrar")) {
        setMapTarget({ coords: [8.5595, 39.2890], name: "Registrar Office" });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="app-shell flex h-screen w-screen p-6 pb-32 gap-6 overflow-hidden bg-slate-50">
      
      {/* CHAT PANEL */}
      <div className="w-[380px] flex flex-col bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-lg">
        <header className="p-6 bg-blue-600 border-b border-blue-500 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl text-white"><Navigation size={18}/></div>
            <h1 className="font-bold text-white text-lg tracking-tight">ASTUNav AI</h1>
          </div>
          <Sparkles size={18} className="text-blue-100 animate-pulse"/>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-slate-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-4 rounded-2xl text-sm max-w-[90%] shadow-sm ${
                m.isBot ? 'bg-white text-slate-800 border border-slate-100' : 'bg-blue-600 text-white font-medium'
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
              value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSend()}
              className="w-full bg-slate-100 border-none rounded-xl p-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50" 
              placeholder="Search building..." 
            />
            <button onClick={handleSend} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16}/>}
            </button>
          </div>
        </div>
      </div>

      {/* MAP FRAME: RESTRICTED TO ADAMA */}
      <div className="flex-1 map-frame relative h-full">
        <MapContainer 
          center={ASTU_CENTER} 
          zoom={16} 
          minZoom={14} // 3. PREVENTS ZOOMING OUT TOO FAR
          maxBounds={ADAMA_BOUNDS} // 4. LOCKS MAP TO ADAMA ONLY
          className="h-full w-full" 
          zoomControl={false}
        >
          {/* Hybrid Map Layer (Shows roads + satellite for better accuracy) */}
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" pane="shadowPane" />
          
          <Polyline 
            positions={[USER_START, mapTarget.coords]} 
            pathOptions={{ color: '#2563eb', weight: 6, dashArray: '1, 15', className: 'animate-path' }} 
          />

          <Marker position={mapTarget.coords}>
            <Popup><div className="font-bold text-blue-600">{mapTarget.name}</div></Popup>
          </Marker>
          <RecenterMap coords={mapTarget.coords} />
        </MapContainer>
        
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 z-[1000] text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-lg">
          Adama Navigator Active
        </div>
      </div>
    </div>
  );
}