import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Send, Navigation, Sparkles, Bot, User, Loader2 } from 'lucide-react';

// Fix for Leaflet icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
L.Marker.prototype.options.icon = DefaultIcon;

const USER_START = [8.5640, 39.2900]; 
const ASTU_CENTER = [8.5615, 39.2908];

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 18, { duration: 2 }); }, [coords]);
  return null;
}

const MapPage = () => {
  const [messages, setMessages] = useState([{ text: "Welcome! Ask me for a building.", isBot: true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapTarget, setMapTarget] = useState({ coords: ASTU_CENTER, name: "ASTU Campus" });
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat', { text: userMsg });
      const botReply = response.data.reply;
      setMessages(prev => [...prev, { text: botReply, isBot: true }]);
      
      const lowerReply = botReply.toLowerCase();
      if (lowerReply.includes("library")) setMapTarget({ coords: [8.5630, 39.2915], name: "Female Library" });
      else if (lowerReply.includes("registrar")) setMapTarget({ coords: [8.5595, 39.2890], name: "Registrar Office" });
    } catch (error) {
      setMessages(prev => [...prev, { text: "**Error:** Offline", isBot: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative h-screen w-screen bg-slate-950">
      {/* BACKGROUND MAP */}
      <MapContainer center={ASTU_CENTER} zoom={17} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" pane="shadowPane" />
        <Polyline positions={[USER_START, mapTarget.coords]} pathOptions={{ color: '#3b82f6', weight: 6, dashArray: '1, 15', className: 'animate-path' }} />
        <Marker position={USER_START}><Popup>You</Popup></Marker>
        <Marker position={mapTarget.coords}>
          <Popup className="astu-custom-popup">
            <div className="p-2 min-w-[180px]">
              <h3 className="font-extrabold text-blue-600 text-lg border-b pb-1 mb-2">{mapTarget.name}</h3>
              <p className="text-slate-700 text-xs font-mono">Lat: {mapTarget.coords[0]}, Lon: {mapTarget.coords[1]}</p>
            </div>
          </Popup>
        </Marker>
        <RecenterMap coords={mapTarget.coords} />
      </MapContainer>

      {/* OVERLAY CHAT UI - BEAUTIFUL DESIGN */}
      <div className="absolute top-6 left-6 bottom-32 w-full max-w-[400px] z-[4000] flex flex-col gap-4 pointer-events-none">
        {/* Logo/Header */}
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white flex items-center gap-3 pointer-events-auto w-fit">
          <div className="bg-blue-600 p-2 rounded-xl text-white"><Navigation size={18}/></div>
          <h1 className="font-black text-slate-800 tracking-tighter italic">ASTUNav AI</h1>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pointer-events-auto pr-2 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-4 rounded-2xl text-sm max-w-[85%] shadow-xl backdrop-blur-md ${m.isBot ? 'bg-white/90 text-slate-700 border border-white' : 'bg-blue-600/90 text-white border border-blue-400'}`}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white/95 backdrop-blur-2xl p-2 rounded-[32px] shadow-2xl border border-white pointer-events-auto flex items-center gap-2 pr-4">
          <input 
            value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSend()}
            placeholder="Where is the Library?"
            className="flex-1 bg-transparent p-4 outline-none text-slate-800 font-medium placeholder:text-slate-400"
          />
          <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
            <Send size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;