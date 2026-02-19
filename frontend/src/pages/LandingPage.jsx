import React from 'react';
import { 
  Navigation, ArrowRight, Phone, Mail, MapPin, 
  MessageSquare, Globe, Zap, Layers, Cpu 
} from 'lucide-react';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-[6000] backdrop-blur-md bg-white/70 border-b border-slate-100 px-8 lg:px-20 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg shadow-blue-500/30">
            <Navigation size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase text-slate-900">ASTUNav</span>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onStart('login')} 
            className="hidden md:block text-sm font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
          >
            Sign In
          </button>

          <button 
            onClick={() => onStart('register')}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95"
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION - FIX: Removed overflow-hidden and h-screen */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-20">
        <img 
          src="/main.png.jpg" 
          alt="ASTU Main Gate" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-slate-900/90 z-10"></div>
        
        <div className="relative z-20 text-center px-6 max-w-7xl">
          <div className="inline-flex items-center gap-2 bg-blue-600/30 backdrop-blur-xl border border-blue-400/30 px-4 py-2 rounded-full mb-8">
            <Zap size={14} className="text-blue-400 fill-blue-400" />
            <span className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen Campus Intelligence</span>
          </div>

          <h1 className="text-white text-6xl lg:text-[110px] font-[1000] uppercase tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
            Navigate ASTU <br /> <span className="text-blue-400 italic">Smartly</span>
          </h1>
          
          <p className="text-white/90 text-lg lg:text-2xl font-bold max-w-3xl mx-auto mb-12 uppercase tracking-wide leading-relaxed">
            ASTUNav is a sophisticated spatial platform designed to help students and visitors master the Adama Science and Technology University campus.
          </p>

          <button 
            onClick={() => onStart('login')}
            className="mx-auto bg-blue-600 text-white px-12 py-6 rounded-full font-black text-sm uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-white hover:text-blue-600 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.4)] active:scale-95 group"
          >
            Start Exploring <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* 3. DETAILED PROJECT EXPLANATION */}
      <section className="py-32 px-8 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                Bridging the gap between <br /><span className="text-blue-600">Space and Location.</span>
              </h2>
              <p className="text-slate-600 text-lg font-medium leading-relaxed">
                ASTUNav was developed to solve the "last-mile" navigation problem—helping you find specific offices and laboratories across the vast ASTU infrastructure.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <Cpu className="text-blue-600 mb-2" size={24} />
                  <h4 className="font-black text-xs uppercase tracking-widest mb-1">AI Logic</h4>
                  <p className="text-slate-500 text-xs font-bold">Processes complex queries to find exact coordinates.</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <Layers className="text-blue-600 mb-2" size={24} />
                  <h4 className="font-black text-xs uppercase tracking-widest mb-1">Live Sync</h4>
                  <p className="text-slate-500 text-xs font-bold">Synchronized with official university hall assignments.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
               <FeatureBox 
                  icon={MessageSquare} 
                  title="Semantic AI Search" 
                  desc="Chat naturally with our system. The AI understands context and intent." 
               />
               <FeatureBox 
                  icon={Globe} 
                  title="Satellite Mapping" 
                  desc="High-fidelity satellite imagery provides a real-world perspective." 
               />
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section className="py-24 px-8 lg:px-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-12">Contact <span className="text-blue-600">Offices</span></h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <ContactInfo 
              name="International Relations Office"
              phone="+251-22-211-3961"
              email="irccd@astu.edu.et"
              loc="P.O.Box: 1888 Adama, Ethiopia"
            />
            <ContactInfo 
              name="Office of Registrar"
              phone="+251-221-100001"
              email="sar@astu.edu.et"
              loc="P.O.Box: 1888 Adama, Ethiopia"
            />
          </div>
        </div>
      </section>

      <footer className="py-10 text-center bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
        © 2026 ASTUNav AI System
      </footer>
    </div>
  );
}

const FeatureBox = ({ icon: Icon, title, desc }) => (
  <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-black uppercase mb-3 text-slate-900">{title}</h3>
    <p className="text-slate-500 font-medium text-sm">{desc}</p>
  </div>
);

const ContactInfo = ({ name, phone, email, loc }) => (
  <div className="bg-white border border-slate-200 p-10 rounded-[40px]">
    <h3 className="text-xl font-black uppercase mb-8 text-blue-600">{name}</h3>
    <div className="space-y-4 text-slate-600 font-bold text-xs">
      <div className="flex items-center gap-3"><Phone size={16} className="text-blue-500"/> {phone}</div>
      <div className="flex items-center gap-3"><Mail size={16} className="text-blue-500"/> {email}</div>
      <div className="flex items-center gap-3"><MapPin size={16} className="text-blue-500"/> {loc}</div>
    </div>
  </div>
);