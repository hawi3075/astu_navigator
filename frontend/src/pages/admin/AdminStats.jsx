import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, ShieldCheck, Zap } from 'lucide-react';

export default function AdminStats() {
    const [stats, setStats] = useState({ totalUsers: 0, totalBlocks: 0, activeEvents: 0 });

    // 1. Function to fetch real-time data from backend
    const loadStats = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    // 2. Load stats automatically when the page opens
    useEffect(() => {
        loadStats();
    }, []);

    const handlePublishEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const eventData = {
            title: formData.get('title'),
            date: formData.get('date'),
            location: formData.get('location'),
            description: "Campus Event"
        };

        try {
            const response = await fetch('http://localhost:8000/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                alert("Event Published!");
                e.target.reset();
                loadStats(); // 3. 🔄 THIS UPDATES THE COUNTER IMMEDIATELY
            }
        } catch (error) {
            alert("Error connecting to server");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* STAT CARDS */}
            <div className="grid grid-cols-3 gap-6">
                <StatCard icon={<ShieldCheck size={20}/>} label="Users" value={stats.totalUsers} color="bg-blue-600" />
                <StatCard icon={<BarChart3 size={20}/>} label="Blocks" value={stats.totalBlocks} color="bg-emerald-500" />
                <StatCard icon={<Zap size={20}/>} label="Events" value={stats.activeEvents} color="bg-orange-500" />
            </div>

            {/* EVENT FORM */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20}/> Deploy Campus Event
                </h3>
                <form onSubmit={handlePublishEvent} className="space-y-4">
                    <input name="title" placeholder="Event Name (e.g. Graduation 2026)" className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="date" type="date" className="bg-slate-50 p-4 rounded-2xl border-none outline-none" required />
                        <input name="location" placeholder="Location (e.g. Stadium)" className="bg-slate-50 p-4 rounded-2xl border-none outline-none" required />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">Publish Event</button>
                </form>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className={`${color} p-4 rounded-2xl text-white mb-3 shadow-lg`}>{icon}</div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-3xl font-black text-slate-800">{value}</span>
        </div>
    );
}