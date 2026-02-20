"use client";

import React from 'react';
import { LogOut, Bell, Users, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { fetchAPI } from '@/utils/api';

export const Sidebar = ({ user }: { user: any }) => {
  const handleLogout = async () => {
    try {
      // 1. Avisa o backend para deletar o Cookie HttpOnly
      await fetchAPI('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error("Erro ao invalidar cookie no servidor");
    } finally {
      // 2. Limpa o lixo local e volta para o login
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const menu = [
    { title: 'Início', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { title: 'Avisos', icon: <Bell size={20} />, path: '/avisos' },
    { title: 'Pessoas', icon: <Users size={20} />, path: '/colaboradores' },
  ];

  return (
    <aside className="w-72 bg-[#002147] flex flex-col h-screen shadow-2xl shrink-0">
      <div className="p-8 flex items-center gap-3">
        <ShieldAlert className="text-[#D4AF37]" size={24} />
        <span className="font-black text-white text-xl uppercase italic">ZeroCore</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menu.map(item => (
          <a key={item.path} href={item.path} className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-[#D4AF37] transition-all">
            {item.icon}
            <span className="text-[11px] font-black uppercase tracking-widest">{item.title}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-2">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#002147] font-black text-xs">
            {user?.full_name?.charAt(0)}
          </div>
          <p className="text-[10px] font-black text-white uppercase truncate">{user?.full_name?.split(' ')[0]}</p>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut size={20} />
          <span className="text-[11px] font-black uppercase tracking-widest">Sair</span>
        </button>
      </div>
    </aside>
  );
};