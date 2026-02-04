// Local: ZeroCore/frontend/src/app/page.tsx
'use client';

import React, { useState } from 'react';
/**
 * O erro de resolução de caminho geralmente ocorre devido à configuração do alias no Next.js.
 * Se você usou o padrão do 'create-next-app', o alias '@/' aponta para a pasta 'src/'.
 */
import Sidebar from '@/components/layout/Sidebar';
import { Bell, Clock } from 'lucide-react';

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Componente Sidebar importado de src/components/layout/Sidebar.tsx */}
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho superior fixo */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0a1d37] capitalize">{activeTab}</h1>
          
          <div className="flex items-center gap-4">
            {/* Widget de Relógio / Status */}
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <Clock size={16} className="text-[#c5a059]" />
              <span className="text-sm font-bold">08:14</span>
            </div>
            {/* Botão de Notificações */}
            <button className="p-2 text-gray-400 hover:text-[#0a1d37] transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Área de conteúdo dinâmico baseada na tab ativa */}
        <section className="flex-1 p-10 overflow-y-auto">
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg italic mb-2">Módulo {activeTab} em desenvolvimento...</p>
              <p className="text-sm">Aguardando integração com a ZeroCore API</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}