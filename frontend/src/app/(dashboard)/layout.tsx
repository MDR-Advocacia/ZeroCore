"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('zc_user');
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Erro no cache local:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Proteção contra renderização de páginas sem usuário (causa tela preta)
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#002147] mb-4" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acessando Área Segura...</p>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') window.location.replace('/login');
    return null;
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden">
      
      {/* Sidebar importada separadamente conforme solicitado */}
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center px-8 shrink-0 z-40">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ambiente ZeroCore</h2>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto min-h-full p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}