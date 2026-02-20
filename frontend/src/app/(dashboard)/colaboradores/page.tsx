"use client";

import React, { useState, useEffect } from 'react';
import { X, Briefcase, Edit3, User, PhoneCall, Loader2 } from 'lucide-react';
import { fetchAPI } from '@/utils/api'; // 🔥 Importamos a API para buscar os detalhes do crachá

// IMPORTAÇÃO DOS COMPONENTES SEPARADOS
import EmployeeList from '@/modules/Employees/EmployeeList';
import EmployeeProfile from '@/modules/Employees/EmployeeProfile';

export default function ColaboradoresPage() {
  const [view, setView] = useState('list'); // 'list' ou 'profile'
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Estados do Modal "Crachá"
  const [quickView, setQuickView] = useState<any | null>(null); // Dados básicos vindos da lista
  const [quickViewUser, setQuickViewUser] = useState<any | null>(null); // Dados completos vindos do backend
  const [quickViewLoading, setQuickViewLoading] = useState(false);

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
    setQuickViewUser(null);
  };

  const navigateBack = () => {
    window.history.pushState(null, '', basePath);
    setView('list');
    setSelectedUser(null);
  };

  // 🔥 Função que abre o modal e busca os dados completos no banco
  const handleOpenQuickView = async (emp: any) => {
    setQuickView(emp);
    setQuickViewLoading(true);
    try {
      const res = await fetchAPI(`/employees/${emp.username}`);
      if (res.ok) {
        setQuickViewUser(await res.json());
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do colaborador", error);
    } finally {
      setQuickViewLoading(false);
    }
  };

  // 🔥 Helper para extrair iniciais do username (ex: rildon.pereira -> RP)
  const getInitials = (username: string) => {
    if (!username) return 'UU';
    const parts = username.split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  // Helper para formatar data evitando bugs de fuso horário
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50/50 font-sans">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h3 className="font-black text-[#002147] uppercase text-sm tracking-[0.3em]">Gestão de Pessoas</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">MDR Advocacia • Central Administrativa</p>
        </div>
      </div>

      {view === 'list' ? (
        <EmployeeList onOpenQuickView={handleOpenQuickView} />
      ) : (
        <EmployeeProfile username={selectedUser!} onBack={navigateBack} />
      )}

      {/* Modal QuickView / Crachá */}
      {quickView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white/20 flex flex-col max-h-[90vh]">
            
            {/* Header Crachá */}
            <div className="bg-[#002147] p-8 text-center relative flex-shrink-0">
               <button onClick={() => { setQuickView(null); setQuickViewUser(null); }} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                 <X size={24} />
               </button>

               {/* Foto do Perfil ou Iniciais */}
               {quickViewUser?.photo_url ? (
                 <img src={quickViewUser.photo_url} alt="Foto" className="w-24 h-24 rounded-[2rem] mx-auto mb-4 object-cover shadow-2xl border-4 border-white/10" />
               ) : (
                 <div className="w-24 h-24 rounded-[2rem] bg-[#D4AF37] mx-auto mb-4 flex items-center justify-center text-[#002147] text-3xl font-black shadow-2xl border-4 border-white/10">
                   {getInitials(quickView.username)}
                 </div>
               )}

               <h4 className="text-white font-black text-xl tracking-tight leading-tight">{quickView.full_name}</h4>
               <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-90">@{quickView.username}</p>
            </div>

            {/* Conteúdo Rolável */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-slate-50">
              {quickViewLoading ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-[#002147]" size={32} /></div>
              ) : quickViewUser ? (
                <>
                  {/* Info Profissionais */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h5 className="text-[10px] font-black text-[#002147] uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={14}/> Info. Profissionais</h5>
                    <div className="space-y-2">
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">Cargo:</span> <span className="font-black text-slate-700 uppercase text-right">{quickViewUser.title || '-'}</span></p>
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">Setor:</span> <span className="font-black text-slate-700 uppercase text-right">{quickViewUser.department || '-'}</span></p>
                    </div>
                  </div>

                  {/* Dados Pessoais */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h5 className="text-[10px] font-black text-[#002147] uppercase tracking-widest mb-3 flex items-center gap-2"><User size={14}/> Dados Pessoais</h5>
                    <div className="space-y-2">
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">CPF:</span> <span className="font-black text-slate-700 uppercase">{quickViewUser.cpf || '-'}</span></p>
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">Nasc.:</span> <span className="font-black text-slate-700 uppercase">{formatDate(quickViewUser.birth_date)}</span></p>
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">E-mail:</span> <span className="font-black text-slate-700 lowercase">{quickViewUser.email || '-'}</span></p>
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">Telefone:</span> <span className="font-black text-slate-700 uppercase">{quickViewUser.phone || '-'}</span></p>
                    </div>
                  </div>

                  {/* Contato Emergencia */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2"><PhoneCall size={14}/> Contato de Emergência</h5>
                    <div className="space-y-2">
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">Nome:</span> <span className="font-black text-slate-700 uppercase text-right">{quickViewUser.emergency_name || '-'}</span></p>
                      <p className="text-xs flex justify-between"><span className="text-slate-400 font-bold uppercase">Telefone:</span> <span className="font-black text-slate-700 uppercase">{quickViewUser.emergency_phone || '-'}</span></p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-red-500 font-bold text-xs uppercase">Erro ao carregar dados.</div>
              )}
            </div>

            {/* Ação do Footer */}
            <div className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
               <button 
                  onClick={() => navigateToProfile(quickView.username)} 
                  className="w-full bg-[#002147] text-[#D4AF37] py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
               >
                  <Edit3 size={16} /> Editar Perfil
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}