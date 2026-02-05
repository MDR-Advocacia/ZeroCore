"use client";

import React from 'react';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  Smartphone, 
  TrendingUp 
} from 'lucide-react';
import { UserData } from '../../types/user';

export const HomeModule = ({ user }: { user: UserData | null }) => {
  const stats = [
    { label: 'Chamados TI', val: '142', icon: <Activity />, color: 'blue' },
    { label: 'Escritório Online', val: '18', icon: <CheckCircle />, color: 'green' },
    { label: 'Prazos DP', val: '05', icon: <Clock />, color: 'amber' },
    { label: 'Acesso Mobile', val: '64%', icon: <Smartphone />, color: 'purple' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="bg-slate-50 p-4 rounded-2xl text-[#002147]">{card.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <h4 className="text-2xl font-black text-[#002147] tracking-tighter">{card.val}</h4>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-16 rounded-[4rem] border border-slate-100 min-h-[450px] flex flex-col items-center justify-center text-center shadow-sm">
        <div className="bg-slate-50 p-8 rounded-full mb-6"><TrendingUp size={48} className="text-slate-200" /></div>
        <h3 className="text-slate-400 font-black uppercase tracking-[0.4em] text-sm italic">MDR • Performance Operacional</h3>
        <p className="text-slate-300 text-[10px] font-bold mt-4 uppercase tracking-[0.2em]">Sincronizando métricas em tempo real...</p>
      </div>
    </div>
  );
};