import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Sparkles, Bookmark, ArrowLeft, MapPin } from 'lucide-react'; 
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- LEAFLET ASSET FIX ---
const getIcon = (category, isTarget) => {
  let color = 'blue'; 
  const cat = category?.toLowerCase() || "";
  if (isTarget) color = 'red';
  else if (cat.includes('dorm')) color = 'green';
  else if (cat.includes('hall') || cat.includes('oda')) color = 'orange';

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

const ASTU_CENTER = [8.5615, 39.2908];
const USER_START = [8.5640, 39.2900];

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { 
    if (coords) map.flyTo(coords, 18, { duration: 1.5 }); 
  }, [coords, map]);
  return null;
}

export default function MapPage({ onNavigate }) {
  const [messages, setMessages] = useState([
    { text: "Welcome to ASTU! Ask me to find any building like **Oda Nabe Hall**.", isBot: true }
  ]);
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
      } catch (err) { console.error("Database connection failed."); }
    };
    fetchLocs();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.toLowerCase().trim();
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput("");
    setLoading(true);

    // ✅ 1. Handle Greetings (Fixes the "hi" problem)
    const greetings = ['hi', 'hello', 'hey', 'yo', 'good morning', 'good afternoon'];
    if (greetings.includes(userText)) {
      setMessages(prev => [...prev, { text: "Hello! I'm your ASTU Campus Assistant. How can I help you find your way today?", isBot: true }]);
      setLoading(false);
      return;
    }

    // ✅ 2. Handle Building Search (Fuzzy Matching)
    const foundLoc = dbLocations.find(loc => 
      userText.includes(loc.name.toLowerCase()) || 
      loc.name.toLowerCase().includes(userText)
    );

    if (foundLoc) {
      setMapTarget({ coords: [foundLoc.latitude, foundLoc.longitude], name: foundLoc.name });
      setMessages(prev => [...prev, { 
        text: `I've located **${foundLoc.name}** for you. Look for the red marker on the map!`, 
        isBot: true 
      }]);
      setLoading(false);
      return;
    }

    // 3. AI Fallback (If not a greeting and not in DB)
    try {
      const response = await axios.post('http://localhost:8000/api/chat', { message: input });
      const { reply, target } = response.data;
      if (target) setMapTarget({ coords: [target.lat, target.lng], name: target.name });
      setMessages(prev => [...prev, { text: reply || "I'm not sure about that specific location. Could you try a different building name?", isBot: true }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: "I'm having trouble connecting right now. Please check if the server is running.", isBot: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b z-[2000]">
        <div className="flex items-center">
          <button onClick={() => onNavigate('Home')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Campus Navigator</h2>
        </div>
        <div className="hidden sm:block bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
          <span className="text-xs font-black text-slate-700 uppercase">Focusing: <span className="text-blue-600">{mapTarget.name}</span></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-4 gap-4 mb-20">
        <div className="w-80 lg:w-[400px] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <header className="p-6 bg-blue-600 text-white font-black text-xl flex justify-between">
            AI Assistant <Sparkles size={20} className="animate-pulse" />
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-4 rounded-2xl text-sm shadow-sm ${m.isBot ? 'bg-white text-slate-700 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'} max-w-[90%] break-words`}>
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
                className="w-full bg-slate-100 rounded-2xl p-4 pr-14 outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                placeholder="Where is Oda Nabe Hall?" 
              />
              <button onClick={handleSend} disabled={loading} className="absolute right-2 p-3 bg-blue-600 text-white rounded-xl active:scale-95 transition-all">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20}/>}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-[3rem] overflow-hidden relative border-8 border-white bg-white shadow-2xl">
          <MapContainer center={ASTU_CENTER} zoom={16} className="h-full w-full">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            <Marker position={USER_START} icon={userIcon}><Popup>You are here</Popup></Marker>
            <Polyline positions={[USER_START, mapTarget.coords]} pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10' }} />
            {dbLocations.map((loc) => (
              <Marker key={loc._id} position={[loc.latitude, loc.longitude]} icon={getIcon(loc.category, mapTarget.name === loc.name)}>
                <Popup className="font-bold">{loc.name}</Popup>
              </Marker>
            ))}
            <RecenterMap coords={mapTarget.coords} />
          </MapContainer>
          
          <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Navigation size={20} className="rotate-45" /></div>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase leading-none mb-1">Navigation Active</p>
              <p className="text-sm font-black text-slate-800 tracking-tight">{mapTarget.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}