"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Loader2, Megaphone, Paperclip, CheckCircle2, Archive as ArchiveIcon } from 'lucide-react';
import { UserData } from '../../types/user';

// IMPORTANTE: Certifique-se de que estes componentes existem no seu projeto
import { CreateModal } from '../Announcements/CreateModal';
import { AnnouncementDetailModal } from '../Announcements/AnnouncementDetailModal';

/**
 * Utilitário de API centralizado para o Mural.
 * Usa o Proxy (/api) e força o envio de Cookies.
 */
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = "/api";
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: { 
        'Content-Type': 'application/json', 
        ...options.headers 
      },
      credentials: 'include', // 🔥 ESSENCIAL: Garante que o cookie zc_token seja enviado
    });

    if (response.status === 401) {
      console.warn("🚨 [Mural] Sessão expirada no servidor.");
      localStorage.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(new Error("Sessão Expirada"));
    }
    return response;
  } catch (error) { 
    console.error("🚨 [Mural] Erro de comunicação via Proxy:", error);
    throw error; 
  }
};

export const MuralModule = ({ user }: { user: UserData | null }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewArchived, setViewArchived] = useState(false);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<any | null>(null);

  // Lógica de permissões restaurada
  const isPrivileged = user && (
    user.role === 'admin' || 
    user.role === 'diretoria' || 
    user.role === 'coordenador' ||
    user.permissions?.includes('post_general') ||
    user.permissions?.includes('post_tech')
  );

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      /**
       * 🔥 A SOLUÇÃO PARA O ERRO net::ERR_NAME_NOT_RESOLVED:
       * Adicionamos a barra "/" ANTES do "?" para bater na rota exata do FastAPI.
       * Isso impede o Redirect 307 que vaza o nome interno "backend:8000".
       */
      const url = `/announcements?category=${activeTab}&show_archived=${viewArchived}`;
      const res = await fetchAPI(url);
      
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (e) { 
      console.error("Erro ao carregar avisos:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchAnnouncements(); 
  }, [activeTab, viewArchived]);

  const categories = [
    { id: 'ALL', label: 'Todos' },
    { id: 'GENERAL', label: 'Institucional' },
    { id: 'SECTOR', label: 'Setoriais' },
    { id: 'TECH', label: 'Técnicos' },
    { id: 'OPS_MGMT', label: 'Gestão' }
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header e Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-[#002147] uppercase text-sm tracking-[0.3em]">Comunicação Interna</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {viewArchived ? '📁 Arquivo de Comunicados' : 'Mural de Avisos e Portarias'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isPrivileged && (
            <button 
              onClick={() => { setViewArchived(!viewArchived); setActiveTab('ALL'); }}
              className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border ${
                viewArchived 
                ? 'bg-amber-100 text-amber-700 border-amber-200' 
                : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <ArchiveIcon size={14} /> {viewArchived ? 'Ver Ativos' : 'Arquivados'}
            </button>
          )}

          {isPrivileged && !viewArchived && (
            <button 
              onClick={() => setIsCreateOpen(true)} 
              className="bg-[#002147] text-[#D4AF37] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              <Plus size={16} /> Novo Comunicado
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === cat.id 
                ? 'bg-white text-[#002147] shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Avisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></div>
        ) : announcements.length > 0 ? (
          announcements.map((ann) => (
            <div 
              key={ann.id} 
              onClick={() => setSelectedAnn(ann)}
              className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${ann.is_archived ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              <div className={`absolute top-0 right-8 px-4 py-1.5 rounded-b-xl text-[8px] font-black uppercase tracking-widest ${
                ann.category === 'TECH' ? 'bg-blue-500 text-white' : 
                ann.category === 'GENERAL' ? 'bg-[#002147] text-[#D4AF37]' : 
                ann.category === 'SECTOR' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {ann.category === 'SECTOR' ? ann.target_dept : ann.category}
              </div>

              <div className="mb-4">
                <h4 className="font-black text-slate-800 text-base leading-tight group-hover:text-[#002147] transition-colors line-clamp-2 pr-10">
                  {ann.title}
                </h4>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6 font-medium">
                {ann.content}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  {ann.attachment_url && (
                    <div className="flex items-center gap-1 text-[#002147] bg-slate-50 px-2 py-1 rounded-md">
                      <Paperclip size={12} />
                      <span className="text-[10px] font-bold">Anexo</span>
                    </div>
                  )}
                  {ann.has_acknowledged && (
                    <CheckCircle2 size={16} className="text-green-500" />
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Por {ann.author_name}</p>
                  <p className="text-[8px] font-bold text-slate-400 mt-0.5">{new Date(ann.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <Megaphone size={40} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">
               {viewArchived ? 'Arquivo vazio' : 'Nenhum comunicado encontrado'}
             </p>
          </div>
        )}
      </div>

      <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} user={user} onSuccess={fetchAnnouncements} />
      
      {selectedAnn && (
        <AnnouncementDetailModal 
          ann={selectedAnn} 
          user={user} 
          onClose={() => setSelectedAnn(null)} 
          onRefresh={fetchAnnouncements}
        />
      )}
    </div>
  );
};