import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, Navigation, Loader2, Sparkles, Bookmark, ArrowLeft } from 'lucide-react'; 
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- LEAFLET ASSET FIX ---
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

// ✅ FIX 1: Ensure onNavigate is accepted as a prop
export default function MapPage({ onNavigate }) {
  const [messages, setMessages] = useState([
    { text: "Welcome to ASTU! Ask me to find any building like **Oda Nabe Hall**.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbLocations, setDbLocations] = useState([]); 
  const [mapTarget, setMapTarget] = useState({ coords: ASTU_CENTER, name: "ASTU Campus", category: "General" });
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchLocs = async () => {
      try {
        // ✅ FIX 2: Ensure your backend is running on port 8000
        const res = await axios.get('http://localhost:8000/api/admin/locations_list');
        setDbLocations(res.data);
      } catch (err) { 
        console.error("Backend unreachable. Ensure FastAPI is running."); 
      }
    };
    fetchLocs();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSaveLocation = async (locationName) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please log in again to save locations.");
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/save-location', {
        user_email: userEmail,
        location_name: locationName
      });
      alert("Location saved to your profile!");
    } catch (err) {
      alert("Failed to save location.");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', { message: userText });
      const { reply, target } = response.data;
      if (target) {
        setMapTarget({ coords: [target.lat, target.lng], name: target.name, category: "Target" });
      }
      setMessages(prev => [...prev, { text: reply, isBot: true }]);
    } catch (e) { 
      setMessages(prev => [...prev, { text: "Connection error.", isBot: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* ✅ FIX 3: Back to Home Header (fixes browser back button issue) */}
      <div className="bg-white px-6 py-4 flex items-center border-b border-slate-200 sticky top-0 z-[2000]">
        <button 
          onClick={() => onNavigate('Home')} 
          className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h2 className="text-lg font-bold text-slate-800">Campus Navigator</h2>
      </div>

      <div className="flex flex-1 overflow-hidden p-4 gap-4 pb-24">
        
        {/* Chat Sidebar */}
        <div className="w-80 lg:w-96 flex flex-col bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <header className="p-5 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation size={20} className="rotate-45" />
              <span className="font-bold text-lg">ASTUNav AI</span>
            </div>
            <Sparkles size={18} className="animate-pulse" />
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.isBot ? 'bg-slate-100' : 'bg-blue-600 text-white'}`}>
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
                className="w-full bg-slate-100 rounded-xl p-3 pr-12 outline-none" 
                placeholder="Ask me anything..." 
              />
              <button onClick={handleSend} disabled={loading} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white bg-white">
          <MapContainer center={ASTU_CENTER} zoom={16} className="h-full w-full" zoomControl={false} maxBounds={ADAMA_BOUNDS}>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            <Marker position={USER_START} icon={userIcon}><Popup>You are here</Popup></Marker>
            <Polyline positions={[USER_START, mapTarget.coords]} pathOptions={{ color: '#3b82f6', weight: 5, dashArray: '12, 12' }} />
            
            {dbLocations.map((loc) => (
              <Marker key={loc._id} position={[loc.latitude, loc.longitude]} icon={getIcon(loc.category, mapTarget.name === loc.name)}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-slate-800 text-sm mb-2">{loc.name}</p>
                    <button 
                      onClick={() => handleSaveLocation(loc.name)}
                      className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all w-full justify-center"
                    >
                      <Bookmark size={14} /> Save Location
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            <RecenterMap coords={mapTarget.coords} />
          </MapContainer>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full shadow-lg z-[1000] border border-blue-100">
            <span className="text-sm font-bold">To: <span className="text-blue-600">{mapTarget.name}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}