import React from 'react';
import { User, Bell, Shield, Moon } from 'lucide-react';

export default function SettingsPage() {
  const settings = [
    { icon: User, label: "Profile", val: "iDesire User" },
    { icon: Bell, label: "Notifications", val: "On" },
    { icon: Moon, label: "Dark Mode", val: "Off" },
    { icon: Shield, label: "Privacy", val: "Strict" }
  ];
  return (
    <div className="app-shell h-screen p-10 bg-slate-50">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">App Settings</h2>
      <div className="max-w-md space-y-3">
        {settings.map(s => (
          <div key={s.label} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <s.icon className="text-blue-600" size={18}/>
              <span className="font-medium text-slate-700">{s.label}</span>
            </div>
            <span className="text-slate-400 text-sm">{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}