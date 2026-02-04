"use client";

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  Settings, 
  FileText, 
  Users, 
  Database, 
  Menu,
  X,
  TrendingUp,
  CreditCard,
  BookOpen,
  ChevronRight
} from 'lucide-react';

/**
 * Interface para os itens do Menu
 */
interface MenuItem {
  title: string;
  icon: React.ReactNode;
  roles: string[];
  module: string;
}

/**
 * Definição mestre de menus e permissões do ZeroCore
 */
const MENU_ITEMS: MenuItem[] = [
  { title: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['all'], module: 'home' },
  { title: 'Helpdesk TI', icon: <Settings size={20} />, roles: ['admin', 'supervisor', 'coordenador'], module: 'ti' },
  { title: 'Gestão de Ativos', icon: <Database size={20} />, roles: ['admin', 'supervisor'], module: 'assets' },
  { title: 'Prontuário DP', icon: <Users size={20} />, roles: ['admin', 'diretoria', 'supervisor', 'coordenador'], module: 'dp' },
  { title: 'Cálculo de Bônus', icon: <CreditCard size={20} />, roles: ['admin', 'diretoria', 'advogado'], module: 'bonus' },
  { title: 'Doutrina & Wiki', icon: <BookOpen size={20} />, roles: ['all'], module: 'wiki' },
  { title: 'Configurações', icon: <ShieldCheck size={20} />, roles: ['admin'], module: 'settings' },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile: fechado por padrão
  const [activeModule, setActiveModule] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('zc_token');
    const storedUser = localStorage.getItem('zc_user');

    if (!token || !storedUser) {
      window.location.href = '/login';
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }

    // No desktop, deixamos a sidebar aberta por padrão
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zc_token');
    localStorage.removeItem('zc_user');
    window.location.href = '/login';
  };

  // Filtra itens do menu baseado na role
  const filteredMenu = MENU_ITEMS.filter(item => 
    item.roles.includes('all') || item.roles.includes(user?.role)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <Loader2 className="w-10 h-10 text-[#002147] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800">
      
      {/* OVERLAY PARA MOBILE (Backdrop) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#002147] transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-64 lg:w-72
      `}>
        {/* Branding Sidebar */}
        <div className="p-6 flex items-center justify-between gap-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37] p-2 rounded-lg shrink-0">
              <LayoutDashboard className="text-[#002147]" size={20} />
            </div>
            <span className="font-black text-white tracking-tighter text-xl">
              ZERO<span className="text-[#D4AF37]">CORE</span>
            </span>
          </div>
          {/* Botão fechar apenas visível no Mobile */}
          <button onClick={() => setSidebarOpen(false)} className="text-white md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.module}
              onClick={() => {
                setActiveModule(item.module);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
                activeModule === item.module 
                ? 'bg-[#D4AF37] text-[#002147] shadow-lg shadow-[#D4AF37]/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="shrink-0">{item.icon}</span>
                <span className="font-bold text-sm">{item.title}</span>
              </div>
              {activeModule === item.module && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        {/* User Profile Area Sidebar (Mobile & Desktop) */}
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2 md:hidden">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#002147] font-black">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm truncate">{user?.name}</p>
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* TOPBAR (Responsivo) */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="font-black text-xl text-[#002147] leading-none">
                {MENU_ITEMS.find(i => i.module === activeModule)?.title}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 hidden sm:block">
                MDR Advocacia • Unidade {user?.location || 'Matriz'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Infos do usuário escondidas no Mobile para limpar a barra */}
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-[#002147]">{user?.name}</p>
              <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.15em] leading-none">
                {user?.dept}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-[#002147] font-black shadow-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* CONTENT AREA (Scrollable) */}
        <main className="p-4 md:p-8 flex-1">
          {activeModule === 'home' && (
            <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
              
              {/* Resumo Dinâmico (Grid Responsivo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-blue-500 hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meus Chamados</p>
                  <h4 className="text-3xl font-black mt-2">04</h4>
                  <div className="mt-2 text-[10px] font-bold text-blue-500 bg-blue-50 inline-block px-2 py-1 rounded-md">2 Pendentes</div>
                </div>
                
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-[#D4AF37] hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Bônus</p>
                  <h4 className="text-3xl font-black mt-2">1.250</h4>
                  <div className="mt-2 text-[10px] font-bold text-[#D4AF37] bg-yellow-50 inline-block px-2 py-1 rounded-md">+15% este mês</div>
                </div>

                {user?.role === 'admin' && (
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-red-500 hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertas TI</p>
                    <h4 className="text-3xl font-black mt-2">02</h4>
                    <div className="mt-2 text-[10px] font-bold text-red-500 bg-red-50 inline-block px-2 py-1 rounded-md">Urgente</div>
                  </div>
                )}

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-green-500 hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Docs Pendentes</p>
                  <h4 className="text-3xl font-black mt-2">01</h4>
                  <div className="mt-2 text-[10px] font-bold text-green-500 bg-green-50 inline-block px-2 py-1 rounded-md">Assinatura Digital</div>
                </div>
              </div>

              {/* Seção Principal do Usuário (Responsive Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                      <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#002147] tracking-tight">Atividade Recente</h3>
                      <p className="text-sm text-slate-400 font-medium">Histórico operacional do escritório</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100 group">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 mt-2 sm:mt-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">Acesso realizado via mobile</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Dispositivo iOS • Há 15 min</p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-[10px] font-bold text-slate-300">DETALHES</span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Lateral de Info (Mobile First: vai pra baixo no mobile) */}
                <div className="bg-[#002147] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-lg font-black mb-1">MDR Wiki</h3>
                    <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest mb-6">Conhecimento Jurídico</p>
                    <p className="text-sm text-blue-100 leading-relaxed mb-8">
                      Acesse manuais de TI, doutrina jurídica atualizada e normativos internos do escritório.
                    </p>
                    <button className="w-full py-4 bg-[#D4AF37] text-[#002147] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#bda142] transition-colors">
                      Explorar Base
                    </button>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                </div>

              </div>
            </div>
          )}

          {activeModule === 'ti' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-20" />
              <p className="italic font-medium">Módulo Helpdesk TI em desenvolvimento...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}