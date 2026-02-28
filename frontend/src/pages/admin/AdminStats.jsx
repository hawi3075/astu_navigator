import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function AdminStats() {
    const [stats, setStats] = useState({ totalUsers: 0, totalBlocks: 0, activeEvents: 0 });

    const loadStats = async () => {
        try {
            // Updated: Changed localhost:5000 to your live Render API URL
            const response = await fetch('https://astu-navigator-api.onrender.com/api/admin/stats');
            const data = await response.json();
            
            // This mapping connects the backend names to your frontend state
            setStats({
                totalUsers: data.totalUsers || 0,
                totalBlocks: data.totalBlocks || 0,
                activeEvents: data.activeEvents || 0
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-3 gap-6">
                <StatCard icon={<ShieldCheck size={20}/>} label="Users" value={stats.totalUsers} color="bg-blue-600" />
                <StatCard icon={<BarChart3 size={20}/>} label="Blocks" value={stats.totalBlocks} color="bg-emerald-500" />
                <StatCard icon={<Zap size={20}/>} label="Events" value={stats.activeEvents} color="bg-orange-500" />
            </div>

            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[32px] text-center">
                <p className="text-blue-600 font-bold">Dashboard updated in real-time.</p>
                <p className="text-blue-400 text-sm">Use the navigation below to manage campus data.</p>
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