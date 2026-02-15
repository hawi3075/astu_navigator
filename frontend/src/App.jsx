import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Sparkles, Bot, User, Loader2, Home, MapPin, Bookmark, Settings } from 'lucide-react';

// Fix for Leaflet default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ 
  iconUrl: markerIcon, 
  shadowUrl: markerShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Constants
const USER_START = [8.5640, 39.2900]; 
const ASTU_CENTER = [8.5615, 39.2908];

// Smooth gliding map movement
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { 
    if (coords) map.flyTo(coords, 18, { duration: 2.5 }); 
  }, [coords]);
  return null;
}

function App() {
  const [messages, setMessages] = useState([
    { text: "Welcome to **ASTU Navigator**. Ask me for a location and I'll show you the way!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // mapTarget now stores both the coordinates and the name for the popup
  const [mapTarget, setMapTarget] = useState({
    coords: ASTU_CENTER,
    name: "ASTU Campus"
  });

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
      
      // Logic to update destination based on AI reply
      if (lowerReply.includes("library")) {
        setMapTarget({ coords: [8.5630, 39.2915], name: "Female Library" });
      } else if (lowerReply.includes("registrar")) {
        setMapTarget({ coords: [8.5595, 39.2890], name: "Registrar Office" });
      } else if (lowerReply.includes("block 1")) {
        setMapTarget({ coords: [8.5620, 39.2910], name: "Academic Block 1" });
      } else if (lowerReply.includes("cafe")) {
        setMapTarget({ coords: [8.5612, 39.2920], name: "Campus Cafe" });
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "**Error:** Backend is offline.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden">
      
      {/* LEFT SIDEBAR: CHAT */}
      <div className="w-[420px] h-full flex flex-col bg-white border-r z-20 shadow-2xl">
        <header className="p-5 border-b flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg"><Navigation size={20}/></div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight">ASTUNav AI</h1>
          </div>
          <Sparkles className="text-blue-500 animate-pulse" size={20}/>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-4 rounded-2xl text-sm max-w-[85%] shadow-sm ${m.isBot ? 'bg-white text-slate-700 border' : 'bg-blue-600 text-white shadow-md'}`}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <div className="flex justify-start pl-10"><Loader2 size={18} className="animate-spin text-blue-500" /></div>}
          <div ref={chatEndRef} />
        </main>

        <footer className="p-4 bg-white border-t pb-8 md:pb-6 relative z-30">
          <div className="relative flex items-center">
            <input 
              value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSend()}
              className="w-full bg-slate-100 rounded-2xl p-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700" 
              placeholder="Where is the Library?" 
            />
            <button onClick={handleSend} className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700"><Send size={20}/></button>
          </div>
        </footer>
      </div>

      {/* RIGHT SIDE: HYBRID SATELLITE MAP */}
      <div className="flex-1 relative">
        <MapContainer center={ASTU_CENTER} zoom={17} className="h-full w-full" zoomControl={false}>
          {/* 🛰️ LAYER 1: Satellite View */}
          <TileLayer 
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri'
          />
          {/* 🏷️ LAYER 2: Road Names & Labels */}
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            pane="shadowPane"
          />

          {/* 🚶 ANIMATED GPS PATH */}
          <Polyline 
            positions={[USER_START, mapTarget.coords]} 
            pathOptions={{
              color: '#3b82f6', 
              weight: 7, 
              opacity: 0.9, 
              dashArray: '1, 15', 
              className: 'animate-path'
            }} 
          />

          <Marker position={USER_START}><Popup>You are here (Entrance)</Popup></Marker>

          {/* 📍 DESTINATION MARKER WITH DYNAMIC POPUP */}
          <Marker position={mapTarget.coords}>
            <Popup className="astu-custom-popup">
              <div className="p-2 min-w-[180px]">
                <h3 className="font-extrabold text-blue-600 text-lg border-b pb-1 mb-2">
                  {mapTarget.name}
                </h3>
                <p className="text-slate-700 text-sm font-medium leading-tight">
                  📍 Verified Building Location: <br/>
                  <span className="text-blue-500 text-xs font-mono">
                    Lat: {mapTarget.coords[0].toFixed(4)}, Lon: {mapTarget.coords[1].toFixed(4)}
                  </span>
                </p>
                <div className="mt-3 bg-blue-600 p-2 rounded-lg text-center shadow-md">
                  <p className="text-[10px] text-white uppercase font-black tracking-widest">
                    ASTU Navigator Verified
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>

          <RecenterMap coords={mapTarget.coords} />
        </MapContainer>

        {/* HUD UI OVERLAY */}
        <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Find Anywhere</h2>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] mt-1 tracking-widest">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span> 
              ADAMA TOWN HYBRID LIVE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;