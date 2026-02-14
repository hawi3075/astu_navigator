import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Added for better text formatting
import { Send, MapPin, Bot, User, Loader2, Sparkles, Navigation } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the **ASTU Navigator**. You can ask me about campus blocks, offices, or cafes!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Suggested questions for the user (2026 UX Tip)
  const suggestions = ["Where is the Library?", "Registrar Office location", "Cafe recommendations"];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textOverride = null) => {
    const messageToSend = textOverride || input;
    if (!messageToSend.trim()) return;

    setMessages(prev => [...prev, { text: messageToSend, isBot: false }]);
    if (!textOverride) setInput("");
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat', { text: messageToSend });
      setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "**Error:** Backend offline. Please check port 8000.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* 2026 Modern Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Navigation size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ASTU Navigator</h1>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live Campus AI
            </div>
          </div>
        </div>
        <Sparkles size={20} className="text-blue-500" />
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 md:px-20 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end animate-in slide-in-from-right-5'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white'}`}>
                {msg.isBot ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm prose prose-sm ${msg.isBot ? 'bg-white border border-slate-200' : 'bg-blue-600 text-white prose-invert'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center gap-2 text-slate-400 italic text-sm pl-12">
            <Loader2 size={16} className="animate-spin" /> Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Footer & Input */}
      <footer className="p-4 bg-white border-t border-slate-200 md:px-20">
        {/* Suggestion Chips */}
        {!loading && messages.length < 3 && (
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {suggestions.map(s => (
              <button key={s} onClick={() => handleSend(s)} className="whitespace-nowrap bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-4 py-2 rounded-full text-xs font-medium transition-all border border-slate-200">
                {s}
              </button>
            ))}
          </div>
        )}
        
        <div className="relative flex items-center">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 pr-14 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;