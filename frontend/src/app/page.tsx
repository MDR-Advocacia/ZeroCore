"use client";

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  LayoutDashboard, 
  Bell, 
  Settings, 
  Database, 
  Users, 
  CreditCard, 
  BookOpen, 
  ShieldCheck, 
  Menu 
} from 'lucide-react';

// Importações dos Componentes Modulares
import { Sidebar } from '../components/Sidebar';
import { HomeModule } from '../modules/Home/HomeModule';
import { MuralModule } from '../modules/Announcements/MuralModule';
import { MenuItem, UserData } from '../types/user';

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('zc_token');
    const storedUser = localStorage.getItem('zc_user');
    if (!token || !storedUser) { 
      window.location.assign(window.location.origin + '/login'); 
    } else { 
      setUser(JSON.parse(storedUser)); 
      setLoading(false); 
    }
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, []);

  const MENU_ITEMS: MenuItem[] = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['all'], module: 'home' },
    { title: 'Mural de Avisos', icon: <Bell size={20} />, roles: ['all'], module: 'announcements' },
    { title: 'Helpdesk TI', icon: <Settings size={20} />, roles: ['admin', 'supervisor'], module: 'ti' },
    { title: 'Gestão de Ativos', icon: <Database size={20} />, roles: ['admin', 'supervisor'], module: 'assets' },
    { title: 'Prontuário DP', icon: <Users size={20} />, roles: ['admin', 'diretoria', 'supervisor', 'coordenador'], module: 'dp' },
    { title: 'Cálculo de Bônus', icon: <CreditCard size={20} />, roles: ['admin', 'diretoria', 'advogado'], module: 'bonus' },
    { title: 'Wiki MDR', icon: <BookOpen size={20} />, roles: ['all'], module: 'wiki' },
    { title: 'Configurações', icon: <ShieldCheck size={20} />, roles: ['admin'], module: 'settings' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-[#002147]" size={40} />
    </div>
  );

  const filteredMenu = MENU_ITEMS.filter(item => 
    item.roles.includes('all') || (user && item.roles.includes(user.role))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 font-sans selection:bg-[#D4AF37] selection:text-[#002147]">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
        user={user}
        menuItems={filteredMenu}
      />

      <div className="flex-1 flex flex-col min-h-screen relative">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 md:px-14 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-3 bg-slate-50 rounded-xl">
              <Menu size={24} />
            </button>
            <h2 className="font-black text-2xl text-[#002147] uppercase tracking-tighter italic">
              {MENU_ITEMS.find(i => i.module === activeModule)?.title}
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="font-black text-sm text-[#002147] leading-none tracking-tight">{user?.name}</p>
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.15em] mt-1">{user?.role} • {user?.dept}</p>
            </div>
            <div className="w-14 h-14 bg-[#002147] text-[#D4AF37] rounded-2xl flex items-center justify-center font-black shadow-xl text-xl ring-4 ring-slate-50">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-6 md:p-14 flex-1 overflow-y-auto">
          {activeModule === 'home' && <HomeModule user={user} />}
          {activeModule === 'announcements' && <MuralModule user={user} />}
          
          {activeModule !== 'home' && activeModule !== 'announcements' && (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 italic text-slate-200 font-black uppercase tracking-[0.4em]">
              Módulo em construção
            </div>
          )}
        </main>
      </div>
    </div>
  );
}