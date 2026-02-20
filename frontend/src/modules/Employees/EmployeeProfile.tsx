"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Check, UserCircle } from 'lucide-react';

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = "/api";
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: { 
        'Content-Type': 'application/json',
        ...options.headers 
      },
      credentials: 'include',
    });
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(new Error("Sessão Expirada"));
    }
    return response;
  } catch (error) { throw error; }
};

export default function EmployeeProfile({ username, onBack }: { username: string, onBack: () => void }) {
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableDepts, setAvailableDepts] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔥 BARRA FINAL (/) É OBRIGATÓRIA PARA EVITAR REDIRECT NO DOCKER
        const [resEmp, resDepts] = await Promise.all([
          fetchAPI(`/employees/${username}/`),
          fetchAPI(`/auth/departments/`)
        ]);
        if (resEmp.ok) setEmp(await resEmp.json());
        if (resDepts.ok) setAvailableDepts(await resDepts.json());
      } catch (e) { console.error("Erro na carga"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchAPI(`/employees/${username}/`, {
        method: 'PUT',
        body: JSON.stringify(emp) 
      });
      if (res.ok) alert("Sincronizado!");
    } catch (e) { alert("Falha conexão"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!emp) return <div className="p-20 text-center uppercase font-black text-xs text-red-500">Erro ao carregar perfil.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border">
        <div className="bg-[#002147] p-12 text-white flex items-center gap-10">
          <div className="w-24 h-24 rounded-3xl bg-[#D4AF37] flex items-center justify-center text-[#002147] text-3xl font-black">
            {emp.full_name?.charAt(0)}
          </div>
          <h2 className="text-3xl font-black">{emp.full_name}</h2>
        </div>

        <div className="p-12 grid grid-cols-2 gap-10">
           <div className="space-y-4">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Cargo</label>
             <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold uppercase text-xs" value={emp.title} onChange={e => setEmp({...emp, title: e.target.value})} />
           </div>
           <div className="space-y-4">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Unidade</label>
             <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold uppercase text-xs" value={emp.location} onChange={e => setEmp({...emp, location: e.target.value})} />
           </div>
        </div>

        <div className="p-12 bg-slate-50 border-t flex justify-end">
          <button onClick={handleSave} disabled={saving} className="bg-[#002147] text-[#D4AF37] px-12 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3">
            {saving ? <Loader2 className="animate-spin" /> : <Check size={18} />}
            Salvar no AD
          </button>
        </div>
      </div>
    </div>
  );
}