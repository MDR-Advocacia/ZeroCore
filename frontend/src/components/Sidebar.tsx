"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  LogOut, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { MenuItem, UserData } from '../types/user';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  user: UserData | null;
  menuItems: MenuItem[];
}

export const Sidebar = ({ 
  isOpen, 
  setOpen, 
  activeModule, 
  setActiveModule, 
  user, 
  menuItems 
}: SidebarProps) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Backdrop Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden" 
          onClick={() => setOpen(false)} 
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-[#002147] transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-64 lg:w-72
      `}>
        {/* Branding */}
        <div className="p-10 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37] p-2 rounded-lg shrink-0">
              <LayoutDashboard className="text-[#002147]" size={20} />
            </div>
            <span className="font-black text-white tracking-tighter text-xl uppercase italic">
              Zero<span className="text-[#D4AF37] not-italic">Core</span>
            </span>
          </div>
          <button onClick={() => setOpen(false)} className="text-white md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-10 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.module}
              onClick={() => {
                setActiveModule(item.module);
                if (window.innerWidth < 768) setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm uppercase tracking-tight group ${
                activeModule === item.module 
                ? 'bg-[#D4AF37] text-[#002147] shadow-xl translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="shrink-0">{item.icon}</span>
                <span>{item.title}</span>
              </div>
              {activeModule === item.module && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-8 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-red-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/10 rounded-2xl transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};