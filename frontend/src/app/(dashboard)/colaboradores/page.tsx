"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, Briefcase, Edit3 } from 'lucide-react';

// IMPORTAÇÃO DOS COMPONENTES SEPARADOS
import EmployeeList from '@/modules/Employees/EmployeeList';
import EmployeeProfile from '@/modules/Employees/EmployeeProfile';

export default function ColaboradoresPage() {
  const [view, setView] = useState('list'); // 'list' ou 'profile'
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [quickView, setQuickView] = useState<any | null>(null);

  const basePath = '/colaboradores';

  // Sincronização de URL (Deep Linking)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith(`${basePath}/`)) {
        const username = path.replace(`${basePath}/`, '');
        if (username) {
          setSelectedUser(username);
          setView('profile');
        }
      } else {
        setView('list');
        setSelectedUser(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Check inicial no carregamento
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToProfile = (username: string) => {
    window.history.pushState(null, '', `${basePath}/${username}`);
    setSelectedUser(username);
    setView('profile');
    setQuickView(null);
  };

  const navigateBack = () => {
    window.history.pushState(null, '', basePath);
    setView('list');
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50/50 font-sans">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h3 className="font-black text-[#002147] uppercase text-sm tracking-[0.3em]">Gestão de Pessoas</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">MDR Advocacia • Central Administrativa</p>
        </div>
      </div>

      {/* Renderização Condicional de Componentes Externos */}
      {view === 'list' ? (
        <EmployeeList onOpenQuickView={setQuickView} />
      ) : (
        <EmployeeProfile username={selectedUser!} onBack={navigateBack} />
      )}

      {/* Modal QuickView (Bridge entre os componentes) */}
      {quickView && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white/20">
            <div className="bg-[#002147] p-10 text-center relative">
               <button onClick={() => setQuickView(null)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"><X size={24} /></button>
               <div className="w-24 h-24 rounded-[2rem] bg-[#D4AF37] mx-auto mb-6 flex items-center justify-center text-[#002147] text-3xl font-black shadow-2xl border-4 border-white/10">
                 {quickView.full_name.charAt(0)}
               </div>
               <h4 className="text-white font-black text-xl tracking-tight leading-tight">{quickView.full_name}</h4>
               <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80">@{quickView.username}</p>
            </div>
            <div className="p-10 space-y-5">
               <div className="flex items-center gap-4 text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Mail size={18} className="text-[#002147]/30" /> 
                  <span className="text-[11px] font-bold truncate uppercase">{quickView.email || 'NÃO CADASTRADO'}</span>
               </div>
               <div className="flex items-center gap-4 text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Briefcase size={18} className="text-[#002147]/30" /> 
                  <span className="text-[11px] font-bold uppercase truncate">{quickView.title}</span>
               </div>
               <button 
                  onClick={() => navigateToProfile(quickView.username)} 
                  className="w-full bg-[#002147] text-[#D4AF37] py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 mt-6 hover:scale-105 transition-all shadow-2xl"
               >
                  <Edit3 size={18} /> Ver Perfil Completo
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}