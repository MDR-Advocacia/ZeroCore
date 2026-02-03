// Caminho: ZeroCore/frontend/src/app/page.tsx
'use client';

import React, { useState } from 'react';
// Importação ajustada para usar caminhos relativos para garantir compatibilidade
import Sidebar from '../components/layout/Sidebar';
import { Clock, Bell } from 'lucide-react';

export default function Page() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('ADMIN');

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-[#1a1a1a]">
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#0a1d37] capitalize font-serif">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-gray-400 text-sm">Painel Operacional MDR Advocacia</p>
          </div>
          
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <Clock size={16} className="text-[#c5a059]" />
                <span className="text-sm font-bold text-[#0a1d37]">08:14</span>
             </div>
             <button className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#c5a059] rounded-full"></span>
             </button>
          </div>
        </header>

        {/* Área de Conteúdo do Módulo */}
        <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px] flex items-center justify-center text-gray-300 italic border-dashed border-2">
          Módulo {activeTab} em desenvolvimento...
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
}