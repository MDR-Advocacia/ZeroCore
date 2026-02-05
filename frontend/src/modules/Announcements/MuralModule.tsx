"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Loader2, Megaphone } from 'lucide-react';
import { Announcement, UserData } from '../../types/user';
import { CreateModal } from './CreateModal';

interface MuralProps {
  user: UserData | null;
}

export const MuralModule = ({ user }: MuralProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem('zc_token');
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/announcements/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Erro ao buscar:", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-[#002147] uppercase text-sm tracking-[0.3em]">Mural de Comunicação</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Feed de notícias do escritório</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#002147] text-[#D4AF37] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95">
          <Plus size={18} /> Novo Aviso
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
             <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></div>
          ) : announcements.length > 0 ? (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-5 mb-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-[#002147] group-hover:bg-[#002147] group-hover:text-[#D4AF37] transition-all"><Bell size={20} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 tracking-tight text-lg">{ann.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{ann.category} • {new Date(ann.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap pl-1">{ann.content}</p>
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
              <Megaphone size={48} className="mx-auto text-slate-100 mb-4" />
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">O mural está vazio no momento</p>
            </div>
          )}
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 h-fit shadow-sm">
           <h4 className="font-black text-[#002147] text-[10px] uppercase tracking-[0.3em] mb-6">Informação</h4>
           <p className="text-xs text-slate-400 leading-relaxed font-medium">Este painel é regulado por cargo e setor.</p>
        </div>
      </div>

      <CreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} onSuccess={fetchAnnouncements} />
    </div>
  );
};