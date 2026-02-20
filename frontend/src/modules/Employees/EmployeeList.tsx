"use client"; 

import React, { useState, useEffect } from 'react';
import { Search, Loader2, ChevronRight } from 'lucide-react';

/**
 * Utilitário de API INFALÍVEL.
 * IMPORTANTE: Usamos "/api" para o Next.js fazer o túnel seguro.
 */
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = "/api"; 
  const finalUrl = `${baseUrl}${endpoint}`;
  
  console.log(`🚀 [FRONTEND] Solicitando: ${finalUrl}`);

  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers: { 
        'Content-Type': 'application/json',
        ...options.headers 
      },
      credentials: 'include', // 🔥 CRÍTICO: Envia o cookie zc_token
    });

    if (response.status === 401) {
      console.warn("🚨 [API] Sessão expirada ou sem cookie.");
      localStorage.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(new Error("Sessão Expirada"));
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export default function EmployeeList({ onOpenQuickView }: { onOpenQuickView: (emp: any) => void }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      /**
       * 🔥 A CORREÇÃO DEFINITIVA:
       * Adicionamos a barra "/" após 'employees' e ANTES do "?".
       * Isso impede o FastAPI de dar o redirect 307 que quebra o navegador.
       */
      const res = await fetchAPI(`/employees/?search=${search}&status=${status}`);
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (e) {
      console.error("❌ Falha na conexão com o Proxy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const delay = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(delay);
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="BUSCAR COLABORADOR..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#002147] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={2} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={32} /></td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={2} className="py-20 text-center text-slate-300 font-bold uppercase text-[10px]">Nenhum registro encontrado</td></tr>
            ) : (
              employees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#002147]">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button onClick={() => onOpenQuickView(emp)} className="p-3 text-slate-300 hover:text-[#002147]">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}