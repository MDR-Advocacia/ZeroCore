/**
 * CAMINHO: src/app/(dashboard)/layout.tsx
 * Layout modular para todas as páginas internas.
 */
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Menu } from 'lucide-react';
import { Sidebar, MENU_ITEMS } from '@/components/Sidebar';
import { UserData } from '@/types/user';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('zc_token');
    const storedUser = localStorage.getItem('zc_user');
    
    if (!token || !storedUser) { 
      router.push('/login'); 
    } else { 
      setUser(JSON.parse(storedUser)); 
      setLoading(false); 
    }
    
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-[#002147]" size={40} />
    </div>
  );

  const currentItem = MENU_ITEMS.find(i => i.path === pathname);
  const currentTitle = currentItem?.title || "ZeroCore";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 font-sans selection:bg-[#D4AF37] selection:text-[#002147]">
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} user={user} />

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-14 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-3 bg-slate-50 rounded-xl">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="font-black text-xl md:text-2xl text-[#002147] uppercase tracking-tighter italic leading-none">
                {currentTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="font-black text-sm text-[#002147] leading-none tracking-tight">{user?.name}</p>
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.15em] mt-1">
                {user?.role} • {user?.dept}
              </p>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#002147] text-[#D4AF37] rounded-2xl flex items-center justify-center font-black shadow-lg text-xl ring-4 ring-slate-50 shrink-0">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-6 md:p-14 flex-1 overflow-y-auto pb-safe">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}