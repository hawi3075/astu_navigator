import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Sparkles, Loader2 } from 'lucide-react';

// Marker Fix
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

export default function MapPage() {
  const [messages, setMessages] = useState([{ text: "Welcome to **ASTU Navigator**!", isBot: true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapTarget, setMapTarget] = useState({ coords: ASTU_CENTER, name: "ASTU Campus" });
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    const query = input;
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat', { text: query });
      const reply = response.data.reply;
      setMessages(prev => [...prev, { text: reply, isBot: true }]);
      
      if (reply.toLowerCase().includes("library")) setMapTarget({ coords: [8.5630, 39.2915], name: "Female Library" });
      else if (reply.toLowerCase().includes("registrar")) setMapTarget({ coords: [8.5595, 39.2890], name: "Registrar Office" });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapContainer center={ASTU_CENTER} zoom={17} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" pane="shadowPane" />
        <Polyline positions={[USER_START, mapTarget.coords]} pathOptions={{ color: '#3b82f6', weight: 6, dashArray: '1, 15', className: 'animate-path' }} />
        <Marker position={mapTarget.coords}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-blue-600">{mapTarget.name}</h3>
              <p className="text-[10px] text-slate-500">📍 {mapTarget.coords[0]}, {mapTarget.coords[1]}</p>
            </div>
          </Popup>
        </Marker>
        <RecenterMap coords={mapTarget.coords} />
      </MapContainer>

      {/* Side Chat Panel */}
      <div className="absolute top-6 left-6 bottom-32 w-full max-w-[350px] z-[4000] flex flex-col gap-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white pointer-events-auto flex items-center gap-3 w-fit">
          <Navigation className="text-blue-600" size={20}/>
          <h1 className="font-black text-slate-800 italic uppercase">ASTUNav AI</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pointer-events-auto pr-2 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-2xl text-sm max-w-[90%] shadow-lg ${m.isBot ? 'bg-white text-slate-700' : 'bg-blue-600 text-white'}`}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 pointer-events-auto flex items-center gap-2 pr-4">
          <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSend()} className="flex-1 px-3 py-2 outline-none text-sm" placeholder="Ask for a building..." />
          <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-xl">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}