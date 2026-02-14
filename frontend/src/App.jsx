import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, MapPin, Bot, User, Loader2 } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the ASTU Navigator. Ask me where any office or building is!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Connect to your FastAPI backend (Port 8000)
      const response = await axios.post('http://127.0.0.1:8000/chat', { 
        text: input 
      });
      
      setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Error: Is your backend running on port 8000?", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={24} className="text-blue-200" />
          <h1 className="text-xl font-bold tracking-tight">ASTU Navigator</h1>
        </div>
        <span className="text-xs bg-blue-600 px-2 py-1 rounded-full border border-blue-400">2026 AI Edition</span>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm flex gap-3 ${
              msg.isBot ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'
            }`}>
              <div className="mt-1">
                {msg.isBot ? <Bot size={20} className="text-blue-600" /> : <User size={20} />}
              </div>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm italic">Searching campus data...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Bar */}
      <footer className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about registrar, library, or blocks..."
          className="flex-1 border border-gray-300 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-800 disabled:bg-blue-300 transition-colors shadow-md"
        >
          <Send size={22} />
        </button>
      </footer>
    </div>
  );
}

export default App;