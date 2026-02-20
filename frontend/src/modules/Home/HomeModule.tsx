"use client";

import React from 'react';
import Link from 'next/link'; // 🔥 Import adicionado para navegação SPA
import { LayoutDashboard, Bell, Users, ShieldCheck } from 'lucide-react';

export const HomeModule = ({ user }: { user: any }) => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Bem-vindo */}
      <div className="bg-[#002147] rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <LayoutDashboard size={150} />
        </div>
        <div className="relative z-10">
          <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em] mb-4">MDR Advocacia • ZeroCore</p>
          <h1 className="text-4xl font-black tracking-tighter mb-2 italic uppercase">Bom dia, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-slate-300 font-bold text-sm max-w-xl leading-relaxed uppercase">
            Bem-vindo à central administrativa. Aqui você gere os acessos ao Active Directory e os comunicados internos.
          </p>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🔥 Trocado a tag <a> clássica pelo componente <Link> */}
        <Link href="/avisos" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="bg-blue-50 text-[#002147] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Bell size={28} />
          </div>
          <h4 className="text-[#002147] font-black text-xs uppercase tracking-widest mb-2">Comunicados</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase leading-tight">Poste novos avisos para os setores da MDR.</p>
        </Link>

        {/* 🔥 Trocado a tag <a> clássica pelo componente <Link> */}
        <Link href="/colaboradores" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="bg-amber-50 text-[#D4AF37] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <h4 className="text-[#002147] font-black text-xs uppercase tracking-widest mb-2">Colaboradores</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase leading-tight">Gira os perfis e grupos de segurança no AD.</p>
        </Link>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="bg-slate-50 text-slate-300 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={28} />
          </div>
          <h4 className="text-[#002147] font-black text-[10px] uppercase tracking-[0.2em]">{user?.role}</h4>
          <p className="text-slate-400 text-[9px] font-black uppercase mt-1 tracking-tighter">Nível de Acesso MDR</p>
        </div>
      </div>
    </div>
  );
};