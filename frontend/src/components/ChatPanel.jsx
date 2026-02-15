import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2, Navigation } from 'lucide-react';

export default function ChatPanel({ messages, input, setInput, handleSend, loading }) {
  return (
    <div className="absolute top-6 left-6 w-80 md:w-96 bottom-32 flex flex-col gap-4 z-[4000] pointer-events-none">
      {/* Header Card */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white pointer-events-auto flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-200 shadow-lg"><Navigation size={18}/></div>
        <div>
          <h1 className="font-black text-slate-800 leading-none">ASTUNav AI</h1>
          <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Satellite Live</span>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pointer-events-auto pr-2 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-3 rounded-2xl text-sm max-w-[90%] shadow-lg ${m.isBot ? 'bg-white text-slate-700 border border-slate-100' : 'bg-blue-600 text-white'}`}>
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 pointer-events-auto flex items-center gap-2">
        <input 
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Where is the Library?"
          className="flex-1 bg-transparent px-3 py-2 outline-none text-slate-800 text-sm"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}